import {
	FormLayout,
	InputField,
	SelectField,
	SelectOption
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
import { createId } from '@paralleldrive/cuid2';
import { useQuery } from '@rocicorp/zero/react';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { EventCategory } from './EventCategoriesView';

const eventCategorySchema = z.object({
	name: z.string(),
	coordinator: z.string().nullable().optional()
});

type EventCategoryFormData = z.infer<typeof eventCategorySchema>;

export default function EventCategoryFormModal({
	eventCategory,
	open,
	onOpenChange,
	children
}: {
	eventCategory?: EventCategory;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	children?: React.ReactNode;
}) {
	const zero = useZero();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [volunteers] = useQuery(
		zero.query.users.where('role', 'IN', ['volunteer', 'admin'])
	);

	if (!children && !(open !== undefined && onOpenChange)) {
		throw new Error(
			'EventCategoryFormModal must have children or pass open and onOpenChange props'
		);
	}

	const coordinatorOptions: SelectOption[] = volunteers.map(volunteer => ({
		value: volunteer.id,
		label: `${volunteer.firstName} ${volunteer.lastName}`
	}));

	// Get eventCategory default values
	const getEventCategoryDefaultValues = (eventCategory?: EventCategory) => {
		if (!eventCategory) return {};

		return {
			name: eventCategory.name,
			coordinator: eventCategory.coordinator?.id ?? undefined
		};
	};

	const form = useForm<EventCategoryFormData>({
		resolver: zodResolver(eventCategorySchema),
		defaultValues: getEventCategoryDefaultValues(eventCategory)
	});

	const handleFormSubmit = async (data: EventCategoryFormData) => {
		setIsSubmitting(true);

		try {
			if (!eventCategory) {
				// Create the eventCategory in db
				const eventCategoryId = createId();
				await zero.mutate.eventCategories.insert({
					id: eventCategoryId,
					name: data.name,
					coordinatorId: data.coordinator
				});
			} else {
				// Update eventCategory
				await zero.mutate.eventCategories.update({
					id: eventCategory.id,
					name: data.name,
					coordinatorId: data.coordinator
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
						{!eventCategory ? 'Create Event Category' : 'Update Event Category'}
					</ModalTitle>
				</ModalHeader>
				<FormLayout<EventCategoryFormData>
					form={form}
					onSubmit={form.handleSubmit(handleFormSubmit)}
				>
					<ModalBody className='space-y-4'>
						<InputField name='name' label='Name' />
						<SelectField
							name='coordinator'
							label='Coordinator'
							options={coordinatorOptions}
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
