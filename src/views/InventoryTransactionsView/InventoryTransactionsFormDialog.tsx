import {
	FormLayout,
	InputField,
	SelectField,
	SelectOption
} from '@/components/form';
import { ComboBoxField } from '@/components/form/ComboBoxField';
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
import { LoaderCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { inventoryTransactionType } from 'shared/db/schema';
import * as z from 'zod';

const inventoryTransactionSchema = z.object({
	inventoryId: z.string(),
	type: z.enum(inventoryTransactionType.enumValues),
	quantity: z.number().min(0),
	eventId: z.string().nullable().optional(),
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
	const [events] = useQuery(zero.query.events.orderBy('name', 'asc'));
	const [inventories] = useQuery(zero.query.inventory.orderBy('name', 'asc'));

	if (!children && !(open !== undefined && onOpenChange)) {
		throw new Error(
			'InventoryTransactionFormModal must have children or pass open and onOpenChange props'
		);
	}

	const eventOptions: SelectOption[] = events.map(event => ({
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
	const inventoriesMap = keyBy(inventories, 'id');

	// Get inventoryTransaction default values
	const defaultValues = useMemo(() => {
		return {};
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
				ctx.value.eventId !== inventoriesMap[ctx.value.inventoryId]?.eventId
			) {
				ctx.issues.push({
					code: 'custom',
					message: 'Event does not match the event of the selected inventory',
					path: ['eventId'],
					input: ctx.value.eventId
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
		}
	});

	const form = useForm<InventoryTransactionFormData>({
		resolver: zodResolver(schemaWithLimits),
		defaultValues
	});
	const { setValue, watch } = form;

	const handleFormSubmit = async (data: InventoryTransactionFormData) => {
		setIsSubmitting(true);

		try {
			// Create the inventoryTransaction in db
			await zero.mutate.inventoryTransactions.create({
				...data,
				eventId: data.eventId ?? undefined
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
	const selectedInventoryId = selectedInventory?.eventId;
	useEffect(() => {
		if (selectedInventoryId) {
			setValue('eventId', selectedInventoryId);
		}
	}, [selectedInventoryId, setValue]);

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
						/>
						<SelectField
							name='type'
							label='Type'
							options={typeOptions}
							showClear
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
						/>
						<SelectField
							name='eventId'
							label='Event'
							options={eventOptions}
							showClear
							disabled={!!inventoriesMap[watch('inventoryId')]?.eventId}
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
