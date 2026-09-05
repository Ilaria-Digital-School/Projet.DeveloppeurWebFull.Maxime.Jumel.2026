```bash
#!/bin/bash

# ============================================================
# AUTO UPDATE GITHUB -> DOCKER -> DISCORD
# Branche : reactdev
# ============================================================

set -u

# ------------------------------------------------------------
# CONFIGURATION
# ------------------------------------------------------------

PROJECT_DIR="/var/www/Reactdev"

BRANCH="reactdev"

# URL SSH du dépôt
REPO="git@github.com:Ilaria-Digital-School/Projet.DeveloppeurWebFull.Maxime.Jumel.2026.git"

# Webhook Discord
DISCORD_WEBHOOK="https://discordapp.com/api/webhooks/1545734185379962980/LnBXJ-q-myAXT-ND8YoRZLD0eKsI9xObIrdCBEhEXm7p43xSNQhLsAeB98rICTK0qioG"

# Nom du service/container Docker
# Si tu utilises docker compose, laisse COMPOSE_FILE.
COMPOSE_FILE="docker-compose.yml"

# Fichier de log
LOG_FILE="/var/log/github-auto-update.log"


# ------------------------------------------------------------
# FONCTIONS
# ------------------------------------------------------------

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}


discord() {

    local MESSAGE="$1"

    # Échappement JSON
    MESSAGE=$(printf '%s' "$MESSAGE" | sed \
        -e 's/\\/\\\\/g' \
        -e 's/"/\\"/g' \
        -e ':a' -e 'N' -e '$!ba' -e 's/\n/\\n/g')

    curl -sS -X POST \
        -H "Content-Type: application/json" \
        -d "{\"content\":\"$MESSAGE\"}" \
        "$DISCORD_WEBHOOK" \
        >/dev/null 2>&1
}


# ------------------------------------------------------------
# VÉRIFICATION DU DOSSIER
# ------------------------------------------------------------

if [ ! -d "$PROJECT_DIR/.git" ]; then

    log "Projet Git introuvable."

    discord "❌ **AUTO UPDATE ERROR**

Le dépôt Git est introuvable.

📁 `$PROJECT_DIR`
🌿 Branche : \`$BRANCH\`"

    exit 1
fi


cd "$PROJECT_DIR" || exit 1


# ------------------------------------------------------------
# VÉRIFICATION DE LA BRANCHE
# ------------------------------------------------------------

CURRENT_BRANCH=$(git branch --show-current)

if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then

    log "Changement vers la branche $BRANCH"

    git fetch origin "$BRANCH"

    git switch "$BRANCH" 2>&1 | tee -a "$LOG_FILE"

    if [ $? -ne 0 ]; then
        log "Impossible de changer de branche."

        discord "❌ **AUTO UPDATE ERROR**

Impossible de sélectionner la branche \`$BRANCH\`.

📁 Projet : \`$PROJECT_DIR\`"

        exit 1
    fi
fi


# ------------------------------------------------------------
# FETCH GITHUB
# ------------------------------------------------------------

log "Vérification de GitHub..."

git fetch origin "$BRANCH" >> "$LOG_FILE" 2>&1

if [ $? -ne 0 ]; then

    log "Erreur lors du git fetch."

    discord "❌ **GITHUB UPDATE ERROR**

Impossible de récupérer les informations depuis GitHub.

🌿 Branche : \`$BRANCH\`
📁 Projet : \`$PROJECT_DIR\`"

    exit 1
fi


# ------------------------------------------------------------
# COMPARAISON DES COMMITS
# ------------------------------------------------------------

LOCAL_COMMIT=$(git rev-parse HEAD)
REMOTE_COMMIT=$(git rev-parse "origin/$BRANCH")


# ------------------------------------------------------------
# AUCUNE MISE À JOUR
# ------------------------------------------------------------

if [ "$LOCAL_COMMIT" = "$REMOTE_COMMIT" ]; then

    log "Aucune mise à jour disponible."

    exit 0
fi


# ------------------------------------------------------------
# MÉTADONNÉES DU NOUVEAU COMMIT
# ------------------------------------------------------------

OLD_COMMIT_SHORT=$(git rev-parse --short HEAD)
NEW_COMMIT_SHORT=$(git rev-parse --short "origin/$BRANCH")

AUTHOR=$(git log -1 --format='%an' "origin/$BRANCH")

AUTHOR_EMAIL=$(git log -1 --format='%ae' "origin/$BRANCH")

COMMIT_MESSAGE=$(git log -1 --format='%s' "origin/$BRANCH")

COMMIT_DATE=$(git log -1 --format='%ci' "origin/$BRANCH")


log "Nouvelle mise à jour détectée."
log "Ancien commit : $OLD_COMMIT_SHORT"
log "Nouveau commit : $NEW_COMMIT_SHORT"
log "Auteur : $AUTHOR"
log "Message : $COMMIT_MESSAGE"


# ------------------------------------------------------------
# GIT PULL
# ------------------------------------------------------------

log "Téléchargement de la mise à jour..."

git pull --ff-only origin "$BRANCH" >> "$LOG_FILE" 2>&1

if [ $? -ne 0 ]; then

    log "Échec du git pull."

    discord "❌ **DEPLOYMENT FAILED**

Une mise à jour a été détectée mais le \`git pull\` a échoué.

🌿 Branche : \`$BRANCH\`
📦 Projet : \`Projet.DeveloppeurWebFull.Maxime.Jumel.2026\`

🔴 Ancien commit : \`$OLD_COMMIT_SHORT\`
🔴 Nouveau commit : \`$NEW_COMMIT_SHORT\`

👤 Auteur : $AUTHOR
📝 Message : $COMMIT_MESSAGE"

    exit 1
fi


# ------------------------------------------------------------
# DOCKER
# ------------------------------------------------------------

log "Reconstruction des conteneurs Docker..."

docker compose up -d --build >> "$LOG_FILE" 2>&1

DOCKER_STATUS=$?


# ------------------------------------------------------------
# DOCKER ERROR
# ------------------------------------------------------------

if [ $DOCKER_STATUS -ne 0 ]; then

    log "Erreur Docker."

    discord "❌ **DOCKER DEPLOYMENT FAILED**

Le code GitHub a bien été mis à jour mais Docker a rencontré une erreur.

🌿 Branche : \`$BRANCH\`

📦 Projet :
\`Projet.DeveloppeurWebFull.Maxime.Jumel.2026\`

🔴 Commit : \`$NEW_COMMIT_SHORT\`

👤 Auteur : $AUTHOR

📝 Commit :
$COMMIT_MESSAGE"

    exit 1
fi


# ------------------------------------------------------------
# SUCCÈS
# ------------------------------------------------------------

log "Déploiement terminé avec succès."


discord "🚀 **MISE À JOUR AUTOMATIQUE**

Le projet a été automatiquement mis à jour.

━━━━━━━━━━━━━━━━━━

📦 **Projet**
\`Projet.DeveloppeurWebFull.Maxime.Jumel.2026\`

🌿 **Branche**
\`$BRANCH\`

━━━━━━━━━━━━━━━━━━

🔄 **Commit**

Ancien :
\`$OLD_COMMIT_SHORT\`

Nouveau :
\`$NEW_COMMIT_SHORT\`

━━━━━━━━━━━━━━━━━━

👤 **Auteur**
$AUTHOR

📧 **Email**
$AUTHOR_EMAIL

📝 **Message**
$COMMIT_MESSAGE

📅 **Date**
$COMMIT_DATE

━━━━━━━━━━━━━━━━━━

🐳 **Docker**
✅ Build effectué
✅ Conteneurs démarrés

🌐 **Statut**
🟢 Déploiement terminé"


exit 0
```
