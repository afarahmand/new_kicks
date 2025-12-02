import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { formatAsYYYYMMDD } from '../../utils/date_util';

import {
  fetchProject,
  createProject,
  updateProject
} from '../../actions/project_actions';

const ProjectForm = () => {
    const location = useLocation();
    const params = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { projectId } = params;
    const pathname = location.pathname;
    const formType = pathname === '/projects/new' ? 'new' : 'update';

    const categories = useSelector(state => state.entities.categories);
    const currentUser = useSelector(state => state.session.currentUser);
    const errors = useSelector(state => state.errors.projects);
    const projectFromStore = useSelector(state => 
        projectId ? state.entities.projects[projectId] : undefined
    );

    const [project, setProject] = useState({
        title: "",
        image_url: "https://i.imgur.com/wB6sCUA.jpg",
        short_blurb: "",
        description: "",
        category: "Art",
        funding_amount: 0,
        funding_end_date: formatAsYYYYMMDD(Date())
    });

    useEffect(() => {
        if (formType === 'update' && projectFromStore && currentUser) {
            if (projectFromStore.user_id !== currentUser.id) {
                navigate("/");
            }
        }
    }, [navigate, currentUser, formType, projectFromStore]);

    useEffect(() => {
        if (pathname === `/projects/${projectId}/edit` && projectFromStore) {
            setProject(projectFromStore);
        }
    }, [pathname, projectId, projectFromStore]);

    useEffect(() => {
        if (projectId && formType === 'update') {
            dispatch(fetchProject(projectId));
        }
    }, [dispatch, projectId, formType]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const processFormAction = formType === 'new' 
            ? createProject(project)
            : updateProject(project);
        
        dispatch(processFormAction).then((result) => {
            if (result.project) {
                navigate(`/projects/${result.project.id}`);
            }
        });
    };

    const update = (field) => (e) => {
        setProject({
            ...project,
            [field]: e.currentTarget.value
        });
    };

    const renderEndDateInput = () => {
        if (formType === 'update') {
            return (
                <div className="project-form-input-section">
                    <input
                        type="date"
                        value={project.funding_end_date?.slice(0, 10) || ''}
                        className="project-input"
                        disabled
                    />
                    <p>
                        Projects with shorter durations have higher success
                        rates. You won't be able to adjust your duration
                        after you launch.
                    </p>
                </div>
            );
        } else {
            return (
                <div className="project-form-input-section">
                    <input
                        type="date"
                        value={project.funding_end_date}
                        onChange={update('funding_end_date')}
                        className="project-input"
                    />
                    <p>
                        Projects with shorter durations have higher success
                        rates. You won't be able to adjust your duration
                        after you launch.
                    </p>
                </div>
            );
        }
    };

    const renderErrors = () => {
        if (!errors || errors.length === 0) return null;
        
        return (
            <div className="error-display">
                <ul>
                    {errors.map((error, i) => (
                        <li key={`error-${i}`}>{error}</li>
                    ))}
                </ul>
            </div>
        );
    };

    const renderLabelSection = (text) => ((
        <div className="project-form-label-section">
            <h4 className="project-field-label">{text}</h4>
        </div>
    ))

    const renderPageTitle = () => (
        formType === 'new'  ? "Let's get started" : "Edit project"
    )

    if (formType === 'update' && !projectFromStore) {
        return null;
    }

    return (
        <div className="project-form-page">
        <h2>{renderPageTitle()}</h2>
        <div className="page-subtitle">
            Make a great first impression with your project's title and
            image, and set your funding goal, campaign duration, and
            project category.
        </div>
        <div className="project-form-container">
            <form className="project-form" onSubmit={handleSubmit}>
                {renderErrors()}
                <ul>
                    <li>
                    <div className="project-form-label-section">
                        <h4 className="project-field-label">Project image</h4>
                    </div>
                    <div className="project-form-input-section">
                        <img src={project.image_url} alt="Project preview" />
                        <p>
                        This is the first thing that people will see when
                        they come across your project. Choose an image
                        that's crisp and text-free.
                        </p>
                        <input
                        type="text"
                        value={project.image_url}
                        onChange={update('image_url')}
                        className="project-input"
                        />
                    </div>
                    </li>

                    <li>
                    {renderLabelSection("Project title")}
                    <div className="project-form-input-section">
                        <input
                        type="text"
                        value={project.title}
                        onChange={update('title')}
                        className="project-input"
                        />
                        <p>
                        Our search looks through words from your project title
                        and blurb, so make them clear and descriptive of what
                        you're making.
                        </p>
                        <p>
                        These words will help people find your project, so
                        choose them wisely! Your name will be searchable too.
                        </p>
                    </div>
                    </li>

                    <li>
                        {renderLabelSection("Short blurb")}
                        <div className="project-form-input-section">
                            <textarea
                                maxLength="135"
                                onChange={update('short_blurb')}
                                className="project-input shortblurb"
                                value={project.short_blurb}
                            />
                            <p>
                                Give people a sense of what you're doing. Skip
                                "Help me" and focus on what you're making.
                            </p>
                        </div>
                    </li>

                    <li>
                        {renderLabelSection("Description")}
                        <div className="project-form-input-section">
                            <textarea
                            onChange={update('description')}
                            className="project-input description"
                            value={project.description}
                            />
                        </div>
                    </li>

                    <li>
                        {renderLabelSection("Category")}
                        <div className="project-form-input-section">
                            <select
                            onChange={update('category')}
                            className="project-input"
                            value={project.category}
                            >
                            {categories && Object.keys(categories).map((id) => (
                                <option key={id} value={categories[id]}>
                                    {categories[id]}
                                </option>
                            ))}
                            </select>
                        </div>
                    </li>

                    <li>
                        {renderLabelSection("Funding end date")}
                        {renderEndDateInput()}
                    </li>

                    <li>
                        {renderLabelSection("Funding goal ($)")}
                        <div className="project-form-input-section">
                            <input
                                type="text"
                                value={project.funding_amount}
                                onChange={update('funding_amount')}
                                className="project-input"
                            />
                            <p>
                                Funding on Kickstarter is all-or-nothing. It's okay
                                to raise more than your goal, but if your goal isn't
                                met, no money will be collected. Your goal should
                                reflect the minimum amount of funds you need to
                                complete your project and send out rewards, and
                                include a buffer for payments processing fees.
                            </p>
                            <p>
                                If your project is successfully funded, the following
                                fees will be collected from your funding total:
                                Quikstarter's 5% fee, and payment processing fees
                                (between 3% and 5%). If funding isn't successful,
                                there are no fees.
                            </p>
                        </div>
                    </li>

                    <li>
                        <div className="project-form-label-section"></div>
                        <div className="project-form-input-section">
                            <input
                                type="submit"
                                value={
                                    formType === 'new'
                                    ? 'Create project'
                                    : 'Update project'
                                }
                            />
                        </div>
                    </li>
                </ul>
            </form>
        </div>
        </div>
    );
}

export default ProjectForm;