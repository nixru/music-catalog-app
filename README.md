# Crate — Music Catalog Insights Platform

A full-stack app for building a personal album library sourced from the iTunes Search API, with an analytics dashboard and AI-generated insights on top.

**Live demo:** https://music-catalog-app-opal.vercel.app
**Backend API:** https://music-catalog-app-production.up.railway.app
**Repo:** https://github.com/nixru/music-catalog-app

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 17, Spring Boot 3.2, Spring Security, Spring Data JPA |
| Frontend | React 18 (Vite), Tailwind CSS, Recharts, React Router |
| Database | PostgreSQL |
| Auth | JWT (username/password) + Google Sign-In (OAuth) |
| External API | iTunes Search API |

---

## Entity Choice: Albums

I chose **Albums** as the focus entity, over Songs or Artists, for two reasons:

1. **Metadata richness** — Albums carry genre, release date, track count, and artwork in a single record, which directly feeds four distinct chart types (genre breakdown, releases-by-year, decade trends, artist frequency) without needing extra API calls or joins.
2. **Signal-to-noise ratio** — Song-level search returns far more results with more duplicate/noisy entries (remixes, live versions, deluxe re-releases), which would need extra cleanup before the analytics were meaningful. Albums are a cleaner unit for a personal collection.

---

## Database Schema

Two tables, related by a foreign key, using PostgreSQL via Spring Data JPA (`ddl-auto=update` for local dev):

**`users`**
| Column | Type | Notes |
|---|---|---|
| id | BIGSERIAL PK | |
| username | VARCHAR, UNIQUE | email for Google accounts, chosen username otherwise |
| password | VARCHAR, nullable | BCrypt hash; null for Google-only accounts |
| auth_provider | VARCHAR | `LOCAL` or `GOOGLE` |
| created_at | TIMESTAMP | |

**`library_items`**
| Column | Type | Notes |
|---|---|---|
| id | BIGSERIAL PK | |
| apple_catalog_id | BIGINT | iTunes `collectionId`; unique per user |
| title | VARCHAR | album title |
| artist_name | VARCHAR | |
| genre | VARCHAR | nullable |
| release_date | DATE | nullable |
| track_count | INTEGER | nullable |
| artwork_url | VARCHAR | nullable |
| user_rating | INTEGER | 1–5, nullable |
| user_notes | VARCHAR(2000) | nullable |
| created_at / updated_at | TIMESTAMP | |
| user_id | BIGINT FK → users.id | scopes the library per user |

**Why SQL over NoSQL:** the data is genuinely relational (each library item belongs to exactly one user), the schema is stable and well-defined upfront, and the analytics layer needs aggregation (`GROUP BY` genre, year, rating) which relational databases handle natively and efficiently. A document store would add complexity here without a clear benefit for this shape of data.

---

## REST API

All endpoints under `/api`. `search` is public; everything else requires a `Bearer` JWT.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account, returns JWT |
| POST | `/api/auth/login` | Login, returns JWT |
| POST | `/api/auth/google` | Verify Google ID token, returns JWT |
| GET | `/api/search?query=&type=&limit=` | Proxy to iTunes Search API |
| GET | `/api/library` | List the user's saved albums |
| POST | `/api/library` | Save an album |
| PUT | `/api/library/{id}` | Update rating/notes |
| DELETE | `/api/library/{id}` | Remove an album |
| GET | `/api/library/stats` | Aggregate stats for charts |
| GET | `/api/library/insights` | AI-generated trend summary |

Validation is enforced via Bean Validation on all request DTOs; errors are handled centrally through a `@RestControllerAdvice` returning consistent JSON error bodies (400 validation, 404 not found, 409 duplicate, 401 bad credentials, 502 upstream API failure).

---

## AI Feature: Trend Summary

`GET /api/library/insights` returns a natural-language paragraph describing patterns in the user's library — dominant genre, favorite decade, most-collected artist, and rating habits — computed from the same aggregate stats that power the charts.

**How it works:**
- If an `anthropic.api-key` is configured, the backend calls the Claude API with the library's stats and asks for a short, specific summary.
- If no key is configured (the default, out-of-the-box state), it falls back to a deterministic, template-based summary built from the same data.
- The response includes a `source` field (`"llm"` or `"rule-based"`) so the frontend can show which path generated it — no silent fallback.

This was a deliberate trade-off: the feature works immediately with zero external dependencies or API keys, while still supporting a genuine LLM call if one is configured, without the UI needing to know which path is active.

---

## Local Setup

### Prerequisites
- JDK 17, Eclipse (or any IDE with Maven support)
- PostgreSQL 14+
- Node.js 18+

### Backend
1. Create the database: `CREATE DATABASE music_catalog;`
2. Copy `backend/src/main/resources/application.properties.example` to `application.properties` and fill in your DB password (and optionally `google.client-id`, `anthropic.api-key`)
3. Import into Eclipse as a Maven project, run `MusicCatalogApplication`
4. Runs on `http://localhost:8080`

### Frontend
1. `cd frontend`
2. Copy `.env.example` to `.env`, set `VITE_API_URL=http://localhost:8080` and (optionally) `VITE_GOOGLE_CLIENT_ID`
3. `npm install && npm run dev`
4. Runs on `http://localhost:5173`

### Google Sign-In (optional)
Requires an OAuth Client ID from https://console.cloud.google.com/apis/credentials with `http://localhost:5173` as an authorized JavaScript origin. Same client ID goes in both `application.properties` (`google.client-id`) and frontend `.env` (`VITE_GOOGLE_CLIENT_ID`).

---

## Deployment

- **Backend:** Railway — configured via environment variables (`SPRING_DATASOURCE_URL`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `CORS_ALLOWED_ORIGINS`, etc.), no code changes needed between local and prod.
- **Database:** Neon (serverless PostgreSQL) — connected via the standard JDBC URL, no schema changes needed vs. local Postgres.
- **Frontend:** Vercel — `VITE_API_URL` and `VITE_GOOGLE_CLIENT_ID` set as environment variables at build time.

---

## Trade-offs & Known Limitations

- **`ddl-auto=update`** is convenient for iterating locally but isn't a substitute for real migrations (Flyway/Liquibase) in production — schema changes on an existing prod DB would need to be applied carefully or manually.
- **AI feature has no external dependency by default** (rule-based fallback) — this trades "always genuinely AI-generated" for "always works, zero setup, zero cost." An Anthropic API key upgrades it to real LLM output without any code change.
- **No retry/backoff on the iTunes API call** — a transient failure surfaces as a 502 to the user rather than being retried. Would add resilience4j or similar for production hardening.
- **No pagination on search results** — capped at a configurable `limit` (default 24) rather than true pagination, since iTunes's own API pagination is limited and the library-saving UX didn't need it at this scale.
- **Password reset flow is not implemented** — out of scope for the assignment's time window; would be a natural next addition alongside email verification.

---

## Good-to-haves not yet implemented
- Unit tests (backend: service-layer tests for `AnalyticsService`/`LibraryService` would be the highest-value first additions)
- Debounced search — **implemented** (400ms debounce on the Search page)
- Caching — not implemented; iTunes responses aren't cached, so repeated identical searches re-hit the external API
