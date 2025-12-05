export const sortByAscendingAmount = rewardsArray => (
    rewardsArray.sort((a, b) => a.amount - b.amount)
)