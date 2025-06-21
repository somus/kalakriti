import { Zero as ZeroType } from '@rocicorp/zero';
import { useZero as useZ } from '@rocicorp/zero/react';
import { createMutators } from 'shared/db/mutators';
import { Schema } from 'shared/db/schema.zero';

export default function useZero() {
	return useZ<Schema, ReturnType<typeof createMutators>>();
}

export type Zero = ZeroType<Schema, ReturnType<typeof createMutators>>;
