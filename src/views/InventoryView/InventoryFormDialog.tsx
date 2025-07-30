import {
	FormLayout,
	InputField,
	SelectField,
	SelectOption
} from '@/components/form';
import { FileUploader } from '@/components/form/ImageUploadField';
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
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@/components/ui/form';
import { env } from '@/env.client';
import useZero from '@/hooks/useZero';
import { useAuth } from '@clerk/clerk-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@rocicorp/zero/react';
import kebabCase from 'lodash/kebabCase';
import { LoaderCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Inventory } from './InventoryView';

const inventorySchema = z.object({
	name: z.string(),
	unitPrice: z.number().min(0),
	quantity: z.number().min(0),
	eventId: z.string().nullable().optional(),
	photoPath: z
		.string()
		.check(ctx => {
			if (
				ctx.value &&
				ctx.value !== '' &&
				!ctx.value.startsWith(`${env.VITE_ASSET_FOLDER}/`)
			) {
				ctx.issues.push({
					code: 'custom',
					message: 'Invalid photo path',
					input: ctx.value
				});
			}
		})
		.optional()
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
	const { getToken } = useAuth();
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
			eventId: inventory.event?.id ?? undefined,
			photoPath: inventory.photoPath ?? undefined
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
				const oldPhotoPath = inventory.photoPath;
				// Update inventory
				await zero.mutate.inventory
					.update({
						id: inventory.id,
						name: data.name,
						eventId: data.eventId === '' ? null : data.eventId,
						unitPrice: data.unitPrice,
						photoPath: data.photoPath
					})
					.client.then(async () => {
						if (oldPhotoPath !== data.photoPath) {
							// Delete the old photo from R2 bucket
							const token = await getToken();
							await fetch('http://localhost:3000/api/deleteAsset', {
								method: 'DELETE',
								headers: {
									accept: 'application/json',
									Authorization: `Bearer ${token}`
								},
								body: JSON.stringify({
									filePath: oldPhotoPath
								})
							});
						}
					});
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
						<FormField
							control={form.control}
							name='photoPath'
							render={({ field }) => (
								<FormItem className='flex flex-col'>
									<FormLabel showClear>Photo</FormLabel>
									<FormControl>
										{!field.value || field.value === '' ? (
											<FileUploader
												onUploadSuccess={result => {
													if (result.successful?.length === 1) {
														form.setValue(
															'photoPath',
															`${env.VITE_ASSET_FOLDER}/${kebabCase(result.successful[0].name)}`
														);
													}
												}}
												getToken={getToken}
											/>
										) : (
											<img
												src={`${import.meta.env.DEV ? 'https://kalakriti.proudindian.ngo' : ''}/cdn-cgi/image/height=500,quality=75/${env.VITE_IMAGE_CDN}/${field.value}`}
												className='object-contain cursor-pointer'
											/>
										)}
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
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
