import DataTableWrapper from '@/components/data-table-wrapper';
import { QrScanDialog } from '@/components/qr-scan-dialog';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import useZero from '@/hooks/useZero';
import LoadingScreen from '@/views/general/LoadingScreen';
import { useQuery } from '@rocicorp/zero/react';
import { ScanQrCodeIcon } from 'lucide-react';
import { MutatorResult } from 'node_modules/@rocicorp/zero/out/zero-client/src/client/custom';
import { toast } from 'sonner';

import { columns } from './columns';
import { columnsConfig } from './filters';

export interface Person {
	id: string;
	name: string;
	role: 'participant' | 'guardian' | 'volunteer' | 'guest' | 'judge';
	center?: {
		id: string;
		name: string;
	};
	hadBreakfast: boolean;
	hadLunch: boolean;
}

export default function UsersView() {
	// eslint-disable-next-line react-hooks/react-compiler
	'use no memo';
	const z = useZero();
	const [users, status] = useQuery(
		z.query.users
			.related('guardianCenters', q => q.related('center'))
			.orderBy('createdAt', 'desc')
	);
	const [participants, participantsStatus] = useQuery(
		z.query.participants.related('center').orderBy('createdAt', 'desc')
	);

	if (status.type !== 'complete' || participantsStatus.type !== 'complete') {
		return <LoadingScreen />;
	}

	if (!users || !participants) {
		return (
			<div className='flex h-screen w-full items-center justify-center'>
				<p className='text-gray-500 dark:text-gray-400'>
					<p>Unable to load users</p>
				</p>
			</div>
		);
	}

	const persons = [
		...users.map(user => ({
			id: user.id,
			name: `${user.firstName} ${user.lastName ?? ''}`,
			role: user.role === 'admin' ? 'volunteer' : user.role,
			center:
				user.role === 'guardian' ? user.guardianCenters[0]?.center : undefined,
			hadBreakfast: user.hadBreakfast ?? false,
			hadLunch: user.hadLunch ?? false
		})),
		...participants.map(participant => ({
			id: participant.id,
			name: participant.name,
			role: 'participant',
			center: participant.center,
			hadBreakfast: participant.hadBreakfast ?? false,
			hadLunch: participant.hadLunch ?? false
		}))
	];

	return (
		<DataTableWrapper
			data={persons as Person[]}
			columns={columns}
			columnsConfig={columnsConfig}
			additionalActions={[
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
							title='Toggle Had Breakfast'
							onScan={async scanResult => {
								let mutation: MutatorResult | undefined;
								let hadBreakfast = false;
								if (scanResult.type === 'participant') {
									const participant = await z.query.participants
										.where('id', scanResult.id)
										.one();

									if (!participant) {
										throw new Error('Participant not found');
									}

									hadBreakfast = participant.hadBreakfast === true;
									mutation = z.mutate.participants.toggleHadBreakfast(
										participant.id
									);
								} else {
									const user = await z.query.users
										.where('id', scanResult.id)
										.one();

									if (!user) {
										throw new Error('User not found');
									}

									hadBreakfast = user.hadBreakfast === true;
									mutation = z.mutate.users.toggleHadBreakfast(user.id);
								}

								mutation.client
									.then(() => {
										toast.success(
											`Had breakfast ${hadBreakfast ? 'unmarked' : 'marked'} successfully`
										);
									})
									.catch((e: Error) => {
										toast.error(`Error toggling had breakfast for user`, {
											description: e.message || 'Something went wrong'
										});
									});
							}}
						>
							<DropdownMenuItem onSelect={e => e.preventDefault()}>
								Toggle Had Breakfast
							</DropdownMenuItem>
						</QrScanDialog>
						<QrScanDialog
							title='Toggle Had Lunch'
							onScan={async scanResult => {
								let mutation: MutatorResult | undefined;
								let hadLunch = false;
								if (scanResult.type === 'participant') {
									const participant = await z.query.participants
										.where('id', scanResult.id)
										.one();

									if (!participant) {
										throw new Error('Participant not found');
									}

									hadLunch = participant.hadLunch === true;
									mutation = z.mutate.participants.toggleHadLunch(
										participant.id
									);
								} else {
									const user = await z.query.users
										.where('id', scanResult.id)
										.one();

									if (!user) {
										throw new Error('User not found');
									}

									hadLunch = user.hadLunch === true;
									mutation = z.mutate.users.toggleHadLunch(user.id);
								}

								mutation.client
									.then(() => {
										toast.success(
											`Had lunch ${hadLunch ? 'unmarked' : 'marked'} successfully`
										);
									})
									.catch((e: Error) => {
										toast.error(`Error toggling had lunch for user`, {
											description: e.message || 'Something went wrong'
										});
									});
							}}
						>
							<DropdownMenuItem onSelect={e => e.preventDefault()}>
								Toggle Had Lunch
							</DropdownMenuItem>
						</QrScanDialog>
					</DropdownMenuContent>
				</DropdownMenu>
			]}
		/>
	);
}
