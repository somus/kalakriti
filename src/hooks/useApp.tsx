import useZero from '@/hooks/useZero';
import { EventCategory } from '@/views/EventCategoriesView/EventCategoriesView';
import LoadingScreen from '@/views/general/LoadingScreen';
import { UserResource } from '@clerk/types';
import { useQuery } from '@rocicorp/zero/react';
import { PropsWithChildren, createContext, useContext } from 'react';
import { Center, SubEvent, User } from 'shared/db/schema.zero';

interface UserType extends User {
	coordinatingEvents: SubEvent[];
	liaisoningCenters: Center[];
	guardianCenters: Center[];
	coordinatingEventCategories: EventCategory[];
}

interface AppContextProps {
	clerkUser: UserResource;
	user: UserType;
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
		role: 'volunteer',
		canLogin: false,
		createdAt: 0,
		updatedAt: 0,
		leading: null,
		coordinatingEvents: [],
		liaisoningCenters: [],
		guardianCenters: [],
		coordinatingEventCategories: []
	}
});

export const AppProvider = ({
	children,
	context
}: PropsWithChildren<{ context: Omit<AppContextProps, 'user'> }>) => {
	const z = useZero();
	const [user, status] = useQuery(
		z.query.users
			.where('id', '=', context.clerkUser.id)
			.related('coordinatingEvents')
			.related('liaisoningCenters')
			.related('coordinatingEventCategories')
			.related('guardianCenters')
			.one()
	);

	if (status.type !== 'complete' || !user) {
		return <LoadingScreen />;
	}

	return (
		<AppContext.Provider
			value={{ ...context, user: user as unknown as UserType }}
		>
			{children}
		</AppContext.Provider>
	);
};

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => {
	return useContext(AppContext);
};
