const privatePages = [
  "dashboard.html",
  "miembros.html",
  "historial.html",
  "geocercas.html",
  "alertas.html"
];

const currentPage = window.location.pathname.split("/").pop();
const token = localStorage.getItem("safeTrackToken");

if (privatePages.includes(currentPage) && !token) {
  window.location.href = "login.html";
}
const API_URL = "http://localhost:5298/api/v1";

const registerButton = document.getElementById("registerButton");

if (registerButton) {
  registerButton.addEventListener("click", async () => {
    const fullName = document.getElementById("registerFullName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();
    const message = document.getElementById("registerMessage");

    if (!fullName || !email || !password || !confirmPassword) {
      message.textContent = "Completa todos los campos.";
      return;
    }

    if (password !== confirmPassword) {
      message.textContent = "Las contraseñas no coinciden.";
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fullName,
          email,
          password
        })
      });

      const data = await response.json();

      if (response.ok) {
        message.textContent = "Cuenta creada correctamente.";
        setTimeout(() => {
          window.location.href = "login.html";
        }, 1200);
      } else {
        message.textContent = data.message || "No se pudo registrar.";
      }
    } catch (error) {
      message.textContent = "Error al conectar con el backend.";
    }
  });
}

const loginButton = document.getElementById("loginButton");

if (loginButton) {
  loginButton.addEventListener("click", async () => {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();
    const message = document.getElementById("loginMessage");

    if (!email || !password) {
      message.textContent = "Ingresa correo y contraseña.";
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await response.json();

      if (response.ok) {
 localStorage.setItem("safeTrackToken", data.token);
localStorage.setItem("safeTrackEmail", data.email);
localStorage.setItem("safeTrackFullName", data.fullName);
localStorage.setItem("safeTrackRole", data.role);
  message.textContent = "Inicio de sesión exitoso.";
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 1000);
      } else {
        message.textContent = data.message || "Credenciales incorrectas.";
      }
    } catch (error) {
      message.textContent = "Error al conectar con el backend.";
    }
  });
}
const dashboardFullName = document.getElementById("dashboardFullName");
const dashboardRole = document.getElementById("dashboardRole");

if (dashboardFullName && dashboardRole) {
  const savedFullName = localStorage.getItem("safeTrackFullName");
  const savedRole = localStorage.getItem("safeTrackRole");

  if (!savedFullName) {
    window.location.href = "login.html";
  } else {
    dashboardFullName.textContent = savedFullName;
    dashboardRole.textContent = savedRole || "Tutor";
  }
}


const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    localStorage.removeItem("safeTrackToken");
    localStorage.removeItem("safeTrackEmail");
    window.location.href = "login.html";
  });
}
const panicButton = document.getElementById("panicButton");

if (panicButton) {
  panicButton.addEventListener("click", async () => {
    try {
      const response = await fetch(`${API_URL}/alerts/panic`, {
        method: "POST"
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || "Alerta activada correctamente.");
      } else {
        alert("No se pudo activar la alerta.");
      }
    } catch (error) {
      alert("Error al conectar con el backend.");
    }
  });
}
const dashboardLocation = document.getElementById("dashboardLocation");

if (dashboardLocation) {
  async function loadDashboardLocation() {
    try {
      const response = await fetch(`${API_URL}/tracking/1`);
      const data = await response.json();

      if (response.ok) {
        dashboardLocation.textContent = `Lat: ${data.latitude}, Lng: ${data.longitude}`;
      } else {
        dashboardLocation.textContent = "No se pudo cargar ubicación";
      }
    } catch (error) {
      dashboardLocation.textContent = "Error al conectar ubicación";
    }
  }

  loadDashboardLocation();
}
const memberFullName = document.getElementById("memberFullName");
const memberRole = document.getElementById("memberRole");
const memberEmail = document.getElementById("memberEmail");

if (memberFullName && memberRole && memberEmail) {
  const savedFullName = localStorage.getItem("safeTrackFullName");
  const savedRole = localStorage.getItem("safeTrackRole");
  const savedEmail = localStorage.getItem("safeTrackEmail");

  if (!savedFullName) {
    window.location.href = "login.html";
  } else {
    memberFullName.textContent = savedFullName;
    memberRole.textContent = savedRole || "Tutor";
    memberEmail.textContent = savedEmail || "Sin correo";
  }
}
const historyLatitude = document.getElementById("historyLatitude");
const historyLongitude = document.getElementById("historyLongitude");
const historyStatus = document.getElementById("historyStatus");

if (historyLatitude && historyLongitude && historyStatus) {
  async function loadHistoryLocation() {
    try {
      const response = await fetch(`${API_URL}/tracking/1`);
      const data = await response.json();

      if (response.ok) {
        historyLatitude.textContent = data.latitude;
        historyLongitude.textContent = data.longitude;
        historyStatus.textContent = data.status || "Ruta segura";
      } else {
        historyLatitude.textContent = "No disponible";
        historyLongitude.textContent = "No disponible";
        historyStatus.textContent = "No se pudo cargar historial";
      }
    } catch (error) {
      historyLatitude.textContent = "Error";
      historyLongitude.textContent = "Error";
      historyStatus.textContent = "Error de conexión";
    }
  }

  loadHistoryLocation();
}
const geofenceStatus = document.getElementById("geofenceStatus");
const geofenceLatitude = document.getElementById("geofenceLatitude");
const geofenceLongitude = document.getElementById("geofenceLongitude");

