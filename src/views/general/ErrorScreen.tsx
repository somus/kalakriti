import React from 'react';

function ErrorScreen({
	children,
	error
}: {
	children?: React.ReactNode;
	error?: Error;
}) {
	return (
		<div className='flex h-full w-full items-center justify-center flex-col gap-2'>
			<div className='text-t2 text-sm max-w-sm text-center'>
				{children ?? error?.message ?? 'Something went wrong.'}
			</div>
		</div>
	);
}

export default ErrorScreen;
