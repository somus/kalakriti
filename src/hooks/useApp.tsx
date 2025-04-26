import { UserResource } from '@clerk/types';
import { PropsWithChildren, createContext, useContext } from 'react';

interface AppContextProps {
	user: UserResource;
}

const AppContext = createContext<AppContextProps>({
	user: {
		id: ''
	} as UserResource
});

export const AppProvider = ({
	children,
	context
}: PropsWithChildren<{ context: AppContextProps }>) => {
	return <AppContext.Provider value={context}>{children}</AppContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => {
	return useContext(AppContext);
};
