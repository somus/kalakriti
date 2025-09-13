import { ChartPieDonut } from '@/components/pie-chart';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table';
import { useApp } from '@/hooks/useApp';
import useZero from '@/hooks/useZero';
import { useQuery } from '@rocicorp/zero/react';
import camelCase from 'lodash/camelCase';
import { Link } from 'react-router';
import { teamsEnum } from 'shared/db/schema';

import { CenterPage, centerQuery } from './CenterView/CenterView';
import { TEAMS_NAME_MAP } from './UsersView/columns';

export default function DashboardView() {
	const {
		user: {
			role,
			leading,
			liaisoningCenters,
			coordinatingEventCategories,
			coordinatingEvents,
			guardianCenters
		}
	} = useApp();
	const zero = useZero();
	const [center] = useQuery(centerQuery(zero));
	const [users] = useQuery(zero.query.users);
	const [participants] = useQuery(zero.query.participants);
	const [centers] = useQuery(zero.query.centers.related('participants'));
	const [events] = useQuery(
		zero.query.events.related('subEvents', q =>
			q.related('participants', q => q.related('participant'))
		)
	);

	if (
		center &&
		((role === 'guardian' && guardianCenters?.length === 1) ||
			(role === 'volunteer' && liaisoningCenters?.length === 1))
	) {
		return <CenterPage center={center} />;
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
	const totalPeople = participants.length + users.length;
	const peopleWhoHadBreakfast =
		participants.filter(participant => participant.hadBreakfast).length +
		users.filter(user => user.hadBreakfast).length;
	const peopleWhoHadLunch =
		participants.filter(participant => participant.hadLunch).length +
		users.filter(user => user.hadLunch).length;
	const totalEvents = events.flatMap(event => event.subEvents).length;
	const completedEvents = events
		.flatMap(event => event.subEvents)
		.filter(
			subEvent =>
				subEvent.participants.some(participant => participant.isWinner) &&
				subEvent.participants.some(participant => participant.isRunner)
		).length;
	const startedEvents = events
		.flatMap(event => event.subEvents)
		.filter(subEvent =>
			subEvent.participants.some(participant => participant.attended)
		).length;
	const awardedPrizes = events
		.flatMap(event => event.subEvents)
		.reduce((acc, subEvent) => {
			const hasAwardedWinners = subEvent.participants.some(
				participant => participant.isWinner && participant.prizeAwarded
			);
			const hasAwardedRunners = subEvent.participants.some(
				participant => participant.isRunner && participant.prizeAwarded
			);
			return acc + (hasAwardedWinners ? 1 : 0) + (hasAwardedRunners ? 1 : 0);
		}, 0);
	const centerScores = events
		.flatMap(event => event.subEvents)
		.reduce(
			(acc, subEvent) => {
				const winnerCenterId = subEvent.participants.find(
					participant => participant.isWinner
				)?.participant?.centerId;
				const runnerCenterId = subEvent.participants.find(
					participant => participant.isRunner
				)?.participant?.centerId;
				if (winnerCenterId) {
					acc[winnerCenterId] = (acc[winnerCenterId] || 0) + 10;
				}
				if (runnerCenterId) {
					acc[runnerCenterId] = (acc[runnerCenterId] || 0) + 5;
				}
				return acc;
			},
			{} as Record<string, number>
		);
	const scoresByCentersData = centers
		? centers.map(center => ({
				name: camelCase(center.name),
				value: centerScores[center.id] || 0,
				fill: `var(--color-${camelCase(center.name)})`
			}))
		: [];

	return (
		<div className='@container/main flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
			<div className='[&_[data-slot=card]]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 [&_[data-slot=card]]:bg-gradient-to-t [&_[data-slot=card]]:from-primary/5 [&_[data-slot=card]]:to-card dark:[&_[data-slot=card]]:bg-card'>
				{role === 'admin' && (
					<>
						<Link
							to={`/users?filters=%5B%7B%22columnId%22:%22role%22,%22type%22:%22option%22,%22operator%22:%22is%22,%22values%22:%5B%22volunteer%22%5D%7D%5D`}
						>
							<Card className='@container/card'>
								<CardHeader className='relative'>
									<CardDescription>Total Volunteers</CardDescription>
									<CardTitle className='@[250px]/card:text-3xl text-2xl font-semibold tabular-nums'>
										{
											users.filter(
												user =>
													user.role === 'volunteer' || user.role === 'admin'
											).length
										}
									</CardTitle>
								</CardHeader>
							</Card>
						</Link>
						<Link to={`/centers`}>
							<Card className='@container/card'>
								<CardHeader className='relative'>
									<CardDescription>Total Centers</CardDescription>
									<CardTitle className='@[250px]/card:text-3xl text-2xl font-semibold tabular-nums'>
										{centers.length}
									</CardTitle>
								</CardHeader>
							</Card>
						</Link>
						<Link
							to={`/users?filters=%5B%7B%22columnId%22:%22role%22,%22type%22:%22option%22,%22operator%22:%22is%22,%22values%22:%5B%22guardian%22%5D%7D%5D`}
						>
							<Card className='@container/card'>
								<CardHeader className='relative'>
									<CardDescription>Total Guardians</CardDescription>
									<CardTitle className='@[250px]/card:text-3xl text-2xl font-semibold tabular-nums'>
										{users.filter(user => user.role === 'guardian').length}
									</CardTitle>
								</CardHeader>
							</Card>
						</Link>
						<Link to={`/participants`}>
							<Card className='@container/card'>
								<CardHeader className='relative'>
									<CardDescription>Total Participants</CardDescription>
									<CardTitle className='@[250px]/card:text-3xl text-2xl font-semibold tabular-nums'>
										{participants.length}
									</CardTitle>
								</CardHeader>
							</Card>
						</Link>
					</>
				)}
				{(leading === 'food' || role === 'admin') && (
					<>
						<Link to={`/food`}>
							<PercentCard
								label='People who had breakfast'
								total={totalPeople}
								current={peopleWhoHadBreakfast}
							/>
						</Link>
						<Link to={`/food`}>
							<PercentCard
								label='People who had lunch'
								total={totalPeople}
								current={peopleWhoHadLunch}
							/>
						</Link>
					</>
				)}
				{(leading === 'liaison' ||
					leading === 'transport' ||
					role === 'admin') && (
					<>
						<PercentCard
							label='Participants who have been picked up'
							total={participants.length}
							current={
								participants.filter(participant => participant.pickedUp).length
							}
						/>
						<PercentCard
							label='Participants who have been dropped off'
							total={participants.length}
							current={
								participants.filter(participant => participant.droppedOff)
									.length
							}
						/>
					</>
				)}
				{(leading === 'awards' ||
					leading === 'liaison' ||
					leading === 'arts' ||
					leading === 'cultural' ||
					role === 'admin') && (
					<>
						<PercentCard
							label='Started events'
							total={totalEvents}
							current={startedEvents}
						/>
						<PercentCard
							label='Completed events'
							total={totalEvents}
							current={completedEvents}
						/>
						<PercentCard
							label='Prized awarded'
							total={totalEvents * 2}
							current={awardedPrizes}
						/>
					</>
				)}
				{(role === 'volunteer' || role === 'guardian') &&
					(liaisoningCenters.length > 1 || guardianCenters.length > 1) && (
						<>
							{/* Liason and guardian dashboard for liasons & guardians with multiple centers */}
							{centers.map(center => (
								<Link to={`/centers/${center.id}`} key={center.id}>
									<Card className='@container/card'>
										<CardHeader className='relative'>
											<CardTitle className='@[250px]/card:text-3xl text-2xl font-semibold tabular-nums'>
												{center.name}
											</CardTitle>
											<CardDescription>
												{center.participants.length} participants
											</CardDescription>
										</CardHeader>
									</Card>
								</Link>
							))}
						</>
					)}
			</div>
			{(role === 'admin' ||
				coordinatingEvents.length > 0 ||
				coordinatingEventCategories.length > 0) && (
				<div className='@xl/main:grid-cols-1 @5xl/main:grid-cols-2 grid grid-cols-1 gap-4 px-4'>
					<ChartPieDonut
						title='Participants by Center'
						dataLabel='Participants'
						chartConfig={participantsByCentersConfig}
						chartData={participantsByCentersData}
					/>
					<ChartPieDonut
						title='Participations by Events'
						dataLabel='Participations'
						chartConfig={participantsByEventsConfig}
						chartData={participantsByEventsData}
					/>
				</div>
			)}
			{(role === 'admin' || leading === 'awards' || leading === 'liaison') && (
				<div className='@xl/main:grid-cols-1 @5xl/main:grid-cols-2 grid grid-cols-1 gap-4 px-4'>
					<ChartPieDonut
						title='Scores by Center'
						chartConfig={participantsByCentersConfig}
						chartData={scoresByCentersData}
					/>
					{role === 'admin' && (
						<Card className='flex flex-col h-full'>
							<CardHeader className='items-center pb-0'>
								<CardTitle>Leads</CardTitle>
							</CardHeader>
							<CardContent className='flex-1 pb-0'>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Team</TableHead>
											<TableHead>Lead</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{teamsEnum.enumValues.map(team => {
											const leads = users.filter(user => user.leading === team);
											return (
												<TableRow key={team}>
													<TableCell className='font-medium'>
														{TEAMS_NAME_MAP[team]}
													</TableCell>
													<TableCell>
														{leads.length > 0
															? leads
																	.map(
																		lead => `${lead.firstName} ${lead.lastName}`
																	)
																	.join(', ')
															: '-'}
													</TableCell>
												</TableRow>
											);
										})}
									</TableBody>
								</Table>
							</CardContent>
						</Card>
					)}
				</div>
			)}
		</div>
	);
}

const PercentCard = ({
	current,
	total,
	label
}: {
	current: number;
	total: number;
	label: string;
}) => {
	const percent = Math.round((current / total) * 100);
	return (
		<Card className='@container/card'>
			<CardHeader className='relative'>
				<CardDescription>{label}</CardDescription>
				<CardTitle className='@[250px]/card:text-3xl text-2xl font-semibold tabular-nums'>
					{current}
				</CardTitle>
				<div className='space-y-2'>
					<Progress value={percent} />
					<div className='flex items-center justify-between'>
						<span className='text-muted-foreground text-sm'>{total}</span>
						<span className='text-muted-foreground text-sm'>{percent}%</span>
					</div>
				</div>
			</CardHeader>
		</Card>
	);
};
