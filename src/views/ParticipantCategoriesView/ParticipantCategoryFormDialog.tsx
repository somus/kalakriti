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
import { ParticipantCategory } from '@/db/schema.zero';
import useZero from '@/hooks/useZero';
import { zodResolver } from '@hookform/resolvers/zod';
import { createId } from '@paralleldrive/cuid2';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod/v4';

const participantCategorySchema = z.object({
	name: z.string(),
	minAge: z.number().min(0).max(20),
	maxAge: z.number().min(0).max(20),
	maxBoys: z.number().min(0).max(50),
	maxGirls: z.number().min(0).max(50),
	totalEventsAllowed: z.number().min(0).max(10),
	maxEventsPerCategory: z.number().min(0).max(10)
});

type ParticipantCategoryFormData = z.infer<typeof participantCategorySchema>;

export default function ParticipantCategoryFormModal({
	participantCategory,
	open,
	onOpenChange,
	children
}: {
	participantCategory?: ParticipantCategory;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	children?: React.ReactNode;
}) {
	const zero = useZero();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	if (!children && !(open !== undefined && onOpenChange)) {
		throw new Error(
			'ParticipantCategoryFormModal must have children or pass open and onOpenChange props'
		);
	}

	// Get participantCategory default values
	const getParticipantCategoryDefaultValues = (
		participantCategory?: ParticipantCategory
	) => {
		if (!participantCategory) return {};

		return {
			name: participantCategory.name,
			minAge: participantCategory.minAge,
			maxAge: participantCategory.maxAge,
			maxBoys: participantCategory.maxBoys,
			maxGirls: participantCategory.maxGirls,
			totalEventsAllowed: participantCategory.totalEventsAllowed,
			maxEventsPerCategory: participantCategory.maxEventsPerCategory
		};
	};

	const form = useForm<ParticipantCategoryFormData>({
		resolver: zodResolver(participantCategorySchema),
		defaultValues: getParticipantCategoryDefaultValues(participantCategory)
	});

	const handleFormSubmit = async (data: ParticipantCategoryFormData) => {
		setIsSubmitting(true);

		try {
			if (!participantCategory) {
				// Create the participantCategory in db
				const participantCategoryId = createId();
				await zero.mutate.participantCategories.insert({
					id: participantCategoryId,
					name: data.name,
					minAge: data.minAge,
					maxAge: data.maxAge,
					maxBoys: data.maxBoys,
					maxGirls: data.maxGirls,
					totalEventsAllowed: data.totalEventsAllowed,
					maxEventsPerCategory: data.maxEventsPerCategory
				});
			} else {
				// Update participantCategory
				await zero.mutate.participantCategories.update({
					id: participantCategory.id,
					name: data.name,
					minAge: data.minAge,
					maxAge: data.maxAge,
					maxBoys: data.maxBoys,
					maxGirls: data.maxGirls,
					totalEventsAllowed: data.totalEventsAllowed,
					maxEventsPerCategory: data.maxEventsPerCategory
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
					<ModalTitle>
						{!participantCategory
							? 'Create Participant Category'
							: 'Update Participant Category'}
					</ModalTitle>
				</ModalHeader>
				<FormLayout<ParticipantCategoryFormData>
					form={form}
					onSubmit={form.handleSubmit(handleFormSubmit)}
				>
					<ModalBody className='space-y-4'>
						<InputField name='name' label='Name' />
						<InputField name='minAge' label='Minimum Age' type='number' />
						<InputField name='maxAge' label='Maximum Age' type='number' />
						<InputField name='maxBoys' label='Maximum Boys' type='number' />
						<InputField name='maxGirls' label='Maximum Girls' type='number' />
						<InputField
							name='totalEventsAllowed'
							label='Total Events Allowed'
							type='number'
						/>
						<InputField
							name='maxEventsPerCategory'
							label='Maximum Events per Category'
							type='number'
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
