import DataTableWrapper from '@/components/data-table-wrapper';
import { Schema } from '@/db/schema.zero';
import useZero from '@/hooks/useZero';
import { Row, Zero } from '@rocicorp/zero';
import { useQuery } from '@rocicorp/zero/react';

import { columns } from './columns';
import { columnsConfig } from './filters';

function centerEventsQuery(z: Zero<Schema>) {
	return z.query.events.related('category').related('participants');
}

export type CenterEvent = Row<ReturnType<typeof centerEventsQuery>>;

export default function CenterEventsView() {
	// eslint-disable-next-line react-hooks/react-compiler
	'use no memo';

	const zero = useZero();
	const [events, status] = useQuery(centerEventsQuery(zero));

	if (status.type !== 'complete') {
		return null;
	}

	return (
		<DataTableWrapper
			data={events as CenterEvent[]}
			columns={columns}
			columnsConfig={columnsConfig}
		/>
	);
}
