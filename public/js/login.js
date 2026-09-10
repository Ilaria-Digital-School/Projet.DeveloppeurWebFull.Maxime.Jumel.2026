 const form = document.getElementById("loginForm");
      const msgContainer = document.getElementById("message-container");
      const btnSubmit = document.getElementById("btnSubmit");

      const showMessage = (type, iconClass, message) => {
        const alert = document.createElement("div");
        alert.className = `alert alert-${type} py-2 px-3 small mb-0`;
        alert.setAttribute("role", "alert");
        const icon = document.createElement("i");
        icon.className = `bi ${iconClass} me-1`;
        alert.append(icon, document.createTextNode(String(message)));
        msgContainer.replaceChildren(alert);
      };

      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        msgContainer.replaceChildren();

        const email = document.getElementById("inputEmail").value.trim();
        const password = document.getElementById("inputPassword").value;

        btnSubmit.disabled = true;
        btnSubmit.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Connexion en cours...`;

        try {
          const response = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
          });

          const data = await response.json();

          if (response.ok && data.success) {
            showMessage("success", "bi-check-circle-fill", data.message || "Connexion réussie.");
            setTimeout(() => {
              window.location.href = data.redirect || "/dashboard";
            }, 1000);
          } else {
            showMessage("danger", "bi-exclamation-circle-fill", data.message || "Email ou mot de passe incorrect.");
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = "Se connecter";
          }
        } catch (error) {
          console.error("Erreur:", error);
          showMessage("danger", "bi-x-circle-fill", "Impossible de contacter le serveur.");
          btnSubmit.disabled = false;
          btnSubmit.innerHTML = "Se connecter";
        }
      });