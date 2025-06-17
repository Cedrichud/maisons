
const users = {
  alice: { name: "Alice", role: "RESPONSABLE" },
  bruno: { name: "Bruno", role: "ADMINISTRATEUR" },
  carla: { name: "Carla", role: "COMMERCE" },
  daniel: { name: "Daniel", role: "COMMERCE" }
};

let currentUser = null;

// Permissions dynamiques par rôle
const rolePermissions = {
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

function logout() {
  currentUser = null;
  document.getElementById("appContainer").classList.add("hidden");
  document.getElementById("loginScreen").classList.remove("hidden");
}

function showAllowedSections() {
  const rolePerms = rolePermissions[currentUser.role] || [];
  const sections = ["dashboard", "dossiers", "documents", "facturation", "moderation"];
  sections.forEach(section => {
    const btn = document.getElementById("btn-" + section);
    if (btn) btn.style.display = rolePerms.includes(section) ? "block" : "none";
  });
}

function navigate(section) {
  if (!currentUser) return;
  const rolePerms = rolePermissions[currentUser.role];
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
  let html = '<h2>Modération des rôles</h2>';
  html += '<table><tr><th>Utilisateur</th><th>Rôle</th><th>Nouveau rôle</th><th>Action</th></tr>';
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

  html += '<h2>Permissions par rôle</h2>';
  html += '<table><tr><th>Rôle</th><th>Dashboard</th><th>Dossiers</th><th>Documents</th><th>Facturation</th><th>Modération</th></tr>';
  for (let role in rolePermissions) {
    html += '<tr><td>' + role + '</td>';
    ["dashboard", "dossiers", "documents", "facturation", "moderation"].forEach(section => {
      const checked = rolePermissions[role].includes(section) ? 'checked' : '';
      html += '<td><input type="checkbox" id="perm-' + role + '-' + section + '" ' + checked + '></td>';
    });
    html += '</tr>';
  }
  html += '</table>';
  html += '<button onclick="updatePermissions()">Sauvegarder les permissions</button>';

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

function updatePermissions() {
  const newPerms = {};
  ["ADMINISTRATEUR", "RESPONSABLE", "COMMERCE"].forEach(role => {
    newPerms[role] = [];
    ["dashboard", "dossiers", "documents", "facturation", "moderation"].forEach(section => {
      if (document.getElementById("perm-" + role + "-" + section).checked) {
        newPerms[role].push(section);
      }
    });
  });
  Object.assign(rolePermissions, newPerms);
  alert("Permissions mises à jour.");
  showAllowedSections();
  navigate("dashboard");
}
