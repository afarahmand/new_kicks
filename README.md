# README

Quikstarter is a single-page app made to clone features from kickstarter.com.  It utilizes a Vite created React\Redux frontend, Ruby on Rails 8 backend, and a PostgreSQL 18 database.  The app uses JS and BCrypt for password salting and hashing.  The app is Dockerized with separate Docker containers spinning up for the PostgreSQL DB, Rails API, and the React FE.

This app is based on an earlier repo named kicks <https://github.com/afarahmand/kicks/> that used a Rails 5 API and React Redux frontend.  Kicks had a coupled FE and BE, wherein the Rails server served an HTML page upon which the React app was rendered.  It used a combination of dumb, functional components and smart, containerized ones.  It did not use hooks.  Kicks used Webpack to bundle assets and stylesheets.

New kicks has changed in a number of ways.  It runs on Rails 8 API.  It runs on newer versions of React and Redux.  The BE and FE are decoupled.  The app has been migrated from smart containers to React hooks throughout.  The backings feature now uses Redux slices instead of the separated reducer and action logic.  This app includes numerous backend and frontend tests.  New kicks has been Dockerized, where the DB, BE, and FE exist in separate containers.  The FE relies on Vite and esbuild for bundling.

* System dependencies

Docker

* Configuration

1. Set environment variables in .env

* How to run locally:

1) Populate .env file using .env.example as a reference for the keys that should be included
2) Run `docker compose up --build`
3) Run `docker compose up`
4) Run `docker exec -it new_kicks_be python manage.py seeds` - to seed DB with sample records

* How to run the test suite

> FULL STACK

runs both frontend and backend tests
`docker-compose -f docker-compose.test.yml up --abort-on-container-exit`

> BACKEND

migrate test DB
`docker-compose -f docker-compose.test.yml run backend_test python manage.py migrate`

run all backend tests at once
`docker-compose -f docker-compose.test.yml up backend_test --abort-on-container-exit`

Run only one test file
`docker-compose -f docker-compose.test.yml run backend_test pytest tests/api/models/test_user.py --abort-on-container-exit`

Run only one test from file
`docker-compose -f docker-compose.test.yml run backend_test pytest tests/api/models/test_user.py::TestUserModel::test_email_unique --abort-on-container-exit`

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