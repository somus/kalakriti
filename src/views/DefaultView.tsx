import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, ArrowLeft, HomeIcon } from 'lucide-react';
import { Link } from 'react-router';

export default function DefaultView() {
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
							We apologize for the inconvenience. The page you&apos;re looking
							for couldn&apos;t be found or an error has occurred.
						</p>
					</div>
				</div>

				<div className='flex flex-col sm:flex-row gap-2'>
					<Button variant='outline' className='flex-1' asChild>
						<Link
							// @ts-expect-error this works but types doesn't allow it
							to={-1}
						>
							<ArrowLeft className='mr-2 h-4 w-4' />
							Go Back
						</Link>
					</Button>
					<Button className='flex-1' asChild>
						<Link to='/'>
							<HomeIcon className='mr-2 h-4 w-4' />
							Return Home
						</Link>
					</Button>
				</div>

				<div className='border-t pt-6'>
					<p className='text-sm text-muted-foreground text-center'>
						If this problem persists, please contact our support team for
						assistance.
					</p>
				</div>
			</Card>
		</div>
	);
}
