import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { fetchProject } from '../../actions/project_actions';

import TitleSection from './title_section';
import ImageStatusSection from './image_status_section';
import DescriptionRewardsSection from './description_rewards_section';

const ProjectShowPage = () => {
    const dispatch = useDispatch();
    const { projectId } = useParams();
    const project = useSelector((state) => (state.entities.projects[projectId]));
    const dispatchFetchProject = (id) => dispatch(fetchProject(id));

    useEffect(() => {
        dispatchFetchProject(projectId);
        
        return () => {};
    }, [dispatch, projectId]);

    if (project === undefined) {
        return null;
    }

    return (
      <div className="content-narrow-project-show project-show-page">
        <TitleSection project={project} />
        <ImageStatusSection project={project} />
        <DescriptionRewardsSection project={project} />
      </div>
    )
}

export default ProjectShowPage;