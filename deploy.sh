#!/usr/bin/env bash
# Met à jour le serveur de production : pull de la dernière version puis rebuild Docker.
# Usage (sur le serveur, depuis le dossier du projet) : ./deploy.sh [remote] [branche]
set -euo pipefail

REMOTE="${1:-origin}"
BRANCH="${2:-main}"

cd "$(dirname "$0")"

echo "==> Récupération de $REMOTE/$BRANCH"
git fetch "$REMOTE" "$BRANCH"
git checkout "$BRANCH"
git pull --ff-only "$REMOTE" "$BRANCH"

echo "==> Build et redémarrage des conteneurs"
docker compose up -d --build

echo "==> Nettoyage des anciennes images"
docker image prune -f

echo "==> État des conteneurs"
docker compose ps

echo "Déploiement terminé : $(git rev-parse --short HEAD)"
