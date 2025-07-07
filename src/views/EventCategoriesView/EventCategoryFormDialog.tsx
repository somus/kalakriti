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
import { useQuery } from '@rocicorp/zero/react';
import { LoaderCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod/v4';

import { EventCategory } from './EventCategoriesView';

const eventCategorySchema = z.object({
	name: z.string(),
	coordinatorId: z.string().nullable().optional()
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
	const defaultValues = useMemo(() => {
		if (!eventCategory) return {};

		return {
			name: eventCategory.name,
			coordinatorId: eventCategory.coordinator?.id ?? undefined
		};
	}, [eventCategory]);

	const form = useForm<EventCategoryFormData>({
		resolver: zodResolver(eventCategorySchema),
		defaultValues
	});

	const handleFormSubmit = async (data: EventCategoryFormData) => {
		setIsSubmitting(true);

		try {
			if (!eventCategory) {
				// Create the eventCategory in db
				await zero.mutate.eventCategories.create(data).server;
			} else {
				// Update eventCategory
				await zero.mutate.eventCategories.update({
					id: eventCategory.id,
					name: data.name,
					coordinatorId: data.coordinatorId
				}).server;
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
			if (!eventCategory) {
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
							name='coordinatorId'
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
