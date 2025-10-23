import { syncedQuery } from '@rocicorp/zero';
import z from 'zod';

import { builder } from './zero-schema.gen';

export const queries = {
	allUsers: syncedQuery('allUsers', z.tuple([]), () =>
		builder.users
			.related('coordinatingEvents', q => q.related('event'))
			.related('guardianCenters', q => q.related('center'))
			.related('liaisoningCenters', q => q.related('center'))
			.related('volunteeringEvents', q => q.related('event'))
			.orderBy('createdAt', 'desc')
	),
	user: syncedQuery('user', z.tuple([z.uuid()]), ([id]) =>
		builder.users.where('id', id).one()
	)
} as const;
