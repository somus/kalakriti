import { FormLayout, InputField } from '@/components/form';
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
import MultipleSelector, { Option } from '@/components/ui/input-multiselect';
import useZero from '@/hooks/useZero';
import { Center } from '@/layout/CenterLayout';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@rocicorp/zero/react';
import { LoaderCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod/v4';

const centerSchema = z.object({
	name: z.string({ error: 'Name is required' }),
	phoneNumber: z
		.string({ error: 'Phone number is required' })
		.refine(
			value => /^[6-9]\d{9}$/.test(value),
			'Please enter a valid indian mobile number'
		),
	email: z.email({ error: 'Email is required' }),
	liaisons: z
		.array(z.string(), { error: 'Liaisons are required' })
		.min(1, { error: 'Liaisons are required' }),
	guardians: z
		.array(z.string(), { error: 'Guardians are required' })
		.min(1, { error: 'Guardians are required' })
});

type CenterFormData = z.infer<typeof centerSchema>;

export default function CenterFormModal({
	center,
	open,
	onOpenChange,
	children
}: {
	center?: Center;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	children?: React.ReactNode;
}) {
	const zero = useZero();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [guardians] = useQuery(
		zero.query.users.where('role', 'IS', 'guardian')
	);
	const [liaisons] = useQuery(
		zero.query.users.where('role', 'IS', 'volunteer')
	);

	if (!children && !(open !== undefined && onOpenChange)) {
		throw new Error(
			'CenterFormModal must have children or pass open and onOpenChange props'
		);
	}

	const guardianOptions: Option[] = guardians.map(guardian => ({
		value: guardian.id,
		label: `${guardian.firstName} ${guardian.lastName ?? ''}`
	}));
	const liaisonOptions: Option[] = liaisons.map(liaison => ({
		value: liaison.id,
		label: `${liaison.firstName} ${liaison.lastName ?? ''}`
	}));

	// Get center default values
	const defaultValues = useMemo(() => {
		if (!center) return {};

		return {
			name: center.name,
			phoneNumber: center.phoneNumber ?? '',
			email: center.email,
			liaisons: center.liaisons.map(cl => cl.userId),
			guardians: center.guardians.map(cg => cg.userId)
		};
	}, [center]);

	const form = useForm<CenterFormData>({
		resolver: zodResolver(centerSchema),
		defaultValues
	});
	const errors = form.formState.errors;

	const handleFormSubmit = async (data: CenterFormData) => {
		setIsSubmitting(true);

		try {
			if (!center) {
				// Create the center in db
				await zero.mutate.centers.create(data).server;
			} else {
				// Update center
				await zero.mutate.centers.update({ id: center.id, ...data }).server;
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
			form.setError('root.serverError', {
				message: e instanceof Error ? e.message : 'Something went wrong'
			});
		} finally {
			if (!center) {
				// Reset form values after creation
				form.reset();
			}
		}
	};

	return (
		<Modal
			open={open ?? isModalOpen}
			onOpenChange={onOpenChange ?? setIsModalOpen}
		>
			<ModalTrigger asChild>{children}</ModalTrigger>
			<ModalContent className='sm:max-w-[425px]' aria-describedby={undefined}>
				<ModalHeader>
					<ModalTitle>{!center ? 'Create Center' : 'Update Center'}</ModalTitle>
				</ModalHeader>
				<FormLayout<CenterFormData>
					form={form}
					onSubmit={form.handleSubmit(handleFormSubmit)}
				>
					<ModalBody className='space-y-4'>
						<InputField name='name' label='Name' />
						<InputField name='phoneNumber' label='Phone Number' />
						<InputField name='email' label='Email' type='email' />

						<div className='space-y-2'>
							<label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
								Liaisons
							</label>
							<MultipleSelector
								defaultOptions={liaisonOptions}
								placeholder='Select liaisons'
								emptyIndicator={<p>no results found.</p>}
								value={form.watch('liaisons')?.map(id => {
									const option = liaisonOptions.find(opt => opt.value === id);
									return option ?? { value: id, label: id };
								})}
								onChange={options => {
									form.setValue(
										'liaisons',
										options.map(opt => opt.value),
										{ shouldValidate: true }
									);
								}}
							/>
							{errors.liaisons && (
								<p
									data-slot='form-message'
									className='text-destructive text-sm'
								>
									{errors.liaisons.message}
								</p>
							)}
						</div>

						<div className='space-y-2'>
							<label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
								Guardians
							</label>
							<MultipleSelector
								defaultOptions={guardianOptions}
								placeholder='Select guardians'
								emptyIndicator={<p>no results found.</p>}
								value={form.watch('guardians')?.map(id => {
									const option = guardianOptions.find(opt => opt.value === id);
									return option ?? { value: id, label: id };
								})}
								onChange={options => {
									form.setValue(
										'guardians',
										options.map(opt => opt.value),
										{ shouldValidate: true }
									);
								}}
							/>
							{errors.guardians && (
								<p
									data-slot='form-message'
									className='text-destructive text-sm'
								>
									{errors.guardians.message}
								</p>
							)}
						</div>
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
