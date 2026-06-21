/* ============================================================
   result.js — Clients table, pagination, actions, KPI, modals
   ============================================================ */

// ── Data ──────────────────────────────────────────────────────
const clients = [
    { id: 1, name: "Antoine Morel",   email: "antoine.morel@email.com",   message: "Maintenance et mises à jour de mon site.", date: "2026-05-14", status: "Pending" },
    { id: 2, name: "Julie Fontaine",  email: "julie.fontaine@email.com",  message: "Audit de performance de mon site web.", date: "2026-05-20", status: "Pending" },
    { id: 3, name: "Romain Girard",   email: "romain.girard@email.com",   message: "Création d'un portfolio créatif.", date: "2026-05-28", status: "Approved" },
    { id: 4, name: "Elisa Dupuis",    email: "elisa.dupuis@email.com",    message: "Développement d'une API REST.", date: "2026-06-01", status: "Pending" },
    { id: 5, name: "Pierre Leclerc",  email: "pierre.leclerc@email.com",  message: "Migration vers un nouveau CMS.", date: "2026-06-05", status: "Pending" },
    { id: 6, name: "Sophie Renard",   email: "sophie.renard@email.com",   message: "Stratégie de contenu et SEO.", date: "2026-06-08", status: "Approved" },
    { id: 7, name: "Thomas Poirier",  email: "thomas.poirier@email.com",  message: "Site multilingue pour export international.", date: "2026-06-10", status: "Pending" },
    { id: 8, name: "Clara Mercier",   email: "clara.mercier@email.com",   message: "Intégration d'outils analytics avancés.", date: "2026-06-13", status: "Pending" },
    { id: 9, name: "Florian Bonnet",  email: "florian.bonnet@email.com",  message: "Refonte complète avec design system.", date: "2026-06-17", status: "Approved" },
];

// ── DOM refs ──────────────────────────────────────────────────
const searchInput       = document.getElementById("search");
const tbody             = document.getElementById("clients-tbody");
const paginationContainer = document.getElementById("pagination-container");
const noResults         = document.getElementById("no-results");
const tableCountBadge   = document.getElementById("table-count-badge");

// KPI refs
const kpiTotal    = document.getElementById("kpi-total");
const kpiApproved = document.getElementById("kpi-approved");
const kpiPending  = document.getElementById("kpi-pending");

// Modal refs
const clientModalEl  = document.getElementById("clientModal");
const clientModalTitle = document.getElementById("clientModalLabel");
const clientModalBody  = document.getElementById("clientModalBody");
const saveClientBtn    = document.getElementById("saveClientBtn");
const deleteModalEl    = document.getElementById("deleteModal");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

const clientModal = clientModalEl  ? new bootstrap.Modal(clientModalEl)  : null;
const deleteModal = deleteModalEl  ? new bootstrap.Modal(deleteModalEl)  : null;

// ── State ─────────────────────────────────────────────────────
let currentPage     = 1;
const itemsPerPage  = 7;
let filteredClients = [...clients];
let pendingDeleteId = null;
let editMode        = false;

// ── Helpers ───────────────────────────────────────────────────
function splitName(fullName) {
    const parts = fullName.trim().split(" ");
    return { first: parts[0] || "", last: parts.slice(1).join(" ") || "-" };
}

function getHandle(first, last) {
    return `@${first.charAt(0).toLowerCase()}${last.replace(/\s+/g, "").toLowerCase()}`;
}

function getScopeInfo(id) {
    const mod = id % 3;
    if (mod === 0) return { label: "Mobile", cls: "bg-info text-dark" };
    if (mod === 1) return { label: "SEO",    cls: "bg-success text-white" };
    return           { label: "Web",    cls: "bg-primary text-white" };
}

function getStatusInfo(status) {
    switch (status) {
        case "Approved": return { cls: "bg-success text-white",     icon: "bi-check-circle-fill" };
        case "Declined": return { cls: "bg-danger text-white",      icon: "bi-x-circle-fill" };
        default:         return { cls: "bg-warning text-dark",      icon: "bi-hourglass-split" };
    }
}

