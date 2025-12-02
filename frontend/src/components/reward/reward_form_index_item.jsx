import { useState } from 'react';

const RewardFormIndexItem = ({ propReward, createReward, deleteReward, removeReward, updateReward }) => {
    const [reward, setReward] = useState(propReward);

    function handleDelete(e) {
        e.preventDefault();

        // Different behavior depending on whether a new reward or updating
        //   an existing reward.  If creating a reward, must be removed from
        //   local state in the index component after successful creation
        if (removeReward === undefined) {
            deleteReward(reward);
        } else {
            removeReward(reward);
        }
    }
    
    function handleSave(e) {
        e.preventDefault();

        if (createReward === undefined) {
            updateReward(reward);
        } else {
            createReward(reward).then(createdReward => {
                removeReward(reward);
            });
        }
    }
    
    function hasAnyFieldBeenEdited() {
        let stringifiedState = Object.assign({}, reward);

        if (typeof stringifiedState.amount === "string") {
            stringifiedState.amount = Number(stringifiedState.amount);
        }

        return !isEqual(reward, stringifiedState);
    }
    
    function isEqual(reward1, reward2) {
        for (const key in reward1) {
            if (reward1[key] !== reward2[key]) {
                return false;
            }
        }

        return Object.keys(reward1).length === Object.keys(reward2).length;
    }
    
    const update = (field) => (
        e => setReward({
            ...reward,
            [field]: e.currentTarget.value
        })
    )
    
    function renderSaveButton() {
        if (hasAnyFieldBeenEdited()) {
            return (
                <button className="green">Save</button>
            );
        }
    }

    return (
        <div className="reward-form">
            <form onSubmit={handleSave}>
                <div className="reward-top">
                    <table>
                    <tbody>

                        <tr>
                        <th>Title</th>
                        <td>
                            <input
                            type="text"
                            value={reward.title}
                            onChange={update('title')}
                            />
                        </td>
                        </tr>

                        <tr>
                        <th>Amount</th>
                        <td>
                            <input
                            type="text"
                            value={reward.amount}
                            onChange={update('amount')}
                            />
                        </td>
                        </tr>

                        <tr>
                        <th>Description</th>
                        <td>
                            <textarea
                                onChange={update('description')}
                                className="description"
                                value={reward.description}
                            >
                            </textarea>
                        </td>
                        </tr>
                    </tbody>
                    </table>
                </div>

                <div className="reward-bottom">
                    <button onClick={handleDelete} className="red">
                        Delete
                    </button>
                    {renderSaveButton()}
                </div>
            </form>
        </div>
    );
}

export default RewardFormIndexItem;
