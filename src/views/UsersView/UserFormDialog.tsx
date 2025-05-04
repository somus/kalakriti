import { FormLayout, InputField, SelectField } from '@/components/form';
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
import { rolesEnum } from '@/db/schema';
import { User } from '@/db/schema.zero';
import useZero from '@/hooks/useZero';
import {
	clearClerkUser,
	deleteClerkUser,
	updateClerkUser
} from '@/lib/clerkUser';
import { useAuth } from '@clerk/clerk-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { UseFormSetError, useForm } from 'react-hook-form';
import {
	clerkUserCreateInputSchema,
	clerkUserUpdateInputSchema
} from 'shared/schema';
import * as z from 'zod';

const createUserSchema = clerkUserCreateInputSchema.extend({
	phoneNumber: z
		.string()
		.refine(
			value => /^[6-9]\d{9}$/.test(value),
			'Please enter a valid indian mobile number'
		)
		.optional(),
	role: z.enum(rolesEnum.enumValues).default('volunteer')
});

const updateUserSchema = clerkUserUpdateInputSchema
	.extend({
		phoneNumber: z
			.string()
			.refine(
				value => /^[6-9]\d{9}$/.test(value),
				'Please enter a valid indian mobile number'
			)
			.optional()
	})
	.omit({ id: true });

type CreateUserFormData = z.infer<typeof createUserSchema>;
type UpdateUserFormData = z.infer<typeof updateUserSchema>;
type UserFormData = CreateUserFormData | UpdateUserFormData;

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
	const { getToken } = useAuth();
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
		let clerkUserId: string | undefined;
		const isCreating = !user;

		try {
			// Prepare data based on create or update flow
			if (isCreating) {
				// Create flow
				const { password, ...createData } = data as CreateUserFormData;

				// Create user in Clerk
				const clerkResult = await clearClerkUser({
					getToken,
					user: { password, ...createData }
				});

				// Handle Clerk errors
				if ('clerkError' in clerkResult) {
					setError(
						clerkResult.errors[0].code === 'form_identifier_exists'
							? 'email'
							: 'root.submissionError',
						{
							message: clerkResult.errors[0].message
						}
					);
					setIsSubmitting(false);
					return;
				}

				clerkUserId = clerkResult.id;

				// Create user in database
				await zero.mutate.users.insert({
					id: clerkUserId,
					...createData
				});
			} else {
				// Update flow
				const { password, ...updateData } = data as UpdateUserFormData;

				// Update user in Clerk
				const clerkResult = await updateClerkUser({
					getToken,
					user: { id: user.id, password, ...updateData }
				});

				// Handle Clerk errors
				if ('clerkError' in clerkResult) {
					setError(
						clerkResult.errors[0].code === 'form_identifier_exists'
							? 'email'
							: 'root.submissionError',
						{
							message: clerkResult.errors[0].message
						}
					);
					setIsSubmitting(false);
					return;
				}

				// Update user in database
				await zero.mutate.users.update({
					id: user.id,
					...updateData
				});
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
			if (isCreating && clerkUserId) {
				// Cleanup the user if the user creation fails
				await deleteClerkUser({ getToken, userId: clerkUserId });
			}
			setError('root.submissionError', {
				message: e instanceof Error ? e.message : 'Something went wrong'
			});
		}
	};

	const form = useForm<UserFormData>({
		resolver: zodResolver(!user ? createUserSchema : updateUserSchema),
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
						{!user && (
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
