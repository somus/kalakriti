import { CenterOutletContext } from '@/layout/CenterLayout';
import { useOutletContext } from 'react-router';

export default function CenterView() {
	const { center } = useOutletContext<CenterOutletContext>();

	return <h2>{center.name}</h2>;
}
