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
import MultipleSelector, { Option } from '@/components/ui/input-multiselect';
import useZero from '@/hooks/useZero';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@rocicorp/zero/react';
import { format, set } from 'date-fns';
import keyBy from 'lodash/keyBy';
import { LoaderCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod/v4';

import { Event } from './EventsView';

// eslint-disable-next-line react-refresh/only-export-components
export const getTimeOptions = () =>
	Array.from({ length: 49 }).map((_, i) => {
		const hour24 = Math.floor(i / 4) + 6;
		const minute = ((i % 4) * 15).toString().padStart(2, '0');

		const hour12 = hour24 === 12 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
		const ampm = hour24 < 12 ? 'AM' : 'PM';
		const hour24Str = hour24.toString().padStart(2, '0');

		return {
			label: `${hour12}:${minute} ${ampm}`,
			value: `${hour24Str}:${minute}`
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
	const [users] = useQuery(zero.query.users.where('role', 'volunteer'));
	const [eventCategories] = useQuery(zero.query.eventCategories);
	const [participantCategories] = useQuery(zero.query.participantCategories);
	const participantCategoryMap = keyBy(participantCategories, 'id');

	if (!children && !(open !== undefined && onOpenChange)) {
		throw new Error(
			'EventFormModal must have children or pass open and onOpenChange props'
		);
	}

	const coordinatorOptions: Option[] = users
		.filter(user => user.canLogin)
		.map(user => ({
			value: user.id,
			label: `${user.firstName} ${user.lastName ?? ''}`
		}));
	const volunteerOptions: Option[] = users.map(user => ({
		value: user.id,
		label: `${user.firstName} ${user.lastName ?? ''}`
	}));
	const eventCategoryOptions: SelectOption[] = eventCategories.map(
		category => ({
			value: category.id,
			label: category.name
		})
	);

	const eventSchema = z.object({
		name: z.string({ error: 'Name is required' }),
		timings: z.record(
			z.string(),
			z
				.object({
					categoryId: z.cuid2(),
					startTime: z.iso.time().optional(),
					endTime: z.iso.time().optional()
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
		coordinators: z
			.array(z.string(), { error: 'Coordinators are required' })
			.min(1, { error: 'Coordinators are required' }),
		volunteers: z.array(z.string()),
		category: z.cuid2({ error: 'Category is required' })
	});

	type EventFormData = z.infer<typeof eventSchema>;

	// Get event default values
	const defaultValues = useMemo(() => {
		if (!event) {
			return {
				volunteers: [],
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
			coordinators: event.coordinators.map(user => user.userId),
			volunteers: event.volunteers.map(user => user.userId),
			category: event.category?.id
		};
	}, [event, participantCategories]);

	const form = useForm<EventFormData>({
		resolver: zodResolver(eventSchema),
		defaultValues
	});
	const errors = form.formState.errors;

	const handleFormSubmit = async (data: EventFormData) => {
		setIsSubmitting(true);

		try {
			const mutationData = {
				name: data.name,
				coordinators: data.coordinators,
				volunteers: data.volunteers,
				eventCategoryId: data.category,
				timings: Object.keys(data.timings).reduce((acc, timingKey) => {
					const timing = data.timings[timingKey];
					return {
						...acc,
						[timingKey]: {
							categoryId: event ? timing.categoryId : timingKey,
							startTime:
								timing.startTime &&
								set(new Date(2025, 8, 14), {
									hours: parseInt(timing.startTime.split(':')[0]),
									minutes: parseInt(timing.startTime.split(':')[1])
								}).getTime(),
							endTime:
								timing.endTime &&
								set(new Date(2025, 8, 14), {
									hours: parseInt(timing.endTime.split(':')[0]),
									minutes: parseInt(timing.endTime.split(':')[1])
								}).getTime()
						}
					};
				}, {})
			};
			if (!event) {
				// Create the event in db
				await zero.mutate.events.create(mutationData).server;
			} else {
				// Update event
				await zero.mutate.events.update({ id: event.id, ...mutationData })
					.server;
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
		} finally {
			if (!event) {
				// Reset form values after creation
				form.reset();
			}
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
						<div className='space-y-2'>
							<label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
								Coordinators
							</label>
							<MultipleSelector
								defaultOptions={coordinatorOptions}
								placeholder='Select coordinators'
								emptyIndicator={<p>no results found.</p>}
								value={form.watch('coordinators')?.map(id => {
									const option = coordinatorOptions.find(
										opt => opt.value === id
									);
									return option ?? { value: id, label: id };
								})}
								onChange={options => {
									form.setValue(
										'coordinators',
										options.map(opt => opt.value),
										{ shouldValidate: true }
									);
								}}
							/>
							{errors.coordinators && (
								<p
									data-slot='form-message'
									className='text-destructive text-sm'
								>
									{errors.coordinators.message}
								</p>
							)}
						</div>
						<div className='space-y-2'>
							<label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
								Volunteers
							</label>
							<MultipleSelector
								defaultOptions={volunteerOptions}
								placeholder='Select volunteers'
								emptyIndicator={<p>no results found.</p>}
								value={form.watch('volunteers')?.map(id => {
									const option = volunteerOptions.find(opt => opt.value === id);
									return option ?? { value: id, label: id };
								})}
								onChange={options => {
									form.setValue(
										'volunteers',
										options.map(opt => opt.value),
										{ shouldValidate: true }
									);
								}}
							/>
							{errors.volunteers && (
								<p
									data-slot='form-message'
									className='text-destructive text-sm'
								>
									{errors.volunteers.message}
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
