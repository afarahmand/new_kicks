import { Route, Routes } from 'react-router-dom';
import { AuthRoute, ProtectedRoute } from '../utils/route_util';

import DiscoverPage from './discover/discover_page';
import HomePage from './home/home_page';
import NavBar from './navbar/navbar';
import ProjectForm from './project/project_form';
import ProjectShowPage from './project/project_show_page';
import RewardForm from './reward/reward_form';
import SearchPage from './search/search_page';
import SessionForm from './session/session_form';
import UserShowPage from './user/user_show_page';

const App = () => (
  <div>
    <NavBar />

    <Routes>
      <Route path="/signin" element={ <AuthRoute><SessionForm /></AuthRoute> } />
      <Route path="/signup" element={ <AuthRoute><SessionForm /></AuthRoute> } />
      <Route path="/discover" element={<DiscoverPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/projects/new" element={ <ProtectedRoute><ProjectForm /></ProtectedRoute> } />
      <Route path="/projects/:projectId/edit" element={ <ProtectedRoute><ProjectForm /></ProtectedRoute> } />
      <Route path="/projects/:projectId/rewards/edit" element={ <ProtectedRoute><RewardForm /></ProtectedRoute> } />
      <Route path="/projects/:projectId" element={<ProjectShowPage />} />
      <Route path="/users/:userId" element={ <UserShowPage />} />
      <Route path="/" element={ <HomePage /> } />
    </Routes>
  </div>
);

export default App;
