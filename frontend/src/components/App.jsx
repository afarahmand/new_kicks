import { Route, Routes } from 'react-router-dom';
import { AuthRoute, ProtectedRoute } from '../utils/route_util';

import DiscoverPage from './discover/discover_page';
import HomePageContainer from './home/home_page_container';
import NavbarContainer from './navbar/navbar_container';

import ProjectFormContainer from './project/project_form_container';
import ProjectShowPageContainer from './project/project_show_page_container';
import RewardFormContainer from './reward/form/reward_form_container';
import SearchPage from './search/search_page';
import SessionFormContainer from './session/session_form_container';
import UserShowPageContainer from './user/user_show_page_container';

const App = () => (
  <div>
    <header>
      <NavbarContainer/>
    </header>

    <Routes>
      <Route path="/signin" element={ <AuthRoute><SessionFormContainer /></AuthRoute> } />
      <Route path="/signup" element={ <AuthRoute><SessionFormContainer /></AuthRoute> } />
      <Route path="/discover" element={<DiscoverPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/projects/new" element={ <ProtectedRoute><ProjectFormContainer /></ProtectedRoute> } />
      <Route path="/projects/:projectId/edit" element={ <ProtectedRoute><ProjectFormContainer /></ProtectedRoute> } />
      <Route path="/projects/:projectId/rewards/edit" element={ <ProtectedRoute><RewardFormContainer /></ProtectedRoute> } />
      <Route
        path="/projects/:projectId"
        element={<ProjectShowPageContainer />}
      />
      <Route
        path="/users/:userId"
        element={ <UserShowPageContainer />}
      />
      <Route path="/" element={ <HomePageContainer /> } />
    </Routes>
  </div>
);

export default App;
