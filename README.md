# Secure Bank App

A simplified banking application built with Next.js and Prisma. 

> **⚠️ WARNING:** This application contains **intentional security vulnerabilities** (e.g., weak password storage, potential prototype pollution points) for educational and testing purposes. Do not use this code or configuration in a production environment.

## Tech Stack

*   **Framework:** [Next.js 16](https://nextjs.org/) (App Directory)
*   **Language:** TypeScript
*   **Database:** PostgreSQL
*   **ORM:** [Prisma](https://www.prisma.io/)
*   **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
*   **Infrastructure:** Docker & Docker Compose

## Prerequisites

*   Node.js (v20+ recommended)
*   npm, yarn, or pnpm
*   Docker & Docker Compose (for the database)

## Getting Started

Follow these steps to set up the project locally.

### 1. Clone the repository

```bash
git clone <repository-url>
cd secure-bank-app
```

### 2. Install Dependencies

```bash
npm install

```

### 3. Start the Database

This project uses Docker to host a PostgreSQL database.

```bash
docker-compose up -d
```

The database will be available at `localhost:5440`.

**Credentials:**
*   **User:** `bank_admin`
*   **Password:** `secure_password_123`
*   **Database:** `bank_db`

### 4. Setup Prisma

Set your environment variables with the ".env" file. 
You may copy the contents of the ".env.example" file.

```bash
cp .env.example .env
```

Generate the Prisma client and push the schema to the database.

```bash
# Generate the client
npx prisma generate

# Push the schema to the DB (creates tables)
npx prisma db push
```

### 5. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Schema

The database consists of two main models:

*   **User**: Stores account information.
    *   *Note:* Passwords are currently stored insecurely (plain text/weak hash).
    *   Includes a `settings` JSON field.
*   **Transaction**: Records transfers between users.

You can verify the database state using Prisma Studio:

```bash
npx prisma studio
```

## Vulnerabilities

This project is designed to demonstrate specific security flaws, including but not limited to:

1.  **Encoded Password Exposure**: Passwords in the `User` model may be stored without proper hashing/salting.
2.  **Prototype Pollution**: The loose `settings` JSON field in the `User` model is a potential vector for prototype pollution attacks.
