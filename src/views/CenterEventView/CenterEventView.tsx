import { Schema } from '@/db/schema.zero';
import useZero from '@/hooks/useZero';
import { Row, Zero } from '@rocicorp/zero';
import { useQuery } from '@rocicorp/zero/react';
import { Navigate, useParams } from 'react-router';
import { z } from 'zod';

function centerEventQuery(z: Zero<Schema>, eventId: string) {
	return z.query.events
		.where('id', eventId)
		.related('category')
		.related('participants')
		.one();
}

export type CenterEvent = Row<ReturnType<typeof centerEventQuery>>;

export default function CenterEventsView() {
	// eslint-disable-next-line react-hooks/react-compiler
	'use no memo';

	const params = useParams();
	const zero = useZero();
	const eventId = z.string().cuid2().parse(params.eventId);
	const [event, status] = useQuery(centerEventQuery(zero, eventId));

	if (!eventId) {
		return <Navigate to='/' />;
	}

	if (status.type !== 'complete' || !event) {
		return null;
	}

	console.log(event);

	return <p>{event.name}</p>;
}
