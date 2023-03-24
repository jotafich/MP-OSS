// Funciones para manejar el almacenamiento en localStorage
function saveUserData(data) {
    localStorage.setItem("userData", JSON.stringify(data));
}

function getUserData() {
    return JSON.parse(localStorage.getItem("userData"));
}

function saveEpic(epic) {
    console.log(epic); // Agregado para verificar si se está guardando correctamente la épica
    const epics = getEpics();
    const index = epics.findIndex(item => item.id === epic.id);
    if (index === -1) {
      epics.push(epic);
    } else {
      epics[index] = epic;
    }
    localStorage.setItem("epics", JSON.stringify(epics));
  }
  
    
  function getEpics() {
    const epics = JSON.parse(localStorage.getItem("epics")) || [];
    console.log(epics); // Agregado para verificar si estamos obteniendo un array de épicas
    return epics;
  }
  

function deleteEpic(epicId) {
    const epics = getEpics();
    const filteredEpics = epics.filter(epic => epic.id !== epicId);
    localStorage.setItem("epics", JSON.stringify(filteredEpics));
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

function showSuccessMessage() {
    const message = document.createElement("div");
    message.className = "success-message";
    message.textContent = "Los datos fueron ingresados exitosamente";
    document.body.appendChild(message);
    setTimeout(() => {
        message.remove();
    }, 3000);
}

function toggleUserDataForm() {
    const userDataForm = document.querySelector(".user-data");
    userDataForm.classList.toggle("collapsed");
}

// Funciones para manejar las tarjetas de épicas
function setupEpicCards() {
    const epics = getEpics();
    epics.forEach(renderEpicCard);
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
    const epics = getEpics();
    const epic = epics.find(epic => epic.id == epicid);
    if (epic) {
        epic.dependenciesResolved = e.target.checked;
        localStorage.setItem("epics", JSON.stringify(epics)); // Guardar el arreglo actualizado en localStorage
        updateDependencyStatus(e.target);
        const sortedEpics = epics.sort((a, b) => new Date(a.implementationDate) - new Date(b.implementationDate));
        renderEpicTable(sortedEpics);
    } else {
        console.error(`No se encontró una épica con id ${epicid}`);
    }
}

  

function updateDependencyStatus(checkbox) {
    const epicId = checkbox.closest(".epic-card").dataset.id;
    const epics = getEpics();
    const epic = epics.find(epic => epic.id == epicId);
    if (epic) {
        epic.dependenciesResolved = checkbox.checked;
        localStorage.setItem("epics", JSON.stringify(epics)); // Guardar el arreglo actualizado en localStorage
        const status = epic.dependenciesResolved ? "OK" : "PENDIENTE";
        const label = checkbox.nextElementSibling;
        label.style.color = checkbox.checked ? "green" : "red";
        label.textContent = `Dependencias ${status}`;
    } else {
        console.error(`No se encontró una épica con ID ${epicId}`);
    }
}

  

function getDependencyStatus(epic) {
    return epic.dependenciesResolved ? "OK" : "PENDIENTE";
}


function handleDeleteEpicClick(e) {
const card = e.target.closest(".epic-card");
const epicId = parseInt(card.dataset.id, 10);
deleteEpic(epicId);
card.remove();
}

// Funciones para manejar el formulario de agregar épicas
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
    };
    epic.dependenciesResolved = false; // Agregar esta línea
    saveEpic(epic);
    renderEpicCard(epic);
    e.target.reset();
  }
  
  

// Funciones para manejar la tabla de épicas
function setupEpicTable() {
// Aquí puedes configurar la tabla de épicas si es necesario
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