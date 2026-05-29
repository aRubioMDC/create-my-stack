import { Command } from 'commander';
import chalk from 'chalk';
import { askQuestions } from './cli';
import { setupProject } from './setup';
import { createGitHubRepo } from './github';

const program = new Command();

program
  .name('create-my-stack')
  .description('CLI para crear proyectos con stack y CI/CD configurados')
  .version('1.0.0');

program
  .command('create')
  .description('Crear un nuevo proyecto interactivamente')
  .action(async () => {
    console.log(chalk.bold.cyan('\n🚀  create-my-stack\n'));

    try {
      const answers = await askQuestions();
      await setupProject(answers);

      if (answers.cicd === 'GitHub Actions') {
        await createGitHubRepo(answers);
      }

      console.log(chalk.green.bold('\n✅  ¡Proyecto listo!'));
      console.log(chalk.dim(`\n  cd ${answers.projectName}`));
      console.log(chalk.dim('  npm run dev\n'));
    } catch (error) {
      console.error(chalk.red('\n❌  Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program.parse(process.argv);
