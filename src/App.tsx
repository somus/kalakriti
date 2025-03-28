import { ErrorBoundary } from 'react-error-boundary';
import { BrowserRouter, Route, Routes } from 'react-router';

import { MainLayout } from './layout/MainLayout';
import { DashboardView } from './views/DashboardView';
import { DefaultView } from './views/DefaultView';
import { CreateUserView } from './views/UsersView/CreateUserView';
import { UsersView } from './views/UsersView/UsersView';
import ErrorScreen from './views/general/ErrorScreen';

function App() {
	return (
		<ErrorBoundary FallbackComponent={ErrorScreen}>
			<BrowserRouter>
				<Routes>
					<Route element={<MainLayout />}>
						<Route path='*' element={<DefaultView />} />

						<Route path='/dashboard' element={<DashboardView />} />

						<Route path='/users' element={<UsersView />} />
						<Route path='/users/create' element={<CreateUserView />} />
					</Route>
				</Routes>
			</BrowserRouter>
		</ErrorBoundary>
	);
}

export default App;
