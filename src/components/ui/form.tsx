import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import * as LabelPrimitive from '@radix-ui/react-label';
import { Slot } from '@radix-ui/react-slot';
import * as React from 'react';
import {
	Controller,
	type ControllerProps,
	type FieldPath,
	type FieldValues,
	FormProvider,
	useFormContext,
	useFormState
} from 'react-hook-form';

import { Button } from './button';

const Form = FormProvider;

interface FormFieldContextValue<
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
	name: TName;
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
	{} as FormFieldContextValue
);

const FormField = <
	TFieldValues extends FieldValues = FieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
	...props
}: ControllerProps<TFieldValues, TName>) => {
	return (
		<FormFieldContext.Provider value={{ name: props.name }}>
			<Controller {...props} />
		</FormFieldContext.Provider>
	);
};

const useFormField = () => {
	const fieldContext = React.useContext(FormFieldContext);
	const itemContext = React.useContext(FormItemContext);
	const { getFieldState, setValue, watch } = useFormContext();
	const formState = useFormState({ name: fieldContext.name });
	const fieldState = getFieldState(fieldContext.name, formState);

	if (!fieldContext) {
		throw new Error('useFormField should be used within <FormField>');
	}

	const { id } = itemContext;

	return {
		id,
		name: fieldContext.name,
		formItemId: `${id}-form-item`,
		formDescriptionId: `${id}-form-item-description`,
		formMessageId: `${id}-form-item-message`,
		watch,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		setValue: (value: any) => setValue(fieldContext.name, value),
		...fieldState
	};
};

interface FormItemContextValue {
	id: string;
}

const FormItemContext = React.createContext<FormItemContextValue>(
	{} as FormItemContextValue
);

function FormItem({ className, ...props }: React.ComponentProps<'div'>) {
	const id = React.useId();

	return (
		<FormItemContext.Provider value={{ id }}>
			<div
				data-slot='form-item'
				className={cn('grid gap-2', className)}
				{...props}
			/>
		</FormItemContext.Provider>
	);
}

function FormLabel({
	className,
	isRequired = false,
	children,
	showClear = true,
	...props
}: React.ComponentProps<typeof LabelPrimitive.Root> & {
	isRequired?: boolean;
	showClear?: boolean;
}) {
	const { error, formItemId, watch, setValue, name } = useFormField();
	const canShowClear =
		showClear && !isRequired && !!watch(name) && watch(name) !== '';

	return (
		<Label
			data-slot='form-label'
			data-error={!!error}
			className={cn('data-[error=true]:text-destructive', className)}
			htmlFor={formItemId}
			{...props}
		>
			<div className='flex flex-1 items-center gap-1 content-between'>
				<p className='flex-1'>
					{children}
					{isRequired && <span className='text-destructive ml-1'>*</span>}
				</p>
				{canShowClear && (
					<Button
						variant='link'
						size='sm'
						className='text-muted-foreground hover:text-destructive'
						onClick={() => {
							setValue('');
						}}
						type='button'
					>
						Clear
					</Button>
				)}
			</div>
		</Label>
	);
}

function FormControl({ ...props }: React.ComponentProps<typeof Slot>) {
	const { error, formItemId, formDescriptionId, formMessageId } =
		useFormField();

	return (
		<Slot
			data-slot='form-control'
			id={formItemId}
			aria-describedby={
				!error
					? `${formDescriptionId}`
					: `${formDescriptionId} ${formMessageId}`
			}
			aria-invalid={!!error}
			{...props}
		/>
	);
}

function FormDescription({ className, ...props }: React.ComponentProps<'p'>) {
	const { formDescriptionId } = useFormField();

	return (
		<p
			data-slot='form-description'
			id={formDescriptionId}
			className={cn('text-muted-foreground text-sm', className)}
			{...props}
		/>
	);
}

function FormMessage({ className, ...props }: React.ComponentProps<'p'>) {
	const { error, formMessageId } = useFormField();
	const body = error ? String(error?.message ?? '') : props.children;

	if (!body) {
		return null;
	}

	return (
		<p
			data-slot='form-message'
			id={formMessageId}
			className={cn(
				'text-destructive text-sm wrap-break-word min-w-full',
				className
			)}
			{...props}
		>
			{body}
		</p>
	);
}

export {
	// eslint-disable-next-line react-refresh/only-export-components
	useFormField,
	Form,
	FormItem,
	FormLabel,
	FormControl,
	FormDescription,
	FormMessage,
	FormField
};
