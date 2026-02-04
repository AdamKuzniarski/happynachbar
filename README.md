<a id="readme-top"></a>

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16-111111?style=for-the-badge&logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-20232a?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-11-e0234e?style=for-the-badge&logo=nestjs)
![Postgres](https://img.shields.io/badge/Postgres-16-31648c?style=for-the-badge&logo=postgresql&logoColor=white)

</div>

<br />

<div align="center">
  <img width="640" height="360" src="public/assets/hero-homepage.png" alt="Happynachbar preview">

  <h1 align="center">Happynachbar</h1>

  <p align="center">
    A neighborhood platform for discovering, creating, and discussing local activities.
    <br />
    <a href="https://your-demo-url.example.com/">View Demo</a>
    ·
    <a href="#preview">Preview</a>
    ·
    <a href="#features">Features</a>
  </p>
</div>

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#overview">Overview</a></li>
    <li><a href="#features">Features</a></li>
    <li><a href="#preview">Preview</a></li>
    <li><a href="#tech">Tech Stack</a></li>
    <li><a href="#architecture">Architecture</a></li>
    <li><a href="#local-setup">Local Setup</a></li>
  </ol>
</details>

<br />

<!-- ******************************************************** OVERVIEW ************************************************* -->

<h2 id="overview">Overview</h2>

<p>
Happynachbar connects neighbors through activities, events, and real‑time chat. Users can browse and filter activities by category or postal code, create their own events with images and schedules, and reach out to other neighbors directly.
</p>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ******************************************************** FEATURES ************************************************* -->

<h2 id="features">Features</h2>

- Activity discovery with search, category, and postal‑code filters.
- Create and manage events with images, descriptions, and scheduling.
- Profiles with editable user details and avatars.
- Real‑time messaging between neighbors (Socket.IO).
- Image uploads backed by S3 storage.
- Admin tooling for moderation and activity/user oversight.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ******************************************************** PREVIEW ************************************************* -->

<h2 id="preview">Preview</h2>

<div align="center">
  <img src="public/assets/preview-placeholder.png" alt="Happynachbar preview">
</div>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ******************************************************** TECH STACK ************************************************* -->

<h2 id="tech">Tech Stack</h2>

<p>
  <a href="https://nextjs.org/" target="_blank" rel="noreferrer"><img src="https://cdn.simpleicons.org/nextdotjs/111111" alt="Next.js logo" width="36" height="36"></a>
  <a href="https://react.dev/" target="_blank" rel="noreferrer"><img src="https://cdn.simpleicons.org/react/61dafb" alt="React logo" width="36" height="36"></a>
  <a href="https://www.typescriptlang.org/" target="_blank" rel="noreferrer"><img src="https://cdn.simpleicons.org/typescript/3178c6" alt="TypeScript logo" width="36" height="36"></a>
  <a href="https://nestjs.com/" target="_blank" rel="noreferrer"><img src="https://cdn.simpleicons.org/nestjs/e0234e" alt="NestJS logo" width="36" height="36"></a>
  <a href="https://www.postgresql.org/" target="_blank" rel="noreferrer"><img src="https://cdn.simpleicons.org/postgresql/31648c" alt="PostgreSQL logo" width="36" height="36"></a>
</p>

- Next.js `16.0.10`
- React `19.2.1`
- TypeScript `^5`
- Tailwind CSS `^4.1`
- NestJS `^11`
- Prisma `^7.2`
- PostgreSQL 16
- Socket.IO (real‑time)
- Swagger/OpenAPI
- AWS S3 (uploads via `@aws-sdk/*`)
- UI libs: `lucide-react`, `react-toastify`

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ******************************************************** ARCHITECTURE ************************************************* -->

<h2 id="architecture">Architecture</h2>

- **Frontend (`web/`)**: Next.js App Router, Tailwind UI, client + server components.
- **Backend (`api/`)**: NestJS REST + WebSocket API with JWT auth.
- **Database**: PostgreSQL with Prisma schema and migrations.
- **Infra**: Docker Compose for local dev and reproducible services.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ******************************************************** LOCAL SETUP ************************************************* -->

<h2 id="local-setup">Local Setup</h2>

```bash
# 1) Start database + API + web
docker compose up --build

# 2) Web app
# http://localhost:3000

# 3) API
# http://localhost:4000
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>
