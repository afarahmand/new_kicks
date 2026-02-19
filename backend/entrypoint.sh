#!/bin/sh
set -e

# Remove stale PID file if it exists
rm -f tmp/pids/server.pid

# Create and migrate the database
bundle exec rails db:create db:migrate

# Seed only if no users exist
bundle exec rails runner "
  if User.count == 0
    puts 'No users found — running seeds...'
    load Rails.root.join('db/seeds.rb')
    puts 'Seeding complete.'
  else
    puts 'Users already exist — skipping seeds.'
  end
"

# Hand off to the CMD
exec "$@"