import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import chalk from 'chalk';
import ora from 'ora';
import { UserAnswers } from './cli';

const TEMPLATES_DIR = path.join(__dirname, 'templates');

export async function setupProject(answers: UserAnswers): Promise<void> {
  const projectDir = path.resolve(process.cwd(), answers.projectName);

  createProjectDir(projectDir);
  writePackageJson(projectDir, answers);
  writeTsConfig(projectDir, answers);
  writeEntryFile(projectDir, answers);

  if (answers.cicd === 'GitHub Actions') {
    copyGitHubActionsTemplate(projectDir, answers);
  }

  installDependencies(projectDir, answers);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createProjectDir(dir: string): void {
  const spinner = ora(`Creando directorio ${path.basename(dir)}...`).start();
  fs.mkdirSync(dir, { recursive: true });
  spinner.succeed(chalk.green(`Directorio creado: ${path.basename(dir)}`));
}

function writePackageJson(dir: string, answers: UserAnswers): void {
  const devScript = answers.stack === 'Next.js' ? 'next dev' : 'ts-node src/index.ts';
  const buildScript = answers.stack === 'Next.js' ? 'next build' : 'tsc';
  const startScript = answers.stack === 'Next.js' ? 'next start' : 'node dist/index.js';

  const pkg = {
    name: answers.projectName,
    version: '0.1.0',
    description: `Proyecto generado con create-my-stack`,
    scripts: {
      dev: devScript,
      build: buildScript,
      start: startScript,
    },
  };

  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(pkg, null, 2) + '\n');
}

function writeTsConfig(dir: string, answers: UserAnswers): void {
  if (answers.stack === 'Next.js') return; // Next.js genera su propio tsconfig

  const tsconfig = {
    compilerOptions: {
      target: 'ES2020',
      module: 'commonjs',
      outDir: './dist',
      rootDir: './src',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist'],
  };

  fs.writeFileSync(path.join(dir, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2) + '\n');
}

function writeEntryFile(dir: string, answers: UserAnswers): void {
  const srcDir = path.join(dir, 'src');
  fs.mkdirSync(srcDir, { recursive: true });

  let content = '';

  if (answers.stack === 'Node.js + Express') {
    content = [
      "import express from 'express';",
      '',
      'const app = express();',
      'const PORT = process.env.PORT ?? 3000;',
      '',
      "app.use(express.json());",
      '',
      "app.get('/', (_req, res) => {",
      "  res.json({ message: 'Hello World' });",
      '});',
      '',
      'app.listen(PORT, () => {',
      "  console.log(`Server running on http://localhost:${PORT}`);",
      '});',
    ].join('\n');
  } else if (answers.stack === 'Node.js + Fastify') {
    content = [
      "import Fastify from 'fastify';",
      '',
      'const fastify = Fastify({ logger: true });',
      'const PORT = Number(process.env.PORT ?? 3000);',
      '',
      "fastify.get('/', async () => {",
      "  return { message: 'Hello World' };",
      '});',
      '',
      'fastify.listen({ port: PORT }, (err) => {',
      '  if (err) { fastify.log.error(err); process.exit(1); }',
      '});',
    ].join('\n');
  } else {
    // Next.js: crear página básica
    const pagesDir = path.join(dir, 'pages');
    fs.mkdirSync(pagesDir, { recursive: true });
    content = [
      "export default function Home() {",
      "  return <h1>Hello World</h1>;",
      "}",
    ].join('\n');
    fs.writeFileSync(path.join(pagesDir, 'index.tsx'), content + '\n');
    return;
  }

  fs.writeFileSync(path.join(srcDir, 'index.ts'), content + '\n');
}

function copyGitHubActionsTemplate(dir: string, answers: UserAnswers): void {
  const spinner = ora('Copiando plantilla de GitHub Actions...').start();

  const templateMap: Record<UserAnswers['stack'], string> = {
    'Node.js + Express': 'node-express.yml',
    'Node.js + Fastify': 'node-fastify.yml',
    'Next.js': 'nextjs.yml',
  };

  const templateFile = templateMap[answers.stack];
  const srcTemplate = path.join(TEMPLATES_DIR, 'github-actions', templateFile);
  const destWorkflow = path.join(dir, '.github', 'workflows', 'ci.yml');

  fs.mkdirSync(path.dirname(destWorkflow), { recursive: true });

  if (fs.existsSync(srcTemplate)) {
    fs.copyFileSync(srcTemplate, destWorkflow);
    spinner.succeed(chalk.green('Plantilla de CI/CD copiada (.github/workflows/ci.yml)'));
  } else {
    spinner.warn(chalk.yellow(`Plantilla no encontrada: ${templateFile}`));
  }
}

function installDependencies(dir: string, answers: UserAnswers): void {
  const spinner = ora('Instalando dependencias...').start();

  const deps = resolveDeps(answers);

  try {
    if (deps.length > 0) {
      execSync(`npm install ${deps.join(' ')}`, { cwd: dir, stdio: 'ignore' });
    }
    execSync('npm install --save-dev typescript @types/node ts-node', {
      cwd: dir,
      stdio: 'ignore',
    });
    spinner.succeed(chalk.green('Dependencias instaladas.'));
  } catch {
    spinner.fail(chalk.red('Error al instalar dependencias. Ejecuta npm install manualmente.'));
  }
}

function resolveDeps(answers: UserAnswers): string[] {
  const deps: string[] = [];

  if (answers.stack === 'Node.js + Express') deps.push('express', '@types/express');
  if (answers.stack === 'Node.js + Fastify') deps.push('fastify');
  if (answers.stack === 'Next.js') deps.push('next', 'react', 'react-dom', '@types/react');

  if (answers.database === 'PostgreSQL') deps.push('pg', '@types/pg');
  if (answers.database === 'MongoDB') deps.push('mongoose');
  if (answers.database === 'MySQL') deps.push('mysql2');

  return deps;
}
