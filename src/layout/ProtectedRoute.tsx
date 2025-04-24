import { Roles } from '@/db/schema.zero';
import { useUser } from '@clerk/clerk-react';
import { Navigate, Outlet } from 'react-router';

interface ProtectedRouteProps {
	allowedRoles: Roles[];
	redirectPath?: string;
	children?: React.ReactNode;
}

const ProtectedRoute = ({
	allowedRoles,
	redirectPath = '/',
	children
}: ProtectedRouteProps) => {
	const { user } = useUser();
	const currentUserRole = user?.publicMetadata.role as Roles | undefined;
	const isAllowed = !!currentUserRole && allowedRoles.includes(currentUserRole);

	if (!isAllowed) {
		return <Navigate to={redirectPath} replace />;
	}

	return children ?? <Outlet />;
};

export default ProtectedRoute;
