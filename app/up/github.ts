/**
 * Récupération des informations d'une branche Git via l'API REST GitHub.
 *
 * Ces fonctions tournent côté serveur uniquement (Server Component / Route Handler) :
 * elles ne doivent jamais être importées depuis un composant "use client", sinon le
 * token éventuel (GITHUB_TOKEN) se retrouverait exposé au navigateur.
 *
 * Variables d'environnement (toutes optionnelles) :
 *   GITHUB_TOKEN      : token GitHub, utile seulement pour lever la limite de 60 req/h.
 *   GITHUB_OWNER      : propriétaire du dépôt (défaut : Ilaria-Digital-School).
 *   GITHUB_REPO       : nom du dépôt.
 *   GITHUB_BRANCH     : branche surveillée (défaut : reactdev).
 *   GITHUB_REVALIDATE : durée de cache en secondes (défaut : 300).
 *   GITHUB_COMMITS    : nombre de commits listés (défaut : 5).
 */

const GITHUB_API = "https://api.github.com";

const OWNER = process.env.GITHUB_OWNER ?? "Ilaria-Digital-School";
const REPO =
  process.env.GITHUB_REPO ?? "Projet.DeveloppeurWebFull.Maxime.Jumel.2026";
const BRANCH = process.env.GITHUB_BRANCH ?? "reactdev";

const REVALIDATE_SECONDS = Number(process.env.GITHUB_REVALIDATE ?? 300);

/**
 * Tag de cache Next.js commun à toutes les lectures GitHub (branche, tags,
 * commits) : purgeable d'un coup via revalidateTag(GITHUB_CACHE_TAG, "max").
 */
export const GITHUB_CACHE_TAG = "github-branch";

export interface BranchInfo {
  /** "propriétaire/dépôt" */
  repo: string;
  repoUrl: string;
  branch: string;
  /** SHA complet du dernier commit de la branche. */
  sha: string;
  /** SHA abrégé à 7 caractères, pour l'affichage. */
  shortSha: string;
  /** Première ligne du message du dernier commit. */
  message: string;
  authorName: string;
  authorLogin: string | null;
  authorAvatar: string | null;
  /** Date ISO 8601 du dernier commit. */
  committedAt: string;
  commitUrl: string;
  commitsUrl: string;
  /** Nombre de commits de la branche, null si GitHub ne l'expose pas. */
  commitCount: number | null;
  /** Tag le plus récent du dépôt, null s'il n'y en a aucun. */
  latestTag: string | null;
  /** true quand le dernier commit de la branche porte le tag le plus récent. */
  tagIsOnBranchHead: boolean;
}

interface GitHubBranchResponse {
  name: string;
  commit: {
    sha: string;
    html_url: string;
    commit: {
      message: string;
      author: { name?: string; date?: string } | null;
    };
    author: { login?: string; avatar_url?: string } | null;
  };
}

interface GitHubTagResponse {
  name: string;
  commit: { sha: string };
}

interface GitHubCommitResponse {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: { name?: string; date?: string } | null;
  };
  author: { login?: string } | null;
}

/** Un commit tel qu'affiché dans la liste de la page Git. */
export interface BranchCommit {
  sha: string;
  shortSha: string;
  /** Première ligne du message de commit. */
  message: string;
  authorName: string;
  authorLogin: string | null;
  committedAt: string;
  commitUrl: string;
}

/** Nombre de commits listés par défaut (surchargeable via GITHUB_COMMITS). */
const COMMITS_LIMIT = Number(process.env.GITHUB_COMMITS ?? 5);

interface GitHubErrorBody {
  message?: string;
}

/**
 * Traduit un refus de GitHub en message exploitable : quota épuisé, token
 * invalide, ou politique de l'organisation sur les tokens fine-grained.
 */
