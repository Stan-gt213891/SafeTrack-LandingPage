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

const API_URL = "https://safetrackauthservice-production.up.railway.app/api/v1";

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
  async function sendCurrentLocation() {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await fetch(`${API_URL}/tracking/location`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              dependentId: 1,
              latitude: position.coords.latitude.toString(),
              longitude: position.coords.longitude.toString()
            })
          });
        } catch (error) {
          console.log("Error enviando ubicación");
        }
      },
      () => {
        console.log("Permiso de ubicación denegado");
      }
    );
  }

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
          addressData.display_name ||
          `Lat: ${data.latitude}, Lng: ${data.longitude}`;
      } else {
        dashboardLocation.textContent = "No se pudo cargar ubicación";
      }
    } catch (error) {
      dashboardLocation.textContent = "Error al conectar ubicación";
    }
  }

  sendCurrentLocation();

  setTimeout(() => {
    loadDashboardLocation();
  }, 1500);
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
  function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const toRad = value => value * Math.PI / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  async function loadGeofenceLocation() {
    try {
      const trackingResponse = await fetch(`${API_URL}/tracking/1`);
      const trackingData = await trackingResponse.json();

      if (!trackingResponse.ok) {
        throw new Error();
      }

      const currentLat = parseFloat(trackingData.latitude);
      const currentLon = parseFloat(trackingData.longitude);

      geofenceLatitude.textContent = trackingData.latitude;
      geofenceLongitude.textContent = trackingData.longitude;

      const geofencesResponse = await fetch(`${API_URL}/geofences`);
      const geofences = await geofencesResponse.json();

      const validGeofences = geofences.filter(g => g.latitude && g.longitude);

      if (validGeofences.length === 0) {
        geofenceStatus.textContent = "🔴 No existen geocercas con ubicación registrada";
        return;
      }

      let insideAnyGeofence = false;
      let closestGeofence = null;
      let closestDistance = Infinity;

      validGeofences.forEach(geofence => {
        const geofenceLat = parseFloat(geofence.latitude);
        const geofenceLon = parseFloat(geofence.longitude);

        const distance = calculateDistanceMeters(
          currentLat,
          currentLon,
          geofenceLat,
          geofenceLon
        );

        if (distance < closestDistance) {
          closestDistance = distance;
          closestGeofence = geofence;
        }

        if (distance <= geofence.radius) {
          insideAnyGeofence = true;
          closestGeofence = geofence;
        }
      });

      if (insideAnyGeofence) {
        geofenceStatus.textContent =
          `🟢 Dentro de zona segura: ${closestGeofence.name}`;
      } else {
        geofenceStatus.textContent =
          `🔴 Fuera de zona segura. Más cercana: ${closestGeofence.name} (${Math.round(closestDistance)} m)`;

        const alreadyAlerted = sessionStorage.getItem("geofenceExitAlert");

        if (!alreadyAlerted) {
          await fetch(`${API_URL}/alerts/panic`, {
            method: "POST"
          });

          sessionStorage.setItem("geofenceExitAlert", "true");
        }
      }

    } catch (error) {
      geofenceStatus.textContent = "🔴 Error al conectar con Tracking Service";
      geofenceLatitude.textContent = "Error";
      geofenceLongitude.textContent = "Error";
    }
  }

  setTimeout(() => {
    loadGeofenceLocation();
  }, 1500);
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

      alertItem.innerHTML = `
        🔔 ${alertData.message} - ${date}
        <br>
        <button
          class="delete-member-btn"
          onclick="deleteAlert(${alertData.id})">
          🗑️ Eliminar
        </button>
      `;

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
    let tutors = 1;

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
        <p>Latitud: ${geofence.latitude || "No registrada"}</p>
        <p>Longitud: ${geofence.longitude || "No registrada"}</p>

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

function getCurrentBrowserPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("Geolocalización no soportada");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        resolve({
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString()
        });
      },
      () => {
        reject("No se pudo obtener la ubicación");
      }
    );
  });
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
      message.textContent = "Obteniendo ubicación actual...";

      const currentPosition = await getCurrentBrowserPosition();

      const response = await fetch(`${API_URL}/geofences`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          radius,
          status: "Activa",
          latitude: currentPosition.latitude,
          longitude: currentPosition.longitude
        })
      });

      if (response.ok) {
        message.textContent = "Geocerca guardada con ubicación real.";

        nameInput.value = "";
        radiusInput.value = "";

        loadGeofences();

        setTimeout(() => {
          location.reload();
        }, 800);

      } else {
        message.textContent = "No se pudo guardar la geocerca.";
      }
    } catch (error) {
      message.textContent = "Error: debes permitir el acceso a la ubicación.";
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
      `Dependiente: ${historyDependentSelect ? historyDependentSelect.value : "Dependiente"}\n` +
      `Fecha: ${historyDate ? historyDate.textContent : "Fecha actual"}\n` +
      `Salida: ${historyStartTime ? historyStartTime.textContent : "Hora actual"}\n` +
      `Llegada: ${historyEndTime ? historyEndTime.textContent : "Hora estimada"}\n` +
      `Destino: ${historyDestination ? historyDestination.textContent : "Destino"}\n` +
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

      const geofencesResponse = await fetch(`${API_URL}/geofences`);
      const geofences = await geofencesResponse.json();
      const validGeofences = geofences.filter(g => g.latitude && g.longitude);

      if (validGeofences.length > 0) {
        const destination = validGeofences[0];
        const destinationLat = parseFloat(destination.latitude);
        const destinationLon = parseFloat(destination.longitude);

        L.marker([destinationLat, destinationLon])
          .addTo(map)
          .bindPopup(`Destino: ${destination.name}`);

        L.polyline([
          [latitude, longitude],
          [destinationLat, destinationLon]
        ], {
          color: "purple"
        }).addTo(map);
      }

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

      const map = L.map("geofenceMap").setView([latitude, longitude], 16);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors"
      }).addTo(map);

      L.marker([latitude, longitude])
        .addTo(map)
        .bindPopup("Ubicación actual del dependiente")
        .openPopup();

      const geofencesResponse = await fetch(`${API_URL}/geofences`);
      const geofences = await geofencesResponse.json();

      geofences.forEach(geofence => {
        if (!geofence.latitude || !geofence.longitude) {
          return;
        }

        const geofenceLat = parseFloat(geofence.latitude);
        const geofenceLon = parseFloat(geofence.longitude);

        const circle = L.circle([geofenceLat, geofenceLon], {
          radius: geofence.radius,
          color: geofence.radius <= 100 ? "red" : "purple",
          fillColor: geofence.radius <= 100 ? "#ef4444" : "#a855f7",
          fillOpacity: 0.2
        }).addTo(map);

        circle.bindPopup(`${geofence.name} - ${geofence.radius} m`);

        circle.bindTooltip(`${geofence.name} - ${geofence.radius}m`, {
          permanent: true,
          direction: "top"
        });

        L.marker([geofenceLat, geofenceLon])
          .addTo(map)
          .bindPopup(`Centro: ${geofence.name}`);
      });

    } catch (error) {
      console.log("Error cargando mapa de geocercas:", error);
    }
  }

  setTimeout(() => {
    loadGeofenceMap();
  }, 1500);
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

      const selectedDependentId =
  localStorage.getItem("dashboardSelectedDependentId") || "1";

