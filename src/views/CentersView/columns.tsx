import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	DropDrawer,
	DropDrawerContent,
	DropDrawerItem,
	DropDrawerTrigger
} from '@/components/ui/dropdrawer';
import useZero from '@/hooks/useZero';
import { Center } from '@/layout/CenterLayout';
import { Row, createColumnHelper } from '@tanstack/react-table';
import {
	CheckIcon,
	Ellipsis,
	LockIcon,
	LockOpenIcon,
	XIcon
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import CenterFormDialog from './CenterFormDialog';

const columnHelper = createColumnHelper<Center>();

export const columns = [
	columnHelper.accessor(row => row.name, {
		id: 'name',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Name' />
		),
		cell: ({ row }) => <div>{row.getValue('name')}</div>
	}),
	columnHelper.accessor(row => row.liaisons.map(liason => liason.user), {
		id: 'liaisons',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Liaisons' />
		),
		cell: ({ row }) => {
			const liaisons =
				row.getValue<Center['liaisons'][number]['user'][]>('liaisons');

			if (liaisons?.length === 0) return null;

			return (
				<div className='flex gap-1'>
					{liaisons.map(liaison => (
						<Badge variant='outline' key={liaison?.id}>
							{liaison?.firstName} {liaison?.lastName ?? ''}
						</Badge>
					))}
				</div>
			);
		},
		enableSorting: false
	}),
	columnHelper.accessor(row => row.guardians.map(guardian => guardian.user), {
		id: 'guardians',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Guardians' />
		),
		cell: ({ row }) => {
			const guardians =
				row.getValue<Center['guardians'][number]['user'][]>('guardians');

			if (guardians?.length === 0) return null;

			return (
				<div className='flex gap-1'>
					{guardians.map(guardian => (
						<Badge variant='outline' key={guardian?.id}>
							{guardian?.firstName} {guardian?.lastName ?? ''}
						</Badge>
					))}
				</div>
			);
		},
		enableSorting: false
	}),
	columnHelper.accessor(row => row.participants.length, {
		id: 'participants',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Participants' />
		),
		cell: ({ row }) => <div>{row.getValue('participants')}</div>
	}),
	columnHelper.accessor(row => (row.isLocked ?? false).toString(), {
		id: 'isLocked',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Locked' />
		),
		cell: ({ row }) => (
			<div className='capitalize'>
				{row.getValue('isLocked') === 'true' ? (
					<LockIcon className='size-5' />
				) : (
					<LockOpenIcon className='size-5' />
				)}
			</div>
		),
		meta: {
			displayName: 'Locked'
		}
	}),
	columnHelper.accessor(row => (row.enableEventMapping ?? false).toString(), {
		id: 'enableEventMapping',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Event Mapping Enabled?' />
		),
		cell: ({ row }) => (
			<div className='capitalize'>
				{row.getValue('enableEventMapping') === 'true' ? (
					<CheckIcon className='size-5 text-green-500' />
				) : (
					<XIcon className='size-5 text-destructive' />
				)}
			</div>
		),
		meta: {
			displayName: 'Event Mapping Enabled?'
		}
	}),
	{
		id: 'actions',
		cell: ({ row }: { row: Row<Center> }) => {
			return <Actions center={row.original} />;
		},
		size: 32
	}
];

// eslint-disable-next-line react-refresh/only-export-components
const Actions = ({ center }: { center: Center }) => {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const z = useZero();

	return (
		<DropDrawer modal={false}>
			<DropDrawerTrigger asChild>
				<Button
					aria-label='Open menu'
					variant='ghost'
					className='flex p-0 data-[state=open]:bg-muted size-6'
					onClick={e => e.stopPropagation()}
				>
					<Ellipsis className='size-4' aria-hidden='true' />
				</Button>
			</DropDrawerTrigger>
			<DropDrawerContent align='end' onClick={e => e.stopPropagation()}>
				<DropDrawerItem onSelect={() => setIsDialogOpen(true)}>
					Edit
				</DropDrawerItem>
				<DropDrawerItem
					onSelect={() => {
						z.mutate.centers
							.update({
								id: center.id,
								isLocked: !center.isLocked
							})
							.client.catch((e: Error) => {
								toast.error(
									`Error ${center.isLocked ? 'unlocking' : 'locking'} center`,
									{
										description: e.message || 'Something went wrong'
									}
								);
							});
					}}
				>
					{center.isLocked ? 'Unlock' : 'Lock'}
				</DropDrawerItem>
				<DropDrawerItem
					onSelect={() => {
						z.mutate.centers
							.update({
								id: center.id,
								enableEventMapping: !center.enableEventMapping
							})
							.client.catch((e: Error) => {
								toast.error(
									`Error ${center.enableEventMapping ? 'disabling' : 'enabling'} event mapping`,
									{
										description: e.message || 'Something went wrong'
									}
								);
							});
					}}
				>
					{center.enableEventMapping ? 'Disable' : 'Enable'} Event Mapping
				</DropDrawerItem>
				<DropDrawerItem
					variant='destructive'
					onSelect={() => {
						z.mutate.centers
							.delete({
								id: center.id
							})
							.client.catch((e: Error) => {
								toast.error('Error deleting center', {
									description: e.message || 'Something went wrong'
								});
							});
					}}
				>
					Delete
				</DropDrawerItem>
			</DropDrawerContent>
			{isDialogOpen && (
				<div onClick={e => e.stopPropagation()}>
					<CenterFormDialog
						center={center}
						open={isDialogOpen}
						onOpenChange={setIsDialogOpen}
					/>
				</div>
			)}
		</DropDrawer>
	);
};
