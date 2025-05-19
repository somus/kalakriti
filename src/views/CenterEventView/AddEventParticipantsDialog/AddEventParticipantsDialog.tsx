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
import { Event, Participant, ParticipantCategory } from '@/db/schema.zero';
import useZero from '@/hooks/useZero';
import LoadingScreen from '@/views/general/LoadingScreen';
import { createId } from '@paralleldrive/cuid2';
import { useQuery } from '@rocicorp/zero/react';
import { Table } from '@tanstack/react-table';
import { useCallback, useState } from 'react';

import { columns } from './columns';
import { columnsConfig } from './filters';

export default function AddEventParticipantsDialog({
	children,
	event,
	participantCategory,
	participantsToBeFiltered = []
}: {
	children: React.ReactNode;
	event: Event;
	participantCategory: ParticipantCategory;
	participantsToBeFiltered?: string[];
}) {
	'use no memo';
	const zero = useZero();
	const [participants, status] = useQuery(
		zero.query.participants
			.where('participantCategoryId', '=', participantCategory.id)
			.where('id', 'NOT IN', participantsToBeFiltered)
			.related('events', q => q.related('event'))
	);
	const filteredParticipants = participants.filter(
		participant =>
			participant.events.length < participantCategory.totalEventsAllowed &&
			participant.events.filter(
				e => e.event?.eventCategoryId === event.eventCategoryId
			).length < participantCategory.maxEventsPerCategory
	);

	const [open, setOpen] = useState(false);
	const handleAdd = useCallback(
		(table: Table<Participant>) => {
			const selectedRows = table
				.getFilteredSelectedRowModel()
				.rows.map(row => row.original.id);
			zero
				.mutateBatch(async tx => {
					for (const participantId of selectedRows) {
						await tx.eventParticipants.insert({
							id: createId(),
							participantId,
							eventId: event.id
						});
					}
				})
				.catch(e => {
					console.log('Error adding participants', e);
				});

			setOpen(false);
		},
		[zero, event.id]
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
