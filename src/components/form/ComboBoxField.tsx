import { Button } from '@/components/ui/button';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList
} from '@/components/ui/command';
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
import lowerFirst from 'lodash/lowerFirst';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Control, FieldValues, Path, useFormContext } from 'react-hook-form';

export interface ComboBoxOption {
	value: string;
	label: string;
}

interface ComboBoxFieldProps<T extends FieldValues> {
	name: Path<T>;
	label: string;
	control?: Control<T>;
	options: ComboBoxOption[];
	disabled?: boolean;
	hideLabel?: boolean;
}

export function ComboBoxField<T extends FieldValues>({
	name,
	label,
	control,
	options,
	disabled = false,
	hideLabel = false
}: ComboBoxFieldProps<T>) {
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
					<Popover>
						<PopoverTrigger asChild>
							<FormControl>
								<Button
									variant='outline'
									role='combobox'
									className={cn(
										'min-w-[200px] justify-between',
										!field.value && 'text-muted-foreground'
									)}
								>
									{field.value
										? options.find(option => option.value === field.value)
												?.label
										: `Select ${lowerFirst(label)}`}
									<ChevronsUpDown className='opacity-50' />
								</Button>
							</FormControl>
						</PopoverTrigger>
						<PopoverContent className='min-w-[200px] p-0'>
							<Command>
								<CommandInput
									placeholder={`Search ${lowerFirst(label)}...`}
									className='h-9'
								/>
								<CommandList>
									<CommandEmpty>No {lowerFirst(label)} found.</CommandEmpty>
									<CommandGroup>
										{options.map(option => (
											<CommandItem
												value={option.label}
												key={option.value}
												onSelect={() => {
													field.onChange(option.value);
													// @ts-expect-error fix later
													methods.setValue(name, option.value);
												}}
											>
												{option.label}
												<Check
													className={cn(
														'ml-auto',
														option.value === field.value
															? 'opacity-100'
															: 'opacity-0'
													)}
												/>
											</CommandItem>
										))}
									</CommandGroup>
								</CommandList>
							</Command>
						</PopoverContent>
					</Popover>
					<FormMessage />
				</FormItem>
			)}
		/>
	);
}
