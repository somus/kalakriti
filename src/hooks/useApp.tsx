import useZero from '@/hooks/useZero';
import LoadingScreen from '@/views/general/LoadingScreen';
import { UserResource } from '@clerk/types';
import { useQuery } from '@rocicorp/zero/react';
import { PropsWithChildren, createContext, useContext } from 'react';
import { User } from 'shared/db/schema.zero';

interface AppContextProps {
	clerkUser: UserResource;
	user: User;
}

const AppContext = createContext<AppContextProps>({
	clerkUser: {
		id: ''
	} as UserResource,
	user: {
		id: '',
		firstName: '',
		lastName: '',
		email: '',
		phoneNumber: '',
		role: 'volunteer'
	}
});

export const AppProvider = ({
	children,
	context
}: PropsWithChildren<{ context: Omit<AppContextProps, 'user'> }>) => {
	const z = useZero();
	const [user, status] = useQuery(
		z.query.users.where('id', '=', context.clerkUser.id).one()
	);

	if (status.type !== 'complete' || !user) {
		return <LoadingScreen />;
	}

	return (
		<AppContext.Provider value={{ ...context, user }}>
			{children}
		</AppContext.Provider>
	);
};

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => {
	return useContext(AppContext);
};
