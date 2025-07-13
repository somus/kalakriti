import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Form } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';
import { ReactNode } from 'react';
import { FieldValues, FormProvider, UseFormReturn } from 'react-hook-form';

interface FormLayoutProps<T extends FieldValues> {
	form: UseFormReturn<T>;
	onSubmit: (e: React.FormEvent<HTMLFormElement>) => unknown;
	children: ReactNode;
	className?: string;
}

export function FormLayout<T extends FieldValues>({
	form,
	onSubmit,
	children,
	className = 'space-y-4'
}: FormLayoutProps<T>) {
	// Create a handler that doesn't return anything
	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		// Call the provided onSubmit but don't return its result
		void onSubmit(e);
	};

	return (
		<FormProvider {...form}>
			<Form {...form}>
				{form.formState.errors.root?.submissionError && (
					<Alert variant='destructive'>
						<AlertCircle className='h-4 w-4' />
						{form.formState.errors.root.submissionError.type ===
							'submitError' && <AlertTitle>Submission Error</AlertTitle>}
						<AlertDescription>
							{form.formState.errors.root.submissionError.message}
						</AlertDescription>
					</Alert>
				)}
				<form
					onSubmit={handleSubmit}
					className={cn(
						className,
						'group-data-[vaul-drawer]/drawer-content:overflow-y-scroll'
					)}
				>
					{children}
				</form>
			</Form>
		</FormProvider>
	);
}
