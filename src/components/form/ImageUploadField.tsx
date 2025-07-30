import { GetToken } from '@clerk/types';
import AwsS3, { type AwsS3UploadParameters } from '@uppy/aws-s3';
import Uppy, { Body, Meta, type UploadResult, UppyFile } from '@uppy/core';
import '@uppy/core/dist/style.min.css';
import '@uppy/dashboard/dist/style.min.css';
import { Dashboard } from '@uppy/react';
import React from 'react';

// eslint-disable-next-line react-refresh/only-export-components
export async function getUploadParameters(
	file: UppyFile<Meta, Body>,
	getToken: GetToken
) {
	const token = await getToken();
	const response = await fetch('http://localhost:3000/api/getSignedURL', {
		method: 'POST',
		headers: {
			accept: 'application/json',
			Authorization: `Bearer ${token}`
		},
		body: JSON.stringify({
			filename: file.name,
			contentType: file.type
		})
	});
	if (!response.ok) throw new Error('Unsuccessful request');

	// Parse the JSON response.
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const data: { url: string; method: 'PUT' } = await response.json();

	// Return an object in the correct shape.
	const object: AwsS3UploadParameters = {
		method: data.method,
		url: data.url,
		fields: {}, // For presigned PUT uploads, this should be left empty.
		// Provide content type header required by S3
		headers: {
			'Content-Type': file.type ? file.type : 'application/octet-stream'
		}
	};
	return object;
}

export function FileUploader({
	onUploadSuccess,
	getToken
}: {
	onUploadSuccess: (result: UploadResult<Meta, Body>) => void;
	getToken: GetToken;
}) {
	const uppy = React.useMemo(() => {
		const uppy = new Uppy({
			autoProceed: true,
			restrictions: {
				maxNumberOfFiles: 1,
				allowedFileTypes: ['image/*']
			}
		}).use(AwsS3, {
			id: 'AwsS3',
			shouldUseMultipart: false,
			getUploadParameters: (file: UppyFile<Meta, Body>) =>
				getUploadParameters(file, getToken)
		});
		return uppy;
	}, [getToken]);
	uppy.on('complete', result => {
		onUploadSuccess(result);
	});
	return <Dashboard uppy={uppy} showProgressDetails height={350} />;
}
