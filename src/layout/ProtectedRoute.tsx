import { Roles } from '@/db/schema.zero';
import { useApp } from '@/hooks/useApp';
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
	const { user } = useApp();
	const currentUserRole = user?.publicMetadata.role as Roles | undefined;
	const isAllowed = !!currentUserRole && allowedRoles.includes(currentUserRole);

	if (!isAllowed) {
		return <Navigate to={redirectPath} replace />;
	}

	return children ?? <Outlet />;
};

export default ProtectedRoute;
