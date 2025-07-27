import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@/components/ui/form';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectSeparator,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { Control, FieldValues, Path, useFormContext } from 'react-hook-form';

export interface SelectOption {
	value: string;
	label: string;
}

interface SelectFieldProps<T extends FieldValues> {
	name: Path<T>;
	label: string;
	control?: Control<T>;
	options: SelectOption[];
	placeholder?: string;
	disabled?: boolean;
	hideLabel?: boolean;
	showClear?: boolean;
}

export function SelectField<T extends FieldValues>({
	name,
	label,
	control,
	options,
	placeholder = 'Select an option',
	disabled = false,
	hideLabel = false,
	showClear = false
}: SelectFieldProps<T>) {
	// If control is not provided, try to get it from context
	const methods = useFormContext<T>();
	const resolvedControl = control ?? methods.control;

	return (
		<FormField
			control={resolvedControl}
			name={name}
			disabled={disabled}
			render={({ field }) => (
				<FormItem className='flex-1'>
					<FormLabel className={hideLabel ? 'sr-only' : ''}>{label}</FormLabel>
					<Select
						onValueChange={field.onChange}
						defaultValue={field.value}
						disabled={field.disabled}
						value={field.value}
					>
						<FormControl className='w-full'>
							<SelectTrigger>
								<SelectValue placeholder={placeholder} />
							</SelectTrigger>
						</FormControl>
						<SelectContent>
							{options.map(option => (
								<SelectItem key={option.value} value={option.value}>
									{option.label}
								</SelectItem>
							))}
							{field.value && showClear && (
								<>
									<SelectSeparator />

									<SelectItem
										key='clear'
										// @ts-expect-error fix later
										value={null}
									>
										Clear
									</SelectItem>
								</>
							)}
						</SelectContent>
					</Select>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}
