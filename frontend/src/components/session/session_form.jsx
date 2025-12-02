import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';

import ErrorIndex from '../shared/error_index';

import {
  receiveSessionErrors,
  signin,
  signup
} from '../../actions/session_actions';

const SessionForm = () => {
  const location = useLocation();
  const formType = location.pathname === '/signup' ? 'Sign up' : 'Sign in';
  const action = location.pathname === '/signup' ? signup : signin;

  const dispatch = useDispatch();
  const clearSessionErrors = () => dispatch(receiveSessionErrors([]));
  const processForm = user => dispatch(action(user));
  
  const errors = useSelector((state) => state.errors.session);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  })

  useEffect(() => {
    setForm({
      name: "",
      email: "",
      password: "",
    })

    if (errors.length > 0) {
      clearSessionErrors();
    }
    
    return () => {};
  }, [formType]);

  function demoSignin(e) {
    e.preventDefault();

    const demoUser = {
      name: "Demo_User",
      email: "demo@quickstarter.com",
      password: "password",
    };

    processForm(demoUser);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const user = Object.assign({}, form);
    processForm(user);
  }
  
  function renderButtonText() {
    if (formType === "Sign up") {
      return "Create account";
    } else {
      return "Log me in!";
    }
  }

  function renderDemoSigninButton() {
    if (formType === "Sign in") {
      return (
        <button
          id="demo"
          name="demo"
          className="signin-input"
          onClick={demoSignin}
        >
          Sign In as Demo User
        </button>
      );
    }
  }

  function renderNameInput() {
    if (formType === 'Sign up') {
      return (
        <input
          placeholder="Name"
          type="text"
          value={form.name}
          onChange={update('name')}
          className="signin-input"
        />
      );
    }
  }

  function renderNavLink() {
    if (formType === 'Sign in') {
      return (
        <div id="div-above-signin-form" className="signin-form">
            New to Quikstarter? <Link to="/signup">Sign up!</Link>
        </div>
      );
    } else {
      return (
        <div id="div-above-signin-form" className="signin-form">
          Have an account? <Link to="/signin">Sign in</Link>
        </div>
      );
    }
  }

  function renderTopText() {
    let text = "Sign in";
    if (formType === "Sign up") {
      text = "Sign up";
    }

    return (
      <div className="signin-form-top-text">
        <h2>{text}</h2>
      </div>
    );
  }

  function update(field) {
    return e => setForm({
      ...form,
      [field]: e.currentTarget.value
    });
  }

  return (
    <div className="signin-form-container">
      {renderNavLink()}
      <form className="signin-form" onSubmit={handleSubmit}>
        {renderTopText()}

        <ErrorIndex errors={errors} />

        <ul>
          <li>
            <input
              placeholder="Email"
              type="text"
              value={form.email}
              onChange={update('email')}
              className="signin-input"
            />
          </li>

          <li>
            <input
              placeholder="Password"
              type="password"
              value={form.password}
              onChange={update('password')}
              className="signin-input"
            />
          </li>

          <li>
            {renderNameInput()}
          </li>

          <li>
            <input type="submit" value={renderButtonText()}/>
          </li>

          {renderDemoSigninButton()}
        </ul>

      </form>
    </div>
  );
}

export default SessionForm;