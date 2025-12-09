import { Link } from 'react-router-dom';

const SearchIndexItem = ({ project }) => (
  (
    <div>
      <Link to={`/projects/${project.id}`}>
        <div className="search-result">
          <img src={project.image_url}></img>
          <div className="project-detail">
            <span className="project-title">
              {project.title}
            </span>
            <span className="project-funding">
              ${project.funding_amount} goal
            </span>
          </div>
        </div>
      </Link>
    </div>
  )
)

export default SearchIndexItem;