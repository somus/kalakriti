'use client';

import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger
} from '@/components/ui/drawer';
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger
} from '@/components/ui/sheet';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import * as React from 'react';

interface BaseProps {
	children: React.ReactNode;
}

interface RootCredenzaProps extends BaseProps {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	modal?: boolean;
}

interface CredenzaProps extends BaseProps {
	className?: string;
	asChild?: true;
}

const CredenzaContext = React.createContext<{ isDesktop: boolean }>({
	isDesktop: false
});

const useCredenzaContext = () => {
	const context = React.useContext(CredenzaContext);
	if (!context) {
		throw new Error(
			'Credenza components cannot be rendered outside the Credenza Context'
		);
	}
	return context;
};

const Credenza = ({ children, ...props }: RootCredenzaProps) => {
	const isDesktop = useMediaQuery('(min-width: 768px)');
	const Credenza = isDesktop ? Sheet : Drawer;

	return (
		<CredenzaContext.Provider value={{ isDesktop }}>
			<Credenza {...props} {...(!isDesktop && { autoFocus: true })}>
				{children}
			</Credenza>
		</CredenzaContext.Provider>
	);
};

const CredenzaTrigger = ({ className, children, ...props }: CredenzaProps) => {
	const { isDesktop } = useCredenzaContext();
	const CredenzaTrigger = isDesktop ? SheetTrigger : DrawerTrigger;

	return (
		<CredenzaTrigger className={className} {...props}>
			{children}
		</CredenzaTrigger>
	);
};

const CredenzaClose = ({ className, children, ...props }: CredenzaProps) => {
	const { isDesktop } = useCredenzaContext();
	const CredenzaClose = isDesktop ? SheetClose : DrawerClose;

	return (
		<CredenzaClose className={className} {...props}>
			{children}
		</CredenzaClose>
	);
};

const CredenzaContent = ({ className, children, ...props }: CredenzaProps) => {
	const { isDesktop } = useCredenzaContext();
	const CredenzaContent = isDesktop ? SheetContent : DrawerContent;

	return (
		<CredenzaContent className={className} {...props}>
			{children}
		</CredenzaContent>
	);
};

const CredenzaDescription = ({
	className,
	children,
	...props
}: CredenzaProps) => {
	const { isDesktop } = useCredenzaContext();
	const CredenzaDescription = isDesktop ? SheetDescription : DrawerDescription;

	return (
		<CredenzaDescription className={className} {...props}>
			{children}
		</CredenzaDescription>
	);
};

const CredenzaHeader = ({ className, children, ...props }: CredenzaProps) => {
	const { isDesktop } = useCredenzaContext();
	const CredenzaHeader = isDesktop ? SheetHeader : DrawerHeader;

	return (
		<CredenzaHeader className={className} {...props}>
			{children}
		</CredenzaHeader>
	);
};

const CredenzaTitle = ({ className, children, ...props }: CredenzaProps) => {
	const { isDesktop } = useCredenzaContext();
	const CredenzaTitle = isDesktop ? SheetTitle : DrawerTitle;

	return (
		<CredenzaTitle className={className} {...props}>
			{children}
		</CredenzaTitle>
	);
};

const CredenzaBody = ({ className, children, ...props }: CredenzaProps) => {
	const { isDesktop } = useCredenzaContext();

	if (isDesktop) {
		return (
			<div
				className={cn(
					'px-4 mb-4 h-[calc(100dvh-150px)] overflow-y-auto',
					className
				)}
				{...props}
			>
				{children}
			</div>
		);
	}

	return (
		<div className={cn('px-4 md:px-0', className)} {...props}>
			{children}
		</div>
	);
};

const CredenzaFooter = ({ className, children, ...props }: CredenzaProps) => {
	const { isDesktop } = useCredenzaContext();
	const CredenzaFooter = isDesktop ? SheetFooter : DrawerFooter;

	return (
		<CredenzaFooter className={className} {...props}>
			{children}
		</CredenzaFooter>
	);
};

export {
	Credenza as Modal,
	CredenzaTrigger as ModalTrigger,
	CredenzaClose as ModalClose,
	CredenzaContent as ModalContent,
	CredenzaDescription as ModalDescription,
	CredenzaHeader as ModalHeader,
	CredenzaTitle as ModalTitle,
	CredenzaBody as ModalBody,
	CredenzaFooter as ModalFooter
};
