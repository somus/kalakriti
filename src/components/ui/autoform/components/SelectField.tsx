import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { AutoFormFieldProps } from '@autoform/react';
import React from 'react';

export const SelectField: React.FC<AutoFormFieldProps> = ({
	field,
	inputProps,
	error,
	value,
	id
}) => {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unused-vars
	const { key, ...props } = inputProps;

	return (
		<Select
			{...props}
			onValueChange={value => {
				const syntheticEvent = {
					target: {
						value,
						name: field.key
					}
				} as React.ChangeEvent<HTMLInputElement>;
				// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
				props.onChange(syntheticEvent);
			}}
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
			defaultValue={value ?? field.default}
		>
			<SelectTrigger id={id} className={error ? 'border-destructive' : ''}>
				<SelectValue placeholder='Select an option' />
			</SelectTrigger>
			<SelectContent>
				{(field.options ?? []).map(([key, label]) => (
					<SelectItem key={key} value={key}>
						{label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
};
