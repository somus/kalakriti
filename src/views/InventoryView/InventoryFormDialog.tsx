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
import * as z from 'zod';

import { Inventory } from './InventoryView';

const inventorySchema = z.object({
	name: z.string(),
	unitPrice: z.number().min(0),
	quantity: z.number().min(0),
	eventId: z.string().nullable().optional()
});

type InventoryFormData = z.infer<typeof inventorySchema>;

export default function InventoryFormModal({
	inventory,
	open,
	onOpenChange,
	children
}: {
	inventory?: Inventory;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	children?: React.ReactNode;
}) {
	const zero = useZero();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [events] = useQuery(zero.query.events.orderBy('name', 'asc'));

	if (!children && !(open !== undefined && onOpenChange)) {
		throw new Error(
			'InventoryFormModal must have children or pass open and onOpenChange props'
		);
	}

	const eventOptions: SelectOption[] = events.map(event => ({
		value: event.id,
		label: event.name
	}));

	// Get inventory default values
	const defaultValues = useMemo(() => {
		if (!inventory) return {};

		return {
			name: inventory.name,
			quantity: inventory.quantity,
			unitPrice: inventory.unitPrice,
			eventId: inventory.event?.id ?? undefined
		};
	}, [inventory]);

	const form = useForm<InventoryFormData>({
		resolver: zodResolver(inventorySchema),
		defaultValues
	});

	const handleFormSubmit = async (data: InventoryFormData) => {
		setIsSubmitting(true);

		try {
			if (!inventory) {
				// Create the inventory in db
				await zero.mutate.inventory.create({
					...data,
					eventId: data.eventId ?? undefined
				}).client;
			} else {
				// Update inventory
				await zero.mutate.inventory.update({
					id: inventory.id,
					name: data.name,
					eventId: data.eventId === '' ? null : data.eventId,
					unitPrice: data.unitPrice
				}).client;
			}

			// Close dialog on success
			setIsSubmitting(false);
			if (!inventory) {
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
			modal={false}
		>
			<ModalTrigger asChild>{children}</ModalTrigger>
			<ModalContent className='sm:max-w-[425px]' aria-describedby={undefined}>
				<ModalHeader>
					<ModalTitle>
						{!inventory ? 'Create Inventory' : 'Update Inventory'}
					</ModalTitle>
				</ModalHeader>
				<FormLayout<InventoryFormData>
					form={form}
					onSubmit={form.handleSubmit(handleFormSubmit)}
					className='flex flex-col flex-1'
				>
					<ModalBody className='space-y-4'>
						<InputField name='name' label='Name' />
						<InputField
							name='quantity'
							type='number'
							label='Quantity'
							disabled={!!inventory}
						/>
						<InputField name='unitPrice' type='number' label='Unit Price' />
						<SelectField
							name='eventId'
							label='Event'
							options={eventOptions}
							showClear
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
