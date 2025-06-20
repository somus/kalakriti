import * as z from 'zod/v4';

export const clerkUserSchema = z.object({
	id: z.string(),
	firstName: z.string(),
	lastName: z.string().optional(),
	email: z.email(),
	password: z.string().min(10),
	role: z.enum(['admin', 'volunteer', 'guardian'])
});

export const clerkUserCreateInputSchema = clerkUserSchema.omit({ id: true });
export const clerkUserUpdateInputSchema = clerkUserSchema
	.partial({
		firstName: true,
		password: true,
		role: true
	})
	.omit({ email: true });

export type ClerkUser = z.infer<typeof clerkUserSchema>;
export type ClerkUserCreateInput = z.infer<typeof clerkUserCreateInputSchema>;
export type ClerkUserUpdateInput = z.infer<typeof clerkUserUpdateInputSchema>;
