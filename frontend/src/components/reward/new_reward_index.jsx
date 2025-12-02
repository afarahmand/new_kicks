import { useState } from 'react';
import RewardFormIndexItem from './reward_form_index_item';

const NewRewardIndex = ({ projectId, createReward }) => {
    const [newRewards, setNewRewards] = useState({});

    function addNewReward() {
        let i = 0;

        while (newRewards[i] !== undefined) {
            i++;
        }

        const newReward = {
            id: i,
            title: "",
            amount: 0,
            description: "",
            project_id: projectId
        };

        let newState = Object.assign({}, newRewards);
        newState[i] = newReward;

        setNewRewards(newState);
    }

    function removeReward(reward) {
        let newState = Object.assign({}, newRewards);
        newState[reward.id] = null;
        setNewRewards(newState);
    }
    
    // function renderErrors() {
    //     return (
    //         <div className="error-display">
    //             <ul>
    //                 {
    //                     this.props.errors.map((error, i) => (
    //                         <li key={`error-${i}`}> {error} </li>
    //                     ))
    //                 }
    //             </ul>
    //         </div>
    //     );
    // }

    return (
        <section>
            {
                Object.keys(newRewards).map(rewardId => {
                    if (newRewards[rewardId] !== null) {
                        return (
                            <RewardFormIndexItem
                                key={rewardId}
                                propReward={newRewards[rewardId]}
                                removeReward={removeReward}
                                createReward={createReward}
                            />
                        );
                    } else {
                        return null;
                    }
                })
            }

            <div className="button-container">
                <button onClick={addNewReward}>Add New Reward +</button>
            </div>
        </section>
    )
}

export default NewRewardIndex;
