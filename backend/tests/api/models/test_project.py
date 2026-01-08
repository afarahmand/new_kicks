import pytest
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta
from api.models.user import User
from api.models.project import Project
from api.models.reward import Reward
from api.models.backing import Backing

@pytest.mark.django_db
class TestProjectModel:
    """Test Project model functionality"""
    
    def test_create_project(self, project_data):
        """Test creating a project with valid data"""
        project = Project.objects.create(**project_data)
        assert project.id is not None
        assert project.title == project_data['title']
        assert project.user == project_data['user']
    
    def test_valid_categories(self, project_data):
        """Test all valid category choices"""
        valid_categories = ['Art', 'Fashion', 'Film', 'Food', 'Games', 'Technology']
        
        for category in valid_categories:
            project_data['category'] = category
            project = Project.objects.create(**project_data)
            assert project.category == category
            project.delete()
    
    def test_creator_property(self, project):
        """Test creator property returns project user"""
        assert project.creator == project.user
    
    def test_backings_property(self, project, another_user):
        """Test backings property returns all project backings"""
        reward = Reward.objects.create(
            project=project,
            amount=50,
            title='Test Reward',
            description='Test'
        )
        backing = Backing.objects.create(user=another_user, reward=reward)
        
        backings = project.backings
        assert backing in backings
        assert backings.count() == 1
    
    def test_str_representation(self, project):
        """Test string representation of project"""
        expected = f"{project.id} - {project.title}"
        assert str(project) == expected

@pytest.mark.django_db
class TestPercentageFunded:
    """Test percentage_funded functionality"""
    
    def test_percentage_funded_no_backings(self, project):
        """Test percentage funded with no backings"""
        percentage = project.percentage_funded()
        assert percentage == 0
    
    def test_percentage_funded_single_backing(self, project, another_user):
        """Test percentage funded with one backing"""
        # Project funding amount is 10000
        reward = Reward.objects.create(
            project=project,
            amount=1000,
            title='Test',
            description='Test'
        )
        Backing.objects.create(user=another_user, reward=reward)
        
        percentage = project.percentage_funded()
        assert percentage == 10.0  # 1000/10000 * 100
    
    def test_percentage_funded_multiple_backings(self, project, another_user):
        """Test percentage funded with multiple backings"""
        reward1 = Reward.objects.create(
            project=project, amount=2000, title='R1', description='T'
        )
        reward2 = Reward.objects.create(
            project=project, amount=3000, title='R2', description='T'
        )
        
        Backing.objects.create(user=another_user, reward=reward1)
        
        # Create another user for second backing
        user3 = User.objects.create_user(
            email='user3@example.com',
            name='User 3',
            password='pass'
        )
        Backing.objects.create(user=user3, reward=reward2)
        
        percentage = project.percentage_funded()
        assert percentage == 50.0  # 5000/10000 * 100
    
    def test_percentage_funded_over_100(self, project, another_user):
        """Test percentage funded when overfunded"""
        reward = Reward.objects.create(
            project=project,
            amount=15000,
            title='Big Reward',
            description='Test'
        )
        Backing.objects.create(user=another_user, reward=reward)
        
        percentage = project.percentage_funded()
        assert percentage == 150.0
    
