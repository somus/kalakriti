'use client';

import { LoaderCircle } from 'lucide-react';

function LoadingScreen() {
	return (
		<div className='flex h-screen w-full items-center justify-center'>
			<div className='flex flex-col items-center space-y-4'>
				<LoaderCircle className='animate-spin text-primary' size={30} />
				<p className='text-gray-500 dark:text-gray-400'>Loading...</p>
			</div>
		</div>
	);
}

export default LoadingScreen;
