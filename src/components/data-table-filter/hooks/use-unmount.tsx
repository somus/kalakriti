import { useEffect, useRef } from 'react';

export function useUnmount(func: () => void) {
	const funcRef = useRef(func);

	// eslint-disable-next-line react-hooks/refs
	funcRef.current = func;

	useEffect(
		() => () => {
			funcRef.current();
		},
		[]
	);
}
