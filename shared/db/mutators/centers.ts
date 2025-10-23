// mutators.ts
import { createId } from '@paralleldrive/cuid2';
import { Transaction, UpdateValue } from '@rocicorp/zero';

import { assertIsAdmin } from '../permissions.ts';
import { AuthData, Schema } from '../schema.zero.ts';

export interface CreateCenterArgs {
	name: string;
	liaisons: string[];
	guardians: string[];
}

type MutatorTx = Transaction<Schema>;

export function createCenterMutators(authData: AuthData | undefined) {
	return {
		create: async (
			tx: MutatorTx,
			{ guardians, liaisons, ...data }: CreateCenterArgs
		) => {
			assertIsAdmin(authData);
			const centerId = createId();
			await tx.mutate.centers.insert({ id: centerId, ...data });
			for (const liaisonId of liaisons) {
				await tx.mutate.centerLiaisons.insert({
					centerId: centerId,
					userId: liaisonId
				});
			}
			for (const guardianId of guardians) {
				await tx.mutate.centerGuardians.insert({
					centerId: centerId,
					userId: guardianId
				});
			}
		},
		update: async (
			tx: MutatorTx,
			{
				liaisons,
				guardians,
				...change
			}: UpdateValue<Schema['tables']['centers']> &
				Partial<Pick<CreateCenterArgs, 'liaisons' | 'guardians'>>
		) => {
			assertIsAdmin(authData);
			const center = await tx.query.centers
				.where('id', change.id)
				.related('guardians')
				.related('liaisons')
				.one()
				.run();

			if (!center) {
				throw new Error('Center not found');
			}

			await tx.mutate.centers.update({
				...change,
				updatedAt: new Date().getTime()
			});

			if (liaisons) {
				const currentLiasonIds = center.liaisons.map(liaison => liaison.userId);

				// Determine which liaisons to remove and which to add
				const liaisonsToRemove = currentLiasonIds.filter(
					id => !liaisons.includes(id)
				);
				const liaisonsToAdd = liaisons?.filter(
					id => !currentLiasonIds.includes(id)
				);

				// Remove deleted liaisons
				for (const userId of liaisonsToRemove) {
					await tx.mutate.centerLiaisons.delete({
						centerId: center.id,
						userId
					});
				}

				// Add new liaisons
				for (const userId of liaisonsToAdd) {
					await tx.mutate.centerLiaisons.insert({
						centerId: center.id,
						userId
					});
				}
			}

			if (guardians) {
				const currentGuardianIds = center.guardians.map(
					guardian => guardian.userId
				);

				// Determine which guardians to remove and which to add
				const guardiansToRemove = currentGuardianIds.filter(
					id => !guardians?.includes(id)
				);
				const guardiansToAdd = guardians?.filter(
					id => !currentGuardianIds.includes(id)
				);

				// Remove deleted guardians
				for (const userId of guardiansToRemove) {
					await tx.mutate.centerGuardians.delete({
						centerId: center.id,
						userId
					});
				}

				// Add new guardians
				for (const userId of guardiansToAdd) {
					await tx.mutate.centerGuardians.insert({
						centerId: center.id,
						userId
					});
				}
			}
		},
		delete: async (tx: MutatorTx, { id }: { id: string }) => {
			assertIsAdmin(authData);
			await tx.mutate.centers.delete({ id });
		}
	} as const;
}