@pytest.mark.django_db
class TestProjectsPercentageFunded:
    """Test percentage_funded functionality"""
    
    def test_projects_percentage_funded_no_backings(self, project):
        """Test percentage funded with no backings"""
        percentage = Project.projects_percentage_funded()
        assert percentage == {project.id: 0}
    
    def test_projects_percentage_funded_single_backing(self, project, another_user):
        """Test percentage funded with one backing"""
        # Project funding amount is 10000
        reward = Reward.objects.create(
            project=project,
            amount=1000,
            title='Test',
            description='Test'
        )
        Backing.objects.create(user=another_user, reward=reward)
        
        percentage = Project.projects_percentage_funded()
        assert percentage == {project.id: 10.0}  # 1000/10000 * 100
    
    def test_projects_percentage_funded_multiple_backings(self, project, another_user):
        """Test percentage funded with multiple backings"""
        reward1 = Reward.objects.create(
            project=project, amount=2000, title='R1', description='T'
        )
        reward2 = Reward.objects.create(
            project=project, amount=3000, title='R2', description='T'
        )
        
        Backing.objects.create(user=another_user, reward=reward1)
        
        # Create another user for second backing
        user3 = User.objects.create_user(
            email='user3@example.com',
            name='User 3',
            password='pass'
        )
        Backing.objects.create(user=user3, reward=reward2)
        
        percentage = Project.projects_percentage_funded()
        assert percentage == {project.id: 50.0}  # 5000/10000 * 100
    
    def test_projects_percentage_funded_over_100(self, project, another_user):
        """Test percentage funded when overfunded"""
        reward = Reward.objects.create(
            project=project,
            amount=15000,
            title='Big Reward',
            description='Test'
        )
        Backing.objects.create(user=another_user, reward=reward)
        
        percentage = Project.projects_percentage_funded()
        assert percentage == {project.id: 150.0}
    
    def test_projects_percentage_funded_class_method(self, user):
        """Test class method percentage_funded for all projects"""
        # Create two projects with different funding
        project1 = Project.objects.create(
            user=user,
            category='Technology',
            description='A' * 200,
            funding_amount=10000,
            funding_end_date=timezone.now() + timedelta(days=30),
            image_url='https://example.com/img.jpg',
            short_blurb='Test blurb that is long enough',
            title='Project One'
        )
        
        project2 = Project.objects.create(
            user=user,
            category='Art',
            description='B' * 200,
            funding_amount=5000,
            funding_end_date=timezone.now() + timedelta(days=30),
            image_url='https://example.com/img2.jpg',
            short_blurb='Another test blurb for testing',
            title='Project Two'
        )
        
        # Add backings
        another_user = User.objects.create_user(
            email='backer@example.com',
            name='Backer',
            password='pass'
        )
        
        reward1 = Reward.objects.create(
            project=project1, amount=5000, title='R1', description='T'
        )
        reward2 = Reward.objects.create(
            project=project2, amount=2500, title='R2', description='T'
        )
        
        Backing.objects.create(user=another_user, reward=reward1)
        Backing.objects.create(user=another_user, reward=reward2)
        
        percentages = Project.projects_percentage_funded()
        
        assert percentages[project1.id] == 50.0
        assert percentages[project2.id] == 50.0

