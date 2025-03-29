import { ErrorBoundaryFallback } from '@/components/global-error-boundaey';
import LoadingScreen from '@/views/general/LoadingScreen';
import { Suspense, lazy } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { BrowserRouter, Route, Routes } from 'react-router';

const MainLayout = lazy(() => import('@/layout/MainLayout'));
const DefaultView = lazy(() => import('@/views/DefaultView'));
const UsersView = lazy(() => import('@/views/UsersView/UsersView'));
const DashboardView = lazy(() => import('@/views/DashboardView'));

function App() {
	return (
		<BrowserRouter>
			<ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
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
			</ErrorBoundary>
		</BrowserRouter>
	);
}

export default App;
