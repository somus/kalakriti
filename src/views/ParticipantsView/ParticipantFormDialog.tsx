import {
	FormLayout,
	InputField,
	SelectField,
	SelectOption
} from '@/components/form';
import { ComboBoxField } from '@/components/form/ComboBoxField';
import { DateField } from '@/components/form/DateField';
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
import { useApp } from '@/hooks/useApp';
import useZero from '@/hooks/useZero';
import { CenterOutletContext } from '@/layout/CenterLayout';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@rocicorp/zero/react';
import { subYears } from 'date-fns';
import { LoaderCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useOutletContext } from 'react-router';
import { genderEnum } from 'shared/db/schema';
import * as z from 'zod';

import { Participant } from './ParticipantsView';

const participantSchema = z.object({
	name: z.string(),
	dob: z.date(),
	gender: z.enum(genderEnum.enumValues),
	center: z.cuid2()
});

type ParticipantFormData = z.infer<typeof participantSchema>;

export default function ParticipantFormModal({
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
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const outletContext = useOutletContext<CenterOutletContext>();
	const { user } = useApp();
	const [centers] = useQuery(zero.query.centers);
	const [participantCategories] = useQuery(zero.query.participantCategories);

	if (!children && !(open !== undefined && onOpenChange)) {
		throw new Error(
			'ParticipantFormModal must have children or pass open and onOpenChange props'
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
	const defaultValues = useMemo(() => {
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
	}, [participant, defaultCenter]);

	const today = new Date();

	// Find min and max ages across all categories
	const oldestAge = Math.max(...participantCategories.map(cat => cat.maxAge));
	const youngestAge = Math.min(...participantCategories.map(cat => cat.minAge));

	// Set the min and max dates based on the ages
	const minDate = subYears(today, oldestAge);
	const maxDate = subYears(today, youngestAge);

	const form = useForm<ParticipantFormData>({
		resolver: zodResolver(
			participantSchema.extend({
				dob: z.date().min(minDate).max(maxDate)
			})
		),
		defaultValues
	});

	const handleFormSubmit = async (data: ParticipantFormData) => {
		setIsSubmitting(true);

		try {
			if (!participant) {
				await zero.mutate.participants.create({
					name: data.name,
					dob: data.dob.getTime(),
					gender: data.gender,
					centerId: data.center ?? defaultCenter
				}).server;
			} else {
				// Update participant
				await zero.mutate.participants.update({
					id: participant.id,
					name: data.name
				}).server;
			}

			// Close dialog on success
			setIsSubmitting(false);
			if (!participant) {
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
			<ModalContent className='sm:max-w-[445px]' aria-describedby={undefined}>
				<ModalHeader>
					<ModalTitle>
						{!participant ? 'Create Participant' : 'Update Participant'}
					</ModalTitle>
				</ModalHeader>
				<FormLayout<ParticipantFormData>
					form={form}
					onSubmit={form.handleSubmit(handleFormSubmit)}
				>
					<ModalBody className='space-y-4'>
						<InputField name='name' label='Name' />
						<div className='flex gap-2'>
							<DateField
								name='dob'
								label='Date of Birth'
								disabled={!!participant}
								disabledDates={{ before: minDate, after: maxDate }}
								defaultMonth={participant ? undefined : maxDate}
							/>
							<SelectField
								name='gender'
								label='Gender'
								options={genderOptions}
								disabled={!!participant}
							/>
						</div>
						<ComboBoxField
							name='center'
							label='Center'
							options={centerOptions}
							disabled={!!participant || user.role !== 'admin'}
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
