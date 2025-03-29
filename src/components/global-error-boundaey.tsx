import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, Home } from 'lucide-react';
import { FallbackProps } from 'react-error-boundary';
import { Link } from 'react-router';

export function ErrorBoundaryFallback({
	error,
	resetErrorBoundary
}: FallbackProps) {
	return (
		<div className='min-h-screen w-full bg-background flex items-center justify-center p-4'>
			<Card className='max-w-md w-full p-8 space-y-6'>
				<div className='flex flex-col items-center text-center space-y-4'>
					<div className='rounded-full bg-destructive/10 p-3'>
						<AlertCircle className='h-6 w-6 text-destructive' />
					</div>

					<div className='space-y-2'>
						<h1 className='text-3xl font-bold tracking-tighter'>
							Something went wrong
						</h1>
						<p className='text-muted-foreground'>
							{Error.isError(error)
								? error.message
								: 'An unexpected error occurred.'}
						</p>
					</div>
				</div>

				<div className='flex justify-center gap-4'>
					<Button
						variant='outline'
						onClick={resetErrorBoundary}
						className='flex-1 gap-2'
					>
						Try Again
					</Button>
					<Button asChild className='flex-1 gap-2'>
						<Link to='/'>
							<Home className='h-4 w-4' />
							Back to home
						</Link>
					</Button>
				</div>

				<div className='border-t pt-6'>
					<p className='text-sm text-muted-foreground text-center'>
						If this problem persists, please contact our support team for
						assistance.
					</p>
					{import.meta.env.DEV && Error.isError(error) ? (
						<div className='mt-4 p-4 bg-muted rounded-md'>
							<p className='text-xs font-mono text-muted-foreground break-all'>
								{error.stack}
							</p>
						</div>
					) : null}
				</div>
			</Card>
		</div>
	);
}
