import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import Root from './components/root';
import createStore from './store/store';

import './stylesheets/reset.css';
import './stylesheets/application.css';
import './stylesheets/google_font_modak.css';
import './stylesheets/discover.css';
import './stylesheets/home_page.css';
import './stylesheets/navbar.css';
import './stylesheets/project_form.css';
import './stylesheets/project_index.css';
import './stylesheets/project_show.css';
import './stylesheets/reward_form.css';
import './stylesheets/search.css';
import './stylesheets/session_form.css';
import './stylesheets/stat_bar.css';
import './stylesheets/tab_bar.css';
import './stylesheets/user_show.css';

import './stylesheets/font_awesome_all.js'

document.addEventListener("DOMContentLoaded", () => {
  const root = createRoot(document.getElementById('root'));
  const preloadedState = {
    entities: {
      categories: {
        1: "Art",
        2: "Fashion",
        3: "Film",
        4: "Food",
        5: "Games",
        6: "Technology"
      }
    },
    session: {
      loading: true,
    }
  };

  root.render(
    <StrictMode>
      <Provider store={ createStore(preloadedState) }>
        <Root />
      </Provider>
    </StrictMode>
  )
});