const trackingResponse = await fetch(`${API_URL}/tracking/${selectedDependentId}`);
      const trackingData = await trackingResponse.json();

      const dependents = members.filter(member => member.role === "Dependiente").length;
      const tutors = members.filter(member => member.role === "Tutor").length + 1;

      dashboardMembersCount.textContent = `${dependents} dependientes`;

      const dashboardTutorsCount = document.getElementById("dashboardTutorsCount");

      if (dashboardTutorsCount) {
        dashboardTutorsCount.textContent = `${tutors} tutores`;
      }

      dashboardGeofencesCount.textContent = `${geofences.length} activas`;
      dashboardAlertsCount.textContent = `${alerts.length} activas`;

      const dashboardLastAlert = document.getElementById("dashboardLastAlert");

      if (dashboardLastAlert) {
        if (alerts.length === 0) {
          dashboardLastAlert.textContent = "Sin alertas recientes";
        } else {
          const lastAlert = alerts[0];

          const alertDate = new Date(lastAlert.createdAt + "Z").toLocaleString("es-PE", {
            timeZone: "America/Lima",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
          });

          dashboardLastAlert.textContent = `${lastAlert.message} - ${alertDate}`;
        }
      }

      const dashboardSafeZone = document.getElementById("dashboardSafeZone");

      if (dashboardSafeZone) {
        const validGeofences = geofences.filter(g => g.latitude && g.longitude);

        if (validGeofences.length === 0) {
          dashboardSafeZone.textContent = "Sin zona configurada";
        } else {
          const currentLat = parseFloat(trackingData.latitude);
          const currentLon = parseFloat(trackingData.longitude);

          function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
            const R = 6371000;
            const toRad = value => value * Math.PI / 180;

            const dLat = toRad(lat2 - lat1);
            const dLon = toRad(lon2 - lon1);

            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) *
              Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);

            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

            return R * c;
          }

          let insideAnyGeofence = false;
          let closestGeofence = null;
          let closestDistance = Infinity;

          validGeofences.forEach(geofence => {
            const geofenceLat = parseFloat(geofence.latitude);
            const geofenceLon = parseFloat(geofence.longitude);

            const distance = calculateDistanceMeters(
              currentLat,
              currentLon,
              geofenceLat,
              geofenceLon
            );

            if (distance < closestDistance) {
              closestDistance = distance;
              closestGeofence = geofence;
            }

            if (distance <= geofence.radius) {
              insideAnyGeofence = true;
              closestGeofence = geofence;
            }
          });

          if (insideAnyGeofence) {
            dashboardSafeZone.textContent = `🟢 Dentro de ${closestGeofence.name}`;
          } else {
            dashboardSafeZone.textContent =
              `🔴 Fuera de ${closestGeofence.name} (${Math.round(closestDistance)} m)`;
          }

          const dashboardSafeDistance = document.getElementById("dashboardSafeDistance");

          if (dashboardSafeDistance) {
            dashboardSafeDistance.textContent = `${Math.round(closestDistance)} m`;
          }
        }
      }

    } catch (error) {
      dashboardMembersCount.textContent = "Error";
      dashboardGeofencesCount.textContent = "Error";
      dashboardAlertsCount.textContent = "Error";

      const dashboardSafeZone = document.getElementById("dashboardSafeZone");
      if (dashboardSafeZone) {
        dashboardSafeZone.textContent = "Error";
      }

      const dashboardSafeDistance = document.getElementById("dashboardSafeDistance");
      if (dashboardSafeDistance) {
        dashboardSafeDistance.textContent = "Error";
      }
    }
  }

  loadDashboardStats();
}

/* ELIMINAR ALERTA */

