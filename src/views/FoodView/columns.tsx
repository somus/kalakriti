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
import { cn } from '@/lib/utils';
import { Row, createColumnHelper } from '@tanstack/react-table';
import { CheckIcon, Ellipsis, XIcon } from 'lucide-react';
import { toast } from 'sonner';

import { Person } from './FoodView';

const columnHelper = createColumnHelper<Person>();

export const ROLE_STYLES_MAP = {
	participant: 'bg-red-500 border-red-500',
	volunteer: 'bg-teal-500 border-teal-500',
	guardian: 'bg-blue-500 border-blue-500',
	guest: 'bg-yellow-500 border-yellow-500',
	judge: 'bg-purple-500 border-purple-500'
} as const;

export const columns = [
	columnHelper.accessor(row => row.name, {
		id: 'name',
		header: ({ column }) => (
			<DataTableColumnHeader className='ml-2' column={column} title='Name' />
		),
		cell: ({ row }) => <div className='pl-4'>{row.getValue('name')}</div>,
		sortingFn: 'alphanumeric',
		meta: {
			displayName: 'Name'
		}
	}),
	columnHelper.accessor(row => row.role, {
		id: 'role',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Role' />
		),
		cell: ({ row }) => {
			const role = row.getValue<
				'participant' | 'guardian' | 'volunteer' | 'guest' | 'judge' | undefined
			>('role');
			if (!role) return null;

			return (
				<div className='flex gap-1'>
					<div
						className={cn(
							'flex items-center gap-1 py-1 px-2 rounded-full text-[11px] tracking-[-0.01em] shadow-xs',
							ROLE_STYLES_MAP[role],
							'border-none text-white font-medium capitalize'
						)}
					>
						{role}
					</div>
				</div>
			);
		},
		meta: {
			displayName: 'Role'
		}
	}),
	columnHelper.accessor(row => row.center?.name, {
		id: 'center',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Center' />
		),
		cell: ({ row }) => {
			const center = row.getValue<string | undefined>('center');
			return center ? <Badge variant='outline'>{center}</Badge> : null;
		},
		meta: {
			displayName: 'Center'
		}
	}),
	columnHelper.accessor(row => (row.hadBreakfast ?? false).toString(), {
		id: 'hadBreakfast',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Had Breakfast?' />
		),
		cell: ({ row }) => (
			<div className='capitalize'>
				{row.getValue('hadBreakfast') === 'true' ? (
					<CheckIcon className='size-5 text-green-500' />
				) : (
					<XIcon className='size-5 text-destructive' />
				)}
			</div>
		),
		meta: {
			displayName: 'Had Breakfast?'
		}
	}),
	columnHelper.accessor(row => (row.hadLunch ?? false).toString(), {
		id: 'hadLunch',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Had Lunch?' />
		),
		cell: ({ row }) => (
			<div className='capitalize'>
				{row.getValue('hadLunch') === 'true' ? (
					<CheckIcon className='size-5 text-green-500' />
				) : (
					<XIcon className='size-5 text-destructive' />
				)}
			</div>
		),
		meta: {
			displayName: 'Had Lunch?'
		}
	}),
	{
		id: 'actions',
		cell: ({ row }: { row: Row<Person> }) => {
			return <Actions person={row.original} />;
		},
		size: 32
	}
];

// eslint-disable-next-line react-refresh/only-export-components
const Actions = ({
	person: { id, hadBreakfast, hadLunch, role }
}: {
	person: Person;
}) => {
	const z = useZero();

	return (
		<DropDrawer modal={false}>
			<DropDrawerTrigger asChild>
				<Button
					aria-label='Open menu'
					variant='ghost'
					className='flex size-6 p-0 data-[state=open]:bg-muted'
				>
					<Ellipsis className='size-4' aria-hidden='true' />
				</Button>
			</DropDrawerTrigger>
			<DropDrawerContent align='end'>
				<DropDrawerItem
					onSelect={() => {
						const mutation =
							role === 'participant'
								? z.mutate.participants.toggleHadBreakfast(id)
								: z.mutate.users.toggleHadBreakfast(id);
						mutation.client.catch((e: Error) => {
							toast.error('Error toggling had breakfast for person', {
								description: e.message || 'Something went wrong'
							});
						});
					}}
				>
					{hadBreakfast ? 'Unmark' : 'Mark'} had breakfast
				</DropDrawerItem>
				<DropDrawerItem
					onSelect={() => {
						const mutation =
							role === 'participant'
								? z.mutate.participants.toggleHadLunch(id)
								: z.mutate.users.toggleHadLunch(id);
						mutation.client.catch((e: Error) => {
							toast.error('Error toggling had lunch for person', {
								description: e.message || 'Something went wrong'
							});
						});
					}}
				>
					{hadLunch ? 'Unmark' : 'Mark'} had lunch
				</DropDrawerItem>
			</DropDrawerContent>
		</DropDrawer>
	);
};
