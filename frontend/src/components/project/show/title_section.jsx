import { Link } from "react-router-dom";
import { useSelector } from 'react-redux';

const TitleSection = ({ project }) => {
    const creator = useSelector((state) => (state.entities.users[project.user_id]));

    return (
        <section className="title">
          <div className="creator">
            <Link to={`/users/${creator.id}`}>
              <img src={creator.image_url}></img>
              <span>By {creator.name}</span>
            </Link>
          </div>
          <div className="titles">
            <h2>{project.title}</h2>
            <span className="subtitle">{project.short_blurb}</span>
          </div>
        </section>
    )
}

export default TitleSection;