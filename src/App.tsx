import { Suspense, lazy } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { BrowserRouter, Route, Routes } from 'react-router';

import ErrorScreen from './views/general/ErrorScreen';
import LoadingScreen from './views/general/LoadingScreen';

const MainLayout = lazy(() => import('./layout/MainLayout'));
const DefaultView = lazy(() => import('./views/DefaultView'));
const UsersView = lazy(() => import('./views/UsersView/UsersView'));
const DashboardView = lazy(() => import('./views/DashboardView'));

function App() {
	return (
		<ErrorBoundary FallbackComponent={ErrorScreen}>
			<BrowserRouter>
				<Routes>
					<Route
						element={
							<Suspense fallback={<LoadingScreen />}>
								<MainLayout />
							</Suspense>
						}
					>
						<Route
							path='*'
							element={
								<Suspense fallback={<LoadingScreen />}>
									<DefaultView />
								</Suspense>
							}
						/>

						<Route
							path='/dashboard'
							element={
								<Suspense fallback={<LoadingScreen />}>
									<DashboardView />
								</Suspense>
							}
						/>

						<Route
							path='/users'
							element={
								<Suspense fallback={<LoadingScreen />}>
									<UsersView />
								</Suspense>
							}
						/>
					</Route>
				</Routes>
			</BrowserRouter>
		</ErrorBoundary>
	);
}

export default App;
