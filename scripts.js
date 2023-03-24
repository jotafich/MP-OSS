// Inicializar Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCiZF3Sd0GUC_lLCdlCycOYIn8_dO5cefE",
  authDomain: "mp-oss.firebaseapp.com",
  databaseURL: "https://mp-oss-default-rtdb.firebaseio.com/",
  projectId: "mp-oss",
  storageBucket: "mp-oss.appspot.com",
  messagingSenderId: "859474965357",
  appId: "1:859474965357:web:4b00b672c5dfdd65c1e064",
  measurementId: "G-NZZRJCDEMG"
};
firebase.initializeApp(firebaseConfig);

// Referencia a la base de datos
const database = firebase.database();

// Funciones para manejar el almacenamiento en Firebase
function saveUserData(data) {
  database.ref('userData').set(data);
}

function getUserData() {
  return new Promise((resolve, reject) => {
    database.ref('userData').once('value').then(snapshot => {
      resolve(snapshot.val());
    }).catch(error => {
      reject(error);
    });
  });
}

function saveEpic(epic) {
  database.ref(`epics/${epic.id}`).set(epic);
}

function getEpics() {
  return new Promise((resolve, reject) => {
    database.ref('epics').once('value').then(snapshot => {
      const epics = [];
      snapshot.forEach(childSnapshot => {
        epics.push(childSnapshot.val());
      });
      resolve(epics);
    }).catch(error => {
      reject(error);
    });
  });
}

function deleteEpic(epicId) {
  database.ref(`epics/${epicId}`).remove();
}

// Funciones para manejar el formulario de datos de usuario
function setupUserDataForm() {
  const form = document.getElementById("user-data-form");
  form.addEventListener("submit", handleUserDataSubmit);

  const expandButton = document.getElementById("expand-user-data");
  expandButton.addEventListener("click", toggleUserDataForm);
}

function handleUserDataSubmit(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const userData = {
    nombre: formData.get("nombre"),
    apellido: formData.get("apellido"),
    squad: formData.get("squad"),
    quarter: formData.get("quarter")
  };
  saveUserData(userData);
  showSuccessMessage();
  toggleUserDataForm();
}

// Funciones para manejar las tarjetas de épicas
function setupEpicCards() {
  getEpics().then(epics => {
    epics.forEach(renderEpicCard);
  });
}

function renderEpicCard(epic) {
  const cardContainer = document.querySelector(".epic-cards");
  const card = document.createElement("div");
  card.className = "epic-card";
  card.dataset.id = epic.id;

  card.innerHTML = `
    <h3>${epic.number} - ${epic.name}</h3>
    <p>Squads con dependencias: ${epic.dependentSquads}</p>
    <p>Fecha de inicio: ${epic.startDate}</p>
    <p>Fecha de implementación: ${epic.implementationDate}</p>
    <div class="dependency-status">
      <input type="checkbox" id="dependency-${epic.id}" ${epic.hasOwnProperty('dependenciesResolved') && epic.dependenciesResolved ? 'checked' : ''}>
      <label for="dependency-${epic.id}">Dependencias ${getDependencyStatus(epic)}</label>
    </div>
    <button class="delete-epic">Eliminar</button>
  `;

  card.querySelector(".delete-epic").addEventListener("click", handleDeleteEpicClick);
  const checkbox = card.querySelector("input[type='checkbox']");
  checkbox.addEventListener("change", handleDependencyStatusChange);
  cardContainer.appendChild(card);
  }
  
  function handleDependencyStatusChange(e) {
    const epicid = e.target.closest(".epic-card").dataset.id;
    const epicsRef = firebase.database().ref('epics');
    epicsRef.child(epicid).update({dependenciesResolved: e.target.checked}, (error) => {
      if (error) {
        console.log("Error updating epic: ", error);
      } else {
        console.log("Epic updated successfully!");
      }
    });
  }

  function getDependencyStatus(epic) {
    return epic.dependenciesResolved ? "OK" : "PENDIENTE";
  }

  function handleDeleteEpicClick(e) {
    const card = e.target.closest(".epic-card");
    const epicId = parseInt(card.dataset.id, 10);
    const epicsRef = firebase.database().ref('epics');
    epicsRef.child(epicId).remove((error) => {
      if (error) {
        console.log("Error deleting epic: ", error);
      } else {
        console.log("Epic deleted successfully!");
      }
    });
    card.remove();
  }

  function setupAddEpicForm() {
    const form = document.getElementById("add-epic-form");
    form.addEventListener("submit", handleAddEpicSubmit);
  }

  function handleAddEpicSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const epic = {
      id: Date.now(),
      number: formData.get("epic-number"),
      name: formData.get("epic-name"),
      dependentSquads: formData.get("dependent-squads"),
      startDate: formData.get("start-date"),
      implementationDate: formData.get("implementation-date"),
      dependenciesResolved: false
    };
    const epicsRef = firebase.database().ref('epics');
    epicsRef.push(epic, (error) => {
      if (error) {
        console.log("Error adding epic: ", error);
      } else {
        console.log("Epic added successfully!");
      }
    });
    renderEpicCard(epic);
    e.target.reset();
  }

  function setupEpicTable() {
    // Configurar la tabla de épicas si es necesario
  }

  function renderEpicTable(epics) {
    const userData = getUserData();
    const tableContainer = document.querySelector(".epic-table");
    tableContainer.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Número de épica</th>
                    <th>Nombre de épica</th>
                    <th>Squads con dependencias</th>
                    <th>Fecha de inicio</th>
                    <th>Fecha de implementación</th>
                    <th>Dependencias resueltas</th>
                    <th>Nombre</th>
                    <th>Apellido</th>
                </tr>
            </thead>
            <tbody>
                ${epics.map(epic => `
                    <tr data-id="${epic.id}">
                        <td>${epic.number}</td>
                        <td>${epic.name}</td>
                        <td>${epic.dependentSquads}</td>
                        <td>${epic.startDate}</td>
                        <td>${epic.implementationDate}</td>
                        <td>${epic.dependenciesResolved ? "OK" : "PENDIENTE"}</td>
                        <td>${userData.nombre}</td>
                        <td>${userData.apellido}</td>
                    </tr>
                `).join("")}
            </tbody>
        </table>
    `;
  }

  // Funciones para manejar eventos de la página
function handleViewTableClick() {
const epicTable = document.querySelector(".epic-table");
if (epicTable.style.display === "block") {
epicTable.style.display = "none";
} else {
const sortedEpics = getEpics().sort((a, b) => new Date(a.implementationDate) - new Date(b.implementationDate));
renderEpicTable(sortedEpics);
epicTable.style.display = "block";
}
}

// Función principal para configurar la página
function main() {
// Configurar el formulario de datos de usuario
setupUserDataForm();
// Configurar las tarjetas de épicas
setupEpicCards();
// Configurar el formulario de agregar épicas
setupAddEpicForm();

// Configurar la tabla de épicas
setupEpicTable();

// Configurar el botón de ver tabla
document.getElementById('view-table').addEventListener('click', handleViewTableClick);
}

// Ejecutar la función principal
main();