async function deleteAlert(id) {
  const confirmDelete = confirm("¿Deseas eliminar esta alerta?");

  if (!confirmDelete) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/alerts/${id}`, {
      method: "DELETE"
    });

    if (response.ok) {
      alert("Alerta eliminada correctamente.");
      loadAlerts();
    } else {
      alert("No se pudo eliminar la alerta.");
    }
  } catch (error) {
    alert("Error al conectar con el backend.");
  }
}

/* HISTORIAL - DEPENDIENTES, FECHA, HORA Y DESTINO */

const historyDependentSelect = document.getElementById("historyDependentSelect");
const historyDate = document.getElementById("historyDate");
const historyStartTime = document.getElementById("historyStartTime");
const historyEndTime = document.getElementById("historyEndTime");

if (historyDependentSelect && historyDate) {
 async function loadHistoryDependents() {
  try {
    const response = await fetch(`${API_URL}/family-members`);
    const members = await response.json();

    const dependents = members.filter(member => member.role === "Dependiente");

    historyDependentSelect.innerHTML = "";

    if (dependents.length === 0) {
      historyDependentSelect.innerHTML = `<option value="">Sin dependientes</option>`;
      return;
    }

    dependents.forEach(member => {
      const option = document.createElement("option");
      option.value = member.id;
      option.textContent = member.fullName;
      historyDependentSelect.appendChild(option);
    });

    loadHistoryLocationByDependent(historyDependentSelect.value);

  } catch (error) {
    historyDependentSelect.innerHTML = `<option value="">Error al cargar</option>`;
  }
}

  const now = new Date();

  historyDate.textContent = now.toLocaleDateString("es-PE", {
    timeZone: "America/Lima",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });

  const endTime = new Date(now.getTime() + 30 * 60000);

  if (historyStartTime && historyEndTime) {
    historyStartTime.textContent = now.toLocaleTimeString("es-PE", {
      timeZone: "America/Lima",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });

    historyEndTime.textContent = endTime.toLocaleTimeString("es-PE", {
      timeZone: "America/Lima",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  }

  loadHistoryDependents();
  historyDependentSelect.addEventListener("change", () => {
  loadHistoryLocationByDependent(historyDependentSelect.value);
});
  async function loadHistoryLocationByDependent(dependentId) {
  if (!dependentId) return;

  try {
    const response = await fetch(`${API_URL}/tracking/${dependentId}`);
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
}

const historyDestination = document.getElementById("historyDestination");

if (historyDestination) {
  async function loadHistoryDestination() {
    try {
      const response = await fetch(`${API_URL}/geofences`);
      const geofences = await response.json();

      if (geofences.length === 0) {
        historyDestination.textContent = "Sin geocerca registrada";
        return;
      }

      historyDestination.textContent = geofences[0].name;

    } catch (error) {
      historyDestination.textContent = "Error al cargar destino";
    }
  }

  loadHistoryDestination();
}
/* MODO DEPENDIENTE */

const dependentTrackingSelect =
  document.getElementById("dependentTrackingSelect");

const sendLocationButton =
  document.getElementById("sendLocationButton");

const trackingMessage =
  document.getElementById("trackingMessage");

if (
  dependentTrackingSelect &&
  sendLocationButton &&
  trackingMessage
) {

  async function loadDependentsForTracking() {
    try {
      const response = await fetch(`${API_URL}/family-members`);
      const members = await response.json();

      const dependents =
        members.filter(member => member.role === "Dependiente");

      dependentTrackingSelect.innerHTML = "";

      dependents.forEach(member => {
        const option = document.createElement("option");

        option.value = member.id;
        option.textContent = member.fullName;

        dependentTrackingSelect.appendChild(option);
      });

    } catch (error) {
      trackingMessage.textContent =
        "Error cargando dependientes.";
    }
  }

  sendLocationButton.addEventListener("click", () => {

    const dependentId = dependentTrackingSelect.value;

    if (!dependentId) {
      trackingMessage.textContent =
        "Selecciona un dependiente.";
      return;
    }

    if (!navigator.geolocation) {
      trackingMessage.textContent =
        "GPS no soportado.";
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async position => {

        try {

          const response = await fetch(
            `${API_URL}/tracking/location`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                dependentId: parseInt(dependentId),
                latitude: position.coords.latitude.toString(),
                longitude: position.coords.longitude.toString()
              })
            }
          );

          if (response.ok) {
            trackingMessage.textContent =
              "✅ Ubicación enviada correctamente.";
          } else {
            trackingMessage.textContent =
              "❌ No se pudo enviar ubicación.";
          }

        } catch (error) {
          trackingMessage.textContent =
            "❌ Error al conectar con backend.";
        }

      }
    );

  });

  loadDependentsForTracking();
}
/* DASHBOARD - SELECTOR DE DEPENDIENTE */

const dashboardDependentSelect =
  document.getElementById("dashboardDependentSelect");

if (dashboardDependentSelect) {
  async function loadDashboardDependents() {
    try {
      const response = await fetch(`${API_URL}/family-members`);
      const members = await response.json();

      const dependents =
        members.filter(member => member.role === "Dependiente");

      dashboardDependentSelect.innerHTML = "";

      if (dependents.length === 0) {
        dashboardDependentSelect.innerHTML =
          `<option value="">Sin dependientes</option>`;
        return;
      }

      dependents.forEach(member => {
        const option = document.createElement("option");
        option.value = member.id;
        option.textContent = member.fullName;
        dashboardDependentSelect.appendChild(option);
      });

      const savedDependentId =
        localStorage.getItem("dashboardSelectedDependentId");

      if (savedDependentId) {
        dashboardDependentSelect.value = savedDependentId;
      } else {
        localStorage.setItem(
          "dashboardSelectedDependentId",
          dashboardDependentSelect.value
        );
      }

    } catch (error) {
      dashboardDependentSelect.innerHTML =
        `<option value="">Error al cargar</option>`;
    }
  }

  dashboardDependentSelect.addEventListener("change", () => {
    localStorage.setItem(
      "dashboardSelectedDependentId",
      dashboardDependentSelect.value
    );

    location.reload();
  });

  loadDashboardDependents();
}