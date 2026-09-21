import type { Metadata } from "next";
import GitUpload from "./upgrade_git";
import { getGitOverview } from "./github";

export const metadata: Metadata = {
  title: "Upgrade Git",
  description:
    "Suivi des versions, branches et tags des templates de développement Souflydev.",
};

// La page est mise en cache puis régénérée en arrière-plan : les appels à l'API
// GitHub ne sont pas refaits à chaque visite.
export const revalidate = 300;

export default async function UpgradeGitPage() {
  const { info, commits, revalidate } = await getGitOverview();

  return (
    <GitUpload
      title="Upgrade Git"
      description="Retrouvez ici la version, la branche et le tag du projet. Chaque mise à jour de nos templates de développement est publiée depuis ce dépôt Git."
      version={1}
      branch={info?.branch ?? "reactdev"}
      tag={info?.latestTag ?? undefined}
      info={info}
      commits={commits}
      cacheSeconds={revalidate}
    />
  );
}
