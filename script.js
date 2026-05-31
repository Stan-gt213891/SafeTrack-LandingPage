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

/* REGISTRO */

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

/* LOGIN */

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

/* DATOS DEL USUARIO EN DASHBOARD */

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

/* LOGOUT */

const logoutButton = document.getElementById("logoutButton");

if (logoutButton) {
  logoutButton.addEventListener("click", () => {
    localStorage.removeItem("safeTrackToken");
    localStorage.removeItem("safeTrackEmail");
    localStorage.removeItem("safeTrackFullName");
    localStorage.removeItem("safeTrackRole");

    window.location.href = "login.html";
  });
}

/* BOTÓN DE PÁNICO */

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

        if (typeof loadAlerts === "function") {
          loadAlerts();
        }
      } else {
        alert("No se pudo activar la alerta.");
      }
    } catch (error) {
      alert("Error al conectar con el backend.");
    }
  });
}
    

/* UBICACIÓN EN DASHBOARD CON DIRECCIÓN */

const dashboardLocation = document.getElementById("dashboardLocation");

if (dashboardLocation) {
  async function loadDashboardLocation() {
    try {
      const response = await fetch(`${API_URL}/tracking/1`);
      const data = await response.json();

      if (response.ok) {
        const addressResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${data.latitude}&lon=${data.longitude}`
        );

        const addressData = await addressResponse.json();

        dashboardLocation.textContent =
          addressData.display_name || `Lat: ${data.latitude}, Lng: ${data.longitude}`;
      } else {
        dashboardLocation.textContent = "No se pudo cargar ubicación";
      }
    } catch (error) {
      dashboardLocation.textContent = "Error al conectar ubicación";
    }
  }

  loadDashboardLocation();
}

/* DATOS DEL USUARIO EN MIEMBROS */

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

/* HISTORIAL - DATOS */

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

/* GEOCERCAS - UBICACIÓN */

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

/* ALERTAS */

const alertStatus = document.getElementById("alertStatus");
const alertsList = document.getElementById("alertsList");

async function loadAlerts() {
  if (!alertStatus || !alertsList) return;

  try {
    const response = await fetch(`${API_URL}/alerts`);
    const alerts = await response.json();

    alertsList.innerHTML = "";

    if (alerts.length === 0) {
      alertStatus.textContent = "🟢 Estado actual: Sin emergencias";
      alertsList.innerHTML = "<p>No hay alertas recientes.</p>";
      return;
    }

    alertStatus.textContent = "🔴 Estado actual: Emergencia detectada";

    alerts.forEach(alertData => {
      const alertItem = document.createElement("p");

      const date = new Date(alertData.createdAt + "Z").toLocaleString("es-PE", {
        timeZone: "America/Lima",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });

      alertItem.innerHTML = `🔔 ${alertData.message} - ${date}`;
      alertsList.appendChild(alertItem);
    });

  } catch (error) {
    alertStatus.textContent = "🔴 Error al conectar con Alert Service";
    alertsList.innerHTML = "<p>Error de conexión con backend.</p>";
  }
}

if (alertsList) {
  loadAlerts();
}

/* MIEMBROS - LISTAR, CREAR Y ELIMINAR */

const addMemberButton = document.getElementById("addMemberButton");

async function loadFamilyMembers() {
  const membersGrid = document.getElementById("membersGrid");
  const summaryCard = document.getElementById("summaryCard");
  const membersCount = document.getElementById("membersCount");
  const dependentsCount = document.getElementById("dependentsCount");
  const summaryTotal = document.getElementById("summaryTotal");
  const tutorsCount = document.getElementById("tutorsCount");

  if (!membersGrid || !summaryCard) return;

  try {
    const response = await fetch(`${API_URL}/family-members`);
    const members = await response.json();

    const dynamicCards = document.querySelectorAll(".dynamic-member-card");
    dynamicCards.forEach(card => card.remove());

    let dependents = 0;
    let tutors = 1; // usuario logueado como tutor principal

    members.forEach(member => {
      const newCard = document.createElement("div");
      newCard.classList.add("member-card", "dynamic-member-card");

      newCard.innerHTML = `
        <h2>${member.role === "Tutor" ? "👨" : "👤"} ${member.fullName}</h2>
        <p>${member.role}</p>
        <p>Edad: ${member.age} años</p>

        <button
          class="delete-member-btn"
          onclick="deleteFamilyMember(${member.id})">
          🗑️ Eliminar
        </button>
      `;

      membersGrid.insertBefore(newCard, summaryCard);

      if (member.role === "Dependiente") {
        dependents++;
      }

      if (member.role === "Tutor") {
        tutors++;
      }
    });

    const total = tutors + dependents;

    membersCount.textContent = total;
    dependentsCount.textContent = dependents;
    summaryTotal.textContent = total;

    if (tutorsCount) {
      tutorsCount.textContent = tutors;
    }

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

async function deleteFamilyMember(id) {
  const confirmDelete = confirm("¿Deseas eliminar este miembro?");

  if (!confirmDelete) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/family-members/${id}`, {
      method: "DELETE"
    });

    if (response.ok) {
      alert("Miembro eliminado correctamente.");
      loadFamilyMembers();
    } else {
      alert("No se pudo eliminar.");
    }
  } catch (error) {
    alert("Error al conectar con el backend.");
  }
}

/* GEOCERCAS - LISTAR, CREAR Y ELIMINAR */

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

        <button
          class="delete-member-btn"
          onclick="deleteGeofence(${geofence.id})">
          🗑️ Eliminar
        </button>
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

async function deleteGeofence(id) {
  const confirmDelete = confirm("¿Deseas eliminar esta geocerca?");

  if (!confirmDelete) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/geofences/${id}`, {
      method: "DELETE"
    });

    if (response.ok) {
      alert("Geocerca eliminada correctamente.");
      loadGeofences();
      location.reload();
    } else {
      alert("No se pudo eliminar.");
    }
  } catch (error) {
    alert("Error al conectar con el backend.");
  }
}

/* DETALLE DE HISTORIAL */

const historyDetailsButton = document.getElementById("historyDetailsButton");

if (historyDetailsButton) {
  historyDetailsButton.addEventListener("click", () => {
    const latitude = document.getElementById("historyLatitude").textContent;
    const longitude = document.getElementById("historyLongitude").textContent;
    const status = document.getElementById("historyStatus").textContent;

    alert(
      `Detalle del recorrido\n\n` +
      `Dependiente: Juan Pérez\n` +
      `Fecha: 31/05/2026\n` +
      `Salida: 07:15 AM\n` +
      `Llegada: 07:45 AM\n` +
      `Destino: Escuela Belaunde\n` +
      `Latitud: ${latitude}\n` +
      `Longitud: ${longitude}\n` +
      `Estado: ${status}`
    );
  });
}

/* FECHA Y HORA AUTOMÁTICA */

const lastUpdateDate = document.getElementById("lastUpdateDate");

if (lastUpdateDate) {
  const now = new Date();

  const formattedDate = now.toLocaleString("es-PE", {
    timeZone: "America/Lima",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });

  lastUpdateDate.textContent = formattedDate;
}

/* MAPA HISTORIAL */

const historyMapElement = document.getElementById("historyMap");

if (historyMapElement) {
  async function loadHistoryMap() {
    try {
      const response = await fetch(`${API_URL}/tracking/1`);
      const data = await response.json();

      const latitude = parseFloat(data.latitude);
      const longitude = parseFloat(data.longitude);

      const map = L.map("historyMap").setView([latitude, longitude], 14);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors"
      }).addTo(map);

      L.marker([latitude, longitude])
        .addTo(map)
        .bindPopup("Ubicación actual del dependiente")
        .openPopup();

      L.marker([-12.0453, -77.0311])
        .addTo(map)
        .bindPopup("Casa");

      L.marker([-12.0492, -77.0365])
        .addTo(map)
        .bindPopup("Escuela Belaunde");

      L.polyline([
        [-12.0453, -77.0311],
        [latitude, longitude],
        [-12.0492, -77.0365]
      ], {
        color: "purple"
      }).addTo(map);

    } catch (error) {
      console.log("Error cargando mapa historial:", error);
    }
  }

  loadHistoryMap();
}

/* MAPA GEOCERCAS */

const geofenceMapElement = document.getElementById("geofenceMap");

if (geofenceMapElement) {
  async function loadGeofenceMap() {
    try {
      const trackingResponse = await fetch(`${API_URL}/tracking/1`);
      const trackingData = await trackingResponse.json();

      const latitude = parseFloat(trackingData.latitude);
      const longitude = parseFloat(trackingData.longitude);

      const map = L.map("geofenceMap").setView([latitude, longitude], 14);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors"
      }).addTo(map);

      L.marker([latitude, longitude])
        .addTo(map)
        .bindPopup("Ubicación actual del dependiente")
        .openPopup();

      const geofencesResponse = await fetch(`${API_URL}/geofences`);
      const geofences = await geofencesResponse.json();

      geofences.forEach((geofence, index) => {
        const offset = index * 0.003;

        L.circle([latitude + offset, longitude + offset], {
          radius: geofence.radius,
          color: "purple",
          fillColor: "#a855f7",
          fillOpacity: 0.18
        })
          .addTo(map)
          .bindPopup(`${geofence.name} - ${geofence.radius}m`);
      });

    } catch (error) {
      console.log("Error cargando mapa de geocercas:", error);
    }
  }

  loadGeofenceMap();
}

/* ESTADÍSTICAS DASHBOARD */

const dashboardMembersCount = document.getElementById("dashboardMembersCount");
const dashboardAlertsCount = document.getElementById("dashboardAlertsCount");
const dashboardGeofencesCount = document.getElementById("dashboardGeofencesCount");

if (dashboardMembersCount && dashboardAlertsCount && dashboardGeofencesCount) {
  async function loadDashboardStats() {
    try {
      const membersResponse = await fetch(`${API_URL}/family-members`);
      const members = await membersResponse.json();

      const geofencesResponse = await fetch(`${API_URL}/geofences`);
      const geofences = await geofencesResponse.json();

      const alertsResponse = await fetch(`${API_URL}/alerts`);
      const alerts = await alertsResponse.json();

      const dependents = members.filter(member => member.role === "Dependiente").length;
      const tutors = members.filter(member => member.role === "Tutor").length + 1;

      dashboardMembersCount.textContent = `${dependents} dependientes`;

      const dashboardTutorsCount = document.getElementById("dashboardTutorsCount");

      if (dashboardTutorsCount) {
        dashboardTutorsCount.textContent = `${tutors} tutores`;
      }

      dashboardGeofencesCount.textContent = `${geofences.length} activas`;
      dashboardAlertsCount.textContent = `${alerts.length} activas`;

    } catch (error) {
      dashboardMembersCount.textContent = "Error";
      dashboardGeofencesCount.textContent = "Error";
      dashboardAlertsCount.textContent = "Error";
    }
  }

  loadDashboardStats();
}

/* ESTADO SEGURO DASHBOARD */

const dashboardSafeStatus = document.getElementById("dashboardSafeStatus");

if (dashboardSafeStatus) {
  async function loadDashboardSafeStatus() {
    try {
      const response = await fetch(`${API_URL}/tracking/1`);

      if (response.ok) {
        dashboardSafeStatus.textContent = "🟢 Dentro de zona segura";
      } else {
        dashboardSafeStatus.textContent = "🟡 Estado no disponible";
      }
    } catch (error) {
      dashboardSafeStatus.textContent = "🔴 Error al consultar estado";
    }
  }

  loadDashboardSafeStatus();
}