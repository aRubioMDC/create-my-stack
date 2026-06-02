# 🚀 create-my-stack

> CLI that automates the complete project setup in seconds.
> One command creates your GitHub repo, configures branches,
> installs dependencies, generates CI/CD, and opens VS Code ready to work.

[![npm](https://img.shields.io/npm/v/create-my-stack-cli)](https://www.npmjs.com/package/create-my-stack-cli)

## Demo

```bash
npx create-my-stack my-project
```

## What it does

- ✅ Creates the repository on GitHub
- ✅ Configures main, develop, and staging branches
- ✅ Protects main with required PR reviews
- ✅ Clones the project locally
- ✅ Generates `.env.example` based on your database
- ✅ Sets up CI/CD pipeline with GitHub Actions
- ✅ Installs dependencies automatically
- ✅ Opens VS Code ready to work

## Supported stacks

| Stack             | Database                          | CI/CD          |
|-------------------|-----------------------------------|----------------|
| Node.js + Express | PostgreSQL, MongoDB, MySQL, None  | GitHub Actions |
| Node.js + Fastify | PostgreSQL, MongoDB, MySQL, None  | GitHub Actions |
| Next.js           | PostgreSQL, MongoDB, MySQL, None  | GitHub Actions |

## Requirements

- Node.js 18+
- Git installed
- GitHub Personal Access Token with `repo` and `workflow` scopes

## Usage

```bash
npx create-my-stack <project-name>
```

The CLI will guide you through interactive prompts.

## Roadmap

- Auth pre-configured (JWT + bcrypt)
- Docker + docker-compose
- Prisma pre-configured
- Stripe integrated

---

Made with ❤️ by [aRubioMDC](https://github.com/aRubioMDC)
