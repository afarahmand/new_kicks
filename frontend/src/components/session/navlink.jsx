import { Link } from 'react-router-dom';

const NavLink = ({ formType }) => {
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

export default NavLink;