import inquirer from 'inquirer';

export interface UserAnswers {
  projectName: string;
  stack: 'Node.js + Express' | 'Node.js + Fastify' | 'Next.js';
  database: 'PostgreSQL' | 'MongoDB' | 'MySQL' | 'Ninguna';
  cicd: 'GitHub Actions' | 'Ninguno';
}

export async function askQuestions(): Promise<UserAnswers> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: '¿Cuál es el nombre del proyecto?',
      default: 'my-project',
    },
    {
      type: 'list',
      name: 'stack',
      message: '¿Qué stack prefieres?',
      choices: ['Node.js + Express', 'Node.js + Fastify', 'Next.js'],
    },
    {
      type: 'list',
      name: 'database',
      message: '¿Qué base de datos deseas usar?',
      choices: ['PostgreSQL', 'MongoDB', 'MySQL', 'Ninguna'],
    },
    {
      type: 'list',
      name: 'cicd',
      message: '¿Deseas configurar CI/CD?',
      choices: ['GitHub Actions', 'Ninguno'],
    },
  ]);

  return answers as UserAnswers;
}
