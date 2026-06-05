# 🚀 create-my-stack-cli

> CLI that automates the complete project setup in seconds.
> One command creates your GitHub repo, configures branches,
> installs dependencies, generates CI/CD, and opens VS Code ready to work.

[![npm version](https://img.shields.io/npm/v/create-my-stack-cli)](https://www.npmjs.com/package/create-my-stack-cli)
[![npm downloads](https://img.shields.io/npm/dw/create-my-stack-cli)](https://www.npmjs.com/package/create-my-stack-cli)
[![license](https://img.shields.io/npm/l/create-my-stack-cli)](https://www.npmjs.com/package/create-my-stack-cli)

## Demo

```bash
npx create-my-stack-cli my-project
```

## What it does

- ✅ Creates the repository on GitHub
- ✅ Configures main, develop and staging branches
- ✅ Protects main with required PR reviews (public repos)
- ✅ Clones the project locally
- ✅ Generates `.env.example` based on your database
- ✅ Sets up CI/CD pipeline with GitHub Actions
- ✅ Installs dependencies automatically
- ✅ Opens VS Code ready to work

## Requirements

- Node.js >= 18 (via [nvm](https://github.com/nvm-sh/nvm) or direct install)
- Git installed
- GitHub Personal Access Token with `repo` and `workflow` scopes

→ [How to create a token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)

> If using nvm, run `nvm use 18` or `nvm use --lts` before running the CLI.

## Usage

```bash
npx create-my-stack-cli <project-name>
```

The CLI will guide you through interactive prompts:

```
? What is the project name?              my-project
? What stack do you prefer?              Node.js + Express
? What database do you want to use?      PostgreSQL
? Do you want to set up CI/CD?           GitHub Actions
? Your GitHub Personal Access Token?     [hidden]
? Should the repository be private?      No
```

## Supported stacks

| Stack             | Database                          | CI/CD          |
|-------------------|-----------------------------------|----------------|
| Node.js + Express | PostgreSQL, MongoDB, MySQL, None  | GitHub Actions |
| Node.js + Fastify | PostgreSQL, MongoDB, MySQL, None  | GitHub Actions |
| Next.js           | PostgreSQL, MongoDB, MySQL, None  | GitHub Actions |

## Roadmap Pro

- Auth pre-configured (JWT + bcrypt)
- Docker + docker-compose
- Prisma pre-configured
- Stripe integrated

## Contributing

PRs and issues are welcome! Feel free to open one.

## License

MIT © [aRubioMDC](https://github.com/aRubioMDC)

---

Made with ❤️ by [aRubioMDC](https://github.com/aRubioMDC)
