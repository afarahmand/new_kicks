# Use official Python runtime as base image
FROM python:3.14.2-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Create the app directory
RUN mkdir /app

# Set work directory
WORKDIR /app

# Install system dependencies (minimal for dev)
RUN apt-get update && apt-get install -y \
    curl \
    gcc \
    libffi-dev \
    postgresql-client \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
COPY requirements-test.txt .
RUN pip install --upgrade pip && \
    pip install -r requirements.txt
RUN pip install -r requirements-test.txt

# Copy project files
COPY . .

# Expose port
EXPOSE 8000

# Run Django development server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]