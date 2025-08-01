import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { QRCodeSVG } from 'qrcode.react';

interface IdCardProps {
	name: string;
	role: string;
	qrCodeValue: string;
	type: 'volunteer' | 'guardian' | 'participant';
}

const backgroundColors = {
	volunteer: 'from-blue-300 to-cyan-500',
	guardian: 'from-lime-300 to-green-500',
	participant: 'from-pink-400 to-purple-500'
};

const nameTextColors = {
	volunteer: 'from-blue-900 to-cyan-900',
	guardian: 'from-indigo-900 to-blue-950',
	participant: 'from-gray-900 to-blue-950'
};

const roleTextColors = {
	volunteer: 'from-indigo-900 to-blue-900',
	guardian: 'from-gray-900 to-gray-950',
	participant: 'from-gray-800 to-indigo-950'
};

export function IdCard({ name, role, qrCodeValue, type }: IdCardProps) {
	return (
		<Card
			className={`w-[325px] h-[523px] overflow-hidden rounded-xl shadow-2xl
                 bg-gradient-to-br ${backgroundColors[type]}
                 text-black border-2 border-white/50 flex flex-col items-center justify-start p-5 gap-5`}
		>
			<CardHeader className='flex flex-col items-center justify-center p-0 w-full'>
				<img
					src='/kalakriti-logo.png'
					alt='Kalakriti Logo'
					className='h-24 object-contain'
				/>
			</CardHeader>
			<CardContent className='flex flex-col items-center justify-center p-0 text-center flex-grow'>
				<div className='rounded-lg bg-white p-3 shadow-xl border border-gray-100 mb-6'>
					<QRCodeSVG value={qrCodeValue} size={220} level='H' />{' '}
					{/* Slightly smaller QR */}
				</div>
				<h2
					className={`text-2xl font-extrabold mb-1 bg-gradient-to-br ${nameTextColors[type]} text-transparent bg-clip-text`}
				>
					{name}
				</h2>
				<p
					className={`text-lg font-semibold capitalize bg-gradient-to-br ${roleTextColors[type]} text-transparent bg-clip-text`}
				>
					{role}
				</p>
			</CardContent>
		</Card>
	);
}