@pytest.mark.django_db
class TestDiscoveryResults:
    """Test discovery_results class method functionality"""

    @pytest.fixture
    def setup_projects(self, user):
        # Create multiple projects for testing
        project1 = Project.objects.create(
            user=user,
            category='Art',
            description='A' * 200,
            funding_amount=1000,
            funding_end_date=timezone.now() + timedelta(days=5),
            image_url='https://example.com/img1.jpg',
            short_blurb='Short blurb 1' * 5,
            title='Art Project Alpha'
        )
        # funding_end_date is slightly later than project1 so it comes after if sorted by end date
        project2 = Project.objects.create(
            user=user,
            category='Fashion',
            description='B' * 200,
            funding_amount=5000,
            funding_end_date=timezone.now() + timedelta(days=10),
            image_url='https://example.com/img2.jpg',
            short_blurb='Short blurb 2' * 5,
            title='Fashion Project Beta'
        )
        # funding_amount is higher than project1 and project2, and end_date is later
        project3 = Project.objects.create(
            user=user,
            category='Film',
            description='C' * 200,
            funding_amount=2000,
            funding_end_date=timezone.now() + timedelta(days=15),
            image_url='https://example.com/img3.jpg',
            short_blurb='Short blurb 3' * 5,
            title='Film Project Gamma'
        )
        # funding_amount is lower than project1 allowing us to test sorting by funding_amount
        project4 = Project.objects.create(
            user=user,
            category='Art',
            description='D' * 200,
            funding_amount=500,
            funding_end_date=timezone.now() + timedelta(days=20),
            image_url='https://example.com/img4.jpg',
            short_blurb='Short blurb 4' * 5,
            title='Art Project Delta'
        )
        # Create more projects to exceed the 9 limit
        for i in range(5, 15): # 10 additional projects
            Project.objects.create(
                user=user,
                category='Games',
                description=f'Description {i}' * 40,
                funding_amount=100 * i,
                funding_end_date=timezone.now() + timedelta(days=i),
                image_url=f'https://example.com/img{i}.jpg',
                short_blurb=f'Short blurb {i}' * 5,
                title=f'Game Project {i}'
            )
        return [project1, project2, project3, project4]
    
    def test_discovery_results_default(self, setup_projects):
        """Test default discovery_results (all categories, random sort, limit 9)"""
        results = Project.discovery_results()
        assert len(results) == 9 # Ensure limit of 9
        # Cannot assert specific order for random, but ensure they are projects

    def test_discovery_results_filter_by_category(self, setup_projects):
        """Test discovery_results filters by category"""
        results_art = Project.discovery_results(category='Art')
        assert all(project.category == 'Art' for project in results_art)
        assert len(results_art) <= 9 # Ensure limit of 9 is not exceeded

    def test_discovery_results_sort_by_funding_goal(self, setup_projects):
        """Test discovery_results sorts by funding goal (ascending) and gets max 9 projects"""
        results = Project.discovery_results(sort='Funding Goal')
        assert len(results) == 9  # Ensure limit of 9
        sorted_funding_amounts = [p.funding_amount for p in results]
        assert sorted_funding_amounts == sorted(sorted_funding_amounts)

    def test_discovery_results_sort_by_end_date(self, setup_projects):
        """Test discovery_results sorts by end date (ascending) and gets max 9 projects"""
        results = Project.discovery_results(sort='End Date')
        assert len(results) == 9 # Ensure limit of 9
        # Convert to a comparable format for assertion
        sorted_end_dates = [p.funding_end_date for p in results]
        assert sorted_end_dates == sorted(sorted_end_dates)
    
    def test_discovery_results_sort_by_newest(self, setup_projects):
        """Test discovery_results sorts by newest (descending created_at) and gets max 9 projects"""
        results = Project.discovery_results(sort='Newest')
        assert len(results) == 9 # Ensure limit of 9
        sorted_newest = [p.created_at for p in results]
        assert sorted_newest == sorted(sorted_newest, reverse=True)

    def test_discovery_results_category_and_sort(self, setup_projects):
        """Test discovery_results filters by category and sorts"""
        results = Project.discovery_results(category='Art', sort='Funding Goal')
        assert all(project.category == 'Art' for project in results)
        assert len(results) <= 9 # Ensure limit of 9
        sorted_funding_amounts = [p.funding_amount for p in results]
        assert sorted_funding_amounts == sorted(sorted_funding_amounts)

    def test_discovery_results_no_projects(self):
        """Test discovery_results when no projects exist"""
        results = Project.discovery_results()
        assert len(results) == 0
        assert list(results) == []

@pytest.mark.django_db
class TestSearchResults:
    """Test search_results class method functionality"""

    @pytest.fixture
    def setup_projects(self, user):
        # Create test projects
        # Create multiple projects for testing
        project1 = Project.objects.create(
            user=user,
            category='Art',
            description='A' * 200,
            funding_amount=1000,
            funding_end_date=timezone.now() + timedelta(days=5),
            image_url='https://example.com/img1.jpg',
            short_blurb='Short blurb 1' * 2,
            title='Art Project Alpha'
        )
        # funding_end_date is slightly later than project1 so it comes after if sorted by end date
        project2 = Project.objects.create(
            user=user,
            category='Fashion',
            description='B' * 200,
            funding_amount=5000,
            funding_end_date=timezone.now() + timedelta(days=10),
            image_url='https://example.com/img2.jpg',
            short_blurb='Short blurb 2' * 2,
            title='Fashion Project Beta'
        )
        # funding_amount is higher than project1 and project2, and end_date is later
        project3 = Project.objects.create(
            user=user,
            category='Film',
            description='C' * 200,
            funding_amount=2000,
            funding_end_date=timezone.now() + timedelta(days=15),
            image_url='https://example.com/img3.jpg',
            short_blurb='Short blurb 3' * 2,
            title='Film Project Gamma'
        )
        # funding_amount is lower than project1 allowing us to test sorting by funding_amount
        project4 = Project.objects.create(
            user=user,
            category='Art',
            description='D' * 200,
            funding_amount=500,
            funding_end_date=timezone.now() + timedelta(days=20),
            image_url='https://example.com/img4.jpg',
            short_blurb='sustainable' * 2,
            title='Art Project Delta'
        )
    
    def test_empty_query_returns_all_projects(self, setup_projects):
        """Empty query should return all projects"""
        print("count: ", Project.objects.count())
        print("search count: ", len(list(Project.search_results(""))))
        results = list(Project.search_results(""))
        assert len(results) == 4
    
    def test_search_by_title_case_insensitive(self, setup_projects):
        """Should find projects by title, case insensitive"""
        results = list(Project.search_results("gamma"))
        assert len(results) == 1
        assert results[0].title == "Film Project Gamma"
    
    def test_search_by_title_uppercase(self, setup_projects):
        """Should handle uppercase queries"""
        results = list(Project.search_results("GAMMA"))
        assert len(results) == 1
    
    def test_search_by_short_blurb(self, setup_projects):
        """Should find projects by short_blurb"""
        results = list(Project.search_results("sustainable"))
        assert len(results) == 1
        assert results[0].title == "Art Project Delta"
    
    def test_search_matches_multiple_projects(self, setup_projects):
        """Should return multiple matches"""
        results = list(Project.search_results("art project"))
        assert len(results) == 2
    
    def test_search_partial_match(self, setup_projects):
        """Should match partial strings"""
        results = list(Project.search_results("sustain"))
        assert len(results) == 1
        assert results[0].title == "Art Project Delta"
    
    def test_search_no_results(self, setup_projects):
        """Should return empty queryset for no matches"""
        results = list(Project.search_results("nonexistent"))
        assert len(results) == 0
    
    def test_search_matches_title_or_blurb(self, setup_projects):
        """Should match either title OR blurb"""
        results = list(Project.search_results("urb"))
        assert len(results) == 3

