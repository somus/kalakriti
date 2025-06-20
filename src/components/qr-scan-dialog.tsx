import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog';
import useZero from '@/hooks/useZero';
import { useQuery } from '@rocicorp/zero/react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { PropsWithChildren, useState } from 'react';
import * as z from 'zod/v4';

import { Button } from './ui/button';

const scanResultSchema = z.object({
	type: z.enum(['user', 'participant']),
	id: z.string()
});

type ScanResult = z.infer<typeof scanResultSchema>;

export const QrScanDialog = ({ children }: PropsWithChildren) => {
	const [scanResult, setScanResult] = useState<ScanResult | null>(null);
	const zero = useZero();
	const [user] = useQuery(
		zero.query.users.where('id', '=', scanResult?.id ?? '').one()
	);

	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent aria-describedby={undefined}>
				<DialogTitle>Scan QR Code</DialogTitle>
				{scanResult ? (
					<div className='flex flex-col gap-1'>
						<p>
							<strong>Type:</strong> {scanResult.type}
						</p>
						<p>
							<strong>ID:</strong> {scanResult.id}
						</p>
						{user && (
							<>
								<p>
									<strong>Name:</strong> {user.firstName} {user.lastName}
								</p>
								<p>
									<strong>Email:</strong> {user.email}
								</p>
								<p>
									<strong>Phone:</strong> {user.phoneNumber}
								</p>
								<p>
									<strong>Role:</strong> {user.role}
								</p>
							</>
						)}
						<Button onClick={() => setScanResult(null)}>Scan Again</Button>
					</div>
				) : (
					<Scanner
						formats={['qr_code']}
						onScan={result => {
							try {
								const parsedResult = scanResultSchema.parse(
									JSON.parse(result[0].rawValue)
								);
								setScanResult(parsedResult);
							} catch (error) {
								console.error('Invalid QR code format', error);
							}
						}}
						sound={false}
					/>
				)}
			</DialogContent>
		</Dialog>
	);
};
