# Pull the base image
FROM python:3.13

# Install curl and remove the package index lists for smaller image size
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Install poetry and run using the python3 interpreter
RUN curl -sSL https://install.python-poetry.org | python3 -

# Set up a working directory
WORKDIR /code

# Copy the poetry dependancy files
COPY pyproject.toml poetry.lock /code/

# Install the dependancies
RUN poetry install 

# Expose the port the server will run (pure documentation)
EXPOSE 8000

# Copy the rest of the source code
COPY . /code/

# Run the python script "main"
CMD ["python3", "src/routes/main.py"]
