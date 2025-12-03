import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

import HomePageItem from './home_page_item';
import StatBar from './stat_bar';
import TabBar from './tab_bar';

import { fetchProjects } from '../../actions/project_actions';

const HomePage = () => {
    const categories = useSelector((state) => state.entities.categories);
    const projects = useSelector((state) => state.entities.projects);
    const dispatch = useDispatch();
    const dispatchFetchProjects = () => dispatch(fetchProjects());

    const [chosenCategory, setChosenCategory] = useState(categories[1]);
    const [displayedProjects, setDisplayedProjects] = useState([]);

    useEffect(() => {
        dispatchFetchProjects();
        
        return () => {};
    }, []);

    function selectCategory(category) {
        return (e) => setChosenCategory(category);
    }

    if (Object.keys(projects).length === 0) {
      return null;
    }

    // Determine which 5 projects will become displayedProjects based on selected tabs
    const keys = Object.keys(projects);
    let count = 0;
    let i = 0;
    while (count < 5 && i < keys.length) {
      if (projects[keys[i]].category === chosenCategory) {
        displayedProjects[count] = projects[keys[i]];
        count++;
      }
      i++;
    }

    return (
        <div>
            <StatBar />
            <section className="home-main content-narrow">
                <TabBar categories={categories} selectCategory={selectCategory} />
                
                <section className="title-bar">
                    <span className="category-title">{chosenCategory}</span>
                    <Link to='/discover/'>
                    <span>DISCOVER MORE</span>
                    <i className="fas fa-long-arrow-alt-right"></i>
                    </Link>
                </section>

                <section className="main-aside-title">
                    <div className="content-header-text">FEATURED PROJECT</div>
                    <div className="content-header-text"></div>
                </section>

                <div className="content">
                    <main className="featured-content left-content">
                        <HomePageItem project={displayedProjects[0]} />
                    </main>

                    <aside className="right-content">
                        <div className="project-list">
                            <ul>
                                {
                                    Object.keys(displayedProjects).slice(1).map(id => (
                                        <li key={id}>
                                            <HomePageItem project={displayedProjects[id]} />
                                        </li>
                                    ))
                                }
                            </ul>
                        </div>
                    </aside>
                </div>
            </section>
        </div>
    )
}

export default HomePage;