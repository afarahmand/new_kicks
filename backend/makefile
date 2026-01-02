.PHONY: test test-cov test-fast test-docker

test:
	pytest

test-fast:
	pytest -n auto --reuse-db

test-docker:
	docker-compose -f docker-compose.test.yml up --abort-on-container-exit

test-watch:
	pytest-watch

test-unit:
	pytest -m unit

test-integration:
	pytest -m integration