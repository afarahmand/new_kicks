import { useDispatch, useSelector } from 'react-redux';
import { createBacking } from '../../actions/backing_actions';
import RewardIndexDisplayItem from '../reward/reward_index_display_item';

import selectAlreadyBacked from '../../selectors/already_backed';
import selectProjectRewards from '../../selectors/project_rewards';

const ProjectRewardIndex = ({ project }) => {
    const currentUser = useSelector(state => state.session.currentUser);
    const projectRewards = useSelector(selectProjectRewards(project.id));
    const projectRewardIds = projectRewards.map(reward => reward.id);
    const alreadyBacked = useSelector(selectAlreadyBacked(projectRewardIds, currentUser));

    const dispatch = useDispatch();
    const dispatchCreateBacking = backing => dispatch(createBacking(backing));

    if (currentUser) {
        if (currentUser.id === project.user_id) {
            return ( <div className="col-3 rewards"></div> )
        } else if (alreadyBacked) {
            return (
                <div className="col-3 rewards">
                    <h3>Thank You for Your Support!!!</h3>
                </div>
            )
        }
    }

    return (
        <div className="col-3 rewards">
            <h3>Support</h3>
                {
                    projectRewards.map((reward, idx) => (
                        <RewardIndexDisplayItem
                            key={idx}
                            reward={reward}
                            createBacking={dispatchCreateBacking}
                        />
                    ))
                }
        </div>
    )
}

export default ProjectRewardIndex;