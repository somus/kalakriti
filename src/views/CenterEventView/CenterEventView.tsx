import DataTableWrapper from '@/components/data-table-wrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Schema } from '@/db/schema.zero';
import useZero from '@/hooks/useZero';
import { Row, Zero } from '@rocicorp/zero';
import { useQuery } from '@rocicorp/zero/react';
import { Navigate, useParams } from 'react-router';
import { z } from 'zod';

import AddEventParticipantsDialog from './AddEventParticipantsDialog/AddEventParticipantsDialog';
import { columns } from './columns';
import { columnsConfig } from './filters';

function centerEventQuery(z: Zero<Schema>, eventId: string) {
	return z.query.events
		.where('id', eventId)
		.related('category')
		.related('participants', q => q.related('participant'))
		.one();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function eventParticipantQuery(z: Zero<Schema>) {
	return z.query.eventParticipants.related('participant');
}

export type CenterEvent = Row<ReturnType<typeof centerEventQuery>>;
export type EventParticipant = Row<ReturnType<typeof eventParticipantQuery>>;

export default function CenterEventsView() {
	// eslint-disable-next-line react-hooks/react-compiler
	'use no memo';

	const params = useParams();
	const zero = useZero();
	const eventId = z.string().cuid2().parse(params.eventId);
	const [event, status] = useQuery(centerEventQuery(zero, eventId));
	const [participantCategories, participantCategoriesStatus] = useQuery(
		zero.query.participantCategories
	);

	if (!eventId) {
		return <Navigate to='/' />;
	}

	if (
		status.type !== 'complete' ||
		!event ||
		participantCategoriesStatus.type !== 'complete' ||
		!participantCategories
	) {
		return null;
	}

	const defaultParticipantCategory = participantCategories[0]?.id;

	return (
		<div className='flex flex-col gap-4'>
			<div className='flex gap-2'>
				<h3>{event.name}</h3>
				<Badge variant='outline'>{event.category?.name}</Badge>
			</div>
			{participantCategories.length > 0 && (
				<Tabs defaultValue={defaultParticipantCategory} className='gap-4'>
					<TabsList className='grid w-full grid-cols-2 max-w-[700px]'>
						{participantCategories.map(category => (
							<TabsTrigger key={category.id} value={category.id}>
								{category.name}{' '}
								<Badge
									variant='secondary'
									className='flex h-5 w-5 items-center justify-center rounded-full bg-muted-foreground/30'
								>
									{
										event.participants.filter(
											participant =>
												participant.participant?.participantCategoryId ===
												category.id
										).length
									}
								</Badge>
							</TabsTrigger>
						))}
					</TabsList>
					{participantCategories.map(category => {
						const categoryParticipants = event.participants.filter(
							participant =>
								participant.participant?.participantCategoryId === category.id
						);
						return (
							<TabsContent value={category.id} key={category.id}>
								<DataTableWrapper
									data={categoryParticipants}
									columns={columns}
									columnsConfig={columnsConfig}
									additionalActions={[
										<AddEventParticipantsDialog
											key='add-event-participants'
											event={event}
											participantCategory={category}
											participantsToBeFiltered={categoryParticipants.map(
												participant => participant.participantId
											)}
										>
											<Button className='h-7'>Add Participants</Button>
										</AddEventParticipantsDialog>
									]}
								/>
							</TabsContent>
						);
					})}
				</Tabs>
			)}
		</div>
	);
}
