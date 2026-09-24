# Personal Hub API

Spring Boot REST API for the Personal Hub frontend. The service uses PostgreSQL, JPA/Hibernate, environment-based configuration, and a single-user API key guard suitable for a private hosted deployment.

## Local development

1. Copy `.env.example` to `.env` and replace the passwords/keys.
2. Start the database and API:

```powershell
docker compose --env-file .env up --build
```

The API is available at `http://localhost:8080`. Health is public at `/actuator/health`; application requests require an authenticated server session.

Example:

```powershell
curl http://localhost:8080/api/auth/me
```

## Main endpoints

- `GET /api/workspace` - load the complete workspace snapshot
- `GET|POST|PATCH|DELETE /api/projects`
- `GET|POST|PATCH /api/projects/{projectId}/milestones`
- `GET|POST /api/projects/{projectId}/resources`
- `GET|POST /api/projects/{projectId}/attachments`
- `GET|POST|PATCH|DELETE /api/tasks`
- `GET|POST|PATCH /api/contacts`
- `GET|POST /api/contacts/{contactId}/interactions`
- `GET|PATCH /api/settings`

The current default is `spring.jpa.hibernate.ddl-auto=update`, which is convenient for a personal deployment while the schema is evolving. For a mature production deployment, switch to `validate` and introduce versioned migrations with Flyway before making schema changes.

## Hosting checklist

- Use a managed PostgreSQL database with automated backups.
- Set `PERSONAL_HUB_USERNAME` and a strong BCrypt `PERSONAL_HUB_PASSWORD_HASH`; never commit `.env`.
- Set `APP_CORS_ORIGINS` to the exact frontend origin, without `*`.
- For a frontend hosted on another domain, set `SESSION_COOKIE_SAME_SITE=none` and `SESSION_COOKIE_SECURE=true`.
- Set `SPRING_JPA_HIBERNATE_DDL_AUTO=validate` after adding migrations.
- Put the API behind HTTPS and a reverse proxy/managed ingress.
- Rotate the API key if it is ever exposed.
