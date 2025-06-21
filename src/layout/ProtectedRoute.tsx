import { useApp } from '@/hooks/useApp';
import { Navigate, Outlet } from 'react-router';
import { Roles } from 'shared/db/schema.zero';

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
	const isAllowed = allowedRoles.includes(user.role!);

	if (!isAllowed) {
		return <Navigate to={redirectPath} replace />;
	}

	return children ?? <Outlet />;
};

export default ProtectedRoute;
