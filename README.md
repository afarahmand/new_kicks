# README

Quikstarter is a single-page app made to clone features from kickstarter.com.  It utilizes a Vite created React\Redux frontend, Ruby on Rails 8 API backend, and a PostgreSQL 18 database.  The app uses JS and BCrypt for password salting and hashing.

The app is Dockerized with separate Docker containers spinning up for the PostgreSQL DB, Rails API, and the React FE.  The apps use mult-stage Dockerfiles to minimize the size of produced Docker images.

This app is based on an earlier repo named kicks <https://github.com/afarahmand/kicks/> that used a Rails 5 API and React Redux frontend.  Kicks had a coupled FE and BE, wherein the Rails server served an HTML page upon which the React app was rendered.  It used a combination of dumb, functional components and smart, containerized ones.  It did not use hooks.  Kicks used Webpack to bundle assets and stylesheets.

New kicks has changed in a number of ways.  It runs on Rails 8.  It runs on newer versions of React and Redux.  The BE and FE are decoupled.  The app has been migrated from smart containers to React hooks throughout.  The backings feature now uses Redux slices instead of the separated reducer and action logic.  This app includes numerous backend and frontend tests.  New kicks has been Dockerized, where the DB, BE, and FE exist in separate containers.  The FE relies on Vite and esbuild for bundling.

* System dependencies

- Docker
- Docker compose

* How to run locally:

1) Populate .env file using .env.example as a reference for the keys that should be included
    BASE_URL_KICKS_API=http://localhost:3000/
        - This should be the base url of the API.  The frontend will prepend this in queries to the backend.
    DOCKER_TARGET=development
        - should be "development" for local use and "runtime" for production
    RAILS_ENV=development
        - should be "development" for local use and "production" for production
    RAILS_MASTER_KEY=masterkey
        - enter whatever you want here but I think it needs to match the master.key file included somewhere in Rails
    ROUTE_PREFIX=/new_kicks_api/
        - this adds a scope to all routes in routes.rb

2) Run `docker compose up` - to start project and seed the DB

* How to run the test suite

> BACKEND

Run all tests once
`docker exec -e RAILS_ENV=test -it new_kicks_api bundle exec rspec spec`

Run only one test file
`docker exec -e RAILS_ENV=test -it new_kicks_api bundle exec rspec spec/models/project_spec.rb`

Run only one test from file
`docker exec -e RAILS_ENV=test -it new_kicks_api bundle exec rspec spec/models/project_spec.rb:<line_number>`

> FRONTEND

Run all tests once
`docker-compose -f docker-compose.test.yml run --rm frontend-test`

Run only one test file
`docker-compose -f docker-compose.test.yml run --rm frontend-test npm run test -- navbar.test.jsx`

Run only one test from file
`docker-compose -f docker-compose.test.yml run --rm frontend-test npm run test -- -t "returns empty object if backings is empty"`

Run tests in watch mode (for development)
`docker-compose -f docker-compose.test.yml run --rm frontend-test npm run test:watch`

Run to measure test coverage
`docker-compose -f docker-compose.test.yml run --rm frontend-test npm run test:coverage`