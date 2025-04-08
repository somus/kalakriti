import { Checkbox } from '@/components/ui/checkbox';
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@/components/ui/form';
import { Control, FieldValues, Path } from 'react-hook-form';

interface CheckboxFieldProps<T extends FieldValues> {
	name: Path<T>;
	label: string;
	control: Control<T>;
}

export function CheckboxField<T extends FieldValues>({
	name,
	label,
	control
}: CheckboxFieldProps<T>) {
	return (
		<FormField
			control={control}
			name={name}
			render={({ field }) => (
				<FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md p-1'>
					<FormControl>
						<Checkbox checked={field.value} onCheckedChange={field.onChange} />
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
