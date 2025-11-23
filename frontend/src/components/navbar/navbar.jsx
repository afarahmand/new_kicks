import { useDispatch, useSelector } from "react-redux";
import { Link } from 'react-router-dom';

import { signout } from '../../actions/session_actions';

const NavBar = () => {
    const dispatch = useDispatch();
    const currentUser = useSelector((state) => state.session.currentUser);

    let lastLink;

    if (currentUser) {
        lastLink = (
            <button onClick={() => dispatch(signout())}>
                Sign out
            </button>
        );
    } else {
        lastLink = (
            <Link to='/signin'>
                Sign in
            </Link>
        );
    }

    return (
        <header>
            <nav id="nav-bar">
                <div className="left-nav">
                    <Link to="/discover">Explore</Link>
                    <Link to="/projects/new">Start a project</Link>
                </div>
                <Link to="/">
                    <h1>QUIKSTARTER</h1>
                </Link>
                <div className="right-nav">
                    <div className="search">
                        <Link to="/search">
                            Search
                            <i className="fas fa-search"></i>
                        </Link>
                    </div>
                    {lastLink}
                </div>
            </nav>
        </header>
    )
}

export default NavBar;