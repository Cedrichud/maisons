
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://rjkafvarkofqlcpepfws.supabase.co";
const supabaseKey = "xH1bcDy6Ra1CpWWzCOomU7KfoSfx/dBGm5PfP2L7CtBO1lFlb5SSiwBNxf0CVhh3ey2OXiGLO/ob4MGHqzYrQA==";
const supabase = createClient(supabaseUrl, supabaseKey);

const sections = ["dashboard", "dossiers", "facturation", "moderation"];

const defaultPermissions = {
  ADMINISTRATEUR: ["dashboard", "dossiers", "facturation", "moderation"],
  RESPONSABLE: ["dashboard", "dossiers", "facturation"],
  COMMERCE: ["dashboard", "dossiers"]
};

let utilisateurs = [];

async function fetchUtilisateurs() {
  const { data, error } = await supabase.from("utilisateurs").select("*");
  if (error) {
    console.error("Erreur chargement utilisateurs:", error);
    return;
  }
  utilisateurs = data;
}

function getUserRole(name) {
  const user = utilisateurs.find(u => u.nom === name);
  return user ? user.role : "COMMERCE";
}

function showSection(id) {
  sections.forEach(s => {
    document.getElementById(s).style.display = s === id ? "block" : "none";
  });
}

async function login(name) {
  const role = getUserRole(name);
  localStorage.setItem("username", name);
  localStorage.setItem("role", role);
  renderSidebar();
  showSection("dashboard");
}

function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}

function renderSidebar() {
  const nav = document.getElementById("sidebar");
  const role = localStorage.getItem("role");
  const permissions = JSON.parse(localStorage.getItem("rolePermissions")) || defaultPermissions;

  if (!role) {
    nav.innerHTML = "<h2>Choisissez votre nom</h2>" +
      utilisateurs.map(u =>
        `<button onclick="login('${u.nom}')">${u.nom.charAt(0).toUpperCase() + u.nom.slice(1)}</button>`
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

  const permissions = JSON.parse(localStorage.getItem("rolePermissions")) || defaultPermissions;

  Object.keys(defaultPermissions).forEach(r => {
    const roleDiv = document.createElement("div");
    roleDiv.innerHTML = `<h3>${r}</h3>` +
      sections.map(s => {
        const checked = permissions[r]?.includes(s) ? "checked" : "";
        return `<label><input type="checkbox" onchange="togglePermission('${r}', '${s}')" ${checked}> ${s}</label><br>`;
      }).join("");
    container.appendChild(roleDiv);
  });

  renderRoleAssignments(container);
  renderUserCreation(container);
}

function togglePermission(role, section) {
  const permissions = JSON.parse(localStorage.getItem("rolePermissions")) || defaultPermissions;
  if (!permissions[role]) permissions[role] = [];

  if (permissions[role].includes(section)) {
    permissions[role] = permissions[role].filter(s => s !== section);
  } else {
    permissions[role].push(section);
  }

  localStorage.setItem("rolePermissions", JSON.stringify(permissions));
  renderSidebar();
}

function renderRoleAssignments(container) {
  const roles = Object.keys(defaultPermissions);

  const title = document.createElement("h3");
  title.textContent = "Attribuer un rôle à chaque utilisateur :";
  container.appendChild(title);

  utilisateurs.forEach(user => {
    const label = document.createElement("label");
    label.textContent = user.nom.charAt(0).toUpperCase() + user.nom.slice(1) + " : ";

    const select = document.createElement("select");
    select.onchange = async () => {
      await supabase.from("utilisateurs").update({ role: select.value }).eq("nom", user.nom);
      await fetchUtilisateurs();
      renderSidebar();
      showSection("moderation");
    };

    roles.forEach(r => {
      const option = document.createElement("option");
      option.value = r;
      option.textContent = r;
      if (user.role === r) option.selected = true;
      select.appendChild(option);
    });

    label.appendChild(select);
    container.appendChild(label);
    container.appendChild(document.createElement("br"));
  });
}

function renderUserCreation(container) {
  const roles = Object.keys(defaultPermissions);

  const form = document.createElement("div");
  form.innerHTML = "<h3>Créer un nouvel utilisateur :</h3>";

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Nom de l'utilisateur";
  input.style.marginRight = "10px";

  const select = document.createElement("select");
  roles.forEach(r => {
    const option = document.createElement("option");
    option.value = r;
    option.textContent = r;
    select.appendChild(option);
  });

  const button = document.createElement("button");
  button.textContent = "Créer";
  button.onclick = async () => {
    const name = input.value.trim().toLowerCase();
    if (!name) return alert("Veuillez entrer un nom.");

    const exists = utilisateurs.some(u => u.nom === name);
    if (exists) return alert("L'utilisateur existe déjà.");

    await supabase.from("utilisateurs").insert([{ nom: name, role: select.value }]);
    await fetchUtilisateurs();
    renderSidebar();
    showSection("moderation");
  };

  form.appendChild(input);
  form.appendChild(select);
  form.appendChild(button);
  container.appendChild(form);
}

window.showSection = showSection;
window.login = login;
window.logout = logout;

window.addEventListener("DOMContentLoaded", async () => {
  await fetchUtilisateurs();
  renderSidebar();
});
