import { FormLayout, InputField } from '@/components/form';
import { MultiSelectField, Option } from '@/components/form/MultiSelectField';
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
import { Center } from '@/layout/CenterLayout';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@rocicorp/zero/react';
import { LoaderCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const centerSchema = z.object({
	name: z.string({ error: 'Name is required' }),
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

	const guardianOptions: Option[] = guardians
		.sort((a, b) => a.firstName.localeCompare(b.firstName))
		.map(guardian => ({
			value: guardian.id,
			label: `${guardian.firstName} ${guardian.lastName ?? ''}`
		}));
	const liaisonOptions: Option[] = liaisons
		.sort((a, b) => a.firstName.localeCompare(b.firstName))
		.map(liaison => ({
			value: liaison.id,
			label: `${liaison.firstName} ${liaison.lastName ?? ''}`
		}));

	// Get center default values
	const defaultValues = useMemo(() => {
		if (!center) return {};

		return {
			name: center.name,
			liaisons: center.liaisons.map(cl => cl.userId),
			guardians: center.guardians.map(cg => cg.userId)
		};
	}, [center]);

	const form = useForm<CenterFormData>({
		resolver: zodResolver(centerSchema),
		defaultValues
	});

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
			if (!center) {
				// Reset form values after creation
				form.reset();
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
					className='flex flex-col flex-1'
				>
					<ModalBody className='space-y-4'>
						<InputField name='name' label='Name' />
						<MultiSelectField
							name='liaisons'
							label='Liaisons'
							options={liaisonOptions}
							placeholder='Select liaisons'
						/>
						<MultiSelectField
							name='guardians'
							label='Guardians'
							options={guardianOptions}
							placeholder='Select guardians'
						/>
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
