import chalk from 'chalk';
import ora from 'ora';
import { UserAnswers } from './cli';

interface GitHubRepoResponse {
  html_url: string;
  clone_url: string;
}

interface GitHubErrorResponse {
  message: string;
}

export async function createGitHubRepo(answers: UserAnswers): Promise<void> {
  const token = process.env.GITHUB_TOKEN;

  if (!token) {
    console.warn(
      chalk.yellow('\n⚠  GITHUB_TOKEN no encontrado en las variables de entorno.'),
    );
    console.warn(chalk.dim('   Exporta el token y vuelve a ejecutar para crear el repositorio.'));
    return;
  }

  const spinner = ora('Creando repositorio en GitHub...').start();

  try {
    const response = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({
        name: answers.projectName,
        description: `Proyecto generado con create-my-stack (${answers.stack})`,
        private: false,
        auto_init: false,
      }),
    });

    if (!response.ok) {
      const err = (await response.json()) as GitHubErrorResponse;
      throw new Error(err.message);
    }

    const repo = (await response.json()) as GitHubRepoResponse;

    spinner.succeed(chalk.green(`Repositorio creado: ${repo.html_url}`));
    console.log(chalk.dim(`\n   git remote add origin ${repo.clone_url}`));
  } catch (error) {
    spinner.fail(chalk.red('No se pudo crear el repositorio en GitHub.'));
    throw error;
  }
}
