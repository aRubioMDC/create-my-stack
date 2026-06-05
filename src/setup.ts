import { execa } from 'execa';
import fs from 'fs';
import path from 'path';
import { UserAnswers } from './cli';

type Stack = UserAnswers['stack'];
type Database = UserAnswers['database'];
type Cicd = UserAnswers['cicd'];

export class SetupService {
  private projectName: string;
  private stack: Stack;
  private database: Database;
  private cicd: Cicd;
  private username: string;

  constructor(projectName: string, stack: Stack, database: Database, cicd: Cicd, username: string) {
    this.projectName = projectName;
    this.stack = stack;
    this.database = database;
    this.cicd = cicd;
    this.username = username;
  }

  async cloneRepo(): Promise<void> {
    const url = `https://github.com/${this.username}/${this.projectName}`;
    try {
      await execa('git', ['clone', url]);
    } catch (error) {
      throw new Error(`No se pudo clonar el repositorio: ${(error as Error).message}`);
    }
  }

  async generateBaseFiles(): Promise<void> {
    const projectDir = path.resolve(process.cwd(), this.projectName);
    try {
      fs.writeFileSync(path.join(projectDir, '.env.example'), this.buildEnvExample());
      fs.writeFileSync(path.join(projectDir, 'README.md'), this.buildReadme());
    } catch (error) {
      throw new Error(`No se pudieron generar los archivos base: ${(error as Error).message}`);
    }
  }

  async installDependencies(): Promise<void> {
    const projectDir = path.resolve(process.cwd(), this.projectName);
    try {
      await execa('npm', ['install'], { cwd: projectDir });
    } catch (error) {
      throw new Error(`Error al instalar dependencias: ${(error as Error).message}`);
    }
  }

  async openInVSCode(): Promise<void> {
    try {
      await execa('code', [this.projectName]);
    } catch (error) {
      throw new Error(`No se pudo abrir VS Code: ${(error as Error).message}`);
    }
  }

  async copyCICD(): Promise<void> {
    const projectDir = path.resolve(process.cwd(), this.projectName);
    let src = '';
    let dest = '';
    let destDir = '';

    if (this.cicd === 'None') return;

    if (this.cicd === 'GitHub Actions') {
      const templateMap: Record<string, string> = {
        'Node.js + Express': 'node-express.yml',
        'Node.js + Fastify': 'node-fastify.yml',
        'Next.js': 'nextjs.yml',
      };

      const templateFile = templateMap[this.stack];
      if (!templateFile) return;

      destDir = path.join(projectDir, '.github', 'workflows');
      src = path.join(__dirname, 'templates/github-actions/', templateFile);
      dest = path.join(destDir, 'ci.yml');
    } else if (this.cicd === 'Azure DevOps') {
      destDir = path.join(projectDir, '.azure');
      src = path.join(__dirname, 'templates/azure-devops/azure-pipelines.yml');
      dest = path.join(destDir, 'azure-pipelines.yml');
    } else if (this.cicd === 'GitLab CI') {
      src = path.join(__dirname, 'templates/gitlab-ci/.gitlab-ci.yml');
      dest = path.join(projectDir, '.gitlab-ci.yml');
    }

    try {
      if (destDir) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      fs.copyFileSync(src, dest);
    } catch (error) {
      throw new Error(`No se pudo copiar el archivo de CI/CD: ${(error as Error).message}`);
    }
  }

  // ---------------------------------------------------------------------------
  // Builders privados
  // ---------------------------------------------------------------------------

  private buildEnvExample(): string {
    const lines = ['# Variables de entorno', 'NODE_ENV=development', 'PORT=3000', ''];

    if (this.database === 'PostgreSQL') {
      lines.push('# PostgreSQL', 'DATABASE_URL=postgresql://user:password@localhost:5432/dbname', '');
    } else if (this.database === 'MongoDB') {
      lines.push('# MongoDB', 'MONGODB_URI=mongodb://localhost:27017/dbname', '');
    } else if (this.database === 'MySQL') {
      lines.push(
        '# MySQL',
        'MYSQL_HOST=localhost',
        'MYSQL_PORT=3306',
        'MYSQL_USER=root',
        'MYSQL_PASSWORD=password',
        'MYSQL_DATABASE=dbname',
        '',
      );
    }

    return lines.join('\n');
  }

  private buildReadme(): string {
    return [
      `# ${this.projectName}`,
      '',
      'Proyecto generado con **create-my-stack**.',
      '',
      '## Stack',
      '',
      `- **Framework:** ${this.stack}`,
      `- **Base de datos:** ${this.database}`,
      '',
      '## Inicio rápido',
      '',
      '```bash',
      'cp .env.example .env',
      'npm install',
      'npm run dev',
      '```',
    ].join('\n');
  }
}
