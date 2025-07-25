import { ChartPieDonut } from '@/components/pie-chart';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
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
		zero.query.events.related('subEvents', q => q.related('participants'))
	);

	if (
		(role === 'guardian' && guardianCenters?.length === 1 && center) ||
		(role === 'volunteer' && liaisoningCenters?.length === 1 && center)
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

	return (
		<div className='@container/main flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
			<div className='[&_[data-slot=card]]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 [&_[data-slot=card]]:bg-gradient-to-t [&_[data-slot=card]]:from-primary/5 [&_[data-slot=card]]:to-card dark:[&_[data-slot=card]]:bg-card'>
				{role === 'admin' && (
					<>
						<Link to={`/users`}>
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
						<Link to={`/users`}>
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
				{(role === 'volunteer' || role === 'guardian') &&
					centers.length > 1 && (
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
			{role === 'admin' && (
				<div className='@xl/main:grid-cols-1 @5xl/main:grid-cols-2 grid grid-cols-1 gap-4 px-4'>
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
				</div>
			)}
		</div>
	);
}
