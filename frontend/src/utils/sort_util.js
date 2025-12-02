export const sortByAscendingAmount = rewardsArray => (
    rewardsArray.sort(function(reward1, reward2) {
        if (reward1.amount < reward2.amount) {
            return -1;
        } else if (reward1.amount > reward2.amount) {
            return 1;
        } else {
            return 0;
        }
    })
)