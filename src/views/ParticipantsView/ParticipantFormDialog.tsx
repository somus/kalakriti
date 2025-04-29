import {
	FormLayout,
	InputField,
	SelectField,
	SelectOption
} from '@/components/form';
import { DateField } from '@/components/form/DateField';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog';
import { genderEnum } from '@/db/schema';
import { useApp } from '@/hooks/useApp';
import useZero from '@/hooks/useZero';
import { CenterOutletContext } from '@/layout/CenterLayout';
import { zodResolver } from '@hookform/resolvers/zod';
import { createId } from '@paralleldrive/cuid2';
import { useQuery } from '@rocicorp/zero/react';
import { differenceInYears } from 'date-fns';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useOutletContext } from 'react-router';
import * as z from 'zod';

import { Participant } from './ParticipantsView';

const participantSchema = z.object({
	name: z.string(),
	dob: z.date(),
	gender: z.enum(genderEnum.enumValues),
	center: z.string().cuid2()
});

type ParticipantFormData = z.infer<typeof participantSchema>;

export default function ParticipantFormDialog({
	participant,
	open,
	onOpenChange,
	children
}: {
	participant?: Participant;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	children?: React.ReactNode;
}) {
	const zero = useZero();
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const outletContext = useOutletContext<CenterOutletContext>();
	const { user } = useApp();
	const [centers] = useQuery(zero.query.centers);
	const [participantCategories] = useQuery(zero.query.participantCategories);

	if (!children && !(open !== undefined && onOpenChange)) {
		throw new Error(
			'ParticipantFormDialog must have children or pass open and onOpenChange props'
		);
	}

	const centerOptions: SelectOption[] = centers.map(center => ({
		value: center.id,
		label: center.name
	}));
	const genderOptions: SelectOption[] = [
		{ value: 'male', label: 'Male' },
		{ value: 'female', label: 'Female' }
	];
	const defaultCenter =
		user.role === 'admin' ? undefined : outletContext?.center?.id;

	// Get participant default values
	const getParticipantDefaultValues = (participant?: Participant) => {
		if (!participant) {
			return {
				center: defaultCenter
			};
		}

		return {
			name: participant.name,
			dob: participant.dob ? new Date(participant.dob) : undefined,
			gender: participant.gender,
			center: participant.center?.id
		};
	};

	const form = useForm<ParticipantFormData>({
		resolver: zodResolver(participantSchema),
		defaultValues: getParticipantDefaultValues(participant)
	});

	const handleFormSubmit = async (data: ParticipantFormData) => {
		setIsSubmitting(true);

		try {
			if (!participant) {
				const age = differenceInYears(new Date(), data.dob);
				const participantCategory = participantCategories.find(
					category => category.minAge < age && category.maxAge > age
				);
				if (!participantCategory) {
					throw new Error('Participant category not found');
				}

				// Create the participant in db
				const participantId = createId();
				await zero.mutate.participants.insert({
					id: participantId,
					name: data.name,
					dob: data.dob.getTime(),
					age,
					gender: data.gender,
					centerId: data.center ?? defaultCenter,
					participantCategoryId: participantCategory.id
				});
			} else {
				console.log(participant, data);
				// Update participant
				await zero.mutate.participants.update({
					id: participant.id,
					name: data.name
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
			console.log(e);
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
			modal={false}
		>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className='sm:max-w-[425px]' aria-describedby={undefined}>
				<DialogHeader>
					<DialogTitle>
						{!participant ? 'Create Participant' : 'Update Participant'}
					</DialogTitle>
				</DialogHeader>
				<FormLayout<ParticipantFormData>
					form={form}
					onSubmit={form.handleSubmit(handleFormSubmit)}
				>
					<InputField name='name' label='Name' />
					<DateField
						name='dob'
						label='Date of Birth'
						disabled={!!participant}
					/>
					<SelectField
						name='gender'
						label='Gender'
						options={genderOptions}
						disabled={!!participant}
					/>
					<SelectField
						name='center'
						label='Center'
						options={centerOptions}
						disabled={!!participant || user.role !== 'admin'}
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
