import { Input } from '@/components/ui/input';
import { AutoFormFieldProps } from '@autoform/react';
import React from 'react';

export const DateField: React.FC<AutoFormFieldProps> = ({
	inputProps,
	error,
	id
}) => {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unused-vars
	const { key, ...props } = inputProps;

	return (
		<Input
			id={id}
			type='date'
			className={error ? 'border-destructive' : ''}
			{...props}
		/>
	);
};
