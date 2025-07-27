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
import { Matcher } from 'react-day-picker';
import { Control, FieldValues, Path, useFormContext } from 'react-hook-form';

interface DateFieldProps<T extends FieldValues> {
	name: Path<T>;
	label: string;
	control?: Control<T>;
	disabled?: boolean;
	disabledDates?: Matcher | Matcher[];
}

export function DateField<T extends FieldValues>({
	name,
	label,
	control,
	disabled = false,
	disabledDates,
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
											'w-[200px] justify-start text-left font-normal',
											!date && 'text-muted-foreground'
										)}
										disabled={disabled}
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
										disabled={disabledDates}
										defaultMonth={props.defaultMonth ?? date}
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
