# Vortex

Vortex is a full-stack travel social media application where users can share trips, discover destinations, interact with other travelers, and build a personalized travel feed.

I built Vortex to gain experience developing and deploying a complete web application rather than only building isolated frontend pages or basic CRUD endpoints. The project includes a FastAPI backend, PostgreSQL database, JavaScript frontend, authentication, social features, automated testing, CI/CD, and a deployed production environment.

## Live Application

Website: https://emberlylife.net

API: https://api.emberlylife.net

## Features

### Authentication and Users

Users can create accounts, authenticate, and manage their profiles.

Authentication features include:

* User registration
* User login
* JWT authentication
* OAuth2 password flow
* Password hashing
* Email verification
* Password reset
* User profiles
* Usernames
* Profile pictures
* User bios
* Home country information

### Posts

Users can create and manage travel content containing information about their trips.

Post functionality includes:

* Create, update, and delete posts
* Multiple images per post
* Country and city information
* Trip type
* Trip dates
* Tags and hashtags
* Search
* Filtering
* Pagination
* Sorting

### Social Features

Vortex includes several features that allow users to interact with other travelers and their content.

Users can:

* Like and unlike posts
* Comment on posts
* Bookmark posts
* Follow and unfollow users
* View a personalized following feed
* Explore travel posts
* Send direct messages
* View conversation history
* Receive notifications
* Track unread notifications

## Tech Stack

### Backend

Python  
FastAPI  
SQLAlchemy  
Pydantic  
PostgreSQL  
Alembic  
JWT authentication  
OAuth2

### Frontend

HTML  
CSS  
JavaScript

### Testing

pytest  
FastAPI TestClient  
PostgreSQL test database

### Deployment and Infrastructure

Docker  
Docker Compose  
GitHub Actions  
Nginx  
Gunicorn  
Uvicorn  
DigitalOcean  
Cloudflare  
HTTPS

## Architecture

The application is divided into frontend, API, database, and infrastructure layers.

```text
User Browser
     |
     v
Cloudflare
     |
     v
Nginx
     |
     +---------------------+
     |                     |
     v                     v
Static Frontend        FastAPI API
HTML/CSS/JavaScript         |
                            v
                       SQLAlchemy
                            |
                            v
                       PostgreSQL
```

The frontend communicates with the FastAPI backend through REST API requests. FastAPI handles application logic, authentication, authorization, validation, and database operations.

SQLAlchemy provides the ORM layer between the application and PostgreSQL. Alembic manages database schema migrations.

The production application is served through Nginx and protected with HTTPS. Cloudflare handles the public domain and sits in front of the deployed application.

## Database

Vortex uses PostgreSQL as its relational database and SQLAlchemy for database access.

The main entities include:

* Users
* Posts
* Post Images
* Likes
* Comments
* Bookmarks
* Follows
* Tags
* Post Tags
* Messages
* Notifications

Foreign keys and relationships connect users with posts and other social interactions.

For example, users can own posts, follow other users, like posts, save posts, comment on posts, exchange messages, and receive notifications.

Database schema changes are managed with Alembic migrations so changes can be versioned and applied consistently across development and production environments.

## API

The backend is implemented as a REST API using FastAPI.

Major API areas include:

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

The API handles request validation using Pydantic schemas and communicates with PostgreSQL through SQLAlchemy.

FastAPI also provides interactive API documentation while the application is running.

## Authentication

Vortex uses token-based authentication.

After successful authentication, users receive a JWT access token that can be used to access protected endpoints.

Passwords are hashed before being stored in the database. Plain-text passwords are never stored.

The authentication system also includes email verification and password reset functionality.

Verification and password reset links use environment-based application URLs so the same application code can work correctly in local development and production.

## Email

Vortex sends transactional emails for account verification and password reset.

Email configuration is stored through environment variables instead of being hard-coded into the application.

This keeps credentials outside the source code and allows different configuration values to be used between development, testing, and production.

## Local Development

### 1. Clone the repository

```bash
git clone https://github.com/EdisXT/socialmediaserver.git
cd socialmediaserver
```

### 2. Create the environment file

The repository contains `.env.example`, which documents the environment variables required by the application.

Create your local environment file:

```bash
cp .env.example .env
```

Then replace the example values with your local configuration.

The real `.env` file should never be committed to Git.

### 3. Start the development environment

```bash
docker compose -f docker-compose-dev.yml up --build
```

The development environment includes the FastAPI application and PostgreSQL.

The API is available locally at:

```text
http://127.0.0.1:8000
```

The development configuration supports source code mounting and automatic application reload to make backend development faster.

## Database Migrations

Alembic is used to manage database migrations.

Apply all available migrations with:

```bash
alembic upgrade head
```

Check the currently applied migration with:

```bash
alembic current
```

When database models change, Alembic migrations provide a version-controlled way to update the database schema without manually rebuilding the database.

## Testing

