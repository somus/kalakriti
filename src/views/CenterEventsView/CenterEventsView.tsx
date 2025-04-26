import { CenterOutletContext } from '@/layout/CenterLayout';
import { useOutletContext } from 'react-router';

export default function CenterEventsView() {
	const { center } = useOutletContext<CenterOutletContext>();

	return <h1>{center.name} Events</h1>;
}
