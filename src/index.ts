import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { askQuestions } from './cli';
import { GitHubService } from './github';
import { SetupService } from './setup';

const program = new Command();

program
  .name('create-my-stack')
  .description('CLI to create projects with stack and CI/CD configured')
  .version('1.0.0')
  .argument('<projectName>', 'Name of the project to create')
  .action(async (projectName: string) => {
    console.log(chalk.bold.cyan('\n🚀  create-my-stack\n'));

    const answers = await askQuestions();

    console.log(chalk.bold('\n📋  Project summary:'));
    console.log(`  ${chalk.dim('Name:')}          ${chalk.white(answers.projectName)}`);
    console.log(`  ${chalk.dim('Stack:')}         ${chalk.white(answers.stack)}`);
    console.log(`  ${chalk.dim('Database:')}      ${chalk.white(answers.database)}`);
    console.log(`  ${chalk.dim('CI/CD:')}         ${chalk.white(answers.cicd)}`);
    console.log(`  ${chalk.dim('Private:')}       ${chalk.white(answers.isPrivate ? 'Yes' : 'No')}`);
    console.log('');

    const gh = new GitHubService(answers.githubToken);
    const username = await gh.getUsername();

    // 1. Crear repositorio
    let spinner = ora('Creating repository on GitHub...').start();
    try {
      await gh.createRepo(answers.projectName, answers.isPrivate);
      spinner.succeed(chalk.green('Repository created.'));
    } catch (error) {
      spinner.fail(chalk.red(`Error creating repository: ${(error as Error).message}`));
      process.exit(1);
    }

    // 2. Crear ramas develop y staging
    spinner = ora('Creating develop and staging branches...').start();
    try {
      await gh.createBranches(answers.projectName, ['develop', 'staging']);
      spinner.succeed(chalk.green('Develop and staging branches created.'));
    } catch (error) {
      spinner.fail(chalk.red(`Error creating branches: ${(error as Error).message}`));
      process.exit(1);
    }

    // 3. Proteger rama main
    if (answers.isPrivate) {
      console.log(
        chalk.yellow('⚠  Branch protection requires GitHub Pro for private repositories. Skipping.'),
      );
    } else {
      spinner = ora('Protecting main branch...').start();
      try {
        await gh.protectBranch(answers.projectName, 'main');
        spinner.succeed(chalk.green('Main branch protected.'));
      } catch (error) {
        spinner.fail(chalk.red(`Error protecting main: ${(error as Error).message}`));
        process.exit(1);
      }
    }

    const repoUrl = `https://github.com/${username}/${answers.projectName}`;

    const setup = new SetupService(answers.projectName, answers.stack, answers.database, username);

    // 4. Clonar repositorio
    spinner = ora('Cloning repository...').start();
    try {
      await setup.cloneRepo();
      spinner.succeed(chalk.green('Repository cloned.'));
    } catch (error) {
      spinner.fail(chalk.red(`Error cloning repository: ${(error as Error).message}`));
      process.exit(1);
    }

    // 5. Generar archivos base
    spinner = ora('Generating base files...').start();
    try {
      await setup.generateBaseFiles();
      spinner.succeed(chalk.green('Base files generated (.env.example, README.md).'));
    } catch (error) {
      spinner.fail(chalk.red(`Error generating files: ${(error as Error).message}`));
      process.exit(1);
    }

    // 6. Instalar dependencias
    spinner = ora('Installing dependencies...').start();
    try {
      await setup.installDependencies();
      spinner.succeed(chalk.green('Dependencies installed.'));
    } catch (error) {
      spinner.fail(chalk.red(`Error installing dependencies: ${(error as Error).message}`));
      process.exit(1);
    }

    // 7. Configurar CI/CD
    spinner = ora('Configuring CI/CD...').start();
    try {
      await setup.copyCICD();
      spinner.succeed(chalk.green('CI/CD configured.'));
    } catch (error) {
      spinner.fail(chalk.red(`Error configuring CI/CD: ${(error as Error).message}`));
      process.exit(1);
    }

    // 8. Abrir en VS Code
    spinner = ora('Opening in VS Code...').start();
    try {
      await setup.openInVSCode();
      spinner.succeed(chalk.green('Project opened in VS Code.'));
    } catch (error) {
      spinner.fail(chalk.yellow(`Could not open VS Code: ${(error as Error).message}`));
    }

    console.log(chalk.green.bold('\n✅  Project ready!'));
    console.log(`  ${chalk.dim('Repository:')} ${chalk.cyan(repoUrl)}`);
    console.log(`  ${chalk.dim('Next step:')} ${chalk.white(`cd ${answers.projectName} && npm run dev`)}\n`);
  });

program.parse(process.argv);
