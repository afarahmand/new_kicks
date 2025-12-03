import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { fetchProject } from '../../actions/project_actions';
import {
  createReward, updateReward, deleteReward
} from '../../actions/reward_actions';

import { selectProjectRewards } from '../../selectors/project_rewards';

import RewardFormIndexItem from './reward_form_index_item';
import NewRewardIndex from './new_reward_index';
import ErrorIndex from '../shared/error_index';

const RewardForm = () => {
    const { projectId } = useParams();
    const sortedProjectRewards = useSelector(selectProjectRewards(parseInt(projectId)));
    const errors = useSelector(state => state.errors.rewards);

    const dispatch = useDispatch();
    const dispatchFetchProject = () => dispatch(fetchProject(projectId));
    const dispatchCreateReward = (reward) => dispatch(createReward(reward));
    const dispatchDeleteReward = (reward) => dispatch(deleteReward(reward));
    const dispatchUpdateReward = (reward) => dispatch(updateReward(reward));

    useEffect(() => {
        dispatchFetchProject(projectId);
    }, [dispatch, projectId])

    return (
        <div className="reward-form-page">
            <h2>Set your rewards and shipping costs.</h2>
            <section className="page-subtitle">
                Invite backers to be a part of the creative experience by
                offering rewards like a copy of what you're making, a special
                experience, or a behind-the-scenes look into your process.
            </section>
            <ErrorIndex errors={errors} />
            <section className="reward-form-container">
                {
                    sortedProjectRewards.map(reward => (
                        <RewardFormIndexItem
                            key={reward.id}
                            propReward={reward}
                            deleteReward={dispatchDeleteReward}
                            updateReward={dispatchUpdateReward}
                        />
                    ))
                }
                <NewRewardIndex
                    createReward={dispatchCreateReward}
                    projectId={projectId}
                />
            </section>
        </div>
    )
}

export default RewardForm;