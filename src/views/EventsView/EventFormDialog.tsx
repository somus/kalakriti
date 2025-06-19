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
import { FormItem, FormLabel } from '@/components/ui/form';
import useZero from '@/hooks/useZero';
import { zodResolver } from '@hookform/resolvers/zod';
import { createId } from '@paralleldrive/cuid2';
import { useQuery } from '@rocicorp/zero/react';
import { format, set } from 'date-fns';
import keyBy from 'lodash/keyBy';
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
	const [participantCategories] = useQuery(zero.query.participantCategories);
	const participantCategoryMap = keyBy(participantCategories, 'id');

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

	const eventSchema = z.object({
		name: z.string(),
		timings: z.record(
			z.string(),
			z
				.object({
					categoryId: z.string().cuid2(),
					startTime: z.string().time().optional(),
					endTime: z.string().time().optional()
				})
				.refine(
					data =>
						data.startTime && data.endTime
							? data.startTime < data.endTime
							: true,
					{
						message: 'End time cannot be earlier than start time.',
						path: ['endTime']
					}
				)
		),
		coordinator: z.string(),
		category: z.string().cuid2()
	});

	type EventFormData = z.infer<typeof eventSchema>;

	// Get event default values
	const getEventDefaultValues = (event?: Event) => {
		if (!event) {
			return {
				timings: participantCategories.reduce<
					Record<
						string,
						{
							categoryId: string;
							startTime: string | undefined;
							endTime: string | undefined;
						}
					>
				>(
					(acc, category) => ({
						...acc,
						[category.id]: {
							categoryId: category.id,
							startTime: undefined,
							endTime: undefined
						}
					}),
					{}
				)
			};
		}

		const missingParticipantCategories = participantCategories.filter(
			category =>
				!event.subEvents.some(
					subEvent => subEvent.participantCategoryId === category.id
				)
		);

		return {
			name: event.name,
			timings: {
				...event.subEvents.reduce(
					(acc, subEvent) => ({
						...acc,
						[subEvent.id]: {
							categoryId: subEvent.participantCategory?.id,
							startTime: subEvent.startTime
								? format(new Date(subEvent.startTime), 'HH:mm')
								: undefined,
							endTime: subEvent.endTime
								? format(new Date(subEvent.endTime), 'HH:mm')
								: undefined
						}
					}),
					{}
				),
				...missingParticipantCategories.reduce(
					(acc, category) => ({
						...acc,
						[category.id]: {
							categoryId: category.id,
							startTime: undefined,
							endTime: undefined
						}
					}),
					{}
				)
			} as Record<
				string,
				{
					categoryId: string;
					startTime: string | undefined;
					endTime: string | undefined;
				}
			>,
			coordinator: event.coordinator?.id,
			category: event.category?.id
		};
	};

	const defaultValues = getEventDefaultValues(event);

	const form = useForm<EventFormData>({
		resolver: zodResolver(eventSchema),
		defaultValues
	});

	const handleFormSubmit = async (data: EventFormData) => {
		setIsSubmitting(true);

		try {
			const mutationData = {
				id: event?.id ?? createId(),
				name: data.name,
				coordinatorId: data.coordinator,
				eventCategoryId: data.category
			};
			if (!event) {
				// Create the event in db
				zero
					.mutateBatch(async tx => {
						await zero.mutate.events.insert(mutationData);
						for (const subCategoryId of Object.keys(data.timings)) {
							const subEvent = data.timings[subCategoryId];
							if (subEvent.startTime && subEvent.endTime) {
								await tx.subEvents.insert({
									id: createId(),
									eventId: mutationData.id,
									participantCategoryId: subEvent.categoryId,
									startTime: set(new Date(2025, 8, 25), {
										hours: parseInt(subEvent.startTime.split(':')[0]),
										minutes: parseInt(subEvent.startTime.split(':')[1])
									}).getTime(),
									endTime: set(new Date(2025, 8, 25), {
										hours: parseInt(subEvent.endTime.split(':')[0]),
										minutes: parseInt(subEvent.endTime.split(':')[1])
									}).getTime()
								});
							}
						}
					})
					.catch(e => {
						console.log('Error adding participants', e);
					});
			} else {
				// Update event
				const existingSubEventIds = event.subEvents.map(
					subEvent => subEvent.id
				);
				await zero
					.mutateBatch(async tx => {
						await tx.events.update(mutationData);
						for (const subCategoryId of Object.keys(data.timings)) {
							const subEvent = data.timings[subCategoryId];
							if (subEvent.startTime && subEvent.endTime) {
								if (existingSubEventIds.includes(subCategoryId)) {
									await tx.subEvents.update({
										id: subCategoryId,
										startTime: set(new Date(2025, 8, 25), {
											hours: parseInt(subEvent.startTime.split(':')[0]),
											minutes: parseInt(subEvent.startTime.split(':')[1])
										}).getTime(),
										endTime: set(new Date(2025, 8, 25), {
											hours: parseInt(subEvent.endTime.split(':')[0]),
											minutes: parseInt(subEvent.endTime.split(':')[1])
										}).getTime()
									});
								} else {
									await tx.subEvents.insert({
										id: subCategoryId,
										eventId: event.id,
										participantCategoryId: subEvent.categoryId,
										startTime: set(new Date(2025, 8, 25), {
											hours: parseInt(subEvent.startTime.split(':')[0]),
											minutes: parseInt(subEvent.startTime.split(':')[1])
										}).getTime(),
										endTime: set(new Date(2025, 8, 25), {
											hours: parseInt(subEvent.endTime.split(':')[0]),
											minutes: parseInt(subEvent.endTime.split(':')[1])
										}).getTime()
									});
								}
							}
						}
					})
					.catch(e => {
						console.log('Error updating participants', e);
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
						<FormItem className='flex flex-col gap-2'>
							<FormLabel>Timings</FormLabel>
							{Object.keys(defaultValues.timings).map(id => {
								const category =
									participantCategoryMap[defaultValues.timings[id].categoryId];
								return (
									<FormItem key={id}>
										<FormLabel className='italic'>{category.name}</FormLabel>
										<div className='flex gap-4'>
											<SelectField
												name={`timings.${id}.startTime`}
												label={`${category.name} Start Time`}
												options={getTimeOptions()}
												hideLabel
											/>
											<SelectField
												name={`timings.${id}.endTime`}
												label={`${category.name} End Time`}
												options={getTimeOptions()}
												hideLabel
											/>
										</div>
									</FormItem>
								);
							})}
						</FormItem>
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
