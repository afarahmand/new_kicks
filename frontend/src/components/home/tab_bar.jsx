const TabBar = ({ categories, selectCategory }) => {
    return (
        <div className="tab-bar">
            <ul>
                {
                    <li key="1">
                        <button
                            id="1"
                            onClick={selectCategory(categories[1])}
                            autoFocus
                        >
                            {categories[1]}
                        </button>
                    </li>
                }
                {
                    Object.keys(categories).slice(1).map(id => (
                        <li key={id}>
                            <button
                                id={id}
                                onClick={selectCategory(categories[id])}
                            >
                                {categories[id]}
                            </button>
                        </li>
                    ))
                }
            </ul>
        </div>
    )
}

export default TabBar;