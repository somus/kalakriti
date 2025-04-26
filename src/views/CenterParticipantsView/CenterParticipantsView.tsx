import { CenterOutletContext } from '@/layout/CenterLayout';
import { useOutletContext } from 'react-router';

export default function CenterParticipantsView() {
	const { center } = useOutletContext<CenterOutletContext>();

	return <h1>{center.name} Participants</h1>;
}
