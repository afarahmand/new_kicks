import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import GridItem from './grid_item';

import { fetchProjects } from '../../actions/project_actions';

const HeroProjectGrid = ({ chosenCategory }) => {
    const projects = useSelector(state => state.entities.projects);
    const dispatch = useDispatch();
    const dispatchFetchProjects = () => dispatch(fetchProjects());
    const [displayedProjects, setDisplayedProjects] = useState([]);

    useEffect(() => {
        dispatchFetchProjects();
    }, [dispatch]);

    if (Object.keys(projects).length === 0) { return null; }

    // Determine which 5 projects will become displayedProjects based on selected tabs
    const projectIds = Object.keys(projects);
    let count = 0, i = 0;
    while (count < 5 && i < projectIds.length) {
      if (projects[projectIds[i]].category === chosenCategory) {
        displayedProjects[count] = projects[projectIds[i]];
        count++;
      }
      i++;
    }

    return (
        <div className="content">
            <main className="featured-content left-content">
                <GridItem project={displayedProjects[0]} />
            </main>

            <aside className="right-content">
                <div className="project-list">
                    <ul>
                        {
                            Object.keys(displayedProjects).slice(1).map(id => (
                                <li key={id}>
                                    <GridItem project={displayedProjects[id]} />
                                </li>
                            ))
                        }
                    </ul>
                </div>
            </aside>
        </div>
    )
}

export default HeroProjectGrid;