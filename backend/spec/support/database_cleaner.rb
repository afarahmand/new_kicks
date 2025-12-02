require 'database_cleaner-active_record'

RSpec.configure do |config|
  config.before(:suite) do
    # Clean once at the beginning to remove old data
    DatabaseCleaner.clean_with(:truncation)
  end

  config.before(:each) do
    # Default strategy is transaction (fast)
    DatabaseCleaner.strategy = :transaction
  end

  # For feature/system tests (JavaScript tests), use truncation
  # This includes :feature, :system specs
  config.before(:each, type: :feature) do
    DatabaseCleaner.strategy = :truncation
  end

  config.before(:each, type: :system) do
    DatabaseCleaner.strategy = :truncation
  end

  # Start the cleaner
  config.before(:each) do
    DatabaseCleaner.start
  end

  # Clean after each test
  config.after(:each) do
    DatabaseCleaner.clean
  end
end