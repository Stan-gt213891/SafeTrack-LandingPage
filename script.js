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