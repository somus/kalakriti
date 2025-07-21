import DataTableWrapper from '@/components/data-table-wrapper';
import { Badge } from '@/components/ui/badge';
import { H3 } from '@/components/ui/typography';
import useZero, { Zero } from '@/hooks/useZero';
import { Row } from '@rocicorp/zero';
import { useQuery } from '@rocicorp/zero/react';
import { formatDate } from 'date-fns';
import groupBy from 'lodash/groupBy';
import { Navigate, useParams } from 'react-router';
import * as z from 'zod';

import { SubEventParticipant } from '../CenterEventView/CenterEventView';
import { columns } from '../CenterEventView/columns';
import { columnsConfig } from '../CenterEventView/filters';

function eventQuery(z: Zero, eventId: string) {
	return z.query.subEvents
		.where('id', eventId)
		.related('participants', q =>
			q.related('participant', q => q.related('center'))
		)
		.related('participantCategory')
		.related('event', q => q.related('coordinators').related('category'))
		.one();
}

export type Event = NonNullable<Row<ReturnType<typeof eventQuery>>>;

export default function EventView() {
	// eslint-disable-next-line react-hooks/react-compiler
	'use no memo';

	const params = useParams();
	const zero = useZero();
	const eventId = z.cuid2().parse(params.eventId);
	const [subEvent, status] = useQuery(eventQuery(zero, eventId));

	if (!eventId) {
		return <Navigate to='/' />;
	}

	if (status.type !== 'complete' || !subEvent || !subEvent.event) {
		return null;
	}
	const {
		isGroupEvent,
		maxParticipants,
		minGroupSize,
		maxGroupSize,
		category
	} = subEvent.event;
	const participants = isGroupEvent
		? Object.values(groupBy(subEvent.participants, 'groupId')).map(
				(group, key) => ({
					groupId: group[0].groupId,
					participant: {
						name: `Group ${key + 1}`,
						center: {
							id: group[0].participant?.center?.id,
							name: group[0].participant?.center?.name
						}
					},
					subRows: group
				})
			)
		: subEvent.participants;

	return (
		<div className='flex flex-col py-4 flex-1'>
			<div className='flex px-4 justify-between items-center'>
				<div className='flex gap-4 items-end flex-wrap'>
					<H3>
						{subEvent.event.name} - {subEvent.participantCategory?.name}
					</H3>
					<p className='italic'>
						{formatDate(subEvent.startTime, 'p')} -{' '}
						{formatDate(subEvent.endTime, 'p')}
					</p>
					<div className='flex gap-1 flex-wrap'>
						<Badge variant='outline'>{category?.name}</Badge>
						{isGroupEvent && <Badge variant='outline'>Group Event</Badge>}
						{isGroupEvent ? (
							<>
								<Badge variant='outline'>
									Group Size:{' '}
									{minGroupSize === maxGroupSize
										? `${minGroupSize}`
										: `${minGroupSize} - ${maxGroupSize}`}
								</Badge>
								<Badge variant='outline'>Max Groups: {maxParticipants}</Badge>
							</>
						) : (
							<Badge variant='outline'>
								Max Participants: {maxParticipants}
							</Badge>
						)}
					</div>
				</div>
			</div>
			<DataTableWrapper
				data={participants as SubEventParticipant[]}
				columns={columns}
				columnsConfig={columnsConfig}
			/>
		</div>
	);
}
