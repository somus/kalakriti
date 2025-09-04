import {
	Document,
	Font,
	Image,
	Page,
	StyleSheet,
	Text,
	View
} from '@react-pdf/renderer';
import capitalize from 'lodash/capitalize';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';

// Helper to chunk an array
const chunk = <T,>(arr: T[], size: number): T[][] =>
	Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
		arr.slice(i * size, i * size + size)
	);

export interface IdCardData {
	name?: string;
	role?: string;
	type: 'volunteer' | 'guardian' | 'participant' | 'guest' | 'judge';
	qrCodeValue: string;
}

interface IdCardPdfProps {
	idCards: IdCardData[];
}

// Register fonts
Font.register({
	family: 'Poppins',
	fonts: [
		{
			src: 'https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-Light.ttf',
			fontWeight: 300
		},
		{
			src: 'https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-Regular.ttf',
			fontWeight: 400
		},
		{
			src: 'https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-Bold.ttf',
			fontWeight: 700
		}
	]
});

const pageStyles = StyleSheet.create({
	page: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		backgroundColor: '#FFFFFF',
		padding: 1
	},
	cardContainer: {
		width: '50%',
		height: '50%',
		padding: 1
	}
});

const cardStyles = StyleSheet.create({
	card: {
		width: '100%',
		height: '100%',
		display: 'flex',
		flexDirection: 'column',
		gap: 8,
		borderRadius: 6,
		overflow: 'hidden',
		alignItems: 'center',
		justifyContent: 'flex-start',
		fontFamily: 'Poppins',
		backgroundColor: 'white',
		border: '1px solid #EEE'
	},
	header: {
		position: 'relative',
		width: '100%',
		backgroundColor: '#4D4C4A',
		borderBottomWidth: 14,
		borderBottomColor: '#4FC2F8',
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 12,
		height: 94
	},
	logo: {
		maxHeight: 50,
		flexBasis: '33.33%',
		alignSelf: 'flex-end',
		marginBottom: 14
	},
	content: {
		flexGrow: 1,
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 4,
		gap: 10,
		backgroundColor: 'white',
		width: '100%'
	},
	title: {
		fontSize: 17,
		color: '#2d3748',
		fontWeight: 700
	},
	qrCodeContainer: {
		flexGrow: 1,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center'
	},
	participantInfo: {
		display: 'flex',
		flexDirection: 'column',
		gap: 4,
		alignItems: 'stretch',
		paddingHorizontal: 16,
		width: '80%',
		marginHorizontal: 'auto'
	},
	name: {
		fontSize: 12,
		color: '#4a5568',
		fontWeight: 700,
		minHeight: 14,
		textAlign: 'center'
	},
	role: {
		fontSize: 10,
		color: '#718096',
		fontWeight: 400,
		textAlign: 'center',
		minHeight: 12
	},
	placeholder: {
		borderBottomWidth: 1,
		borderBottomColor: '#4a5568'
	},
	footer: {
		width: '100%',
		backgroundColor: '#4D4C4A',
		color: 'white',
		textAlign: 'center',
		padding: 8,
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		height: 42
	},
	footerText: {
		fontSize: 8,
		lineHeight: 1.5,
		color: 'white',
		fontWeight: 300
	},
	footerTextBold: {
		fontSize: 8,
		lineHeight: 1.5,
		color: 'white',
		fontWeight: 700
	}
});

function QRCodeImage({ value, size }: { value: string; size: number }) {
	const [dataUrl, setDataUrl] = useState<string | null>(null);

	useEffect(() => {
		QRCode.toDataURL(value, { errorCorrectionLevel: 'H' }, (err, url) => {
			if (err) {
				console.error(err);
				return;
			}
			setDataUrl(url);
		});
	}, [value]);

	return dataUrl ? (
		<Image src={dataUrl} style={{ width: size, height: size }} />
	) : null;
}

const borderColor = {
	volunteer: '#FB2C37',
	guardian: '#00C950',
	participant: '#4FC2F8',
	guest: '#F0B100',
	judge: '#AD47FF'
};

function IdCard({ name, role, type, qrCodeValue }: IdCardData) {
	return (
		<View style={cardStyles.card}>
			<View
				style={{
					...cardStyles.header,
					borderBottomColor: borderColor[type]
				}}
			>
				<Image src='/participant-id-card-header.jpg' />
			</View>
			<View style={cardStyles.content}>
				<Text style={cardStyles.title}>{capitalize(type)} ID card</Text>
				<View style={cardStyles.qrCodeContainer}>
					<QRCodeImage value={qrCodeValue} size={180} />
				</View>
				<View
					style={{
						...cardStyles.participantInfo,
						...(!name ? { gap: 10 } : {})
					}}
				>
					<Text
						style={{
							...cardStyles.name,
							...(!name ? cardStyles.placeholder : {})
						}}
					>
						{name}
					</Text>
					<Text
						style={{
							...cardStyles.role,
							...(!role ? cardStyles.placeholder : {})
						}}
					>
						{role}
					</Text>
				</View>
			</View>
			<View style={cardStyles.footer}>
				<Text style={cardStyles.footerText}>
					Art and Cultural festival for under-resourced communities
				</Text>
				<Text style={cardStyles.footerTextBold}>
					Emergency Contact Number -- +91 99864 31321
				</Text>
			</View>
		</View>
	);
}

export function IdCardPdf({ idCards }: IdCardPdfProps) {
	const cardChunks = chunk(idCards, 4);

	return (
		<Document>
			{cardChunks.map((pageOfCards, pageIndex) => (
				<Page key={pageIndex} size='A4' style={pageStyles.page}>
					{pageOfCards.map((cardData, cardIndex) => (
						<View key={cardIndex} style={pageStyles.cardContainer}>
							<IdCard {...cardData} />
						</View>
					))}
				</Page>
			))}
		</Document>
	);
}
