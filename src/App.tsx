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
const CenterLayout = lazy(() => import('@/layout/CenterLayout'));
const CenterView = lazy(() => import('@/views/CenterView/CenterView'));
const DashboardView = lazy(() => import('@/views/DashboardView'));
const CenterParticipantsView = lazy(
	() => import('@/views/CenterParticipantsView/CenterParticipantsView')
);
const CenterEventsView = lazy(
	() => import('@/views/CenterEventsView/CenterEventsView')
);
const CenterEventView = lazy(
	() => import('@/views/CenterEventView/CenterEventView')
);
const EventsView = lazy(() => import('@/views/EventsView/EventsView'));
const EventView = lazy(() => import('@/views/EventView/EventView'));
const EventCategoriesView = lazy(
	() => import('@/views/EventCategoriesView/EventCategoriesView')
);
const ParticipantCategoriesView = lazy(
	() => import('@/views/ParticipantCategoriesView/ParticipantCategoriesView')
);
const ParticipantsView = lazy(
	() => import('@/views/ParticipantsView/ParticipantsView')
);
const InventoryView = lazy(() => import('@/views/InventoryView/InventoryView'));
const InventoryTransactionsView = lazy(
	() => import('@/views/InventoryTransactionsView/InventoryTransactionsView')
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

						{/* Volunteer Routes */}
						<Route
							element={<ProtectedRoute allowedRoles={['admin', 'volunteer']} />}
						>
							<Route
								path='/events/:eventId'
								element={
									<Suspense fallback={<LoadingScreen />}>
										<EventView />
									</Suspense>
								}
							/>
							<Route
								path='/inventory'
								element={
									<Suspense fallback={<LoadingScreen />}>
										<InventoryView />
									</Suspense>
								}
							/>
							<Route
								path='/inventory/transactions'
								element={
									<Suspense fallback={<LoadingScreen />}>
										<InventoryTransactionsView />
									</Suspense>
								}
							/>
						</Route>

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

							<Route path='/events'>
								<Route
									index
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
						<Route path='/centers'>
							<Route
								index
								element={
									<ProtectedRoute allowedRoles={['admin']}>
										<Suspense fallback={<LoadingScreen />}>
											<CentersView />
										</Suspense>
									</ProtectedRoute>
								}
							/>
							{/* Center Routes */}
							<Route path=':centerId' element={<CenterLayout />}>
								<Route
									index
									element={
										<Suspense fallback={<LoadingScreen />}>
											<CenterView />
										</Suspense>
									}
								/>
								<Route
									path='participants'
									element={
										<Suspense fallback={<LoadingScreen />}>
											<CenterParticipantsView />
										</Suspense>
									}
								/>

								<Route path='events'>
									<Route
										index
										element={
											<Suspense fallback={<LoadingScreen />}>
												<CenterEventsView />
											</Suspense>
										}
									/>
									<Route
										path=':eventId'
										element={
											<Suspense fallback={<LoadingScreen />}>
												<CenterEventView />
											</Suspense>
										}
									/>
								</Route>
							</Route>
						</Route>
					</Route>
				</Routes>
			</ErrorBoundary>
		</BrowserRouter>
	);
}

export default App;
