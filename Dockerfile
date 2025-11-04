FROM ruby:3.4.7-alpine

# Install dependencies
RUN apt-get update -qq && apt-get install -y \
  postgresql-client \
  nodejs \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install gems
COPY Gemfile Gemfile.lock ./
RUN bundle install

# Copy the Rails app
COPY . .

# Expose port
EXPOSE 3000

# Start the Rails server
CMD ["rails", "server", "-b", "0.0.0.0"]