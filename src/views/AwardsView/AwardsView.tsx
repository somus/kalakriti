import DataTableWrapper from '@/components/data-table-wrapper';
import useZero, { Zero } from '@/hooks/useZero';
import LoadingScreen from '@/views/general/LoadingScreen';
import { Row } from '@rocicorp/zero';
import { useQuery } from '@rocicorp/zero/react';
import groupBy from 'lodash/groupBy';
import orderBy from 'lodash/orderBy';

import { columns } from './columns';
import { columnsConfig } from './filters';

function subEventParticipantsQuery(z: Zero) {
	return z.query.subEventParticipants
		.related('subEvent', q => q.related('event').related('participantCategory'))
		.related('participant', q => q.related('center'))
		.where(q => q.or(q.cmp('isWinner', true), q.cmp('isRunner', true)))
		.orderBy('createdAt', 'desc');
}

export type SubEventParticipant = Row<
	ReturnType<typeof subEventParticipantsQuery>
> & { subRows?: SubEventParticipant[] };

export default function AwardsView() {
	// eslint-disable-next-line react-hooks/react-compiler
	'use no memo';

	const zero = useZero();
	const [subEventParticipants, status] = useQuery(
		subEventParticipantsQuery(zero)
	);

	if (status.type !== 'complete') {
		return <LoadingScreen />;
	}

	if (!subEventParticipants) {
		return (
			<div className='flex h-screen w-full items-center justify-center'>
				<p className='text-gray-500 dark:text-gray-400'>
					<p>Unable to load participants</p>
				</p>
			</div>
		);
	}

	const participants = [
		...subEventParticipants.filter(p => p.groupId === null),
		...Object.values(
			groupBy(
				subEventParticipants.filter(p => p.groupId !== null),
				'groupId'
			)
		).map(group => ({
			groupId: group[0].groupId,
			participant: {
				name: `${group[0].subEvent?.event?.name} - ${group[0].subEvent?.participantCategory?.name} - ${group[0].isWinner ? 'Winner' : 'Runner-up'}`
			},
			createdAt: group[0].createdAt,
			subRows: orderBy(group, 'participant.name')
		}))
	];

	return (
		<DataTableWrapper
			data={participants as SubEventParticipant[]}
			columns={columns}
			columnsConfig={columnsConfig}
		/>
	);
}
