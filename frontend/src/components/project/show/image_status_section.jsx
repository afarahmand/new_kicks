import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { deleteProject } from '../../../actions/project_actions';
import { daysRemainingUntilEnd } from '../../../utils/date_util';

const ImageStatusSection = ({ project }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const currentUser = useSelector(state => state.session.currentUser);
    const dispatchDeleteProject = () => dispatch(deleteProject(project.id));

    function renderEditDeleteButtons() {
        if (currentUser && (currentUser.id === project.user_id)) {
            return (
                <div className="buttons">
                    <button
                        className="edit-button"
                        onClick={() => navigate(`/projects/${project.id}/edit`)}
                    >
                        Edit Project
                    </button>
                    <button
                        className="delete-button"
                        onClick={
                            () => {
                                dispatchDeleteProject();
                                navigate(`/`);
                            }
                        }
                    >
                        Delete Project
                    </button>
                </div>
            );
        }
    }

    function renderRewardButton() {
        if (currentUser && (project.user_id === currentUser.id)) {
            return (
                <div>
                    <button
                        className="reward-button green"
                        onClick={() => navigate(`/projects/${project.id}/rewards/edit`)}
                    >
                        Edit Rewards
                    </button>
                </div>
            );
        }
    }

    return (
        <section className="show-status">
          <img className="col-12" src={project.image_url}></img>

          <div className="col-3 status">
            <span className="one goal">
              ${project.funding_amount}
            </span>
            <span className="two">funding goal</span>
            <span className="one">
              {daysRemainingUntilEnd(project.funding_end_date)}
            </span>
            <span className="two">days to go</span>

            {renderRewardButton()}

            <div className="all-nothing-container">
              <span className="all-nothing">All or nothing.</span>
              <span>
                This project will only be funded if it reaches its goal
                by {project.funding_end_date.slice(0, 10)}.
              </span>
            </div>

            {renderEditDeleteButtons()}
          </div>
        </section>
    )
}

export default ImageStatusSection;