async function describeFailure(
  response: Response,
  path: string,
): Promise<string> {
  const body = (await response.json().catch(() => null)) as GitHubErrorBody | null;
  const detail = body?.message ? ` — ${body.message}` : "";

  if (response.status === 401) {
    return `token GitHub invalide (401) sur ${path}${detail}`;
  }

  if (response.status === 403 || response.status === 429) {
    const remaining = response.headers.get("x-ratelimit-remaining");
    const reset = response.headers.get("x-ratelimit-reset");

    if (remaining === "0" && reset) {
      const resetTime = new Date(Number(reset) * 1000).toLocaleTimeString(
        "fr-FR",
        { timeZone: "Europe/Paris" },
      );
      return `quota GitHub épuisé (${response.status}) sur ${path}, réinitialisation à ${resetTime}${detail}`;
    }
  }

  return `GitHub API ${response.status} ${response.statusText} sur ${path}${detail}`;
}

function sendRequest(
  path: string,
  token?: string,
  force = false,
): Promise<Response> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const init: RequestInit & {
    next?: { revalidate: number; tags: string[] };
  } = { headers };

  // "force" court-circuite le cache de données : revalidateTag() marque bien
  // l'entrée comme périmée, mais la requête en cours continue de recevoir
  // l'ancienne valeur. Une purge explicite doit relire GitHub tout de suite.
  if (force) {
    init.cache = "no-store";
  } else {
    init.next = { revalidate: REVALIDATE_SECONDS, tags: [GITHUB_CACHE_TAG] };
  }

  return fetch(`${GITHUB_API}${path}`, init);
}

async function githubFetch(path: string, force = false): Promise<Response> {
  const token = process.env.GITHUB_TOKEN;
  const response = await sendRequest(path, token, force);

  if (response.ok) {
    return response;
  }

  // Un token refusé (quota, expiration, politique de l'organisation) ne doit pas
  // priver la page de données publiques : on retente en accès anonyme.
  if (token && (response.status === 401 || response.status === 403)) {
    const anonymous = await sendRequest(path, undefined, force);

    if (anonymous.ok) {
      console.warn(
        `[github] token refusé (${response.status}) sur ${path}, repli en accès anonyme.`,
      );
      return anonymous;
    }

    throw new Error(
      `${await describeFailure(response, path)} (échec aussi en anonyme : ${anonymous.status})`,
    );
  }

  throw new Error(await describeFailure(response, path));
}

/**
 * Dernier tag du dépôt (l'API les renvoie du plus récent au plus ancien).
 * Un dépôt sans tag renvoie simplement un tableau vide.
 */
async function getLatestTag(force = false): Promise<GitHubTagResponse | null> {
  const response = await githubFetch(
    `/repos/${OWNER}/${REPO}/tags?per_page=1`,
    force,
  );
  const tags = (await response.json()) as GitHubTagResponse[];
  return tags[0] ?? null;
}

/**
 * Compte les commits d'une branche sans paginer : on demande une seule entrée
 * et on lit le numéro de la dernière page dans l'en-tête "Link".
 */
function readCommitCount(response: Response): number | null {
  const link = response.headers.get("link") ?? "";
  const lastPage = /[?&]page=(\d+)>;\s*rel="last"/.exec(link);
  if (lastPage) {
    return Number(lastPage[1]);
  }
  // Sans en-tête Link, GitHub n'a renvoyé qu'une seule page.
  return 1;
}

/**
 * Dernière valeur connue et délai de refroidissement après un échec : sans ce
 * garde-fou, chaque affichage de la page relançait trois appels à GitHub et
 * écrivait une stack trace dans les logs.
 */
const FAILURE_COOLDOWN_MS = 60_000;
let lastGoodInfo: BranchInfo | null = null;
let lastGoodCommits: BranchCommit[] = [];
let lastFailureAt = 0;

/**
 * Informations du dernier commit d'une branche.
 * Renvoie la dernière valeur connue (ou null) au lieu de lever si le dépôt, la
 * branche, le réseau ou le quota sont indisponibles, afin que la page garde un
 * rendu de repli.
 */
