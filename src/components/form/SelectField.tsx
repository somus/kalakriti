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
}

export function SelectField<T extends FieldValues>({
	name,
	label,
	control,
	options,
	placeholder = 'Select an option'
}: SelectFieldProps<T>) {
	// If control is not provided, try to get it from context
	const methods = useFormContext<T>();
	const resolvedControl = control ?? methods.control;

	return (
		<FormField
			control={resolvedControl}
			name={name}
			render={({ field }) => (
				<FormItem>
					<FormLabel>{label}</FormLabel>
					<Select onValueChange={field.onChange} defaultValue={field.value}>
						<FormControl>
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
						</SelectContent>
					</Select>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}
