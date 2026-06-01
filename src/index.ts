import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { askQuestions } from './cli';
import { GitHubService } from './github';
import { SetupService } from './setup';

const program = new Command();

program
  .name('create-my-stack')
  .description('CLI para crear proyectos con stack y CI/CD configurados')
  .version('1.0.0')
  .argument('<projectName>', 'Nombre del proyecto a crear')
  .action(async (projectName: string) => {
    console.log(chalk.bold.cyan('\n🚀  create-my-stack\n'));

    const answers = await askQuestions();

    console.log(chalk.bold('\n📋  Resumen del proyecto:'));
    console.log(`  ${chalk.dim('Nombre:')}        ${chalk.white(answers.projectName)}`);
    console.log(`  ${chalk.dim('Stack:')}         ${chalk.white(answers.stack)}`);
    console.log(`  ${chalk.dim('Base de datos:')} ${chalk.white(answers.database)}`);
    console.log(`  ${chalk.dim('CI/CD:')}         ${chalk.white(answers.cicd)}`);
    console.log(`  ${chalk.dim('Privado:')}       ${chalk.white(answers.isPrivate ? 'Sí' : 'No')}`);
    console.log('');

    const gh = new GitHubService(answers.githubToken);
    const username = await gh.getUsername();

    // 1. Crear repositorio
    let spinner = ora('Creando repositorio en GitHub...').start();
    try {
      await gh.createRepo(answers.projectName, answers.isPrivate);
      spinner.succeed(chalk.green('Repositorio creado.'));
    } catch (error) {
      spinner.fail(chalk.red(`Error al crear el repositorio: ${(error as Error).message}`));
      process.exit(1);
    }

    // 2. Crear ramas develop y staging
    spinner = ora('Creando ramas develop y staging...').start();
    try {
      await gh.createBranches(answers.projectName, ['develop', 'staging']);
      spinner.succeed(chalk.green('Ramas develop y staging creadas.'));
    } catch (error) {
      spinner.fail(chalk.red(`Error al crear ramas: ${(error as Error).message}`));
      process.exit(1);
    }

    // 3. Proteger rama main
    if (answers.isPrivate) {
      console.log(
        chalk.yellow('⚠  Branch protection requiere GitHub Pro en repositorios privados. Omitiendo.'),
      );
    } else {
      spinner = ora('Protegiendo rama main...').start();
      try {
        await gh.protectBranch(answers.projectName, 'main');
        spinner.succeed(chalk.green('Rama main protegida.'));
      } catch (error) {
        spinner.fail(chalk.red(`Error al proteger main: ${(error as Error).message}`));
        process.exit(1);
      }
    }

    const repoUrl = `https://github.com/${username}/${answers.projectName}`;

    const setup = new SetupService(answers.projectName, answers.stack, answers.database, username);

    // 4. Clonar repositorio
    spinner = ora('Clonando repositorio...').start();
    try {
      await setup.cloneRepo();
      spinner.succeed(chalk.green('Repositorio clonado.'));
    } catch (error) {
      spinner.fail(chalk.red(`Error al clonar: ${(error as Error).message}`));
      process.exit(1);
    }

    // 5. Generar archivos base
    spinner = ora('Generando archivos base...').start();
    try {
      await setup.generateBaseFiles();
      spinner.succeed(chalk.green('Archivos base generados (.env.example, README.md).'));
    } catch (error) {
      spinner.fail(chalk.red(`Error al generar archivos: ${(error as Error).message}`));
      process.exit(1);
    }

    // 6. Instalar dependencias
    spinner = ora('Instalando dependencias...').start();
    try {
      await setup.installDependencies();
      spinner.succeed(chalk.green('Dependencias instaladas.'));
    } catch (error) {
      spinner.fail(chalk.red(`Error al instalar dependencias: ${(error as Error).message}`));
      process.exit(1);
    }

    // 7. Abrir en VS Code
    spinner = ora('Abriendo en VS Code...').start();
    try {
      await setup.openInVSCode();
      spinner.succeed(chalk.green('Proyecto abierto en VS Code.'));
    } catch (error) {
      spinner.fail(chalk.yellow(`No se pudo abrir VS Code: ${(error as Error).message}`));
    }

    console.log(chalk.green.bold('\n✅  ¡Proyecto listo!'));
    console.log(`  ${chalk.dim('Repositorio:')} ${chalk.cyan(repoUrl)}`);
    console.log(`  ${chalk.dim('Siguiente paso:')} ${chalk.white(`cd ${answers.projectName} && npm run dev`)}\n`);
  });

program.parse(process.argv);
