class Api::ProjectSearchesController < Api::BaseController
  def index
    @projects = Project.search_results(search_params[:query])
    render "api/project_searches/index"
  end

  private

  def search_params
    params.require(:search).permit(:category, :query, :sort)
  end
end
