import {
	FormLayout,
	InputField,
	SelectField,
	SelectOption
} from '@/components/form';
import { ComboBoxField } from '@/components/form/ComboBoxField';
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
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@rocicorp/zero/react';
import keyBy from 'lodash/keyBy';
import startCase from 'lodash/startCase';
import uniqBy from 'lodash/uniqBy';
import { LoaderCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { inventoryTransactionType } from 'shared/db/schema';
import * as z from 'zod';

const inventoryTransactionSchema = z.object({
	inventoryId: z.string(),
	type: z.enum(inventoryTransactionType.enumValues),
	quantity: z.number().min(0),
	events: z.array(z.string()),
	transactorId: z.string().optional(),
	notes: z.string().min(1).max(255).optional()
});

type InventoryTransactionFormData = z.infer<typeof inventoryTransactionSchema>;

export default function InventoryTransactionFormModal({
	open,
	onOpenChange,
	children
}: {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	children?: React.ReactNode;
}) {
	const zero = useZero();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [events] = useQuery(
		zero.query.events
			.related('coordinators', q => q.related('user'))
			.related('volunteers', q => q.related('user'))
			.orderBy('name', 'asc')
	);
	const [volunteers] = useQuery(
		zero.query.users.where('role', 'volunteer').orderBy('firstName', 'asc')
	);
	const [inventories] = useQuery(
		zero.query.inventory.related('events').orderBy('name', 'asc')
	);

	if (!children && !(open !== undefined && onOpenChange)) {
		throw new Error(
			'InventoryTransactionFormModal must have children or pass open and onOpenChange props'
		);
	}

	const eventOptions: Option[] = events.map(event => ({
		value: event.id,
		label: event.name
	}));
	const typeOptions: SelectOption[] = inventoryTransactionType.enumValues
		.filter(type => type !== 'initial_inventory')
		.map(type => ({
			value: type,
			label: startCase(type)
		}));
	const inventoryOptions = inventories.map(inventory => ({
		value: inventory.id,
		label: inventory.name
	}));
	const eventsMap = keyBy(events, 'id');
	const inventoriesMap = keyBy(inventories, 'id');

	// Get inventoryTransaction default values
	const defaultValues = useMemo(() => {
		return {
			events: []
		};
	}, []);

	const schemaWithLimits = inventoryTransactionSchema.check(ctx => {
		if (
			ctx.value.type === 'adjustment' &&
			(!ctx.value.notes || ctx.value.notes.trim() === '')
		) {
			ctx.issues.push({
				code: 'custom',
				message: 'Notes are required for adjustment transactions',
				path: ['notes'],
				input: ctx.value.notes
			});
		}
		if (ctx.value.inventoryId) {
			if (
				inventoriesMap[ctx.value.inventoryId]?.events &&
				ctx.value.events.every(
					eventId =>
						!!inventoriesMap[ctx.value.inventoryId]?.events.find(
							e => e.eventId === eventId
						)
				)
			) {
				ctx.issues.push({
					code: 'custom',
					message: 'Event does not match the event of the selected inventory',
					path: ['eventId'],
					input: ctx.value.events
				});
			}

			if (
				ctx.value.type === 'event_dispatch' &&
				ctx.value.quantity > inventoriesMap[ctx.value.inventoryId]?.quantity
			) {
				ctx.issues.push({
					code: 'custom',
					message: 'Quantity exceeds inventory quantity',
					path: ['quantity'],
					input: ctx.value.quantity
				});
			}

			if (
				(ctx.value.type === 'event_dispatch' ||
					ctx.value.type === 'event_return') &&
				!ctx.value.transactorId
			) {
				ctx.issues.push({
					code: 'custom',
					message: 'Volunteer is required for dispatch and return transactions',
					path: ['transactorId'],
					input: ctx.value.transactorId
				});
			}
		}
	});

	const form = useForm<InventoryTransactionFormData>({
		resolver: zodResolver(schemaWithLimits),
		defaultValues
	});
	const { setValue, watch } = form;
	const currentEvents = watch('events');
	const transactorOptions =
		currentEvents.length > 0 &&
		(watch('type') === 'event_dispatch' || watch('type') === 'event_return')
			? uniqBy(
					[
						...currentEvents.flatMap(eventId =>
							eventsMap[eventId].coordinators.map(coordinator => ({
								label: `${coordinator.user?.firstName} ${coordinator.user?.lastName ?? ''}`,
								value: coordinator.userId
							}))
						),
						...currentEvents.flatMap(eventId =>
							eventsMap[eventId].volunteers.map(volunteer => ({
								label: `${volunteer.user?.firstName} ${volunteer.user?.lastName ?? ''}`,
								value: volunteer.userId
							}))
						)
					],
					'value'
				).sort((a, b) => a.label.localeCompare(b.label))
			: volunteers.map(volunteer => ({
					label: `${volunteer?.firstName} ${volunteer?.lastName ?? ''}`,
					value: volunteer.id
				}));

	const handleFormSubmit = async (data: InventoryTransactionFormData) => {
		setIsSubmitting(true);

		try {
			// Create the inventoryTransaction in db
			await zero.mutate.inventoryTransactions.create({
				...data,
				transactorId: data.transactorId === '' ? undefined : data.transactorId
			}).client;

			// Close dialog on success
			setIsSubmitting(false);
			// Reset form values after creation
			form.reset();
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

	const selectedInventory = inventoriesMap[watch('inventoryId')];
	useEffect(() => {
		const selectedInventoryEventsId =
			selectedInventory?.events.map(event => event.eventId) ?? [];
		if (selectedInventoryEventsId) {
			setValue('events', selectedInventoryEventsId);
		}
	}, [selectedInventory, setValue]);

	return (
		<Modal
			open={open ?? isModalOpen}
			onOpenChange={onOpenChange ?? setIsModalOpen}
			modal={false}
		>
			<ModalTrigger asChild>{children}</ModalTrigger>
			<ModalContent className='sm:max-w-[425px]' aria-describedby={undefined}>
				<ModalHeader>
					<ModalTitle>Create Inventory Transaction</ModalTitle>
				</ModalHeader>
				<FormLayout<InventoryTransactionFormData>
					form={form}
					onSubmit={form.handleSubmit(handleFormSubmit)}
					className='flex flex-col flex-1'
				>
					<ModalBody className='space-y-4'>
						<ComboBoxField
							name='inventoryId'
							label='Inventory'
							options={inventoryOptions}
							isRequired
						/>
						<SelectField
							name='type'
							label='Type'
							options={typeOptions}
							isRequired
						/>
						<InputField
							name='quantity'
							type='number'
							label='Quantity'
							description={
								watch('type') === 'event_dispatch' && !!selectedInventory
									? `There are ${selectedInventory?.quantity ?? 0} items left`
									: undefined
							}
							isRequired
						/>
						<MultiSelectField
							name='events'
							label='Events'
							options={eventOptions}
							placeholder='Select events'
							disabled={inventoriesMap[watch('inventoryId')]?.events.length > 0}
						/>
						<ComboBoxField
							name='transactorId'
							label='Volunteer'
							options={transactorOptions}
						/>
						<InputField name='notes' type='text' label='Notes' />
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
