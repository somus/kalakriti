import {
	Modal,
	ModalContent,
	ModalHeader,
	ModalTitle,
	ModalTrigger
} from '@/components/ui/credenza';
import { Scanner } from '@yudiel/react-qr-scanner';
import { PropsWithChildren, useState } from 'react';
import { toast } from 'sonner';
import * as z from 'zod';

const scanResultSchema = z.object({
	type: z.enum(['guardian', 'participant', 'volunteer', 'judge', 'guest']),
	id: z.string(),
	isNewUser: z.boolean().optional()
});

type ScanResult = z.infer<typeof scanResultSchema>;

interface QRScanDialogProps extends PropsWithChildren {
	title?: string;
	onScan: (result: ScanResult) => Promise<void>;
}

export const QrScanDialog = ({
	children,
	title,
	onScan
}: QRScanDialogProps) => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<Modal open={isOpen} onOpenChange={setIsOpen}>
			<ModalTrigger asChild>{children}</ModalTrigger>
			<ModalContent aria-describedby={undefined}>
				<ModalHeader>
					<ModalTitle>{title ?? 'Scan QR Code'}</ModalTitle>
				</ModalHeader>
				<Scanner
					formats={['qr_code']}
					// eslint-disable-next-line @typescript-eslint/no-misused-promises
					onScan={async result => {
						try {
							const parsedResult = scanResultSchema.parse(
								JSON.parse(result[0].rawValue)
							);
							await onScan(parsedResult);
							setIsOpen(false);
						} catch (error) {
							toast.error('Invalid QR code', {
								description:
									error instanceof Error
										? error.message
										: 'Something went wrong'
							});
						}
					}}
					sound={false}
				/>
			</ModalContent>
		</Modal>
	);
};
