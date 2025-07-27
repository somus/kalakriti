import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@/components/ui/form';
import MultipleSelector, { Option } from '@/components/ui/input-multiselect';
import { Control, FieldValues, Path, useFormContext } from 'react-hook-form';

interface MultiSelectFieldProps<T extends FieldValues> {
	name: Path<T>;
	label: string;
	control?: Control<T>;
	options: Option[];
	placeholder?: string;
	disabled?: boolean;
	hideLabel?: boolean;
}

export type { Option } from '@/components/ui/input-multiselect';

export function MultiSelectField<T extends FieldValues>({
	name,
	label,
	control,
	options,
	placeholder = 'Select an option',
	disabled = false,
	hideLabel = false
}: MultiSelectFieldProps<T>) {
	// If control is not provided, try to get it from context
	const methods = useFormContext<T>();
	const resolvedControl = control ?? methods.control;

	return (
		<FormField
			control={resolvedControl}
			name={name}
			render={({ field }) => (
				<FormItem className='flex-1'>
					<FormLabel className={hideLabel ? 'sr-only' : ''}>{label}</FormLabel>
					<FormControl className='w-full'>
						<MultipleSelector
							defaultOptions={options}
							placeholder={placeholder}
							emptyIndicator={<p>no results found.</p>}
							value={(field.value as string[])?.map(id => {
								const option = options.find(opt => opt.value === id);
								return option ?? { value: id, label: id };
							})}
							disabled={disabled}
							onChange={options => {
								methods.setValue(
									name,
									// @ts-expect-error fix later
									options.map(opt => opt.value),
									{ shouldValidate: true }
								);
							}}
						/>
					</FormControl>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}
