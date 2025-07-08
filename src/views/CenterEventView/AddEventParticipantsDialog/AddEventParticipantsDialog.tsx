import DataTableWrapper from '@/components/data-table-wrapper';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog';
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
	const [participants, status] = useQuery(
		zero.query.participants
			.where(
				'participantCategoryId',
				'=',
				currentEvent.participantCategory?.id ?? ''
			)
			.where('id', 'NOT IN', participantsToBeFiltered)
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
			: [];

	const [open, setOpen] = useState(false);
	const handleAdd = useCallback(
		(table: Table<Participant>) => {
			const selectedRows = table
				.getFilteredSelectedRowModel()
				.rows.map(row => row.original.id);
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
		[zero, currentEvent.id]
	);

	if (status.type !== 'complete') {
		return <LoadingScreen />;
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent
				className='overflow-auto sm:max-w-[425px] md:max-w-[600px] xl:max-w-[900px] 2xl:max-w-[1200px]'
				aria-describedby={undefined}
			>
				<DialogHeader>
					<DialogTitle>Add participants</DialogTitle>
				</DialogHeader>
				<DataTableWrapper
					data={filteredParticipants as Participant[]}
					columns={columns}
					columnsConfig={columnsConfig}
					disabledRows={participantsToDisable}
				>
					{table => (
						<DialogFooter className='col-span-2'>
							<Button
								disabled={table.getSelectedRowModel().rows.length === 0}
								onClick={() => handleAdd(table)}
							>
								Add
							</Button>
						</DialogFooter>
					)}
				</DataTableWrapper>
			</DialogContent>
		</Dialog>
	);
}
