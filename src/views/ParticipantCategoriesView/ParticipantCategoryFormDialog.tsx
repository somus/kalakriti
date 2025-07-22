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
import useZero from '@/hooks/useZero';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ParticipantCategory } from 'shared/db/schema.zero';
import * as z from 'zod';

const participantCategorySchema = z.object({
	name: z.string({ error: 'Name is required' }),
	minAge: z.number({ error: 'Min age is required' }).min(0).max(20),
	maxAge: z.number({ error: 'Max age is required' }).min(0).max(20),
	maxBoys: z.number({ error: 'Max boys is required' }).min(0).max(50),
	maxGirls: z.number({ error: 'Max girls is required' }).min(0).max(50),
	totalEventsAllowed: z
		.number({ error: 'Total events allowed is required' })
		.min(0)
		.max(10),
	maxEventsPerCategory: z
		.number({ error: 'Max events per category is required' })
		.min(0)
		.max(10)
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
	const defaultValues = useMemo(() => {
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
	}, [participantCategory]);

	const form = useForm<ParticipantCategoryFormData>({
		resolver: zodResolver(participantCategorySchema),
		defaultValues
	});

	const handleFormSubmit = async (data: ParticipantCategoryFormData) => {
		setIsSubmitting(true);

		try {
			if (!participantCategory) {
				// Create the participantCategory in db
				await zero.mutate.participantCategories.create(data).client;
			} else {
				// Update participantCategory
				await zero.mutate.participantCategories.update({
					id: participantCategory.id,
					...data
				}).client;
			}

			// Close dialog on success
			setIsSubmitting(false);
			if (!participantCategory) {
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
					<ModalTitle>
						{!participantCategory
							? 'Create Participant Category'
							: 'Update Participant Category'}
					</ModalTitle>
				</ModalHeader>
				<FormLayout<ParticipantCategoryFormData>
					form={form}
					onSubmit={form.handleSubmit(handleFormSubmit)}
					className='flex flex-col flex-1'
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
