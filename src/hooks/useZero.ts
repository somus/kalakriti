import { ZeroSchema } from '@/db/schema.zero';
import { useZero as useZ } from '@rocicorp/zero/react';

export default function useZero() {
	return useZ<ZeroSchema>();
}
