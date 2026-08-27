const links = document.querySelectorAll(".links");
const searchBar = document.getElementById("searchBar");

links.forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();

        // Si c'est l'icône de recherche → on ouvre la barre
        if (link.classList.contains("search-icon")) {
            searchBar.classList.toggle("active");
            return;
        }

        // Sinon → comportement normal (rediriger)
        const href = link.getAttribute("href");
        if (href && href !== "#") {
            window.location.href = href;
        }
    });
});
