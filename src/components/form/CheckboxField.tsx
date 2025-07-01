import { Checkbox } from '@/components/ui/checkbox';
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@/components/ui/form';
import { Control, FieldValues, Path, useFormContext } from 'react-hook-form';

interface CheckboxFieldProps<T extends FieldValues> {
	name: Path<T>;
	label: string;
	control?: Control<T>;
	readonly?: boolean;
}

export function CheckboxField<T extends FieldValues>({
	name,
	label,
	control,
	readonly = false
}: CheckboxFieldProps<T>) {
	// If control is not provided, try to get it from context
	const methods = useFormContext<T>();
	const resolvedControl = control ?? methods.control;

	return (
		<FormField
			control={resolvedControl}
			name={name}
			render={({ field }) => (
				<FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md p-1'>
					<FormControl>
						<Checkbox
							checked={field.value}
							onCheckedChange={field.onChange}
							disabled={readonly}
						/>
					</FormControl>
					<div className='space-y-1 leading-none'>
						<FormLabel>{label}</FormLabel>
						<FormMessage />
					</div>
				</FormItem>
			)}
		/>
	);
}