The backend includes automated tests using pytest and FastAPI's testing utilities.

Run the test suite with:

```bash
pytest -v
```

The CI environment starts a PostgreSQL test database so automated tests can run against a database separate from production data.

External email delivery is mocked during automated testing so tests do not send real verification or password reset emails.

## Docker

Vortex contains separate Docker Compose configurations for development and production.

### Development

`docker-compose-dev.yml`

The development configuration is intended for local development and includes development-specific settings such as source code mounting and automatic reload.

### Production

`docker-compose-prod.yml`

The production configuration uses environment variables for application configuration and credentials.

Sensitive values are not stored directly in the Compose files.

## CI/CD

Vortex uses GitHub Actions to automatically test changes and deploy updates.

The workflow runs when changes are pushed to the main branch and when pull requests target main.

The pipeline performs the following process:

```text
Push or Pull Request
        |
        v
GitHub Actions
        |
        v
Start PostgreSQL Test Service
        |
        v
Set Up Python
        |
        v
Install Dependencies
        |
        v
Run pytest
        |
        v
Tests Pass
        |
        +---------------- Pull Request
        |
        v
Push to main
        |
        v
Connect to Production Server
        |
        v
Pull Latest Code
        |
        v
Restart API Service
```

Automated tests must complete successfully before the deployment step can run.

Deployment only occurs for pushes to the main branch. Pull requests run the testing portion of the workflow without deploying to production.

The production deployment connects to the Ubuntu server, pulls the latest version of the repository, and restarts the FastAPI service.

This provides a simple CI/CD pipeline where changes are automatically tested before the deployed backend is updated.

## Production Deployment

The production backend runs on an Ubuntu server.

The deployed architecture uses:

* Nginx as the reverse proxy
* Gunicorn to manage application workers
* Uvicorn workers to serve FastAPI
* PostgreSQL for persistent application data
* Cloudflare for the public domain
* HTTPS for encrypted communication

The public API is available at:

```text
https://api.emberlylife.net
```

The API root can also be used as a simple production health check.

## Security

The application includes several security practices:

* Password hashing
* JWT authentication
* OAuth2 password flow
* Protected API endpoints
* Email verification
* Password reset tokens
* CORS configuration
* HTTPS in production
* Environment-based configuration
* Secrets excluded from version control

Sensitive credentials are stored in environment variables instead of being hard-coded into the repository.

The `.env` file is excluded through `.gitignore`, while `.env.example` documents the required configuration without containing real credentials.

## Project Structure

```text
socialmediaserver/
├── .github/
│   └── workflows/
│       └── build-deploy.yml
│
├── alembic/
│   └── versions/
│
├── app/
│   ├── routers/
│   ├── calculations.py
│   ├── config.py
│   ├── database.py
│   ├── email_utils.py
│   ├── main.py
│   ├── models.py
│   ├── oauth2.py
│   ├── schemas.py
│   └── utils.py
│
├── tests/
│
├── travelsocial/
│   ├── js/
│   ├── index.html
│   ├── navigation.js
│   ├── script.js
│   └── style.css
│
├── .env.example
├── .gitignore
├── alembic.ini
├── docker-compose-dev.yml
├── docker-compose-prod.yml
├── Dockerfile
├── gunicorn.service
├── nginx
├── requirements.txt
└── README.md
```

## Development Process

Vortex started as a backend API project and was expanded over time into a deployed full-stack application.

Development included designing database models, implementing REST endpoints, adding authentication, creating migrations, testing endpoints, connecting a frontend, containerizing the development environment, configuring a Linux production server, setting up HTTPS, and creating an automated CI/CD workflow.

The project also required debugging differences between local development, automated testing, and production environments.

## What I Learned

Building Vortex gave me practical experience with the full lifecycle of a web application.

Some of the main areas I worked with include:

* Designing REST APIs with FastAPI
* Modeling relational data with PostgreSQL and SQLAlchemy
* Creating and applying database migrations
* Implementing authentication and authorization
* Managing JWT access tokens
* Hashing and storing passwords securely
* Implementing email verification and password reset flows
* Connecting a JavaScript frontend to a REST API
* Implementing social relationships between users and content
* Writing automated API tests
* Testing against a PostgreSQL test database
* Containerizing development environments with Docker
* Managing configuration through environment variables
* Building GitHub Actions workflows
* Deploying a Python web application to Linux
* Configuring Gunicorn and Nginx
* Configuring domains and HTTPS
* Debugging application behavior across development, testing, and production

## Future Improvements

Vortex is an ongoing project. Areas that can be expanded include:

* Additional automated test coverage
* Improved frontend responsiveness and design
* Real-time messaging
* More advanced travel discovery and recommendation features
* Improved search
* Application monitoring
* Structured production logging
* Performance optimization
* More advanced deployment automation
* Improved email deliverability

## Author

Edis Aviles

Computer Science student focused on full-stack software engineering.