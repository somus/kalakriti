import {
	FormLayout,
	InputField,
	SelectField,
	SelectOption
} from '@/components/form';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog';
import { EventCategory } from '@/db/schema.zero';
import useZero from '@/hooks/useZero';
import { zodResolver } from '@hookform/resolvers/zod';
import { createId } from '@paralleldrive/cuid2';
import { useQuery } from '@rocicorp/zero/react';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const eventCategorySchema = z.object({
	name: z.string(),
	coordinator: z.string().nullable().optional()
});

type EventCategoryFormData = z.infer<typeof eventCategorySchema>;

export default function EventCategoryFormDialog({
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
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [volunteers] = useQuery(
		zero.query.users.where('role', 'IN', ['volunteer', 'admin'])
	);

	if (!children && !(open !== undefined && onOpenChange)) {
		throw new Error(
			'EventCategoryFormDialog must have children or pass open and onOpenChange props'
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
				setIsDialogOpen(false);
			}
		} catch (e) {
			setIsSubmitting(false);
			form.setError('root.serverError', {
				message: e instanceof Error ? e.message : 'Something went wrong'
			});
		}
	};

	return (
		<Dialog
			open={open ?? isDialogOpen}
			onOpenChange={onOpenChange ?? setIsDialogOpen}
		>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className='sm:max-w-[425px]' aria-describedby={undefined}>
				<DialogHeader>
					<DialogTitle>
						{!eventCategory ? 'Create Event Category' : 'Update Event Category'}
					</DialogTitle>
				</DialogHeader>
				<FormLayout<EventCategoryFormData>
					form={form}
					onSubmit={form.handleSubmit(handleFormSubmit)}
				>
					<InputField name='name' label='Name' />
					<SelectField
						name='coordinator'
						label='Coordinator'
						options={coordinatorOptions}
					/>

					<DialogFooter>
						<Button type='submit' disabled={isSubmitting}>
							{isSubmitting && <LoaderCircle className='animate-spin mr-2' />}
							Save changes
						</Button>
					</DialogFooter>
				</FormLayout>
			</DialogContent>
		</Dialog>
	);
}