export async function getBranchInfo(
  branch: string = BRANCH,
  { force = false }: { force?: boolean } = {},
): Promise<BranchInfo | null> {
  const repoPath = `/repos/${OWNER}/${REPO}`;
  const repoUrl = `https://github.com/${OWNER}/${REPO}`;

  if (
    !force &&
    lastFailureAt !== 0 &&
    Date.now() - lastFailureAt < FAILURE_COOLDOWN_MS
  ) {
    return lastGoodInfo;
  }

  try {
    const [branchResponse, commitsResponse] = await Promise.all([
      githubFetch(`${repoPath}/branches/${encodeURIComponent(branch)}`, force),
      githubFetch(
        `${repoPath}/commits?sha=${encodeURIComponent(branch)}&per_page=1`,
        force,
      ),
    ]);

    const data = (await branchResponse.json()) as GitHubBranchResponse;
    const latestTag = await getLatestTag(force).catch(() => null);

    const sha = data.commit.sha;
    const commitDate = data.commit.commit.author?.date;

    const info: BranchInfo = {
      repo: `${OWNER}/${REPO}`,
      repoUrl,
      branch: data.name,
      sha,
      shortSha: sha.slice(0, 7),
      message: data.commit.commit.message.split("\n")[0],
      authorName: data.commit.commit.author?.name ?? "Auteur inconnu",
      authorLogin: data.commit.author?.login ?? null,
      authorAvatar: data.commit.author?.avatar_url ?? null,
      committedAt: commitDate ?? new Date().toISOString(),
      commitUrl: data.commit.html_url,
      commitsUrl: `${repoUrl}/commits/${data.name}`,
      commitCount: readCommitCount(commitsResponse),
      latestTag: latestTag?.name ?? null,
      tagIsOnBranchHead: latestTag?.commit.sha === sha,
    };

    lastGoodInfo = info;
    lastFailureAt = 0;
    return info;
  } catch (error) {
    lastFailureAt = Date.now();
    console.error(
      `[github] impossible de lire la branche ${branch} de ${OWNER}/${REPO} : ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return lastGoodInfo;
  }
}

/**
 * Les N derniers commits d'une branche.
 * Même politique que getBranchInfo : valeurs de repli plutôt qu'exception.
 */
export async function getRecentCommits(
  limit: number = COMMITS_LIMIT,
  branch: string = BRANCH,
  { force = false }: { force?: boolean } = {},
): Promise<BranchCommit[]> {
  if (
    !force &&
    lastFailureAt !== 0 &&
    Date.now() - lastFailureAt < FAILURE_COOLDOWN_MS
  ) {
    return lastGoodCommits;
  }

  try {
    const response = await githubFetch(
      `/repos/${OWNER}/${REPO}/commits?sha=${encodeURIComponent(branch)}&per_page=${limit}`,
      force,
    );

    const commits = (await response.json()) as GitHubCommitResponse[];

    const mapped = commits.map((commit) => ({
      sha: commit.sha,
      shortSha: commit.sha.slice(0, 7),
      message: commit.commit.message.split("\n")[0],
      authorName: commit.commit.author?.name ?? "Auteur inconnu",
      authorLogin: commit.author?.login ?? null,
      committedAt: commit.commit.author?.date ?? new Date().toISOString(),
      commitUrl: commit.html_url,
    }));

    lastGoodCommits = mapped;
    lastFailureAt = 0;
    return mapped;
  } catch (error) {
    lastFailureAt = Date.now();
    console.error(
      `[github] impossible de lister les commits de ${branch} : ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return lastGoodCommits;
  }
}

export interface GitOverview {
  info: BranchInfo | null;
  commits: BranchCommit[];
  /** Durée de vie du cache serveur, en secondes. */
  revalidate: number;
  /** true quand GitHub a refusé de répondre et que le cache prend le relais. */
  stale: boolean;
}

/**
 * Lit branche et commits en une seule passe, pour la page et l'API JSON.
 * `force` ignore le cache et interroge GitHub directement (purge manuelle).
 */
export async function getGitOverview(
  { force = false }: { force?: boolean } = {},
): Promise<GitOverview> {
  const options = { force };
  const [info, commits] = await Promise.all([
    getBranchInfo(BRANCH, options),
    getRecentCommits(COMMITS_LIMIT, BRANCH, options),
  ]);

  return {
    info,
    commits,
    revalidate: REVALIDATE_SECONDS,
    stale: lastFailureAt !== 0,
  };
}
