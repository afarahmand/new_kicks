class Api::HealthController < ApplicationController
  def index
    render json: { message: "Server is healthy." }
  end
end