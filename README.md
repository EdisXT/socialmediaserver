# Vortex — Socialmedia Platform

Vortex is a full-stack travel social media application where users can share trips, discover destinations, interact with other travelers, and build a personalized travel feed.

The project was built to explore production backend development, relational database design, authentication, containerization, CI/CD, and deployment—not just basic CRUD operations.

## Live Application

**Website:** https://emberlylife.net
**API:** https://api.emberlylife.net

## Features

### Authentication & Users
- User registration and login
- JWT-based authentication
- Secure password hashing
- Email verification
- Password reset flow
- User profiles
- Profile pictures and bios
- Home country information

### Travel Posts
- Create, update, and delete travel posts
- Upload multiple images per post
- Country and city information
- Trip type classification
- Trip dates
- Hashtags and tags
- Search and filter travel posts
- Pagination and sorting

### Social Features
- Like and unlike posts
- Comment on posts
- Bookmark posts
- Follow and unfollow users
- Personalized following feed
- Explore travel content
- Direct messaging between users
- Conversation history
- Notifications
- Unread notification counts

## Tech Stack

### Backend
- Python
- FastAPI
- SQLAlchemy
- Pydantic
- PostgreSQL
- Alembic
- JWT / OAuth2 authentication

### Frontend
- HTML
- CSS
- JavaScript

### Infrastructure & DevOps
- Docker
- Docker Compose
- GitHub Actions
- Docker Hub
- Nginx
- Gunicorn / Uvicorn
- DigitalOcean
- Cloudflare
- HTTPS

### Testing
- pytest
- FastAPI TestClient
- PostgreSQL test database

## Architecture

```text
                    User Browser
                         |
                         v
                    Cloudflare
                         |
                         v
                       Nginx
                         |
              +----------+----------+
              |                     |
              v                     v
        Static Frontend         FastAPI API
      HTML / CSS / JS               |
                                    v
                                SQLAlchemy
                                    |
                                    v
                               PostgreSQL
```

The application separates frontend, API, database, and deployment concerns while using environment variables for configuration and secrets.

## Database

Vortex uses PostgreSQL with SQLAlchemy ORM models and Alembic migrations.

Major entities include:

- Users
- Posts
- Post Images
- Likes
- Comments
- Bookmarks
- Follows
- Tags
- Post Tags
- Messages
- Notifications

Relationships and foreign keys are used to model interactions between users and travel content.

## API

The FastAPI backend exposes REST endpoints for:

```text
/auth
/users
/posts
/likes
/comments
/bookmarks
/tags
/notifications
/messages
```

FastAPI also provides interactive API documentation when running the backend.

## Local Development with Docker

### 1. Clone the repository

```bash
git clone <repository-url>
cd socialMediaServer
```

### 2. Create the environment file

Copy the example configuration:

```bash
cp .env.example .env
```

Fill in the required values in `.env`.

Never commit the real `.env` file.

### 3. Start the development environment

```bash
docker compose -f docker-compose-dev.yml up --build
```

The API will be available at:

```text
http://127.0.0.1:8000
```

The development environment includes:

- FastAPI with automatic reload
- PostgreSQL 15
- Persistent PostgreSQL Docker volume

## Database Migrations

Alembic is used to version and apply database schema changes.

Apply migrations with:

```bash
alembic upgrade head
```

Check the current migration with:

```bash
alembic current
```

## Testing

Run the test suite with:

```bash
pytest
```

The project includes automated backend tests for core API functionality.

## Docker Environments

The project maintains separate Docker Compose configurations.

### Development

`docker-compose-dev.yml`

Designed for local development with source-code mounting and FastAPI automatic reload.

### Production

`docker-compose-prod.yml`

Designed to run the published application image with production environment variables and persistent PostgreSQL storage.

## CI/CD

The project uses GitHub Actions for automated development and deployment workflows.

The pipeline includes:

```text
Push code
    |
    v
GitHub Actions
    |
    +--> Install dependencies
    |
    +--> Start PostgreSQL test service
    |
    +--> Run automated tests
    |
    +--> Build Docker image
    |
    +--> Publish Docker image
    |
    v
Production deployment
```

This allows application changes to be tested before being released.

## Security

The project uses:

- JWT authentication
- OAuth2 password flow
- Password hashing
- Environment-based secret management
- Email verification
- Password-reset tokens
- CORS configuration
- HTTPS in production

Sensitive credentials are excluded from version control through `.gitignore`.

## Project Structure

```text
socialMediaServer/
├── app/
│   ├── routers/
│   ├── config.py
│   ├── database.py
│   ├── email_utils.py
│   ├── main.py
│   ├── models.py
│   ├── oauth2.py
│   └── schemas.py
│
├── alembic/
│   └── versions/
│
├── tests/
│
├── travelsocial/
│   ├── js/
│   ├── index.html
│   └── ...
│
├── nginx/
├── .github/
│   └── workflows/
│
├── .env.example
├── .gitignore
├── alembic.ini
├── Dockerfile
├── docker-compose-dev.yml
├── docker-compose-prod.yml
├── requirements.txt
└── README.md
```

## What I Learned

Building Vortex provided hands-on experience with the full lifecycle of a web application, including:

- Designing REST APIs
- Modeling relational data
- Implementing authentication and authorization
- Managing database migrations
- Connecting a JavaScript frontend to a FastAPI backend
- Containerizing applications with Docker
- Building CI/CD workflows
- Configuring Linux production servers
- Working with reverse proxies and HTTPS
- Debugging differences between development and production environments

## Future Improvements

Potential future improvements include:

- Expanded automated test coverage
- Improved responsive frontend design
- Real-time messaging
- Additional travel discovery features
- Performance monitoring and logging
- Improved deployment automation
- Dependency and container optimization

## Author

Edis Aviles

Computer Science student focused on full-stack software engineering.