import {
	Card,
	CardContent,
	CardFooter,
	CardHeader
} from '@/components/ui/card';
import { QRCodeSVG } from 'qrcode.react';

interface IdCardProps {
	name: string;
	role: string;
	qrCodeValue: string;
	type: 'volunteer' | 'guardian' | 'participant';
}

const borderColor = {
	volunteer: 'border-red-500',
	guardian: 'border-green-500',
	participant: 'border-[#4FC2F8]'
};

export function IdCard({ name, role, qrCodeValue, type }: IdCardProps) {
	return (
		<Card className='w-[308px] h-[494px] flex flex-col shadow-xl rounded-xl overflow-auto items-center justify-start p-0'>
			<CardHeader
				className={`relative w-full bg-[#4D4C4A] border-b-[15px] ${borderColor[type]} flex items-center h-[100px]`}
				style={{ height: '100px' }}
			>
				<img src='/participant-id-card-header.jpg' alt='Id Card Header' />
			</CardHeader>

			<CardContent className='flex-grow flex flex-col items-center justify-center px-4 gap-5 bg-white'>
				<h1 className='text-xl font-bold text-gray-800 capitalize'>
					{type} ID card
				</h1>

				<div className='flex-grow flex items-center justify-center'>
					<QRCodeSVG value={qrCodeValue} size={150} level='H' />{' '}
				</div>

				<div className='flex flex-col gap-1 items-center'>
					<p className='text-base font-bold text-gray-700'>{name}</p>
					<p className='text-sm font-normal text-gray-500'>{role}</p>
				</div>
			</CardContent>

			<CardFooter className='w-full bg-[#4D4C4A] text-white text-center p-2 flex flex-col items-center h-[80px]'>
				<p className='text-xs font-light'>
					Art and Cultural festival for under-resourced communities
				</p>
				<p className='text-xs font-bold'>
					Emergency Contact Number -- +91 99864 31321
				</p>
			</CardFooter>
		</Card>
	);
}
