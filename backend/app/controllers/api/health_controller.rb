class Api::HealthController < Api::BaseController
  def index
    render json: { message: "Server is healthy." }
  end
end