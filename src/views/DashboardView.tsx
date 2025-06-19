import { ChartPieDonut } from '@/components/pie-chart';
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
import { useApp } from '@/hooks/useApp';
import useZero from '@/hooks/useZero';
import { useQuery } from '@rocicorp/zero/react';
import camelCase from 'lodash/camelCase';

import { CenterPage, centerQuery } from './CenterView/CenterView';

export default function DashboardView() {
	const {
		user: { role }
	} = useApp();
	const zero = useZero();
	const [center] = useQuery(centerQuery(zero));
	const [users] = useQuery(zero.query.users);
	const [participants] = useQuery(zero.query.participants);
	const [centers] = useQuery(zero.query.centers.related('participants'));
	const [events] = useQuery(
		zero.query.events.related('subEvents', q => q.related('participants'))
	);

	if (role === 'guardian' && center) {
		return (
			<div className='w-full px-4'>
				<CenterPage center={center} />
			</div>
		);
	}

	const participantsByCentersConfig = centers
		? centers.reduce(
				(acc, center, index) => ({
					...acc,
					[camelCase(center.name)]: {
						label: center.name,
						color: `var(--chart-${index + 1})`
					}
				}),
				{}
			)
		: {};
	const participantsByCentersData = centers
		? centers.map(center => ({
				name: camelCase(center.name),
				value: center.participants.length,
				fill: `var(--color-${camelCase(center.name)})`
			}))
		: [];

	const participantsByEventsConfig = events
		? events.reduce(
				(acc, event, index) => ({
					...acc,
					[camelCase(event.name)]: {
						label: event.name,
						color: `var(--chart-${index + 1})`
					}
				}),
				{}
			)
		: {};
	const participantsByEventsData = events
		? events.map(event => ({
				name: camelCase(event.name),
				value: event.subEvents.reduce(
					(acc, subEvent) => acc + subEvent.participants.length,
					0
				),
				fill: `var(--color-${camelCase(event.name)})`
			}))
		: [];

	return (
		<div className='@container/main flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
			{/* <div className='flex gap-4'>
			<H2>{center.name}</H2>
		</div> */}
			<div className='*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6'>
				<Card className='@container/card'>
					<CardHeader className='relative'>
						<CardDescription>Total Volunteers</CardDescription>
						<CardTitle className='@[250px]/card:text-3xl text-2xl font-semibold tabular-nums'>
							{users.filter(user => user.role === 'volunteer').length}
						</CardTitle>
					</CardHeader>
				</Card>
				<Card className='@container/card'>
					<CardHeader className='relative'>
						<CardDescription>Total Centers</CardDescription>
						<CardTitle className='@[250px]/card:text-3xl text-2xl font-semibold tabular-nums'>
							{centers.length}
						</CardTitle>
					</CardHeader>
				</Card>
				<Card className='@container/card'>
					<CardHeader className='relative'>
						<CardDescription>Total Guardians</CardDescription>
						<CardTitle className='@[250px]/card:text-3xl text-2xl font-semibold tabular-nums'>
							{users.filter(user => user.role === 'guardian').length}
						</CardTitle>
					</CardHeader>
				</Card>
				<Card className='@container/card'>
					<CardHeader className='relative'>
						<CardDescription>Total Participants</CardDescription>
						<CardTitle className='@[250px]/card:text-3xl text-2xl font-semibold tabular-nums'>
							{participants.length}
						</CardTitle>
					</CardHeader>
				</Card>
			</div>
			<div className='@xl/main:grid-cols-1 @5xl/main:grid-cols-2 grid grid-cols-1 gap-4 px-4 lg:px-6'>
				<ChartPieDonut
					title='Participants by Center'
					dataLabel='Participants'
					chartConfig={participantsByCentersConfig}
					chartData={participantsByCentersData}
				/>
				<ChartPieDonut
					title='Participants by Events'
					dataLabel='Participants'
					chartConfig={participantsByEventsConfig}
					chartData={participantsByEventsData}
				/>
			</div>
		</div>
	);
}
