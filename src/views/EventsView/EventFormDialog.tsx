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
import { format, set } from 'date-fns';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Event } from './EventsView';

// eslint-disable-next-line react-refresh/only-export-components
export const getTimeOptions = () =>
	Array.from({ length: 96 }).map((_, i) => {
		const hour = Math.floor(i / 4)
			.toString()
			.padStart(2, '0');
		const minute = ((i % 4) * 15).toString().padStart(2, '0');

		return {
			label: `${hour}:${minute}`,
			value: `${hour}:${minute}`
		};
	});

const eventSchema = z
	.object({
		name: z.string(),
		startTime: z.string().time(),
		endTime: z.string().time(),
		coordinator: z.string(),
		category: z.string().cuid2()
	})
	.refine(data => data.startTime < data.endTime, {
		message: 'End time cannot be earlier than start time.',
		path: ['endTime']
	});

type EventFormData = z.infer<typeof eventSchema>;

export default function EventFormModal({
	event,
	open,
	onOpenChange,
	children
}: {
	event?: Event;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	children?: React.ReactNode;
}) {
	const zero = useZero();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [coordinators] = useQuery(
		zero.query.users.where('role', 'IS', 'volunteer')
	);
	const [eventCategories] = useQuery(zero.query.eventCategories);

	if (!children && !(open !== undefined && onOpenChange)) {
		throw new Error(
			'EventFormModal must have children or pass open and onOpenChange props'
		);
	}

	const coordinatorOptions: SelectOption[] = coordinators.map(coordinator => ({
		value: coordinator.id,
		label: `${coordinator.firstName} ${coordinator.lastName}`
	}));
	const eventCategoryOptions: SelectOption[] = eventCategories.map(
		category => ({
			value: category.id,
			label: category.name
		})
	);

	// Get event default values
	const getEventDefaultValues = (event?: Event) => {
		if (!event) {
			return {};
		}

		return {
			name: event.name,
			startTime: event.startTime
				? format(new Date(event.startTime), 'HH:mm')
				: undefined,
			endTime: event.endTime
				? format(new Date(event.endTime), 'HH:mm')
				: undefined,
			coordinator: event.coordinator?.id,
			category: event.category?.id
		};
	};

	const form = useForm<EventFormData>({
		resolver: zodResolver(eventSchema),
		defaultValues: getEventDefaultValues(event)
	});

	const handleFormSubmit = async (data: EventFormData) => {
		setIsSubmitting(true);

		try {
			const mutationData = {
				id: event?.id ?? createId(),
				name: data.name,
				startTime: set(new Date(2025, 8, 25), {
					hours: parseInt(data.startTime.split(':')[0]),
					minutes: parseInt(data.startTime.split(':')[1])
				}).getTime(),
				endTime: set(new Date(2025, 8, 25), {
					hours: parseInt(data.endTime.split(':')[0]),
					minutes: parseInt(data.endTime.split(':')[1])
				}).getTime(),
				coordinatorId: data.coordinator,
				eventCategoryId: data.category
			};
			if (!event) {
				// Create the event in db
				await zero.mutate.events.insert(mutationData);
			} else {
				// Update event
				await zero.mutate.events.update(mutationData);
			}

			// Close dialog on success
			setIsSubmitting(false);
			if (onOpenChange) {
				onOpenChange(false);
			} else {
				setIsModalOpen(false);
			}
		} catch (e) {
			console.log(e);
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
			modal={false}
		>
			<ModalTrigger asChild>{children}</ModalTrigger>
			<ModalContent className='sm:max-w-[425px]' aria-describedby={undefined}>
				<ModalHeader>
					<ModalTitle>{!event ? 'Create Event' : 'Update Event'}</ModalTitle>
				</ModalHeader>
				<FormLayout<EventFormData>
					form={form}
					onSubmit={form.handleSubmit(handleFormSubmit)}
				>
					<ModalBody className='space-y-4'>
						<InputField name='name' label='Name' />
						<SelectField
							name='startTime'
							label='Start Time'
							options={getTimeOptions()}
						/>
						<SelectField
							name='endTime'
							label='End Time'
							options={getTimeOptions()}
						/>
						<SelectField
							name='category'
							label='Category'
							options={eventCategoryOptions}
						/>
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
