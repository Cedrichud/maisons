
const users = {
  alice: { name: "Alice", role: "RESPONSABLE" },
  bruno: { name: "Bruno", role: "ADMINISTRATEUR" },
  carla: { name: "Carla", role: "COMMERCE" },
  daniel: { name: "Daniel", role: "COMMERCE" }
};

let currentUser = null;

const permissions = {
  ADMINISTRATEUR: ["dashboard", "dossiers", "documents", "facturation", "moderation"],
  RESPONSABLE: ["dashboard", "dossiers", "documents"],
  COMMERCE: ["dashboard", "documents"]
};

function login() {
  const selected = document.getElementById("userSelect").value;
  if (selected && users[selected]) {
    currentUser = users[selected];
    document.getElementById("loginScreen").classList.add("hidden");
    document.getElementById("appContainer").classList.remove("hidden");
    document.getElementById("roleDisplay").innerText = currentUser.name + " (" + currentUser.role + ")";
    showAllowedSections();
    navigate("dashboard");
  } else {
    alert("Veuillez sélectionner un utilisateur.");
  }
}

function showAllowedSections() {
  const rolePerms = permissions[currentUser.role];
  const buttons = {
    dashboard: document.getElementById("btn-dashboard"),
    dossiers: document.getElementById("btn-dossiers"),
    documents: document.getElementById("btn-documents"),
    facturation: document.getElementById("btn-facturation"),
    moderation: document.getElementById("btn-moderation"),
  };

  for (let key in buttons) {
    if (rolePerms.includes(key)) {
      buttons[key].style.display = "block";
    } else {
      buttons[key].style.display = "none";
    }
  }
}

function navigate(section) {
  if (!currentUser) return;
  const rolePerms = permissions[currentUser.role];
  if (!rolePerms.includes(section)) {
    alert("Accès refusé pour cette section.");
    return;
  }

  const content = document.getElementById('content');
  switch(section) {
    case 'dashboard':
      content.innerHTML = '<h2>Tableau de bord</h2><p>Résumé des activités.</p>';
      break;
    case 'dossiers':
      content.innerHTML = '<h2>Dossiers</h2><p>Liste des dossiers en cours.</p>';
      break;
    case 'documents':
      content.innerHTML = '<h2>Documents</h2><p>Gestion des documents.</p>';
      break;
    case 'facturation':
      content.innerHTML = '<h2>Facturation</h2><p>Suivi de la facturation.</p>';
      break;
    case 'moderation':
      content.innerHTML = generateModerationPanel();
      break;
    default:
      content.innerHTML = '<p>Bienvenue.</p>';
  }
}

function generateModerationPanel() {
  let html = '<h2>Modération des rôles</h2><table><tr><th>Utilisateur</th><th>Rôle</th><th>Nouveau rôle</th><th>Action</th></tr>';
  for (let key in users) {
    html += '<tr><td>' + users[key].name + '</td><td>' + users[key].role + '</td>';
    html += '<td><select id="role-' + key + '">';
    ["ADMINISTRATEUR", "RESPONSABLE", "COMMERCE"].forEach(role => {
      html += '<option value="' + role + '"' + (users[key].role === role ? ' selected' : '') + '>' + role + '</option>';
    });
    html += '</select></td>';
    html += '<td><button onclick="updateRole(\'' + key + '\')">Changer</button></td></tr>';
  }
  html += '</table>';
  return html;
}

function updateRole(userKey) {
  const newRole = document.getElementById("role-" + userKey).value;
  users[userKey].role = newRole;
  alert("Rôle mis à jour pour " + users[userKey].name);
  if (userKey === Object.keys(users).find(k => users[k].name === currentUser.name)) {
    location.reload();
  } else {
    navigate("moderation");
  }
}
