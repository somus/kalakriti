import {
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ComponentProps } from 'react';
import { Control, FieldValues, Path, useFormContext } from 'react-hook-form';

interface InputFieldProps<T extends FieldValues> {
	name: Path<T>;
	label: string;
	control?: Control<T>;
	type?: string;
	description?: string;
	isRequired?: boolean;
}

export function InputField<T extends FieldValues>({
	name,
	label,
	control,
	type = 'text',
	description,
	isRequired = false,
	...props
}: InputFieldProps<T> & Omit<ComponentProps<typeof Input>, 'name' | 'type'>) {
	// If control is not provided, try to get it from context
	const methods = useFormContext<T>();
	const resolvedControl = control ?? methods.control;

	return (
		<FormField
			control={resolvedControl}
			name={name}
			render={({ field }) => (
				<FormItem>
					<FormLabel isRequired={isRequired}>{label}</FormLabel>
					<FormControl>
						<Input
							type={type}
							{...field}
							{...props}
							value={field.value ?? ''}
							onChange={
								type === 'number'
									? e => field.onChange(Number(e.target.value))
									: field.onChange
							}
						/>
					</FormControl>
					{description && <FormDescription>{description}</FormDescription>}
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}
