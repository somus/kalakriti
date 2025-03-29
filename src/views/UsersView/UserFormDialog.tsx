import { AutoForm } from '@/components/ui/autoform';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog';
import { rolesEnum } from '@/db/schema';
import { User } from '@/db/schema.zero';
import useZero from '@/hooks/useZero';
import {
	clearClerkUser,
	deleteClerkUser,
	updateClerkUser
} from '@/lib/clerkUser';
import { ZodProvider } from '@autoform/zod';
import { useAuth } from '@clerk/clerk-react';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import {
	ClerkUser,
	ClerkUserCreateInput,
	ClerkUserUpdateInput,
	clerkUserCreateInputSchema,
	clerkUserUpdateInputSchema
} from 'shared/schema';
import * as z from 'zod';

const createUserSchema = clerkUserCreateInputSchema.extend({
	phoneNumber: z
		.string()
		.refine(
			value => /^[6-9]\d{9}$/.test(value),
			'Please enter a valid indian mobile number'
		)
		.optional(),
	role: z.enum(rolesEnum.enumValues).default('volunteer')
});
const updateUserSchema = clerkUserUpdateInputSchema
	.extend({
		phoneNumber: z
			.string()
			.refine(
				value => /^[6-9]\d{9}$/.test(value),
				'Please enter a valid indian mobile number'
			)
			.optional(),
		role: z.enum(rolesEnum.enumValues)
	})
	.omit({ id: true });

const createUserProvider = new ZodProvider(createUserSchema);
const updateUserPRovider = new ZodProvider(updateUserSchema);

export default function UserFormDialog({
	user,
	open,
	onOpenChange,
	children
}: {
	user?: User;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	children?: React.ReactNode;
}) {
	const { getToken } = useAuth();
	const zero = useZero();
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	if (!children && !(open !== undefined && onOpenChange)) {
		throw new Error(
			'UserFormDialog must have children or pass open and onOpenChange props'
		);
	}

	return (
		<Dialog
			open={open ?? isDialogOpen}
			onOpenChange={onOpenChange ?? setIsDialogOpen}
		>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className='sm:max-w-[425px]' aria-describedby={undefined}>
				<DialogHeader>
					<DialogTitle>{!user ? 'Create User' : 'Update User'}</DialogTitle>
				</DialogHeader>
				<AutoForm
					schema={!user ? createUserProvider : updateUserPRovider}
					// @ts-expect-error type fails becuase of issue with zero where it generates not null for all enum types
					defaultValues={user}
					onSubmit={async data => {
						let clerkUser: ClerkUser | undefined;
						setIsSubmitting(true);

						try {
							if (!user) {
								const { password, ...createUserInput } =
									data as ClerkUserCreateInput;
								// Create the user in Clerk
								clerkUser = await clearClerkUser({
									getToken,
									user: { password, ...createUserInput }
								});
								// Create the user in db
								await zero.mutate.users.insert({
									id: clerkUser.id,
									...createUserInput
								});
							} else {
								const { password, ...updateUserInput } = data as Omit<
									ClerkUserUpdateInput,
									'id'
								>;
								// Update the user in Clerk
								clerkUser = await updateClerkUser({
									getToken,
									user: { id: user.id, password, ...updateUserInput }
								});
								// Update the user in db
								await zero.mutate.users.update({
									id: user.id,
									...updateUserInput
								});
							}
						} catch (e) {
							if (clerkUser) {
								// Clenup the user if the user creation fails
								await deleteClerkUser({ getToken, userId: clerkUser.id });
							}
							console.error(e);
						}
						setIsSubmitting(false);
						if (onOpenChange) {
							onOpenChange(false);
						} else {
							setIsDialogOpen(false);
						}
					}}
				>
					<DialogFooter>
						<Button type='submit' disabled={isSubmitting}>
							{isSubmitting && <LoaderCircle className='animate-spin' />}Save
							changes
						</Button>
					</DialogFooter>
				</AutoForm>
			</DialogContent>
		</Dialog>
	);
}
