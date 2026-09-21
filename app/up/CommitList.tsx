import type { BranchCommit } from "./github";

const absoluteDateFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Paris",
});

/**
 * Écart relatif, calculé à l'heure du rendu serveur. La page étant revalidée
 * régulièrement, la valeur affichée ne dérive jamais de plus de quelques minutes.
 */
function formatRelative(iso: string): string {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);

  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;

  const days = Math.round(hours / 24);
  if (days < 31) return `il y a ${days} j`;

  return `il y a ${Math.round(days / 30)} mois`;
}

interface CommitListProps {
  commits: BranchCommit[];
  branch?: string;
  commitsUrl?: string;
}

export default function CommitList({
  commits,
  branch,
  commitsUrl,
}: CommitListProps) {
  if (commits.length === 0) {
    return null;
  }

  return (
    <div className="bg-secondary bg-opacity-10 border border-secondary rounded-3 p-4 mt-4">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <h2 className="h6 text-secondary text-uppercase fw-semibold mb-0">
          Derniers commits
        </h2>
        {commitsUrl && (
          <a
            href={commitsUrl}
            target="_blank"
            rel="noreferrer"
            className="link-info small fw-semibold text-decoration-none"
          >
            {branch ? `Tout voir sur ${branch}` : "Tout voir sur GitHub"}
          </a>
        )}
      </div>

      <ol className="list-unstyled mb-0">
        {commits.map((commit) => (
          <li
            key={commit.sha}
            className="d-flex flex-column flex-sm-row align-items-sm-center gap-1 gap-sm-3 py-2 border-bottom border-secondary"
          >
            <a
              href={commit.commitUrl}
              target="_blank"
              rel="noreferrer"
              className="badge text-bg-dark border border-secondary font-monospace text-decoration-none flex-shrink-0"
            >
              {commit.shortSha}
            </a>
            <span className="text-light flex-grow-1">{commit.message}</span>
            <span
              className="small text-secondary text-nowrap"
              title={absoluteDateFormatter.format(new Date(commit.committedAt))}
            >
              {commit.authorLogin ?? commit.authorName} ·{" "}
              {formatRelative(commit.committedAt)}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
