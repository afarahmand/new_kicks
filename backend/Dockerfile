# ── Stage 1: Builder ────────────────────────────────────────────────────────
FROM ruby:3.4.7-alpine AS builder

RUN apk add --no-cache \
  build-base \
  postgresql-dev \
  tzdata \
  yaml-dev

WORKDIR /app

COPY Gemfile Gemfile.lock ./
RUN bundle config set --local without 'development test' && \
    bundle install --jobs 4 --retry 3

COPY . .


# ── Stage 2: Development ─────────────────────────────────────────────────────
FROM ruby:3.4.7-alpine AS development

RUN apk add --no-cache \
  build-base \
  gcompat \
  postgresql-client \
  postgresql-dev \
  tzdata \
  yaml-dev

WORKDIR /app

COPY Gemfile Gemfile.lock ./
RUN bundle install --jobs 4 --retry 3

COPY . .

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENV RAILS_ENV=development

EXPOSE 3000
CMD ["rails", "server", "-b", "0.0.0.0"]


# ── Stage 3: Runtime ─────────────────────────────────────────────────────────
FROM ruby:3.4.7-alpine AS runtime

RUN apk add --no-cache \
  gcompat \
  libstdc++ \
  postgresql-client \
  tzdata

WORKDIR /app

COPY --from=builder /usr/local/bundle /usr/local/bundle
COPY --from=builder /app /app

COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENV RAILS_ENV=production \
    BUNDLE_WITHOUT=development:test

EXPOSE 3000
ENTRYPOINT ["entrypoint.sh"]
CMD ["rails", "server", "-b", "0.0.0.0"]