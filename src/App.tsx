import { BrowserRouter, Route, Routes } from 'react-router';

import { MainLayout } from './layout/MainLayout';
import { DashboardView } from './views/DashboardView';
import { DefaultView } from './views/DefaultView';
import { UsersView } from './views/general/UsersView';

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route element={<MainLayout />}>
					<Route path='*' element={<DefaultView />} />

					<Route path='/dashboard' element={<DashboardView />} />

					<Route path='/users' element={<UsersView />} />
				</Route>
			</Routes>
		</BrowserRouter>
	);
}

export default App;
