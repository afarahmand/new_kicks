import { useEffect, useState } from 'react';
import SearchIndex from './search_index';
import { fetchSearchResults } from '../../utils/project_api_util';

const SearchPage = () => {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);

    useEffect(() => {
        const searchInputTextBox = document.getElementById('search-input');
        if (query === "") {
            setResults([]);
        } else {
            fetchSearchResults(query).then(projects => {
                setResults(projects);
            });
        }
        searchInputTextBox.focus();
    }, [query]);

    function renderNoResults() {
        if (query.length > 0 && results.length === 0) {
            return (
                <div className="noresults">
                    <span className="top-noresults-text">
                        Oops! We couldn't find any results.
                    </span>
                    <span className="bottom-noresults-text">
                        Why not change some things around or broaden your search?
                    </span>
                </div>
            );
        }
    }

    return (
      <section className="search-page">
        <div className="search-form">
          <input
            id="search-input"
            type="text"
            value={query}
            onChange={e => setQuery(e.currentTarget.value)}
            placeholder="Search"
          />
        </div>
        <div className="results content-narrow">
          {renderNoResults()}
          <SearchIndex projects={results}/>
        </div>
      </section>
    );
}

export default SearchPage;