@pytest.mark.django_db
class TestProjectValidation:
    """Test project validation rules"""

    def test_description_min_length(self, project_data):
        """Test description must be at least 200 characters"""
        project_data['description'] = 'Too short'
        project = Project(**project_data)
        
        with pytest.raises(ValidationError) as exc_info:
            project.save()
        
        assert 'description' in exc_info.value.error_dict
    
    def test_funding_amount_positive(self, project_data):
        """Test funding amount must be positive"""
        project_data['funding_amount'] = 0
        project = Project(**project_data)
        
        with pytest.raises(ValidationError) as exc_info:
            project.save()
        
        assert 'funding_amount' in exc_info.value.error_dict
    
    def test_funding_end_date_in_future(self, project_data):
        """Test funding end date must be in the future"""
        project_data['funding_end_date'] = timezone.now() - timedelta(days=1)
        project = Project(**project_data)
        
        with pytest.raises(ValidationError) as exc_info:
            project.save()
        
        assert 'funding_end_date' in exc_info.value.error_dict
    
    def test_funding_end_date_max_one_year(self, project_data):
        """Test funding end date cannot be more than a year away"""
        project_data['funding_end_date'] = timezone.now() + timedelta(days=366)
        project = Project(**project_data)
        
        with pytest.raises(ValidationError) as exc_info:
            project.save()
        
        assert 'funding_end_date' in exc_info.value.error_dict
    
    def test_short_blurb_min_length(self, project_data):
        """Test short blurb must be at least 20 characters"""
        project_data['short_blurb'] = 'Too short'
        project = Project(**project_data)
        
        with pytest.raises(ValidationError) as exc_info:
            project.save()
        
        assert 'short_blurb' in exc_info.value.error_dict
    
    def test_short_blurb_max_length(self, project_data):
        """Test short blurb cannot exceed 135 characters"""
        project_data['short_blurb'] = 'x' * 136
        project = Project(**project_data)
        
        with pytest.raises(ValidationError) as exc_info:
            project.save()
        
        assert 'short_blurb' in exc_info.value.error_dict
    
    def test_title_min_length(self, project_data):
        """Test title must be at least 5 characters"""
        project_data['title'] = 'Test'
        project = Project(**project_data)
        
        with pytest.raises(ValidationError) as exc_info:
            project.save()
        
        assert 'title' in exc_info.value.error_dict
    
    def test_title_max_length(self, project_data):
        """Test title cannot exceed 60 characters"""
        project_data['title'] = 'x' * 61
        project = Project(**project_data)
        
        with pytest.raises(ValidationError) as exc_info:
            project.save()
        
        assert 'title' in exc_info.value.error_dict