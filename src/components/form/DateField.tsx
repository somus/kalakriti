import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@/components/ui/form';
import {
	Popover,
	PopoverContent,
	PopoverTrigger
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { ComponentProps } from 'react';
import { Control, FieldValues, Path, useFormContext } from 'react-hook-form';

interface DateFieldProps<T extends FieldValues> {
	name: Path<T>;
	label: string;
	control?: Control<T>;
	disabled?: boolean;
}

export function DateField<T extends FieldValues>({
	name,
	label,
	control,
	disabled = false,
	...props
}: DateFieldProps<T> &
	Omit<ComponentProps<typeof Calendar>, 'name' | 'disabled'>) {
	// If control is not provided, try to get it from context
	const methods = useFormContext<T>();
	const resolvedControl = control ?? methods.control;

	return (
		<FormField
			control={resolvedControl}
			name={name}
			disabled={disabled}
			render={({ field }) => {
				const date = field.value;
				return (
					<FormItem>
						<FormLabel>{label}</FormLabel>
						<FormControl>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant={'outline'}
										className={cn(
											'w-[240px] justify-start text-left font-normal',
											!date && 'text-muted-foreground'
										)}
										disabled={field.disabled}
									>
										<CalendarIcon className='mr-2 h-4 w-4' />
										{date ? format(date, 'PPP') : <span>Pick a date</span>}
									</Button>
								</PopoverTrigger>
								<PopoverContent className='w-auto p-0' align='start'>
									<Calendar
										mode='single'
										selected={date}
										onSelect={field.onChange}
										autoFocus
										{...props}
									/>
								</PopoverContent>
							</Popover>
						</FormControl>
						<FormMessage />
					</FormItem>
				);
			}}
		/>
	);
}
