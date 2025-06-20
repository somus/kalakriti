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
import { createId } from '@paralleldrive/cuid2';
import { useQuery } from '@rocicorp/zero/react';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod/v4';

const centerSchema = z.object({
	name: z.string(),
	phoneNumber: z
		.string()
		.refine(
			value => /^[6-9]\d{9}$/.test(value),
			'Please enter a valid indian mobile number'
		),
	email: z.email(),
	liaisons: z.array(z.string()),
	guardians: z.array(z.string())
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
		label: `${guardian.firstName} ${guardian.lastName}`
	}));
	const liaisonOptions: Option[] = liaisons.map(liaison => ({
		value: liaison.id,
		label: `${liaison.firstName} ${liaison.lastName}`
	}));

	// Get center default values
	const getCenterDefaultValues = (center?: Center) => {
		if (!center) return {};

		return {
			name: center.name,
			phoneNumber: center.phoneNumber ?? '',
			email: center.email,
			liaisons: center.liaisons.map(cl => cl.userId),
			guardians: center.guardians.map(cg => cg.userId)
		};
	};

	const form = useForm<CenterFormData>({
		resolver: zodResolver(centerSchema),
		defaultValues: getCenterDefaultValues(center)
	});

	const handleFormSubmit = async (data: CenterFormData) => {
		setIsSubmitting(true);

		try {
			if (!center) {
				// Create the center in db
				await zero.mutateBatch(async tx => {
					const centerId = createId();
					await tx.centers.insert({
						id: centerId,
						name: data.name,
						phoneNumber: data.phoneNumber,
						email: data.email
					});

					for (const liaisonId of data.liaisons) {
						await tx.centerLiaisons.insert({
							centerId,
							userId: liaisonId
						});
					}

					for (const guardianId of data.guardians) {
						await tx.centerGuardians.insert({
							centerId,
							userId: guardianId
						});
					}
				});
			} else {
				// Update center
				await zero.mutateBatch(async tx => {
					// Update center information
					await tx.centers.update({
						id: center.id,
						name: data.name,
						phoneNumber: data.phoneNumber,
						email: data.email
					});

					// Get current liaisons and guardians
					const currentLiasonIds = center.liaisons.map(
						liaison => liaison.userId
					);
					const currentGuardianIds = center.guardians.map(
						guardian => guardian.userId
					);

					// Determine which liaisons to remove and which to add
					const liaisonsToRemove = currentLiasonIds.filter(
						id => !data.liaisons.includes(id)
					);
					const liaisonsToAdd = data.liaisons.filter(
						id => !currentLiasonIds.includes(id)
					);

					// Determine which guardians to remove and which to add
					const guardiansToRemove = currentGuardianIds.filter(
						id => !data.guardians.includes(id)
					);
					const guardiansToAdd = data.guardians.filter(
						id => !currentGuardianIds.includes(id)
					);

					// Remove deleted liaisons
					for (const userId of liaisonsToRemove) {
						await tx.centerLiaisons.delete({
							centerId: center.id,
							userId
						});
					}

					// Remove deleted guardians
					for (const userId of guardiansToRemove) {
						await tx.centerGuardians.delete({
							centerId: center.id,
							userId
						});
					}

					// Add new liaisons
					for (const userId of liaisonsToAdd) {
						await tx.centerLiaisons.insert({
							centerId: center.id,
							userId
						});
					}

					// Add new guardians
					for (const userId of guardiansToAdd) {
						await tx.centerGuardians.insert({
							centerId: center.id,
							userId
						});
					}
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
			form.setError('root.serverError', {
				message: e instanceof Error ? e.message : 'Something went wrong'
			});
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
