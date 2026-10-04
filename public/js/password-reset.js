// Gere les deux formulaires « mot de passe oublie » et « nouveau mot de passe ».
const showResetMessage = (type, iconClass, message) => {
  const form = document.getElementById("forgotPasswordForm") || document.getElementById("resetPasswordForm");
  if (!form) return;

  let box = document.getElementById("passwordResetMessage");
  if (!box) {
    box = document.createElement("div");
    box.id = "passwordResetMessage";
    box.className = "alert py-2 px-3 small text-start mt-3 mb-0";
    box.setAttribute("role", "alert");
    form.parentNode.insertBefore(box, form);
  }

  box.className = `alert alert-${type} py-2 px-3 small text-start mt-3 mb-0`;
  box.replaceChildren();

  const icon = document.createElement("i");
  icon.className = `bi ${iconClass} me-1`;
  box.append(icon, document.createTextNode(String(message)));
};

const setSubmitting = (button, label) => {
  if (!button) return;
  button.disabled = true;
  button.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>${label}`;
};

const restoreSubmit = (button, label) => {
  if (!button) return;
  button.disabled = false;
  button.innerHTML = label;
};

// ── Demande de lien de réinitialisation ──────────────────────────────
const forgotForm = document.getElementById("forgotPasswordForm");
if (forgotForm) {
  const button = document.getElementById("btnSubmit");

  forgotForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("inputEmail").value.trim();
    if (!email) {
      showResetMessage("danger", "bi-exclamation-circle-fill", "Renseignez votre adresse email.");
      return;
    }

    setSubmitting(button, "Envoi en cours...");

    try {
      const response = await fetch("/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (response.ok) {
        // La réponse est identique que le compte existe ou non.
        window.location.href = "/forgot-password?envoye=1";
      } else {
        showResetMessage("danger", "bi-x-circle-fill", data.message || "Impossible d'envoyer le lien.");
        restoreSubmit(button, "Envoyer le lien");
      }
    } catch {
      showResetMessage("danger", "bi-x-circle-fill", "Impossible de contacter le serveur.");
      restoreSubmit(button, "Envoyer le lien");
    }
  });
}

// ── Choix du nouveau mot de passe ────────────────────────────────────
const resetForm = document.getElementById("resetPasswordForm");
if (resetForm) {
  const button = document.getElementById("btnSubmit");
  const token = resetForm.dataset.token;

  resetForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const password = document.getElementById("inputPassword").value;
    const confirmation = document.getElementById("inputConfirmation").value;

    if (password.length < 6) {
      showResetMessage("danger", "bi-exclamation-circle-fill", "Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (password !== confirmation) {
      showResetMessage("danger", "bi-exclamation-circle-fill", "Les deux mots de passe ne correspondent pas.");
      return;
    }

    setSubmitting(button, "Enregistrement...");

    try {
      const response = await fetch(`/reset-password/${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, confirmation }),
      });
      const data = await response.json();

      if (response.ok) {
        window.location.href = data.redirect || "/reset-password/termine";
      } else {
        showResetMessage("danger", "bi-x-circle-fill", data.message || "Impossible de mettre à jour le mot de passe.");
        restoreSubmit(button, "Mettre à jour");
      }
    } catch {
      showResetMessage("danger", "bi-x-circle-fill", "Impossible de contacter le serveur.");
      restoreSubmit(button, "Mettre à jour");
    }
  });
}