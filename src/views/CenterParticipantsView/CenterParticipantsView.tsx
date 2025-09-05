import DataTableWrapper from '@/components/data-table-wrapper';
import { QrScanDialog } from '@/components/qr-scan-dialog';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useApp } from '@/hooks/useApp';
import useZero from '@/hooks/useZero';
import { CenterOutletContext } from '@/layout/CenterLayout';
import ParticipantFormDialog from '@/views/ParticipantsView/ParticipantFormDialog';
import { columns } from '@/views/ParticipantsView/columns';
import { columnsConfig } from '@/views/ParticipantsView/filters';
import LoadingScreen from '@/views/general/LoadingScreen';
import { useQuery } from '@rocicorp/zero/react';
import { ScanQrCodeIcon } from 'lucide-react';
import { useOutletContext } from 'react-router';
import { toast } from 'sonner';

import { Participant } from '../ParticipantsView/ParticipantsView';

export default function CenterParticipantsView() {
	const { center } = useOutletContext<CenterOutletContext>();
	const zero = useZero();
	const {
		user: { role, leading, liaisoningCenters }
	} = useApp();
	const [participants, status] = useQuery(
		zero.query.participants
			.where('centerId', '=', center.id)
			.related('center')
			.related('participantCategory')
			.related('subEvents', q =>
				q.related('subEvent', q =>
					q.related('event').related('participantCategory')
				)
			)
			.orderBy('createdAt', 'desc')
	);

	const canMarkAttendance =
		(role === 'volunteer' && liaisoningCenters.length > 0) ||
		role === 'admin' ||
		leading === 'liaison';

	if (status.type !== 'complete') {
		return <LoadingScreen />;
	}

	if (!participants) {
		return (
			<div className='flex h-screen w-full items-center justify-center'>
				<p className='text-gray-500 dark:text-gray-400'>
					<p>Unable to load participants</p>
				</p>
			</div>
		);
	}

	return (
		<DataTableWrapper
			data={participants as Participant[]}
			columns={columns.filter(
				column => column.id !== 'actions' || leading !== 'transport'
			)}
			columnsConfig={columnsConfig}
			columnsToHide={['center']}
			additionalActions={
				leading === 'transport'
					? []
					: [
							canMarkAttendance ? (
								<DropdownMenu key='scan-attendance'>
									<DropdownMenuTrigger asChild>
										<Button className='h-7'>
											<ScanQrCodeIcon />
											Scan
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
										// side={isMobile ? 'bottom' : 'right'}
										align='end'
										sideOffset={4}
									>
										<QrScanDialog
											title='Toggle Picked Up'
											onScan={async scanResult => {
												const participant = await zero.query.participants
													.where('id', scanResult.id)
													.one();

												if (!participant) {
													throw new Error('Participant not found');
												}

												if (
													!!participant.reachedVenue &&
													!!participant.pickedUp
												) {
													throw new Error(
														'Participant already reached venue, so cannot toggle picked up'
													);
												}

												await zero.mutate.participants
													.togglePickedUp(participant.id)
													.client.then(() => {
														toast.success(
															`Picked up ${participant.pickedUp ? 'unmarked' : 'marked'} successfully`
														);
													})
													.catch((e: Error) => {
														toast.error(`Error toggling picked up for user`, {
															description: e.message || 'Something went wrong'
														});
													});
											}}
										>
											<DropdownMenuItem onSelect={e => e.preventDefault()}>
												Toggle Picked Up
											</DropdownMenuItem>
										</QrScanDialog>
										<QrScanDialog
											title='Toggle Reached Venue'
											onScan={async scanResult => {
												const participant = await zero.query.participants
													.where('id', scanResult.id)
													.one();

												if (!participant) {
													throw new Error('Participant not found');
												}

												if (
													!participant.pickedUp &&
													!participant.reachedVenue
												) {
													throw new Error(
														'Participant has not been picked up, so cannot toggle reached venue'
													);
												}

												if (
													!!participant.leftVenue &&
													!!participant.reachedVenue
												) {
													throw new Error(
														'Participant already left venue, so cannot toggle reached venue'
													);
												}

												await zero.mutate.participants
													.toggleReachedVenue(participant.id)
													.client.then(() => {
														toast.success(
															`Reached venue ${participant.reachedVenue ? 'unmarked' : 'marked'} successfully`
														);
													})
													.catch((e: Error) => {
														toast.error(
															`Error toggling reached venue for user`,
															{
																description: e.message || 'Something went wrong'
															}
														);
													});
											}}
										>
											<DropdownMenuItem onSelect={e => e.preventDefault()}>
												Toggle Reached Venue
											</DropdownMenuItem>
										</QrScanDialog>
										<QrScanDialog
											title='Toggle Left Venue'
											onScan={async scanResult => {
												const participant = await zero.query.participants
													.where('id', scanResult.id)
													.one();

												if (!participant) {
													throw new Error('Participant not found');
												}

												if (
													!participant.reachedVenue &&
													!participant.leftVenue
												) {
													throw new Error(
														'Participant has not reached venue, so cannot toggle left venue'
													);
												}

												if (
													!!participant.droppedOff &&
													!!participant.leftVenue
												) {
													throw new Error(
														'Participant already dropped off, so cannot toggle left venue'
													);
												}

												await zero.mutate.participants
													.toggleLeftVenue(participant.id)
													.client.then(() => {
														toast.success(
															`Left venue ${participant.leftVenue ? 'unmarked' : 'marked'} successfully`
														);
													})
													.catch((e: Error) => {
														toast.error(`Error toggling left venue for user`, {
															description: e.message || 'Something went wrong'
														});
													});
											}}
										>
											<DropdownMenuItem onSelect={e => e.preventDefault()}>
												Toggle Left Venue
											</DropdownMenuItem>
										</QrScanDialog>
										<QrScanDialog
											title='Toggle Dropped Off'
											onScan={async scanResult => {
												const participant = await zero.query.participants
													.where('id', scanResult.id)
													.one();

												if (!participant) {
													throw new Error('Participant not found');
												}

												if (!participant.leftVenue && !participant.droppedOff) {
													throw new Error(
														'Participant has not left venue, so cannot toggle dropped off'
													);
												}

												await zero.mutate.participants
													.toggleDroppedOff(participant.id)
													.client.then(() => {
														toast.success(
															`Dropped off ${participant.droppedOff ? 'unmarked' : 'marked'} successfully`
														);
													})
													.catch((e: Error) => {
														toast.error(`Error toggling dropped off for user`, {
															description: e.message || 'Something went wrong'
														});
													});
											}}
										>
											<DropdownMenuItem onSelect={e => e.preventDefault()}>
												Toggle Dropped Off
											</DropdownMenuItem>
										</QrScanDialog>
									</DropdownMenuContent>
								</DropdownMenu>
							) : null,
							center?.isLocked && role !== 'admin' ? null : (
								<ParticipantFormDialog key='create-participant'>
									<Button className='h-7'>Create Participant</Button>
								</ParticipantFormDialog>
							)
						]
			}
		/>
	);
}
