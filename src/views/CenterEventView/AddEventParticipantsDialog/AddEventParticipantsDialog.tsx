import DataTableWrapper from '@/components/data-table-wrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Modal,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalTitle,
	ModalTrigger
} from '@/components/ui/credenza';
import { H3 } from '@/components/ui/typography';
import { useIsMobile } from '@/hooks/use-mobile';
import useZero from '@/hooks/useZero';
import LoadingScreen from '@/views/general/LoadingScreen';
import { createId } from '@paralleldrive/cuid2';
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
	const isGroupEvent = currentEvent.event?.isGroupEvent ?? false;

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
		async (table: Table<Participant>) => {
			const selectedRows = table
				.getFilteredSelectedRowModel()
				.rows.map(row => row.original.id);

			try {
				await zero.mutate.subEventParticipants.createBatch({
					participantIds: selectedRows,
					subEventId: currentEvent.id,
					groupId: isGroupEvent ? createId() : undefined
				}).server;
			} catch (e) {
				toast.error('Error adding participants', {
					description: e instanceof Error ? e.message : 'Something went wrong'
				});
			}

			setOpen(false);
		},
		[zero, currentEvent.id, isGroupEvent]
	);

	const isMobile = useIsMobile();

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
				<ModalHeader className='pb-0'>
					<ModalTitle>
						<div className='flex gap-2 items-end flex-wrap'>
							<H3>
								Add participants for {currentEvent.event?.name} -{' '}
								{currentEvent.participantCategory?.name}
							</H3>
							{isGroupEvent ? (
								<>
									<Badge variant='outline'>
										Group Size:{' '}
										{currentEvent.event?.minGroupSize ===
										currentEvent.event?.maxGroupSize
											? `${currentEvent.event?.minGroupSize}`
											: `${currentEvent.event?.minGroupSize} - ${currentEvent.event?.maxGroupSize}`}
									</Badge>
									<Badge variant='outline'>
										Max Groups: {currentEvent.event?.maxParticipants}
									</Badge>
								</>
							) : (
								<Badge variant='outline'>
									Max Participants: {currentEvent.event?.maxParticipants}
								</Badge>
							)}
						</div>
					</ModalTitle>
				</ModalHeader>
				<DataTableWrapper
					data={filteredParticipants as Participant[]}
					columns={columns}
					columnsConfig={columnsConfig}
					disabledRows={participantsToDisable}
					selectedRows={isGroupEvent ? participantsToBeFiltered : undefined}
					tableContainerClassName={
						isMobile ? undefined : 'h-[calc(100dvh-242px)]'
					}
				>
					{table => {
						const noOfSelectedRows = table.getSelectedRowModel().rows.length;
						const disableAdd =
							isGroupEvent &&
							currentEvent.event?.maxGroupSize &&
							currentEvent.event?.minGroupSize
								? noOfSelectedRows > currentEvent.event?.maxGroupSize ||
									noOfSelectedRows < currentEvent.event?.minGroupSize
								: noOfSelectedRows === 0 ||
									noOfSelectedRows === currentEvent.event?.maxParticipants;

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
