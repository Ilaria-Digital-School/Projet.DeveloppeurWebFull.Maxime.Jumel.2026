import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { GITHUB_CACHE_TAG, getGitOverview } from "../../up/github";

// La route lit des données externes : jamais de rendu figé au build.
export const dynamic = "force-dynamic";

/** Délai minimal entre deux purges manuelles, pour protéger le quota GitHub. */
const PURGE_COOLDOWN_MS = 30_000;
let lastPurgeAt = 0;

/**
 * GET /api/git
 *   -> instantané JSON de la branche surveillée et de ses derniers commits.
 * GET /api/git?refresh=1
 *   -> purge d'abord le cache serveur (tag GitHub + route /up), puis relit.
 */
export async function GET(request: Request) {
  const wantsRefresh = new URL(request.url).searchParams.get("refresh") === "1";

  let purged = false;
  let purgeSkipped: string | null = null;

  if (wantsRefresh) {
    const sinceLastPurge = Date.now() - lastPurgeAt;

    if (sinceLastPurge < PURGE_COOLDOWN_MS) {
      purgeSkipped = `purge déjà effectuée il y a ${Math.round(sinceLastPurge / 1000)} s`;
    } else {
      lastPurgeAt = Date.now();
      revalidateTag(GITHUB_CACHE_TAG, "max");
      revalidatePath("/up");
      purged = true;
    }
  }

  // `purged` implique une relecture réelle de GitHub, pas seulement un marquage
  // du cache : la réponse renvoyée est donc garantie fraîche.
  const { info, commits, revalidate, stale } = await getGitOverview({
    force: purged,
  });

  return NextResponse.json(
    {
      branch: info,
      commits,
      meta: {
        revalidate,
        stale,
        purged,
        purgeSkipped,
        generatedAt: new Date().toISOString(),
      },
    },
    {
      headers: {
        "Cache-Control": purged
          ? "no-store"
          : `s-maxage=${revalidate}, stale-while-revalidate=${revalidate}`,
      },
    },
  );
}
