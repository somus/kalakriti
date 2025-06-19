import { ChartPieDonut } from '@/components/pie-chart';
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
import { Schema } from '@/db/schema.zero';
import useZero from '@/hooks/useZero';
import { Center, CenterOutletContext } from '@/layout/CenterLayout';
import { Zero } from '@rocicorp/zero';
import { useQuery } from '@rocicorp/zero/react';
import camelCase from 'lodash/camelCase';
import { useOutletContext } from 'react-router';

// eslint-disable-next-line react-refresh/only-export-components
export function centerQuery(z: Zero<Schema>) {
	return z.query.centers
		.related('guardians', q => q.related('user'))
		.related('liaisons', q => q.related('user'))
		.related('participants', q => q.related('participantCategory'))
		.one();
}

export default function CenterView() {
	const { center } = useOutletContext<CenterOutletContext>();

	return <CenterPage center={center} />;
}

export function CenterPage({ center }: { center: Center }) {
	const zero = useZero();
	const [participantCategories] = useQuery(zero.query.participantCategories);
	const [events] = useQuery(
		zero.query.events.related('subEvents', q => q.related('participants'))
	);

	const participantsByAgeConfig = participantCategories
		? participantCategories.reduce(
				(acc, category, index) => ({
					...acc,
					[`${camelCase(category.name)}Boys`]: {
						label: `${category.name} - Boys`,
						color: `var(--chart-${index + index + 1})`
					},
					[`${camelCase(category.name)}Girls`]: {
						label: `${category.name} - Girls`,
						color: `var(--chart-${index + index + 2})`
					}
				}),
				{}
			)
		: {};
	const participantsByAgeData = participantCategories
		? participantCategories.flatMap(category => [
				{
					name: `${camelCase(category.name)}Boys`,
					value: center.participants.filter(
						p => p.participantCategoryId === category.id && p.gender === 'male'
					).length,
					fill: `var(--color-${camelCase(category.name)}Boys)`
				},
				{
					name: `${camelCase(category.name)}Girls`,
					value: center.participants.filter(
						p =>
							p.participantCategoryId === category.id && p.gender === 'female'
					).length,
					fill: `var(--color-${camelCase(category.name)}Girls)`
				}
			])
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
						<CardDescription>Total Participants</CardDescription>
						<CardTitle className='@[250px]/card:text-3xl text-2xl font-semibold tabular-nums'>
							{center.participants.length}
						</CardTitle>
					</CardHeader>
				</Card>
				<Card className='@container/card'>
					<CardHeader className='relative'>
						<CardDescription>Total Guardians</CardDescription>
						<CardTitle className='@[250px]/card:text-3xl text-2xl font-semibold tabular-nums'>
							{center.guardians.length}
						</CardTitle>
					</CardHeader>
				</Card>
				<Card className='@container/card'>
					<CardHeader className='relative'>
						<CardDescription>Total Liasons</CardDescription>
						<CardTitle className='@[250px]/card:text-3xl text-2xl font-semibold tabular-nums'>
							{center.liaisons.length}
						</CardTitle>
					</CardHeader>
				</Card>
			</div>
			<div className='@xl/main:grid-cols-1 @5xl/main:grid-cols-2 grid grid-cols-1 gap-4 px-4 lg:px-6'>
				<ChartPieDonut
					title='Participants by Events'
					dataLabel='Participants'
					chartConfig={participantsByEventsConfig}
					chartData={participantsByEventsData}
				/>
				<ChartPieDonut
					title='Participants by Age'
					dataLabel='Participants'
					chartConfig={participantsByAgeConfig}
					chartData={participantsByAgeData}
				/>
			</div>
		</div>
	);
}
