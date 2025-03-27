import React from 'react';

function ErrorScreen({ children }: { children: React.ReactNode }) {
	return (
		<div className='flex h-full w-full items-center justify-center flex-col gap-2'>
			<div className='text-t2 text-sm max-w-sm text-center'>{children}</div>
		</div>
	);
}

export default ErrorScreen;
