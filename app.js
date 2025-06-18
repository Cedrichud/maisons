
const sections = ["dashboard", "dossiers", "facturation", "moderation"];

const defaultRoles = {
  bruno: "ADMINISTRATEUR",
  julie: "RESPONSABLE",
  luc: "COMMERCE",
  marie: "COMMERCE"
};

const defaultPermissions = {
  ADMINISTRATEUR: ["dashboard", "dossiers", "facturation", "moderation"],
  RESPONSABLE: ["dashboard", "dossiers", "facturation"],
  COMMERCE: ["dashboard", "dossiers"]
};

function showSection(id) {
  sections.forEach(s => {
    document.getElementById(s).style.display = s === id ? "block" : "none";
  });
}

function login(name) {
  const role = getUserRole(name);
  localStorage.setItem("username", name);
  localStorage.setItem("role", role);
  renderSidebar();
  showSection("dashboard");
}

function logout() {
  localStorage.clear();
  location.reload();
}

function getUserRole(name) {
  const roles = JSON.parse(localStorage.getItem("userRoles")) || defaultRoles;
  return roles[name] || "COMMERCE";
}

function renderSidebar() {
  const nav = document.getElementById("sidebar");
  const role = localStorage.getItem("role");
  const permissions = JSON.parse(localStorage.getItem("rolePermissions")) || defaultPermissions;

  if (!role) {
    nav.innerHTML = "<h2>Choisissez votre nom</h2>" +
      Object.keys(defaultRoles).map(n =>
        `<button onclick="login('${n}')">${n}</button>`
      ).join("");
    return;
  }

  nav.innerHTML = `<h2>MAISONS</h2>` +
    sections.map(s =>
      permissions[role]?.includes(s)
        ? `<button onclick="showSection('${s}')">${s.charAt(0).toUpperCase() + s.slice(1)}</button>`
        : ""
    ).join("") +
    `<hr><button onclick="logout()">Se déconnecter</button>`;

  renderPermissions();
}

function renderPermissions() {
  const role = localStorage.getItem("role");
  if (role !== "ADMINISTRATEUR") return;

  const container = document.getElementById("permissions");
  container.innerHTML = "";

  Object.keys(defaultPermissions).forEach(r => {
    const roleDiv = document.createElement("div");
    roleDiv.innerHTML = `<h3>${r}</h3>` +
      sections.map(s => {
        const checked = getPermissions()[r]?.includes(s) ? "checked" : "";
        return `<label><input type="checkbox" onchange="togglePermission('${r}', '${s}')" ${checked}> ${s}</label><br>`;
      }).join("");
    container.appendChild(roleDiv);
  });
}

function togglePermission(role, section) {
  const permissions = getPermissions();
  if (!permissions[role]) permissions[role] = [];

  if (permissions[role].includes(section)) {
    permissions[role] = permissions[role].filter(s => s !== section);
  } else {
    permissions[role].push(section);
  }

  localStorage.setItem("rolePermissions", JSON.stringify(permissions));
  renderSidebar();
}

function getPermissions() {
  return JSON.parse(localStorage.getItem("rolePermissions")) || defaultPermissions;
}

window.showSection = showSection;
window.login = login;
window.logout = logout;
window.togglePermission = togglePermission;
window.renderSidebar = renderSidebar;

window.addEventListener("DOMContentLoaded", () => {
  renderSidebar();
});
