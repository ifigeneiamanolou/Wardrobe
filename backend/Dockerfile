# Pull the base image
FROM python:3.13

# Environment variables
ARG YOUR_ENV

ENV PYTHONFAULTHANDLER=1 \
  PYTHONUNBUFFERED=1 \
  PYTHONHASHSEED=random \
  PIP_NO_CACHE_DIR=off \
  PIP_DISABLE_PIP_VERSION_CHECK=on \
  PIP_DEFAULT_TIMEOUT=100 \
  # Poetry's configuration:
  POETRY_REQUESTS_TIMEOUT=300 \
  POETRY_NO_INTERACTION=1 \
  POETRY_VIRTUALENVS_CREATE=false \
  POETRY_CACHE_DIR='/var/cache/pypoetry' \
  POETRY_HOME='/usr/local' \
  POETRY_VERSION=2.3.4

# Install curl and remove the package index lists for smaller image size
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Install poetry and run using the python3 interpreter
RUN curl -sSL https://install.python-poetry.org | python3 -

# Set up a working directory
WORKDIR /code

# Copy the poetry dependancy files
COPY pyproject.toml poetry.lock /code/

# Install the dependancies
RUN poetry config installer.max-workers 4
RUN for i in 1 2 3 4 5; do \
      poetry install --no-interaction --no-ansi && break || \
      { echo "Retry $i..."; sleep 10; }; \
    done

# Expose the port the server will run (pure documentation)
EXPOSE 8000

# Copy the rest of the source code
COPY . /code

# Run the python script "main"
CMD ["python3", "src/routes/main.py"]
