import { Checkbox } from '@/components/ui/checkbox';
import { AutoFormFieldProps } from '@autoform/react';
import React from 'react';

import { Label } from '../../label';

export const BooleanField: React.FC<AutoFormFieldProps> = ({
	field,
	label,
	id,
	inputProps
}) => (
	<div className='flex items-center space-x-2'>
		<Checkbox
			id={id}
			onCheckedChange={checked => {
				// react-hook-form expects an event object
				const event = {
					target: {
						name: field.key,
						value: checked
					}
				};
				// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
				inputProps.onChange(event);
			}}
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
			checked={inputProps.value}
		/>
		<Label htmlFor={id}>
			{label}
			{field.required && <span className='text-destructive'> *</span>}
		</Label>
	</div>
);
