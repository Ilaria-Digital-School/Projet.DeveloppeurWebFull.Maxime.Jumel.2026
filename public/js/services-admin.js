// Pilotage des modals d'administration des prestations (réservé aux administrateurs).
const serviceAdminAlert = (type, message) => {
  const box = document.getElementById("serviceAdminAlert");
  if (!box) return;
  box.className = `alert alert-${type} py-2 px-3 small mb-0`;
  box.textContent = message;
};

const request = async (url, options) => {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Erreur serveur.");
  return data;
};

const reload = () => window.location.reload();

const setButtonBusy = (button, busy, idleLabel) => {
  if (!button) return;
  if (busy) {
    button.dataset.idleLabel = button.textContent;
    button.disabled = true;
    button.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Enregistrement…`;
  } else {
    button.disabled = false;
    button.textContent = idleLabel;
  }
};

// ── Formulaire catégorie ─────────────────────────────────────────────
const categoryForm = document.getElementById("formCategory");
if (categoryForm) {
  const iconInput = document.getElementById("catIcon");
  const iconPreview = document.getElementById("catIconPreview");

  iconInput.addEventListener("input", () => {
    const value = iconInput.value.trim();
    iconPreview.className = `bi ${value || "bi-code-slash"}`;
  });

  categoryForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const button = document.getElementById("btnSaveCategory");

    const name = document.getElementById("catName").value.trim();
    const description = document.getElementById("catDescription").value.trim();
    const icon = iconInput.value.trim();

    if (!name || !description || !icon) {
      serviceAdminAlert("warning", "Tous les champs sont requis.");
      return;
    }

    const editing = categoryForm.dataset.editId;
    setButtonBusy(button, true);
    try {
      await request(editing ? `/update-category/${editing}` : "/create-category", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name, description, icon }),
      });
      reload();
    } catch (error) {
      serviceAdminAlert("danger", error.message);
      setButtonBusy(button, false, "Enregistrer");
    }
  });
}

// ── Formulaire service ───────────────────────────────────────────────
const serviceForm = document.getElementById("formService");
if (serviceForm) {
  serviceForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const button = document.getElementById("btnSaveService");

    const name = document.getElementById("svcName").value.trim();
    const description = document.getElementById("svcDescription").value.trim();
    const categoryId = document.getElementById("svcCategory").value;

    if (!name || !description || !categoryId) {
      serviceAdminAlert("warning", "Tous les champs sont requis.");
      return;
    }

    const editing = serviceForm.dataset.editId;
    setButtonBusy(button, true);
    try {
      await request(editing ? `/update-service/${editing}` : "/create-service", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name, description, categoryId }),
      });
      reload();
    } catch (error) {
      serviceAdminAlert("danger", error.message);
      setButtonBusy(button, false, "Enregistrer");
    }
  });
}

// Le titre du modal vit dans son en-tête, hors du <form> : on cible le modal.
const setModalTitle = (modalId, text) => {
  const title = document.querySelector(`#${modalId} [data-modal-title]`);
  if (title) title.textContent = text;
};

const clearAlert = (id) => {
  const box = document.getElementById(id);
  if (box) box.replaceChildren();
};

// ── Ouverture des modals de formulaire ───────────────────────────────
document.addEventListener("show.bs.modal", (event) => {
  const trigger = event.relatedTarget;
  if (!trigger) return;

  // Un seul modal à la fois : on referme la gestion avant d'ouvrir un formulaire,
  // sinon deux backdrops se superposent.
  const targetId = event.target.id;
  if (targetId === "modalCategoryEdit" || targetId === "modalServiceEdit") {
    const adminModal = document.getElementById("modalServiceAdmin");
    const instance = adminModal && window.bootstrap?.Modal.getInstance(adminModal);
    if (instance) instance.hide();
  }

  const id = trigger.dataset.id;
  const action = trigger.dataset.action;

  if (action === "new-category") {
    categoryForm.reset();
    delete categoryForm.dataset.editId;
    document.getElementById("catIconPreview").className = "bi bi-code-slash";
    setModalTitle("modalCategoryEdit", "Nouvelle catégorie");
    clearAlert("categoryAlert");
  }

  if (action === "edit-category") {
    categoryForm.dataset.editId = id;
    document.getElementById("catName").value = trigger.dataset.name;
    document.getElementById("catIcon").value = trigger.dataset.icon;
    document.getElementById("catIconPreview").className = `bi ${trigger.dataset.icon}`;
    document.getElementById("catDescription").value = trigger.dataset.description;
    setModalTitle("modalCategoryEdit", "Modifier la catégorie");
    clearAlert("categoryAlert");
  }

  if (action === "new-service") {
    serviceForm.reset();
    delete serviceForm.dataset.editId;
    setModalTitle("modalServiceEdit", "Nouveau service");
    clearAlert("serviceAlert");
  }

  if (action === "edit-service") {
    serviceForm.dataset.editId = id;
    document.getElementById("svcName").value = trigger.dataset.name;
    document.getElementById("svcDescription").value = trigger.dataset.description;
    document.getElementById("svcCategory").value = trigger.dataset.category;
    setModalTitle("modalServiceEdit", "Modifier le service");
    clearAlert("serviceAlert");
  }
});

// ── Suppressions ─────────────────────────────────────────────────────
document.addEventListener("click", async (event) => {
  const trigger = event.target.closest("[data-action^='delete-']");
  if (!trigger) return;

  const action = trigger.dataset.action;
  const label = trigger.dataset.name;
  const question = action === "delete-category"
    ? `Supprimer la catégorie « ${label} » ?`
    : `Supprimer le service « ${label} » ?`;

  if (!window.confirm(question)) return;

  trigger.disabled = true;
  try {
    await request(`/delete-${action.replace("delete-", "")}/${trigger.dataset.id}`, {
      method: "DELETE",
      headers: { Accept: "application/json" },
    });
    reload();
  } catch (error) {
    serviceAdminAlert("danger", error.message);
    trigger.disabled = false;
  }
});