class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  # allow_browser versions: :modern

  # Changes to the importmap will invalidate the etag for HTML responses
  stale_when_importmap_changes

  protect_from_forgery with: :exception

  helper_method :current_user, :signed_in?

  def current_user
    @current_user = User.find_by(session_token: session[:session_token])
  end

  def signed_in?
    !!current_user
  end

  def sign_in(user)
    @current_user = user
    session[:session_token] = user.reset_session_token!
  end

  def sign_out
    @current_user.try(:reset_session_token!)
    session[:session_token] = nil
  end

  def require_signed_in!
    #redirect... if !signed_in?
  end
end