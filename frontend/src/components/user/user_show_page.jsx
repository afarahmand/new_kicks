import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import DiscoverIndex from '../discover/discover_index';

import { selectBackedProjects } from '../../selectors/backed_projects';
import { selectCreatedProjects } from '../../selectors/created_projects';

import { fetchUser } from '../../actions/user_actions';

const UserShowPage = () => {
    const { userId } = useParams();
    const user = useSelector(state => state.entities.users[userId]);
    const backedProjects = useSelector(selectBackedProjects(user));
    const createdProjects = useSelector(selectCreatedProjects(user));

    const dispatch = useDispatch();
    const dispatchFetchUser = (id) => dispatch(fetchUser(id));

    useEffect(() => {
        dispatchFetchUser(userId);
    }, [userId]);

    if (user === undefined) {
        return null;
    }

    return (
        <section id="user-show" className="content-narrow discover-results">
            <section>
                <h2>{user.name}s created projects</h2>
                <DiscoverIndex projects={createdProjects}/>
            </section>

            <section>
                <h2>{user.name}s backed projects</h2>
                <DiscoverIndex projects={backedProjects}/>
            </section>
        </section>
    )
}

export default UserShowPage;