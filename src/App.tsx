import { ErrorBoundaryFallback } from '@/components/global-error-boundaey';
import LoadingScreen from '@/views/general/LoadingScreen';
import { Suspense, lazy } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { BrowserRouter, Route, Routes } from 'react-router';

import ProtectedRoute from './layout/ProtectedRoute';

const MainLayout = lazy(() => import('@/layout/MainLayout'));
const DefaultView = lazy(() => import('@/views/DefaultView'));
const UsersView = lazy(() => import('@/views/UsersView/UsersView'));
const CentersView = lazy(() => import('@/views/CentersView/CentersView'));
const DashboardView = lazy(() => import('@/views/DashboardView'));
const CenterParticipantsView = lazy(
	() => import('@/views/CenterParticipantsView/CenterParticipantsView')
);
const CenterEventsView = lazy(
	() => import('@/views/CenterEventsView/CenterEventsView')
);
const EventsView = lazy(() => import('@/views/EventsView/EventsView'));
const EventCategoriesView = lazy(
	() => import('@/views/EventCategoriesView/EventCategoriesView')
);
const ParticipantCategoriesView = lazy(
	() => import('@/views/ParticipantCategoriesView/ParticipantCategoriesView')
);
const ParticipantsView = lazy(
	() => import('@/views/ParticipantsView/ParticipantsView')
);

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
							path='/'
							element={
								<Suspense fallback={<LoadingScreen />}>
									<DashboardView />
								</Suspense>
							}
						/>

						{/* Admin Routes */}
						<Route element={<ProtectedRoute allowedRoles={['admin']} />}>
							<Route
								path='/users'
								element={
									<Suspense fallback={<LoadingScreen />}>
										<UsersView />
									</Suspense>
								}
							/>

							<Route
								path='/centers'
								element={
									<Suspense fallback={<LoadingScreen />}>
										<CentersView />
									</Suspense>
								}
							/>

							<Route path='/events'>
								<Route
									path=''
									element={
										<Suspense fallback={<LoadingScreen />}>
											<EventsView />
										</Suspense>
									}
								/>
								<Route
									path='categories'
									element={
										<Suspense fallback={<LoadingScreen />}>
											<EventCategoriesView />
										</Suspense>
									}
								/>
							</Route>
							<Route path='/participants'>
								<Route
									path=''
									element={
										<Suspense fallback={<LoadingScreen />}>
											<ParticipantsView />
										</Suspense>
									}
								/>
								<Route
									path='categories'
									element={
										<Suspense fallback={<LoadingScreen />}>
											<ParticipantCategoriesView />
										</Suspense>
									}
								/>
							</Route>
						</Route>

						{/* Center Routes */}
						<Route
							path='center'
							element={<ProtectedRoute allowedRoles={['guardian']} />}
						>
							<Route
								path='participants'
								element={
									<Suspense fallback={<LoadingScreen />}>
										<CenterParticipantsView />
									</Suspense>
								}
							/>

							<Route
								path='events'
								element={
									<Suspense fallback={<LoadingScreen />}>
										<CenterEventsView />
									</Suspense>
								}
							/>
						</Route>
					</Route>
				</Routes>
			</ErrorBoundary>
		</BrowserRouter>
	);
}

export default App;