function formatDate(dateStr) {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

// ── KPI update ────────────────────────────────────────────────
function updateKPIs() {
    const total    = clients.length;
    const approved = clients.filter(c => c.status === "Approved").length;
    const pending  = clients.filter(c => c.status === "Pending").length;
    const rate     = Math.round((approved / total) * 100);

    if (kpiTotal)    animateCount(kpiTotal,    total);
    if (kpiApproved) {
        animateCount(kpiApproved, approved);
        const trendEl = kpiApproved.closest(".kpi-card").querySelector(".kpi-trend");
        if (trendEl) trendEl.textContent = `Taux ${rate}%`;
    }
    if (kpiPending)  animateCount(kpiPending,  pending);
}

function animateCount(el, target) {
    let current = 0;
    const step = Math.ceil(target / 20);
    const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = current;
        if (current >= target) clearInterval(timer);
    }, 40);
}

// ── Render table ──────────────────────────────────────────────
function displayClients() {
    if (!tbody) return;
    tbody.innerHTML = "";

    const total = filteredClients.length;

    if (tableCountBadge) {
        tableCountBadge.textContent = `${total} contact${total !== 1 ? "s" : ""}`;
    }

    if (total === 0) {
        if (noResults) noResults.classList.remove("d-none");
        if (paginationContainer) paginationContainer.innerHTML = "";
        return;
    }
    if (noResults) noResults.classList.add("d-none");

    // Clamp page
    const totalPages = Math.ceil(total / itemsPerPage);
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const start = (currentPage - 1) * itemsPerPage;
    const end   = Math.min(start + itemsPerPage, total);
    const slice = filteredClients.slice(start, end);

    slice.forEach((client, idx) => {
        const { first, last } = splitName(client.name);
        const handle = getHandle(first, last);
        const scope  = getScopeInfo(client.id);
        const stat   = getStatusInfo(client.status);

        const tr = document.createElement("tr");
        tr.dataset.id = client.id;
        tr.innerHTML = `
            <th scope="row" class="ps-3 text-muted" style="font-weight:500">${start + idx + 1}</th>
            <td class="fw-semibold">${escHtml(first)}</td>
            <td class="text-muted">${escHtml(last)}</td>
            <td><code class="text-primary" style="font-size:0.8rem">${escHtml(handle)}</code></td>
            <td class="text-center">
                <span class="badge badge-scope ${scope.cls}" style="border-radius:6px;font-size:.68rem">${scope.label}</span>
            </td>
            <td class="text-center">
                <span class="badge badge-status ${stat.cls}" style="border-radius:6px;font-size:.68rem">
                    <i class="bi ${stat.icon} me-1"></i>${escHtml(client.status)}
                </span>
            </td>
            <td class="text-center pe-3">
                <button class="btn btn-primary   btn-action btn-view   me-1" data-id="${client.id}" title="Voir" aria-label="Voir client ${escHtml(client.name)}"><i class="bi bi-eye"></i></button>
                <button class="btn btn-warning   btn-action btn-edit   me-1" data-id="${client.id}" title="Modifier" aria-label="Modifier client ${escHtml(client.name)}"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-danger    btn-action btn-delete"      data-id="${client.id}" title="Supprimer" aria-label="Supprimer client ${escHtml(client.name)}"><i class="bi bi-trash3"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    attachActionListeners();
    renderPagination(total, totalPages, start + 1, end);
}

// ── Sanitise ──────────────────────────────────────────────────
function escHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

// ── Action listeners ──────────────────────────────────────────
function attachActionListeners() {
    document.querySelectorAll(".btn-view").forEach(btn => {
        btn.addEventListener("click", () => openViewModal(parseInt(btn.dataset.id)));
    });
    document.querySelectorAll(".btn-edit").forEach(btn => {
        btn.addEventListener("click", () => openEditModal(parseInt(btn.dataset.id)));
    });
    document.querySelectorAll(".btn-delete").forEach(btn => {
        btn.addEventListener("click", () => openDeleteModal(parseInt(btn.dataset.id)));
    });
}

// ── VIEW modal ────────────────────────────────────────────────
function openViewModal(id) {
    const client = clients.find(c => c.id === id);
    if (!client || !clientModal) return;

    editMode = false;
    const { first, last } = splitName(client.name);
    const scope = getScopeInfo(client.id);
    const stat  = getStatusInfo(client.status);

    clientModalTitle.textContent = `Fiche client — ${client.name}`;
    saveClientBtn.classList.add("d-none");

    clientModalBody.innerHTML = `
        <div class="d-flex align-items-center gap-3 mb-4">
            <div style="width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#003bfd,#8b5cf6);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:1.2rem;flex-shrink:0">
                ${escHtml(first.charAt(0))}${escHtml(last !== "-" ? last.charAt(0) : "")}
            </div>
            <div>
                <div class="fw-bold fs-6">${escHtml(client.name)}</div>
                <div class="text-muted small">${escHtml(client.email)}</div>
            </div>
        </div>
        <div class="client-detail-row">
            <span class="client-detail-label">Scope</span>
            <span class="badge ${scope.cls} badge-scope">${scope.label}</span>
        </div>
        <div class="client-detail-row">
            <span class="client-detail-label">Statut</span>
            <span class="badge ${stat.cls} badge-status"><i class="bi ${stat.icon} me-1"></i>${escHtml(client.status)}</span>
        </div>
        <div class="client-detail-row">
            <span class="client-detail-label">Date</span>
            <span>${formatDate(client.date)}</span>
        </div>
        <div class="client-detail-row">
            <span class="client-detail-label">Message</span>
            <span class="text-muted">${escHtml(client.message)}</span>
        </div>
    `;
    clientModal.show();
}

// ── EDIT modal ────────────────────────────────────────────────
function openEditModal(id) {
    const client = clients.find(c => c.id === id);
    if (!client || !clientModal) return;

    editMode = true;
    const { first, last } = splitName(client.name);

    clientModalTitle.innerHTML = `<i class="bi bi-pencil-square text-primary me-2"></i>Modifier — ${escHtml(client.name)}`;
    saveClientBtn.classList.remove("d-none");
    saveClientBtn.dataset.id = id;

    clientModalBody.innerHTML = `
        <div class="mb-3">
            <label class="form-label fw-semibold small">Prénom</label>
            <input type="text" class="form-control" id="edit-first" value="${escHtml(first)}">
        </div>
        <div class="mb-3">
            <label class="form-label fw-semibold small">Nom</label>
            <input type="text" class="form-control" id="edit-last" value="${escHtml(last !== "-" ? last : "")}">
        </div>
        <div class="mb-3">
            <label class="form-label fw-semibold small">Email</label>
            <input type="email" class="form-control" id="edit-email" value="${escHtml(client.email)}">
        </div>
        <div class="mb-3">
            <label class="form-label fw-semibold small">Statut</label>
            <select class="form-select" id="edit-status">
                <option value="Pending"  ${client.status === "Pending"  ? "selected" : ""}>Pending</option>
                <option value="Approved" ${client.status === "Approved" ? "selected" : ""}>Approved</option>
                <option value="Declined" ${client.status === "Declined" ? "selected" : ""}>Declined</option>
            </select>
        </div>
        <div class="mb-1">
            <label class="form-label fw-semibold small">Message</label>
            <textarea class="form-control" id="edit-message" rows="3">${escHtml(client.message)}</textarea>
        </div>
    `;
    clientModal.show();
}

// Save edit
if (saveClientBtn) {
    saveClientBtn.addEventListener("click", () => {
        const id = parseInt(saveClientBtn.dataset.id);
        const client = clients.find(c => c.id === id);
        if (!client) return;

        const first   = document.getElementById("edit-first")?.value.trim() || client.name.split(" ")[0];
        const last    = document.getElementById("edit-last")?.value.trim()  || "";
        const email   = document.getElementById("edit-email")?.value.trim()  || client.email;
        const status  = document.getElementById("edit-status")?.value        || client.status;
        const message = document.getElementById("edit-message")?.value.trim()|| client.message;

        client.name    = last ? `${first} ${last}` : first;
        client.email   = email;
        client.status  = status;
        client.message = message;

        clientModal.hide();
        updateKPIs();
        displayClients();
        showToast("Modifications sauvegardées ✓", "success");
    });
}

// ── DELETE modal ──────────────────────────────────────────────
function openDeleteModal(id) {
    pendingDeleteId = id;
    if (deleteModal) deleteModal.show();
}

if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", () => {
        if (pendingDeleteId == null) return;
        const idx = clients.findIndex(c => c.id === pendingDeleteId);
        if (idx !== -1) clients.splice(idx, 1);
        filteredClients = filteredClients.filter(c => c.id !== pendingDeleteId);
        pendingDeleteId = null;
        deleteModal.hide();
        updateKPIs();
        displayClients();
        showToast("Client supprimé.", "danger");
    });
}

// ── Pagination ────────────────────────────────────────────────
function renderPagination(total, totalPages, from, to) {
    if (!paginationContainer) return;

    if (totalPages <= 1) {
        paginationContainer.innerHTML = `
            <span class="text-secondary small">Affichage de <strong>${from}</strong> à <strong>${to}</strong> sur <strong>${total}</strong> clients</span>
        `;
        return;
    }

    // Build page buttons (show max 5 around current)
    let pageButtons = "";
    const range = 2;
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - range && i <= currentPage + range)) {
            pageButtons += `<li class="page-item ${currentPage === i ? "active" : ""}">
                <button class="page-link btn-page-num" data-page="${i}">${i}</button>
            </li>`;
        } else if (i === currentPage - range - 1 || i === currentPage + range + 1) {
            pageButtons += `<li class="page-item disabled"><span class="page-link">…</span></li>`;
        }
    }

    paginationContainer.innerHTML = `
        <span class="text-secondary small">
            Affichage de <strong>${from}</strong> à <strong>${to}</strong> sur <strong>${total}</strong> clients
        </span>
        <nav aria-label="Navigation des pages">
            <ul class="pagination pagination-sm mb-0 gap-1">
                <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
                    <button class="page-link" id="prev-page" aria-label="Page précédente">‹</button>
                </li>
                ${pageButtons}
                <li class="page-item ${currentPage === totalPages ? "disabled" : ""}">
                    <button class="page-link" id="next-page" aria-label="Page suivante">›</button>
                </li>
            </ul>
        </nav>
    `;

    document.getElementById("prev-page")?.addEventListener("click", () => {
        if (currentPage > 1) { currentPage--; displayClients(); }
    });
    document.getElementById("next-page")?.addEventListener("click", () => {
        if (currentPage < totalPages) { currentPage++; displayClients(); }
    });
    document.querySelectorAll(".btn-page-num").forEach(btn => {
        btn.addEventListener("click", () => {
            currentPage = parseInt(btn.dataset.page);
            displayClients();
        });
    });
}

// ── Search ────────────────────────────────────────────────────
if (searchInput) {
    searchInput.addEventListener("input", e => {
        const q = e.target.value.toLowerCase().trim();
        filteredClients = q
            ? clients.filter(c =>
                c.name.toLowerCase().includes(q) ||
                c.email.toLowerCase().includes(q) ||
                c.status.toLowerCase().includes(q))
            : [...clients];
        currentPage = 1;
        displayClients();
    });
}

// ── New Article form ──────────────────────────────────────────
const saveArticleBtn = document.getElementById("saveArticleBtn");
if (saveArticleBtn) {
    saveArticleBtn.addEventListener("click", () => {
        const form    = document.getElementById("newArticleForm");
        const title   = document.getElementById("articleTitle");
        const content = document.getElementById("articleContent");
        let valid = true;

        [title, content].forEach(el => {
            if (!el.value.trim()) {
                el.classList.add("is-invalid");
                valid = false;
            } else {
                el.classList.remove("is-invalid");
            }
        });

        if (!valid) return;

        const modalEl = document.getElementById("newArticleModal");
        bootstrap.Modal.getInstance(modalEl)?.hide();

        // Reset form
        form.reset();
        [title, content].forEach(el => el.classList.remove("is-invalid", "is-valid"));

        showToast(`Article "${title.value || "sans titre"}" publié avec succès ✓`, "success");
    });
}

// ── Toast utility ─────────────────────────────────────────────
function showToast(message, type = "success") {
    const colors = {
        success: { bg: "#10b981", icon: "bi-check-circle-fill" },
        danger:  { bg: "#ef4444", icon: "bi-exclamation-circle-fill" },
        info:    { bg: "#003bfd", icon: "bi-info-circle-fill" },
    };
    const c = colors[type] || colors.info;

    const toast = document.createElement("div");
    toast.className = "dashboard-toast d-flex align-items-center gap-3 p-3 text-white";
    toast.style.background = c.bg;
    toast.innerHTML = `
        <i class="bi ${c.icon} fs-5"></i>
        <span class="small fw-semibold flex-grow-1">${escHtml(message)}</span>
        <button class="btn-close btn-close-white btn-sm" aria-label="Fermer"></button>
    `;
    document.body.appendChild(toast);
    toast.querySelector(".btn-close").addEventListener("click", () => toast.remove());
    setTimeout(() => toast.style.opacity = "0", 3000);
    setTimeout(() => toast.remove(), 3500);
}

// ── Init ──────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    filteredClients = [...clients];
    updateKPIs();
    displayClients();
});
