import { Octokit } from '@octokit/rest';

export class GitHubService {
  private octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({ auth: token });
  }

  async getUsername(): Promise<string> {
    try {
      const { data } = await this.octokit.rest.users.getAuthenticated();
      return data.login;
    } catch (error) {
      throw new Error(`No se pudo obtener el usuario autenticado: ${(error as Error).message}`);
    }
  }

  async createRepo(name: string, isPrivate: boolean): Promise<void> {
    try {
      await this.octokit.request('POST /user/repos', {
        name,
        private: isPrivate,
        auto_init: true,
        headers: { 'X-GitHub-Api-Version': '2022-11-28' },
      });
    } catch (error) {
      throw new Error(`No se pudo crear el repositorio "${name}": ${(error as Error).message}`);
    }
  }

  async createBranches(repo: string, branches: string[]): Promise<void> {
    try {
      const owner = await this.getUsername();

      // Obtener el SHA del último commit de main
      const { data: ref } = await this.octokit.rest.git.getRef({
        owner,
        repo,
        ref: 'heads/main',
      });
      const mainSha = ref.object.sha;

      for (const branch of branches) {
        try {
          await this.octokit.rest.git.createRef({
            owner,
            repo,
            ref: `refs/heads/${branch}`,
            sha: mainSha,
          });
        } catch (error) {
          throw new Error(`No se pudo crear la rama "${branch}": ${(error as Error).message}`);
        }
      }
    } catch (error) {
      throw new Error(`Error al crear ramas en "${repo}": ${(error as Error).message}`);
    }
  }

  async protectBranch(repo: string, branch: string): Promise<void> {
    try {
      const owner = await this.getUsername();

      await this.octokit.rest.repos.updateBranchProtection({
        owner,
        repo,
        branch,
        required_status_checks: null,
        enforce_admins: true,
        required_pull_request_reviews: {
          required_approving_review_count: 1,
          dismiss_stale_reviews: true,
        },
        restrictions: null,
      });
    } catch (error) {
      throw new Error(
        `No se pudo proteger la rama "${branch}" en "${repo}": ${(error as Error).message}`,
      );
    }
  }
}
