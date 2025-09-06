import {
	CheckboxField,
	FormLayout,
	InputField,
	SelectField
} from '@/components/form';
import { QrScanDialog } from '@/components/qr-scan-dialog';
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
import get from 'lodash/get';
import { LoaderCircle, ScanQrCodeIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { rolesEnum, teamsEnum } from 'shared/db/schema';
import { User } from 'shared/db/schema.zero';
import { toast } from 'sonner';
import * as z from 'zod';

import { TEAMS_NAME_MAP } from './columns';

const userSchema = z
	.object({
		firstName: z.string({ error: 'Please enter a valid first name' }),
		lastName: z.string().optional(),
		email: z.email({ error: 'Please enter a valid email address' }).optional(),
		password: z.string().optional(),
		role: z.enum(rolesEnum.enumValues).default('volunteer').optional(),
		leading: z
			.enum([...teamsEnum.enumValues, ''])
			.default('')
			.optional(),
		team: z
			.enum([
				...teamsEnum.enumValues.filter(
					team => !['overall', 'events'].includes(team)
				),
				''
			])
			.default('')
			.optional(),
		canLogin: z.boolean().optional(),
		phoneNumber: z
			.string()
			.refine(
				value => /^[6-9]\d{9}$/.test(value),
				'Please enter a valid indian mobile number'
			)
	})
	.check(ctx => {
		if (
			ctx.value.canLogin === undefined
				? false
				: ctx.value.canLogin || ctx.value.role === 'admin'
		) {
			if (!ctx.value.password || ctx.value.password.length < 10) {
				ctx.issues.push({
					code: 'custom',
					message: 'Password must be at least 10 characters long',
					path: ['password'],
					input: ctx.value.password
				});
			}
			if (!ctx.value.email) {
				ctx.issues.push({
					code: 'custom',
					message: 'Email is required for login enabled users',
					path: ['email'],
					input: ctx.value.email
				});
			}
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
	const [qrScanResult, setQrScanResult] = useState<{
		id: string;
		type: NonNullable<User['role']>;
	} | null>(null);

	// Format user data for form
	const defaultValues = useMemo(() => {
		if (!user)
			return {
				role: rolesEnum.enumValues[2],
				canLogin: false
			};

		return {
			firstName: user.firstName,
			lastName: user.lastName ?? undefined,
			email: user.email ?? undefined,
			phoneNumber: user.phoneNumber,
			role: user.role ?? 'volunteer',
			leading: user.leading ?? ('' as UserFormData['leading'])
		};
	}, [user]);

	const form = useForm<UserFormData>({
		resolver: zodResolver(userSchema),
		defaultValues
	});
	const { setValue } = form;

	// Form submission handler
	const handleFormSubmit = async (data: UserFormData) => {
		setIsSubmitting(true);

		try {
			// Prepare data based on create or update flow
			if (!user) {
				// Create user
				await zero.mutate.users.create({
					...data,
					id: qrScanResult?.id,
					role: data.role ?? 'volunteer',
					leading:
						(data.role === 'admin' || data.role === 'volunteer') &&
						data.leading !== ''
							? data.leading
							: undefined,
					team:
						(data.role === 'admin' || data.role === 'volunteer') &&
						data.team !== ''
							? data.team
							: undefined,
					canLogin: data.role === 'admin' || data.canLogin ? true : false
				}).server;
			} else {
				// Update user
				await zero.mutate.users.update({
					id: user.id,
					...data,
					team:
						data.role === 'admin' || data.role === 'volunteer'
							? data.team === ''
								? null
								: data.team
							: undefined,
					leading:
						data.role === 'admin' || data.role === 'volunteer'
							? data.leading === ''
								? null
								: data.leading
							: undefined
				}).server;
			}

			// Close dialog on success
			setIsSubmitting(false);
			if (!user) {
				// Reset form values after creation
				form.reset();
				setQrScanResult(null);
			}
			if (onOpenChange) {
				onOpenChange(false);
			} else {
				setIsModalOpen(false);
			}
		} catch (e) {
			console.error(e);
			setIsSubmitting(false);
			form.setError('root.submissionError', {
				type: e instanceof Error ? 'submitError' : 'unknownError',
				message:
					e instanceof Error
						? e.message
						: (get(e, 'details') ?? 'Something went wrong')
			});
		}
	};

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

	const teamOptions = teamsEnum.enumValues.map(team => ({
		value: team,
		label: TEAMS_NAME_MAP[team]
	}));

	useEffect(() => {
		if (qrScanResult) {
			setValue('role', qrScanResult.type);
		}
	}, [qrScanResult, setValue]);

	const selectedLeading = form.watch('leading');
	const selectedTeam = form.watch('team');
	useEffect(() => {
		if (selectedLeading !== undefined && selectedLeading !== '') {
			setValue('team', '');
		}
		if (selectedTeam !== undefined && selectedTeam !== '') {
			setValue('leading', '');
		}
	}, [selectedLeading, selectedTeam, setValue]);

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
					onSubmit={form.handleSubmit(handleFormSubmit)}
					className='flex flex-col flex-1'
				>
					<ModalBody className='space-y-4'>
						{!qrScanResult && !user && (
							<QrScanDialog
								onScan={async scanResult => {
									if (
										!['volunteer', 'guest', 'judge'].includes(
											scanResult.type
										) ||
										!scanResult.isNewUser
									) {
										toast.error('Invalid QR code');
										return;
									}

									const user = await zero.query.users
										.where('id', scanResult.id)
										.one();

									if (user && !!scanResult.isNewUser) {
										toast.error('User already exists');
										return;
									}

									setQrScanResult({
										id: scanResult.id,
										type: scanResult.type as NonNullable<User['role']>
									});
								}}
							>
								<Button>
									<ScanQrCodeIcon />
									Scan QR Code
								</Button>
							</QrScanDialog>
						)}
						<InputField name='firstName' label='First Name' isRequired />
						<InputField name='lastName' label='Last Name' />
						<InputField
							name='email'
							label='Email'
							type='email'
							disabled={!!user}
						/>
						<InputField name='phoneNumber' label='Phone Number' isRequired />
						<SelectField
							name='role'
							label='Role'
							options={roleOptions}
							isRequired
							disabled={!!qrScanResult}
						/>
						{form.watch('role') === 'volunteer' && (
							<SelectField
								name='leading'
								label='Leading'
								options={teamOptions}
								disabled={
									form.watch('team') !== undefined && form.watch('team') !== ''
								}
							/>
						)}
						{form.watch('role') === 'volunteer' && (
							<SelectField
								name='team'
								label='Team'
								options={teamOptions.filter(
									team => !['overall', 'events'].includes(team.value)
								)}
								disabled={
									form.watch('leading') !== undefined &&
									form.watch('leading') !== ''
								}
							/>
						)}
						{!user && form.watch('role') !== 'admin' && (
							<CheckboxField name='canLogin' label='Should allow login?' />
						)}
						{!user &&
							(form.watch('role') === 'admin' || form.watch('canLogin')) && (
								<InputField
									name='password'
									label='Password'
									type='password'
									isRequired
								/>
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
