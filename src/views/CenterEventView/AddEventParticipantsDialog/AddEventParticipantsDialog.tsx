import DataTableWrapper from '@/components/data-table-wrapper';
import { Button } from '@/components/ui/button';
import {
	Modal,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalTitle,
	ModalTrigger
} from '@/components/ui/credenza';
import useZero from '@/hooks/useZero';
import LoadingScreen from '@/views/general/LoadingScreen';
import { useQuery } from '@rocicorp/zero/react';
import { Table } from '@tanstack/react-table';
import { useCallback, useState } from 'react';
import { Participant } from 'shared/db/schema.zero';
import { toast } from 'sonner';

import { SubEvent } from '../CenterEventView';
import { columns } from './columns';
import { columnsConfig } from './filters';

export default function AddEventParticipantsDialog({
	children,
	subEvent: currentEvent,
	eventCategoryId,
	participantsToBeFiltered = []
}: {
	children: React.ReactNode;
	subEvent: SubEvent;
	eventCategoryId: string;
	participantsToBeFiltered?: string[];
}) {
	// 'use no memo';
	const zero = useZero();
	const isGroupEvent =
		currentEvent.event?.minParticipants && currentEvent.event?.maxParticipants;

	const [participants, status] = useQuery(
		zero.query.participants
			.where(
				'participantCategoryId',
				'=',
				currentEvent.participantCategory?.id ?? ''
			)
			.where('id', 'NOT IN', isGroupEvent ? [] : participantsToBeFiltered)
			.related('subEvents', q => q.related('subEvent', q => q.related('event')))
			.orderBy('createdAt', 'desc')
	);
	const filteredParticipants = participants.filter(p =>
		currentEvent.event?.allowedGender === 'both'
			? true
			: p.gender === currentEvent.event?.allowedGender
	);

	const totalEventsAllowed =
		currentEvent.participantCategory?.totalEventsAllowed;
	const maxEventsPerCategory =
		currentEvent.participantCategory?.maxEventsPerCategory;
	const participantsToDisable =
		totalEventsAllowed && maxEventsPerCategory
			? filteredParticipants
					.filter(
						participant =>
							participant.subEvents.length >= totalEventsAllowed ||
							participant.subEvents.filter(
								e => e.subEvent?.event?.eventCategoryId === eventCategoryId
							).length >= maxEventsPerCategory ||
							participant.subEvents.some(
								subEvent =>
									subEvent?.subEvent?.startTime &&
									subEvent?.subEvent?.endTime &&
									currentEvent.startTime < subEvent.subEvent.endTime &&
									currentEvent.endTime > subEvent.subEvent.startTime
							)
					)
					.map(participant => participant.id)
					.filter(participantId =>
						// Don't disable already selected participants when it is a group event
						isGroupEvent
							? !participantsToBeFiltered.includes(participantId)
							: true
					)
			: [];

	const [open, setOpen] = useState(false);
	const handleAdd = useCallback(
		async (table: Table<Participant>) => {
			const selectedRows = table
				.getFilteredSelectedRowModel()
				.rows.map(row => row.original.id);

			if (isGroupEvent && participantsToBeFiltered.length > 0) {
				// Delete all participants from the current event while updating
				await zero.mutate.subEventParticipants.deleteBatch({
					ids: currentEvent.participants.map(participant => participant.id)
				}).server;
			}

			zero.mutate.subEventParticipants
				.createBatch({
					participantIds: selectedRows,
					subEventId: currentEvent.id
				})
				.server.catch((e: Error) => {
					toast.error('Error adding participants', {
						description: e.message || 'Something went wrong'
					});
				});

			setOpen(false);
		},
		[
			zero,
			currentEvent.id,
			isGroupEvent,
			currentEvent.participants,
			participantsToBeFiltered
		]
	);

	if (status.type !== 'complete') {
		return <LoadingScreen />;
	}

	return (
		<Modal open={open} onOpenChange={setOpen}>
			<ModalTrigger asChild>{children}</ModalTrigger>
			<ModalContent
				className='overflow-auto sm:max-w-[425px] md:max-w-[600px] xl:max-w-[900px] 2xl:max-w-[1200px] gap-0'
				aria-describedby={undefined}
			>
				<ModalHeader>
					<div className='flex flex-col gap-3'>
						<ModalTitle>
							Add participants for {currentEvent.event?.name} -{' '}
							{currentEvent.participantCategory?.name}
						</ModalTitle>
						{isGroupEvent && (
							<p className='text-sm'>
								Min Participants: {currentEvent.event?.minParticipants}, Max
								Participants: {currentEvent.event?.maxParticipants}
							</p>
						)}
					</div>
				</ModalHeader>
				<DataTableWrapper
					data={filteredParticipants as Participant[]}
					columns={columns}
					columnsConfig={columnsConfig}
					disabledRows={participantsToDisable}
					selectedRows={isGroupEvent ? participantsToBeFiltered : undefined}
					className='px-0'
				>
					{table => {
						const noOfSelectedRows = table.getSelectedRowModel().rows.length;
						const disableAdd = isGroupEvent
							? noOfSelectedRows > currentEvent.event?.maxParticipants ||
								noOfSelectedRows < currentEvent.event?.minParticipants
							: noOfSelectedRows === 0;

						return (
							<ModalFooter className='col-span-2 pt-4'>
								<Button
									disabled={disableAdd}
									// eslint-disable-next-line @typescript-eslint/no-misused-promises
									onClick={() => handleAdd(table)}
								>
									Add
								</Button>
							</ModalFooter>
						);
					}}
				</DataTableWrapper>
			</ModalContent>
		</Modal>
	);
}
