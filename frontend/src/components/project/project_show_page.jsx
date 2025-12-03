import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { fetchProject } from '../../actions/project_actions';

import TitleSection from './title_section';
import ImageStatusSection from './image_status_section';
import ErrorIndex from '../shared/error_index';
import ProjectRewardIndex from './project_reward_index';

const ProjectShowPage = () => {
    const dispatch = useDispatch();
    const { projectId } = useParams();
    const project = useSelector(state => state.entities.projects[projectId]);
    const backingErrors = useSelector(state => state.errors.backings);
    const dispatchFetchProject = id => dispatch(fetchProject(id));

    useEffect(() => {
        dispatchFetchProject(projectId);
    }, [dispatch, projectId]);

    if (project === undefined) { return null; }

    return (
      <div className="content-narrow-project-show project-show-page">
        <TitleSection project={project} />
        <ImageStatusSection project={project} />
        <section className="description-rewards">
          <div className="col-12 description">
            <h3>About</h3>
            <p>{project.description}</p>
            <ErrorIndex errors={backingErrors} />
          </div>

          <ProjectRewardIndex project={project} />
        </section>
      </div>
    )
}

export default ProjectShowPage;