// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { User } from '@/db/schema.zero';
import { defineMeta, filterFn } from '@/lib/filters';
import { cn } from '@/lib/utils';
import { createColumnHelper } from '@tanstack/react-table';
import {
	// CircleDashedIcon,
	Heading1Icon,
	MailIcon,
	Phone,
	ShieldUser
} from 'lucide-react';

const columnHelper = createColumnHelper<User>();

const ROLE_STYLES_MAP = {
	guardian: 'bg-red-500 border-red-500',
	admin: 'bg-orange-500 border-orange-500',
	volunteer: 'bg-amber-500 border-amber-500'
	// yellow: 'bg-yellow-500 border-yellow-500',
	// lime: 'bg-lime-500 border-lime-500',
	// green: 'bg-green-500 border-green-500',
	// emerald: 'bg-emerald-500 border-emerald-500',
	// teal: 'bg-teal-500 border-teal-500',
	// cyan: 'bg-cyan-500 border-cyan-500',
	// sky: 'bg-sky-500 border-sky-500',
	// blue: 'bg-blue-500 border-blue-500',
	// indigo: 'bg-indigo-500 border-indigo-500',
	// violet: 'bg-violet-500 border-violet-500',
	// purple: 'bg-purple-500 border-purple-500',
	// fuchsia: 'bg-fuchsia-500 border-fuchsia-500',
	// pink: 'bg-pink-500 border-pink-500',
	// rose: 'bg-rose-500 border-rose-500',
	// neutral: 'bg-neutral-500 border-neutral-500',
} as const;

export const columns = [
	columnHelper.display({
		id: 'select',
		header: ({ table }) => (
			<Checkbox
				checked={
					table.getIsAllPageRowsSelected() ||
					(table.getIsSomePageRowsSelected() && 'indeterminate')
				}
				onCheckedChange={value => table.toggleAllRowsSelected(!!value)}
				aria-label='Select all'
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={value => row.toggleSelected(!!value)}
				aria-label='Select row'
			/>
		),
		enableSorting: false,
		enableHiding: false
	}),
	columnHelper.accessor(row => row.firstName, {
		id: 'firstName',
		header: 'First Name',
		cell: ({ row }) => <div>{row.getValue('firstName')}</div>,
		meta: {
			displayName: 'First Name',
			type: 'text',
			icon: Heading1Icon
		},
		filterFn: filterFn('text')
	}),
	columnHelper.accessor(row => row.lastName, {
		id: 'lastName',
		header: 'Last Name',
		cell: ({ row }) => <div>{row.getValue('lastName')}</div>,
		meta: {
			displayName: 'Last Name',
			type: 'text',
			icon: Heading1Icon
		},
		filterFn: filterFn('text')
	}),
	// columnHelper.accessor('avatar', {
	// 	id: 'avatar',
	// 	header: 'Avatar',
	// 	cell: ({ row }) => {
	// 		const avatar = row.getValue<User['avatar']>('avatar');

	// 		if (!avatar) {
	// 			return <CircleDashedIcon className='size-5 text-border' />;
	// 		}

	// 		const initials = row.original.name
	// 			.split(' ')
	// 			.map(x => x[0])
	// 			.join('')
	// 			.toUpperCase();

	// 		return (
	// 			<Avatar className='size-5'>
	// 				<AvatarImage src={avatar} />
	// 				<AvatarFallback>{initials}</AvatarFallback>
	// 			</Avatar>
	// 		);
	// 	}
	// }),
	columnHelper.accessor(row => row.role, {
		id: 'role',
		header: 'Role',
		cell: ({ row }) => {
			const role = row.getValue<User['role']>('role');

			if (!role) return null;

			return (
				<div className='flex gap-1'>
					<div
						className={cn(
							'flex items-center gap-1 py-1 px-2 rounded-full text-[11px] tracking-[-0.01em] shadow-xs',
							ROLE_STYLES_MAP[role],
							'border-none text-white font-medium'
						)}
					>
						{role}
					</div>
				</div>
			);
		},
		filterFn: filterFn('option'),
		meta: defineMeta('role', {
			displayName: 'Role',
			type: 'option',
			icon: ShieldUser,
			transformOptionFn(data) {
				return {
					value: data,
					label: data,
					icon: (
						<div
							className={cn(
								'size-2.5 border-none rounded-full',
								ROLE_STYLES_MAP[data]
							)}
						/>
					)
				};
			}
		})
	}),
	columnHelper.accessor(row => row.email, {
		id: 'email',
		header: 'Email',
		cell: ({ row }) => <div>{row.getValue('email')}</div>,
		meta: {
			displayName: 'Email',
			type: 'text',
			icon: MailIcon
		},
		filterFn: filterFn('text')
	}),
	columnHelper.accessor(row => row.phoneNumber, {
		id: 'phoneNumber',
		header: 'Phone Number',
		cell: ({ row }) => <div>{row.getValue('phoneNumber')}</div>,
		meta: {
			displayName: 'Phone Number',
			type: 'text',
			icon: Phone
		},
		filterFn: filterFn('text')
	})
];
