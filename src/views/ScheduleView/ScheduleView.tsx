import { Card } from '@/components/ui/card';
import { useState } from 'react';

export default function ScheduleView() {
	const [selectedImage, setSelectedImage] = useState<string | null>(null);

	const openModal = (imageSrc: string) => {
		setSelectedImage(imageSrc);
	};

	const closeModal = () => {
		setSelectedImage(null);
	};

	return (
		<div className='container mx-auto px-4 py-6 space-y-8 max-w-7xl'>
			{/* Schedule Images Container */}
			<div className='grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8'>
				{/* First Schedule Image */}
				<Card className='p-4 lg:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300'>
					<div className='space-y-4'>
						<h2 className='text-xl lg:text-2xl font-semibold text-center text-gray-800 border-b pb-2'>
							Events Schedule
						</h2>
						<div
							className='relative w-full cursor-pointer'
							onClick={() => openModal('/schedule.jpg')}
						>
							<img
								src='/schedule.jpg'
								alt='Events Schedule - Rooms 101-108 and Badminton Court including Painting, Face Painting, Junk Art, Piggy Bank Painting, and Rangoli events'
								className='w-full h-auto rounded-lg shadow-md'
								loading='lazy'
							/>
						</div>
					</div>
				</Card>

				{/* Second Schedule Image */}
				<Card className='p-4 lg:p-6 shadow-lg hover:shadow-xl transition-shadow duration-300'>
					<div className='space-y-4'>
						<h2 className='text-xl lg:text-2xl font-semibold text-center text-gray-800 border-b pb-2'>
							Main Audi Events Schedule
						</h2>
						<div
							className='relative w-full cursor-pointer'
							onClick={() => openModal('/schedule-main-audi.jpg')}
						>
							<img
								src='/schedule-main-audi.jpg'
								alt='Main Auditorium Group Dance Events Schedule including Female, Male, and Mixed group dance events'
								className='w-full h-auto rounded-lg shadow-md'
								loading='lazy'
							/>
						</div>
					</div>
				</Card>
			</div>

			{/* Mobile Instructions */}
			<div className='block xl:hidden'>
				<Card className='p-4 bg-gray-50 border-gray-200'>
					<div className='text-center text-sm text-gray-600'>
						<p className='flex items-center justify-center gap-2'>
							<span>📱</span>
							<span>Tap on any schedule image to view in full screen</span>
						</p>
					</div>
				</Card>
			</div>

			{/* Modal for Full Screen Image */}
			{selectedImage && (
				<div
					className='fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4'
					onClick={closeModal}
				>
					<div className='relative max-w-full max-h-full'>
						<button
							onClick={closeModal}
							className='absolute top-4 right-4 text-white bg-red-600 hover:bg-red-700 rounded-full p-2 z-10 transition-colors duration-200'
							aria-label='Close modal'
						>
							<svg
								className='w-6 h-6'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M6 18L18 6M6 6l12 12'
								/>
							</svg>
						</button>
						<img
							src={selectedImage}
							alt='Schedule in full screen'
							className='max-w-full max-h-full object-contain rounded-lg'
						/>
					</div>
				</div>
			)}
		</div>
	);
}
