import { useDispatch, useSelector } from 'react-redux';
import { createBacking } from '../../../actions/backing_actions';
import RewardIndexDisplay from '../../reward/reward_index_display';

import { selectAlreadyBacked } from '../../../selectors/already_backed';
import { selectProjectRewards } from '../../../selectors/project_rewards';

const DescriptionRewardsSection = ({ project }) => {
    const currentUser = useSelector((state) => (state.session.currentUser));
    const projectRewards = useSelector(selectProjectRewards(project));
    const projectRewardIds = projectRewards.map(reward => reward.id);
    const alreadyBacked = useSelector(selectAlreadyBacked(projectRewardIds, currentUser));

    const dispatch = useDispatch();
    const dispatchCreateBacking = (backing) => dispatch(createBacking(backing));

    function renderRewards () {
        if (currentUser) {
            if (currentUser.id === project.user_id) {
                return (
                    <div className="col-3 rewards"></div>
                );
            }
            else if (alreadyBacked) {
                return (
                    <div className="col-3 rewards">
                        <h3>Thank You for Your Support!!!</h3>
                    </div>
                );
            }
        }

        return (
            <div className="col-3 rewards">
                <h3>Support</h3>
                <RewardIndexDisplay
                    rewards={projectRewards}
                    createBacking={dispatchCreateBacking}
                />
            </div>
        );
    }

    return (
        <section className="description-rewards">
          <div className="col-12 description">
            <h3>About</h3>
            <p>{project.description}</p>
          </div>

          {renderRewards()}
        </section>
    )
}

export default DescriptionRewardsSection;