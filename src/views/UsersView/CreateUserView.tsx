import { AutoForm } from '@/components/ui/autoform';
import { rolesEnum } from '@/db/schema';
import useZero from '@/hooks/useZero';
import { clearClerkUser, deleteClerkUser } from '@/lib/clerkUser';
import { ZodProvider } from '@autoform/zod';
import { useAuth } from '@clerk/clerk-react';
import { ClerkUser, clerkUserCreateInputSchema } from 'shared/schema';
import * as z from 'zod';

const userSchema = clerkUserCreateInputSchema.extend({
	phoneNumber: z
		.string()
		.refine(
			value => /^[6-9]\d{9}$/.test(value),
			'Please enter a valid indian mobile number'
		)
		.optional(),
	role: z.enum(rolesEnum.enumValues).default('volunteer')
});

const schemaProvider = new ZodProvider(userSchema);

export default function CreateUserView() {
	const { getToken } = useAuth();
	const zero = useZero();
	return (
		<div className='max-w-3xl w-full self-center'>
			<AutoForm
				schema={schemaProvider}
				onSubmit={async ({ password, ...data }) => {
					let clerkUser: ClerkUser | undefined;
					try {
						// Create the user in Clerk
						clerkUser = await clearClerkUser({
							getToken,
							user: { password, ...data }
						});
						// Create the user in db
						await zero.mutate.users.insert({
							id: clerkUser.id,
							...data
						});
					} catch (e) {
						if (clerkUser) {
							// Clenup the user if the user creation fails
							await deleteClerkUser({ getToken, userId: clerkUser.id });
						}
						console.error(e);
					}
				}}
				withSubmit
			/>
		</div>
	);
}
