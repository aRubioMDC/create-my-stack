import inquirer from 'inquirer';

export interface UserAnswers {
  projectName: string;
  stack: 'Node.js + Express' | 'Node.js + Fastify' | 'Next.js';
  database: 'PostgreSQL' | 'MongoDB' | 'MySQL' | 'Ninguna';
  cicd: 'GitHub Actions' | 'Ninguno';
  githubToken: string;
  isPrivate: boolean;
}

export async function askQuestions(): Promise<UserAnswers> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'What is the project name?',
      default: 'my-project',
    },
    {
      type: 'list',
      name: 'stack',
      message: 'Which stack do you prefer?',
      choices: ['Node.js + Express', 'Node.js + Fastify', 'Next.js'],
    },
    {
      type: 'list',
      name: 'database',
      message: 'Which database do you want to use?',
      choices: ['PostgreSQL', 'MongoDB', 'MySQL', 'Ninguna'],
    },
    {
      type: 'list',
      name: 'cicd',
      message: 'Do you want to configure CI/CD?',
      choices: ['GitHub Actions', 'Ninguno'],
    },
    {
      type: 'password',
      name: 'githubToken',
      message: 'Your GitHub Personal Access Token?',
    },
    {
      type: 'confirm',
      name: 'isPrivate',
      message: 'Will the repository be private?',
      default: true,
    },
  ]);

  return answers as UserAnswers;
}
