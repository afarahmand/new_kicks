import { useDispatch, useSelector } from 'react-redux';
import { createBacking } from '../../../actions/backing_actions';
import RewardIndexDisplay from '../../reward/reward_index_display';

const DescriptionRewardsSection = ({ project }) => {
    const currentUser = useSelector((state) => (state.session.currentUser));
    const projectRewards = useSelector((state) => {
        let tempProjectRewards = [];
        let reward;

        Object.keys(state.entities.rewards).forEach((rewardId) => {
            reward = state.entities.rewards[rewardId];
            if (reward.project_id === project.id) {
                tempProjectRewards.push(reward);
            }
        })

        return tempProjectRewards;
    });

    const alreadyBacked = useSelector((state) => {
        if (currentUser) {
            const projectRewardIds = projectRewards.map((reward) => reward.id);
            Object.keys(state.entities.backings).forEach(backingId => {
                if ((projectRewardIds.includes(state.entities.backings[backingId].reward_id)) &&
                    (state.entities.backings[backingId].user_id === currentUser.id)) {
                    return true;
                }
            });

            return false;
        } else {
            return false;
        }
    });

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