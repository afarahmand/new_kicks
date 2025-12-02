import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import DiscoverIndex from '../discover/discover_index';
import { fetchDiscoveryResults } from '../../utils/project_api_util';

const DiscoverPage = () => {
    const categories = useSelector((state) => state.entities.categories);
    const [chosenCategory, setChosenCategory] = useState("All");
    const [sort, setSort] = useState("Random");
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        fetchDiscoveryResults(chosenCategory, sort, 9).then(
            projects => setSearchResults(projects)
        );
        
        return () => {};
    }, [chosenCategory, sort]);

    return (
        <section className="discover">
            <section className="discover-form content-narrow">
                <form>
                Show me
                <select
                    onChange={e => { setChosenCategory(e.target.value); }}
                    className="discover-input"
                    defaultValue="All"
                >
                <option value="All">All</option>
                    {
                        Object.keys(categories).map((id) => {
                            return (
                                <option
                                    key={id}
                                    value={categories[id]}
                                >
                                    {categories[id]}
                                </option>
                            );
                        })
                    }
                </select>
                projects sorted by

                <select
                    onChange={e => {setSort(e.target.value);}}
                    className="discover-input"
                    defaultValue="Random"
                >
                    <option value="Random">Random</option>
                    <option value="Funding Goal">Funding Goal</option>
                    <option value="End Date">End Date</option>
                    <option value="Newest">Newest</option>
                </select>
                </form>
            </section>
            <hr></hr>
            <section className="discover-results content-narrow">
                <DiscoverIndex projects={searchResults} />
            </section>
        </section>
    );    
}

export default DiscoverPage;
