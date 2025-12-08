import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '../../../../src/reducers/root_reducer';
import NavBar from '../nav_bar';
import * as sessionActions from '../../../actions/session_actions';

describe('NavBar component', () => {
  it('renders correctly when loading', () => {
    const store = configureStore({
      reducer: rootReducer,
      preloadedState: {
        session: {
          currentUser: null,
          loading: true,
        },
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <NavBar />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Explore')).toBeInTheDocument();
    expect(screen.getByText('Start a project')).toBeInTheDocument();
    expect(screen.getByText('QUIKSTARTER')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign/i })).toBeInTheDocument();
    expect(screen.queryByText('Sign in')).not.toBeInTheDocument();
    expect(screen.queryByText('Sign out')).not.toBeInTheDocument();
  });

  it('renders correctly when a user is signed in', () => {
    const store = configureStore({
      reducer: rootReducer,
      preloadedState: {
        session: {
          currentUser: { id: 1, username: 'testuser' },
          loading: false,
        },
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <NavBar />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Explore')).toBeInTheDocument();
    expect(screen.getByText('Start a project')).toBeInTheDocument();
    expect(screen.getByText('QUIKSTARTER')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign out/i })).toBeInTheDocument();
    expect(screen.queryByText('Sign in')).not.toBeInTheDocument();
    // The 'Sign' button is for the loading state, which should not be present when a user is signed in.
    // The 'Sign out' button is correctly expected above.
    expect(screen.queryByRole('button', { name: /^Sign$/i })).not.toBeInTheDocument();
  });

  it('renders correctly when no user is signed in', () => {
    const store = configureStore({
      reducer: rootReducer,
      preloadedState: {
        session: {
          currentUser: null,
          loading: false,
        },
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <NavBar />
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText('Explore')).toBeInTheDocument();
    expect(screen.getByText('Start a project')).toBeInTheDocument();
    expect(screen.getByText('QUIKSTARTER')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Sign in/i })).toBeInTheDocument();
    expect(screen.queryByText('Sign out')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Sign/i })).not.toBeInTheDocument();
  });

  it('dispatches signout action when "Sign out" button is clicked', () => {
    const store = configureStore({
      reducer: rootReducer,
      preloadedState: {
        session: {
          currentUser: { id: 1, username: 'testuser' },
          loading: false,
        },
      },
    });

    const signoutSpy = vi.spyOn(sessionActions, 'signout').mockReturnValue({ type: 'SIGNOUT' });

    render(
      <Provider store={store}>
        <MemoryRouter>
          <NavBar />
        </MemoryRouter>
      </Provider>
    );

    fireEvent.click(screen.getByRole('button', { name: /Sign out/i }));

    expect(signoutSpy).toHaveBeenCalled();
    // Redux Toolkit's store does not expose a .getActions() method like redux-mock-store.
    // Verifying that the action creator was called is sufficient for this test.

    signoutSpy.mockRestore();
  });

  it('navigates to /discover when "Explore" link is clicked', () => {
    const store = configureStore({
      reducer: rootReducer,
      preloadedState: {
        session: {
          currentUser: null,
          loading: false,
        },
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/']}>
          <NavBar />
        </MemoryRouter>
      </Provider>
    );

    const exploreLink = screen.getByRole('link', { name: /Explore/i });
    expect(exploreLink).toHaveAttribute('href', '/discover');
  });

  it('navigates to /projects/new when "Start a project" link is clicked', () => {
    const store = configureStore({
      reducer: rootReducer,
      preloadedState: {
        session: {
          currentUser: null,
          loading: false,
        },
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/']}>
          <NavBar />
        </MemoryRouter>
      </Provider>
    );

    const startProjectLink = screen.getByRole('link', { name: /Start a project/i });
    expect(startProjectLink).toHaveAttribute('href', '/projects/new');
  });

  it('navigates to / when "QUIKSTARTER" link is clicked', () => {
    const store = configureStore({
      reducer: rootReducer,
      preloadedState: {
        session: {
          currentUser: null,
          loading: false,
        },
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/discover']}>
          <NavBar />
        </MemoryRouter>
      </Provider>
    );

    const quikstarterLink = screen.getByRole('link', { name: /QUIKSTARTER/i });
    expect(quikstarterLink).toHaveAttribute('href', '/');
  });

  it('navigates to /search when "Search" link is clicked', () => {
    const store = configureStore({
      reducer: rootReducer,
      preloadedState: {
        session: {
          currentUser: null,
          loading: false,
        },
      },
    });

    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/']}>
          <NavBar />
        </MemoryRouter>
      </Provider>
    );

    const searchLink = screen.getByRole('link', { name: /Search/i });
    expect(searchLink).toHaveAttribute('href', '/search');
  });
});