# README

Quikstarter is a single-page app made to clone features from kickstarter.com.  It utilizes a Vite created React\Redux frontend, Ruby on Rails 8 backend, and a PostgreSQL 18 database.  The app uses JS and BCrypt for password salting and hashing.  The app is Dockerized with separate Docker containers spinning up for the PostgreSQL DB, Rails API, and the React FE.

* System dependencies

Docker

* Configuration

- Set environment variables in .env

* How to run the test suite

>>> BACKEND
`docker exec -e RAILS_ENV=test -it <Rails API container ID> bundle exec rspec spec`

>>> FRONTEND
<!-- Run all tests once -->
`docker-compose -f docker-compose.test.yml run --rm frontend-test`

<!-- Run only one test file -->
`docker-compose -f docker-compose.test.yml run --rm frontend-test npm run test -- navbar.test.jsx`

<!-- Run only one test from file -->
`docker-compose -f docker-compose.test.yml run --rm frontend-test npm run test -- -t "returns empty object if backings is empty"`

<!-- Run tests in watch mode (for development) -->
`docker-compose -f docker-compose.test.yml run --rm frontend-test npm run test:watch`

<!-- Run to measure test coverage -->
`docker-compose -f docker-compose.test.yml run --rm frontend-test npm run test:coverage`

* How to run locally:

1) Populate .env file using .env.example as a reference for the keys that should be included
2) Run `docker compose up --build`