import { IdCard } from '@/components/IdCard';
import { DataTableColumnHeader } from '@/components/data-table-column-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog';
import {
	DropDrawer,
	DropDrawerContent,
	DropDrawerItem,
	DropDrawerTrigger
} from '@/components/ui/dropdrawer';
import useZero from '@/hooks/useZero';
import { cn } from '@/lib/utils';
import { Row, createColumnHelper } from '@tanstack/react-table';
import capitalize from 'lodash/capitalize';
import { CheckIcon, Ellipsis, IdCardIcon, XIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import UserFormDialog from './UserFormDialog';
import { User } from './UsersView';

const columnHelper = createColumnHelper<User>();

export const ROLE_STYLES_MAP = {
	admin: 'bg-red-500 border-red-500',
	volunteer: 'bg-teal-500 border-teal-500',
	guardian: 'bg-blue-500 border-blue-500',
	guest: 'bg-yellow-500 border-yellow-500',
	judge: 'bg-purple-500 border-purple-500'
} as const;

export const TEAMS_NAME_MAP = {
	overall: 'Overall Lead',
	events: 'Overall Events',
	arts: 'Arts',
	cultural: 'Cultural',
	liaison: 'Liaison',
	transport: 'Transport',
	venue: 'Venue',
	food: 'Food',
	logistics: 'Logistics',
	awards: 'Awards',
	hospitality: 'Hospitality',
	media: 'Media',
	fundraising: 'Fundraising'
} as const;

export const columns = [
	// columnHelper.display({
	// 	id: 'select',
	// 	header: ({ table }) => (
	// 		<Checkbox
	// 			checked={
	// 				table.getIsAllPageRowsSelected() ||
	// 				(table.getIsSomePageRowsSelected() && 'indeterminate')
	// 			}
	// 			onCheckedChange={value => table.toggleAllRowsSelected(!!value)}
	// 			aria-label='Select all'
	// 		/>
	// 	),
	// 	cell: ({ row }) => (
	// 		<Checkbox
	// 			checked={row.getIsSelected()}
	// 			onCheckedChange={value => row.toggleSelected(!!value)}
	// 			aria-label='Select row'
	// 		/>
	// 	),
	// 	enableSorting: false,
	// 	enableHiding: false
	// }),
	columnHelper.accessor(row => row.firstName, {
		id: 'firstName',
		header: ({ column }) => (
			<DataTableColumnHeader
				className='ml-2'
				column={column}
				title='First Name'
			/>
		),
		cell: ({ row }) => <div className='pl-4'>{row.getValue('firstName')}</div>,
		meta: {
			displayName: 'First Name'
		}
	}),
	columnHelper.accessor(row => row.lastName, {
		id: 'lastName',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Last Name' />
		),
		cell: ({ row }) => <div>{row.getValue('lastName')}</div>,
		meta: {
			displayName: 'Last Name'
		}
	}),
	columnHelper.accessor(row => row.role, {
		id: 'role',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Role' />
		),
		cell: ({ row }) => {
			const role = row.getValue<User['role']>('role');

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
	columnHelper.accessor(row => row.team, {
		id: 'team',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Team' />
		),
		cell: ({ row }) => {
			const team = row.getValue<User['team']>('team');

			if (!team) return null;

			return <Badge variant='outline'>{TEAMS_NAME_MAP[team]}</Badge>;
		},
		meta: {
			displayName: 'Team'
		}
	}),
	columnHelper.accessor(row => row.leading, {
		id: 'leading',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Leading' />
		),
		cell: ({ row }) => {
			const leading = row.getValue<User['leading']>('leading');

			if (!leading) return null;

			return <Badge>{TEAMS_NAME_MAP[leading]}</Badge>;
		},
		meta: {
			displayName: 'Leading'
		}
	}),
	columnHelper.accessor(row => row.email, {
		id: 'email',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Email' />
		),
		cell: ({ row }) => <div>{row.getValue('email')}</div>,
		meta: {
			displayName: 'Email'
		}
	}),
	columnHelper.accessor(row => row.phoneNumber, {
		id: 'phoneNumber',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Phone Number' />
		),
		cell: ({ row }) => <div>{row.getValue('phoneNumber')}</div>,
		meta: {
			displayName: 'Phone Number'
		}
	}),
	columnHelper.accessor(row => (row.canLogin ?? false).toString(), {
		id: 'canLogin',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title='Can Login?' />
		),
		cell: ({ row }) => (
			<div className='capitalize'>
				{row.getValue('canLogin') === 'true' ? (
					<CheckIcon className='size-5 text-green-500' />
				) : (
					<XIcon className='size-5 text-destructive' />
				)}
			</div>
		),
		meta: {
			displayName: 'Can Login?'
		}
	}),
	{
		id: 'view-id-card',
		cell: ({ row }: { row: Row<User> }) => {
			return (
				<Dialog>
					<DialogTrigger asChild>
						<Button variant='ghost' size='icon' className='size-6'>
							<IdCardIcon className='size-4' aria-hidden='true' />
						</Button>
					</DialogTrigger>
					<DialogContent
						className='border-0 bg-transparent p-0 shadow-none'
						aria-describedby={undefined}
					>
						<DialogTitle className='hidden'>ID Card</DialogTitle>
						<div
							style={{
								height: 'auto',
								margin: '0 auto',
								maxWidth: 308,
								width: '100%'
							}}
						>
							<IdCard
								name={`${row.original.firstName} ${row.original.lastName ?? ''}`}
								role={getUserRoleText(row.original)}
								type={
									row.original.role === 'guardian' ? 'guardian' : 'volunteer'
								}
								qrCodeValue={JSON.stringify({
									type:
										row.original.role === 'guardian' ? 'guardian' : 'volunteer',
									id: row.original.id
								})}
							/>
						</div>
					</DialogContent>
				</Dialog>
			);
		},
		size: 32
	},
	{
		id: 'actions',
		cell: ({ row }: { row: Row<User> }) => {
			return <Actions user={row.original} />;
		},
		size: 32
	}
];

// eslint-disable-next-line react-refresh/only-export-components
const Actions = ({ user }: { user: User }) => {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
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
				<DropDrawerItem onSelect={() => setIsDialogOpen(true)}>
					Edit
				</DropDrawerItem>
				<DropDrawerItem
					variant='destructive'
					onSelect={() => {
						z.mutate.users
							.delete({
								id: user.id
							})
							.server.catch((e: Error) => {
								toast.error('Error deleting user', {
									description: e.message || 'Something went wrong'
								});
							});
					}}
				>
					Delete
				</DropDrawerItem>
			</DropDrawerContent>
			{isDialogOpen && (
				<UserFormDialog
					user={user}
					open={isDialogOpen}
					onOpenChange={setIsDialogOpen}
				/>
			)}
		</DropDrawer>
	);
};

export const getUserRoleText = (user: User) => {
	if (user.role === 'guardian') {
		return user.guardianCenters[0]?.center?.name ?? 'Guardian';
	}
	if (user.leading) {
		return `${capitalize(user.leading)} Coordinator`;
	}
	if (user.liaisoningCenters.length > 0) {
		return `${user.liaisoningCenters[0].center?.name} Liaison`;
	}
	if (user.volunteeringEvents.length > 0) {
		return `${user.volunteeringEvents[0].event?.name} Volunteer`;
	}
	if (user.coordinatingEvents.length > 0) {
		return `${user.coordinatingEvents[0].event?.name.replace(' (M)', '').replace(' (F)', '')} Coordinator`;
	}
	if (user.team) {
		return `${capitalize(user.team)} Volunteer`;
	}
	return 'Volunteer';
};
