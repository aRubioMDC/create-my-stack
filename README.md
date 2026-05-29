# create-my-stack

CLI interactivo para andamiar proyectos Node.js con stack, base de datos y CI/CD preconfigurados.

## Stacks soportados

| Stack | Base de datos | CI/CD |
|---|---|---|
| Node.js + Express | PostgreSQL, MongoDB, MySQL, Ninguna | GitHub Actions |
| Node.js + Fastify | PostgreSQL, MongoDB, MySQL, Ninguna | GitHub Actions |
| Next.js | PostgreSQL, MongoDB, MySQL, Ninguna | GitHub Actions |

## Uso

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Compilar
npm run build

# Ejecutar el binario compilado
node dist/index.js create
```

## Variables de entorno

| Variable | Descripción |
|---|---|
| `GITHUB_TOKEN` | Personal Access Token de GitHub para crear el repositorio automáticamente. Requiere el scope `repo`. |

```bash
export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
```

## Estructura generada

```
mi-proyecto/
├── src/
│   └── index.ts
├── .github/
│   └── workflows/
│       └── ci.yml        # Solo si se eligió GitHub Actions
├── package.json
└── tsconfig.json
```

## Desarrollo

```bash
# Compilar TypeScript
npm run build

# Ejecutar directamente con ts-node
npx ts-node src/index.ts create
```
