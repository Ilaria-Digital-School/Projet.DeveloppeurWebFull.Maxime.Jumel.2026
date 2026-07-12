// Default project data
const defaultProjectData = {
    idproject: "01",
    ImageURL: "assets/images/upload/soulfydev.webp",
    title: "Luck jumper",
    client_pseudo: "Luck jamus",
    projetType: "site web",
    Location: "France",
    date: "2024",
    budjet: "~ 2000 $",
    duration: "~ 3 mois",
    description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugiat, dolorum recusandae. Beatae aut et exercitationem dolorum, cumque consequatur architecto veritatis nisi aliquam vel harum eius consequatur. Quibusdam, ad."
};

// Retrieve data from localStorage with fallbacks
function getProjectData() {
    const idproject = localStorage.getItem("idproject") || defaultProjectData.idproject;
    
    // Try to find the project in the allProjects array first
    const allProjects = JSON.parse(localStorage.getItem("allProjects")) || [];
    const project = allProjects.find(p => p.idproject === idproject);

    if (project) {
        return project;
    }

    // Fallback if not found in allProjects
    const ImageURL = localStorage.getItem("ImageURL") || defaultProjectData.ImageURL;
    const title = localStorage.getItem("titleProject") || defaultProjectData.title;
    const description = localStorage.getItem("descriptionProject") || defaultProjectData.description;
    const client_pseudo = localStorage.getItem("clientPseudo") || defaultProjectData.client_pseudo;
    const projetType = localStorage.getItem("projetType") || defaultProjectData.projetType;
    const Location = localStorage.getItem("Location") || defaultProjectData.Location;
    const date = localStorage.getItem("date") || defaultProjectData.date;
    const budjet = localStorage.getItem("budjet") || defaultProjectData.budjet;
    const duration = localStorage.getItem("duration") || defaultProjectData.duration;
    const imgArray = localStorage.getItem("imgArray");

    return {
        idproject,
        ImageURL,
        title,
        description,
        client_pseudo,
        projetType,
        Location,
        date,
        budjet,
        duration,
        imgArray
    };
}

// Populate UI Elements on page load
document.addEventListener("DOMContentLoaded", () => {
    const data = getProjectData();

    // Select elements by ID or Class
    const titleEl = document.getElementById("title-project");
    const descEl = document.getElementById("description-project");
    const pseudoEl = document.querySelector(".client_pseudo");
    const typeEl = document.querySelector(".projetType");
    const locEl = document.querySelector(".Location");
    const budgetEl = document.querySelector(".budjet");
    const durEl = document.querySelector(".duration");

    const ImageEl = document.querySelector(".image-project");

    // Populate innerText/innerHTML
    if (titleEl) titleEl.innerHTML = `<h2 class="fw-bold">${data.title}</h2>`;
    if (ImageEl) ImageEl.src = data.ImageURL || data.Image || defaultProjectData.ImageURL;
    if (descEl) descEl.innerText = data.description;
    if (pseudoEl) pseudoEl.innerText = data.client_pseudo;
    if (typeEl) typeEl.innerText = data.projetType;
    if (locEl) locEl.innerText = data.Location;
    if (budgetEl) budgetEl.innerText = data.budjet;
    if (durEl) durEl.innerText = data.duration;
});
