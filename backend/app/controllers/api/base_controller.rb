class Api::BaseController < ApplicationController
  skip_before_action :verify_authenticity_token

  # Catch ALL exceptions and return JSON
  rescue_from StandardError do |exception|
    # Log the error for debugging
    Rails.logger.error("API Error: #{exception.class} - #{exception.message}")
    Rails.logger.error(exception.backtrace.join("\n"))
    
    render json: { 
      error: exception.message,
      type: exception.class.name 
    }, status: :internal_server_error
  end
  
  # Specific rescues (these take precedence over StandardError)
  rescue_from ActionController::ParameterMissing do |exception|
    render json: { error: exception.message }, status: :bad_request
  end
  
  rescue_from ActiveRecord::RecordNotFound do |exception|
    render json: { error: "Record not found" }, status: :not_found
  end
  
  rescue_from ActiveRecord::RecordInvalid do |exception|
    render json: { errors: exception.record.errors.full_messages }, status: :unprocessable_entity
  end
end