FROM ruby:3.4.7-alpine

# Install dependencies
RUN apk add --no-cache \
  postgresql-dev \
  postgresql-client \
  build-base \
  tzdata \
  nodejs

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