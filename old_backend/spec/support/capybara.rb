require 'capybara/rspec'
require 'capybara/rails'
require 'capybara-screenshot/rspec'

Capybara.app_host = "http://localhost:3001"
Capybara.default_max_wait_time = 5
Capybara.server = :puma
Capybara.server_host = '0.0.0.0'  # Important for Docker
Capybara.server_port = 3001       # Use a different port than development

Capybara::Screenshot.webkit_options = {
  width: 1024,
  height: 768
}

Capybara::Screenshot.autosave_on_failure = false
Capybara::Screenshot.prune_strategy = :keep_last_run

RSpec.configure do |config|
  config.after do |example|
    if example.metadata[:type] == :feature and example.metadata[:js] and example.exception.present?
      Capybara::Screenshot.screenshot_and_open_image
    end
  end
end
