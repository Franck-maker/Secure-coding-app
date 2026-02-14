# Secure Bank App

A simplified banking application built with Next.js and Prisma. 

> ⚠️ This application contains intentional security vulnerabilities (e.g., weak password storage, code injection) for the purposes of the related course. Do not use this code or configuration in a production environment.

## Tech Stack
*   **Framework:** [Next.js 16](https://nextjs.org/) (App Directory)
*   **Language:** TypeScript
*   **Database:** PostgreSQL
*   **ORM:** [Prisma](https://www.prisma.io/)
*   **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
*   **Infrastructure:** Docker & Docker Compose

## Prerequisites

- Docker & Docker Compose (verified with Docker Desktop v4.60.0)
- Only locally: NodeJS (verified with Node v24.12.0 and NPM v11.9.0)

## Getting Started

Kick start the application with either Docker Compose (production mode) or locally (development mode).

### With Docker Compose

Follow these steps to set up the project via Docker.

#### 1. Clone the repository

```bash
git clone https://github.com/Franck-maker/Secure-coding-app.git
cd Secure-coding-app
```

#### 2. Run Docker Compose

Run this project as Docker containers with Docker Compose.
```bash
docker compose up -d --build
```

Wait for a few minutes so that the fullstack application builds and the different containers setup themselves.  
When the application is ready, http://localhost:3000 is available.

### Or Locally

Run the database with Docker Compose.
```bash
docker compose up postgres -d
```

Set the environment variables to .env; you may copy .env.example: `cp .env.example .env`

Install web dependencies and deploy the database migrations.
```bash
npm ci
npm run db:deploy
```

Optionally: run the database tool management with Docker Compose.
```bash
docker compose up prisma-studio -d
``` 

Run the fullstack application as develop
```bash
npm run dev
```

## The Application 

### Fullstack Application

Open http://localhost:3000 with your browser to see the result.

### Database

The database will be available at `localhost:5440`.

It consists of two main models:
*   **User**: Stores account information.
    *   *Note:* Passwords are currently stored insecurely (plain text/weak hash).
*   **Transaction**: Records transfers between users.

#### Prisma Studio 

You can verify the database state using Prisma Studio: http://localhost:5555

### Available users

- test@ema.il (password: "12345")
- admin@ema.il (password: "12345"): is an admin