if (geofenceStatus && geofenceLatitude && geofenceLongitude) {
  async function loadGeofenceLocation() {
    try {
      const response = await fetch(`${API_URL}/tracking/1`);
      const data = await response.json();

      if (response.ok) {
        geofenceStatus.textContent = "🟢 Dependiente dentro de zona segura";
        geofenceLatitude.textContent = data.latitude;
        geofenceLongitude.textContent = data.longitude;
      } else {
        geofenceStatus.textContent = "🔴 No se pudo validar la zona segura";
        geofenceLatitude.textContent = "No disponible";
        geofenceLongitude.textContent = "No disponible";
      }
    } catch (error) {
      geofenceStatus.textContent = "🔴 Error al conectar con Tracking Service";
      geofenceLatitude.textContent = "Error";
      geofenceLongitude.textContent = "Error";
    }
  }

  loadGeofenceLocation();
}
const alertStatus = document.getElementById("alertStatus");
const backendAlertMessage = document.getElementById("backendAlertMessage");

if (alertStatus && backendAlertMessage) {
  async function loadAlerts() {
    try {
      const response = await fetch(`${API_URL}/alerts`);
      const data = await response.json();

      if (response.ok) {
        alertStatus.textContent = "🔴 Estado actual: Emergencia detectada";
        backendAlertMessage.textContent = `🔔 ${data.message}`;
      } else {
        alertStatus.textContent = "🟡 No se pudieron cargar alertas";
        backendAlertMessage.textContent = "Sin información disponible";
      }
    } catch (error) {
      alertStatus.textContent = "🔴 Error al conectar con Alert Service";
      backendAlertMessage.textContent = "Error de conexión con backend";
    }
  }

  loadAlerts();
}
const addMemberButton = document.getElementById("addMemberButton");

async function loadFamilyMembers() {
  const membersGrid = document.getElementById("membersGrid");
  const summaryCard = document.getElementById("summaryCard");
  const membersCount = document.getElementById("membersCount");
  const dependentsCount = document.getElementById("dependentsCount");
  const summaryTotal = document.getElementById("summaryTotal");

  if (!membersGrid || !summaryCard) return;

  try {
    const response = await fetch(`${API_URL}/family-members`);
    const members = await response.json();

    const dynamicCards = document.querySelectorAll(".dynamic-member-card");
    dynamicCards.forEach(card => card.remove());

    let dependents = 2;

    members.forEach(member => {
      const newCard = document.createElement("div");
      newCard.classList.add("member-card", "dynamic-member-card");

      newCard.innerHTML = `
        <h2>${member.role === "Tutor" ? "👨" : "👤"} ${member.fullName}</h2>
        <p>${member.role}</p>
        <p>Edad: ${member.age} años</p>
      `;

      membersGrid.insertBefore(newCard, summaryCard);

      if (member.role === "Dependiente") {
        dependents++;
      }
    });

    const total = 3 + members.length;

    membersCount.textContent = total;
    dependentsCount.textContent = dependents;
    summaryTotal.textContent = total;

  } catch (error) {
    console.log("Error cargando miembros:", error);
  }
}

if (addMemberButton) {
  loadFamilyMembers();

  addMemberButton.addEventListener("click", async () => {
    const nameInput = document.getElementById("newMemberName");
    const ageInput = document.getElementById("newMemberAge");
    const roleInput = document.getElementById("newMemberRole");
    const message = document.getElementById("memberMessage");

    const fullName = nameInput.value.trim();
    const age = parseInt(ageInput.value.trim());
    const role = roleInput.value;

    if (!fullName || !age) {
      message.textContent = "Completa el nombre y la edad.";
      return;
    }

    try {
      const response = await fetch(`${API_URL}/family-members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fullName,
          age,
          role
        })
      });

      if (response.ok) {
        message.textContent = "Miembro guardado en Railway correctamente.";

        nameInput.value = "";
        ageInput.value = "";
        roleInput.value = "Dependiente";

        loadFamilyMembers();
      } else {
        message.textContent = "No se pudo guardar el miembro.";
      }
    } catch (error) {
      message.textContent = "Error al conectar con el backend.";
    }
  });
}
const addGeofenceButton = document.getElementById("addGeofenceButton");

async function loadGeofences() {
  const geofencePanel = document.getElementById("geofencePanel");

  if (!geofencePanel) return;

  try {
    const response = await fetch(`${API_URL}/geofences`);
    const geofences = await response.json();

    const dynamicGeofences = document.querySelectorAll(".dynamic-geofence-item");
    dynamicGeofences.forEach(item => item.remove());

    geofences.forEach(geofence => {
      const item = document.createElement("div");
      item.classList.add("geofence-item", "dynamic-geofence-item");

      item.innerHTML = `
        <h3>📍 ${geofence.name}</h3>
        <p>RADIO - ${geofence.radius} M</p>
        <p>Estado: ${geofence.status}</p>
      `;

      geofencePanel.appendChild(item);
    });

  } catch (error) {
    console.log("Error cargando geocercas:", error);
  }
}

if (addGeofenceButton) {

  loadGeofences();

  addGeofenceButton.addEventListener("click", async () => {

    const nameInput = document.getElementById("newGeofenceName");
    const radiusInput = document.getElementById("newGeofenceRadius");
    const message = document.getElementById("geofenceMessage");

    const name = nameInput.value.trim();
    const radius = parseInt(radiusInput.value.trim());

    if (!name || !radius) {
      message.textContent = "Completa el nombre y el radio.";
      return;
    }

    try {
      const response = await fetch(`${API_URL}/geofences`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          radius,
          status: "Activa"
        })
      });

      if (response.ok) {

        message.textContent = "Geocerca guardada correctamente.";

        nameInput.value = "";
        radiusInput.value = "";

        loadGeofences();

      } else {
        message.textContent = "No se pudo guardar la geocerca.";
      }

    } catch (error) {
      message.textContent = "Error al conectar con el backend.";
    }

  });
}