import {
	CheckboxField,
	FormLayout,
	InputField,
	SelectField
} from '@/components/form';
import { Button } from '@/components/ui/button';
import {
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalTitle,
	ModalTrigger
} from '@/components/ui/credenza';
import useZero from '@/hooks/useZero';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { UseFormSetError, useForm } from 'react-hook-form';
import { rolesEnum } from 'shared/db/schema';
import { User } from 'shared/db/schema.zero';
import * as z from 'zod/v4';

const userSchema = z
	.object({
		firstName: z.string({ error: 'Please enter a valid first name' }),
		lastName: z.string().optional(),
		email: z.email({ error: 'Please enter a valid email address' }),
		password: z.string().optional(),
		role: z.enum(rolesEnum.enumValues).default('volunteer').optional(),
		canLogin: z.boolean().default(false).optional(),
		phoneNumber: z
			.string()
			.refine(
				value => /^[6-9]\d{9}$/.test(value),
				'Please enter a valid indian mobile number'
			)
			.optional()
	})
	.check(ctx => {
		if (
			(ctx.value.canLogin || ctx.value.role === 'admin') &&
			(!ctx.value.password || ctx.value.password.length < 10)
		) {
			ctx.issues.push({
				code: 'custom',
				message: 'Password must be at least 10 characters long',
				path: ['password'],
				input: ctx.value.password
			});
		}
	});

type UserFormData = z.infer<typeof userSchema>;

export default function UserFormModal({
	user,
	open,
	onOpenChange,
	children
}: {
	user?: User;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	children?: React.ReactNode;
}) {
	const zero = useZero();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Format user data for form
	const getUserDefaultValues = (user?: User) => {
		if (!user)
			return {
				role: rolesEnum.enumValues[2]
			};

		return {
			firstName: user.firstName,
			lastName: user.lastName ?? undefined,
			email: user.email,
			canLogin: user.canLogin ?? false,
			phoneNumber: user.phoneNumber ?? undefined,
			role: user.role ?? 'volunteer'
		};
	};

	// Form submission handler
	const handleFormSubmit = async (
		data: UserFormData,
		setError: UseFormSetError<UserFormData>
	) => {
		setIsSubmitting(true);

		try {
			// Prepare data based on create or update flow
			if (!user) {
				// Create user
				await zero.mutate.users.create({
					...data,
					role: data.role ?? 'volunteer',
					canLogin: data.role === 'admin' || data.canLogin ? true : false
				}).server;
			} else {
				// Update user
				await zero.mutate.users.update({ id: user.id, ...data }).server;
			}

			// Close dialog on success
			setIsSubmitting(false);
			if (onOpenChange) {
				onOpenChange(false);
			} else {
				setIsModalOpen(false);
			}
		} catch (e) {
			setIsSubmitting(false);
			setError('root.submissionError', {
				message: e instanceof Error ? e.message : 'Something went wrong'
			});
		} finally {
			form.reset();
		}
	};

	const form = useForm<UserFormData>({
		resolver: zodResolver(userSchema),
		defaultValues: getUserDefaultValues(user)
	});

	if (!children && !(open !== undefined && onOpenChange)) {
		throw new Error(
			'UserFormModal must have children or pass open and onOpenChange props'
		);
	}

	// Prepare role options
	const roleOptions = rolesEnum.enumValues.map(role => ({
		value: role,
		label: role.charAt(0).toUpperCase() + role.slice(1)
	}));

	return (
		<Modal
			open={open ?? isModalOpen}
			onOpenChange={onOpenChange ?? setIsModalOpen}
		>
			<ModalTrigger asChild>{children}</ModalTrigger>
			<ModalContent className='sm:max-w-[425px]' aria-describedby={undefined}>
				<ModalHeader>
					<ModalTitle>{!user ? 'Create User' : 'Update User'}</ModalTitle>
				</ModalHeader>
				<FormLayout<UserFormData>
					form={form}
					onSubmit={form.handleSubmit(data =>
						handleFormSubmit(data, form.setError)
					)}
				>
					<ModalBody className='space-y-4'>
						<InputField name='firstName' label='First Name' />
						<InputField name='lastName' label='Last Name' />
						<InputField name='email' label='Email' type='email' />
						<InputField name='phoneNumber' label='Phone Number' />
						<SelectField name='role' label='Role' options={roleOptions} />
						{!user && form.watch('role') !== 'admin' && (
							<CheckboxField name='canLogin' label='Should allow login?' />
						)}
						{!user &&
							(form.watch('canLogin') ?? form.watch('role') === 'admin') && (
								<InputField name='password' label='Password' type='password' />
							)}
					</ModalBody>
					<ModalFooter>
						<Button type='submit' disabled={isSubmitting}>
							{isSubmitting && <LoaderCircle className='animate-spin mr-2' />}
							Save changes
						</Button>
					</ModalFooter>
				</FormLayout>
			</ModalContent>
		</Modal>
	);
}
