import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import StatBar from './stat_bar';
import TabBar from './tab_bar';
import HeroProjectGrid from './hero_project_grid';

const HomePage = () => {
    const categories = useSelector(state => state.entities.categories);
    const [chosenCategory, setChosenCategory] = useState(categories[1]);

    const selectCategory = category => (
        e => setChosenCategory(category)
    )

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

                <HeroProjectGrid chosenCategory={chosenCategory} />
            </section>
        </div>
    )
}

export default HomePage;