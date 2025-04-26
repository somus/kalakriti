import { Center } from '@/db/schema.zero';
import { CenterOutletContext } from '@/layout/CenterLayout';
import { useOutletContext } from 'react-router';

export default function CenterView() {
	const { center } = useOutletContext<CenterOutletContext>();

	return <CenterPage center={center} />;
}

export function CenterPage({ center }: { center: Center }) {
	return <h2>{center.name}</h2>;
}
