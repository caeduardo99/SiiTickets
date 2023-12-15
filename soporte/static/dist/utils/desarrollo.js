$(document).ready(function () {
  $("#myTabs a").on("click", function (e) {
    e.preventDefault();
    $(this).tab("show");
    loadListProjects();
  });

  const rowDescripcionGeneral = document.getElementById(
    "rowDescripcionGeneral"
  );
  const rowFechaInformacionAsignacion = document.getElementById(
    "rowFechaInformacionAsignacion"
  );
  const rowFechaInformacionCreacion = document.getElementById(
    "rowFechaInformacionCreacion"
  );
  const rowFechaInformacionFinalizacionEstimada = document.getElementById(
    "rowFechaInformacionFinalizacionEstimada"
  );
  const rowFechaInformacionFinalizacion = document.getElementById(
    "rowFechaInformacionFinalizacion"
  );
  const fechaTicketEstimado = document.getElementById("fecha_ticket_estimado");
  const fechaTicketFinalizacion = document.getElementById(
    "fecha_ticket_finalizacion"
  );
  const rowButtonCreateTicket = document.getElementById(
    "rowButtonCreateTicket"
  );
  const inputTitleProject = document.getElementById("inputTitleProject");
  const spanTitleProject = document.getElementById("spanTitleProject");
  const rowSolicitante = document.getElementById("rowSolicitante");
  const rowButtonTask = document.getElementById("rowButtonTask");
  const cuerpoTabla = document.getElementById("tableBodyTasks");
  const rowTableTask = document.getElementById("rowTableTask");
  const btnNewTask = document.getElementById("btnNewTask");
  const rowAgente = document.getElementById("rowAgente");
  const agentesolicitado = document.getElementById("agentesolicitado");
  const solicitante = document.getElementById("solicitante");
  const fechaTicketAsignacion = document.getElementById(
    "fecha_ticket_asignacion"
  );
  const modalInfoProyectLabel = document.getElementById(
    "modalInfoProyectLabel"
  );
  const ticketsTable = document
    .getElementById("tickets-table")
    .getElementsByTagName("tbody")[0];
  const inputEditTitleProject = document.getElementById('inputEditTitleProject');
  const inputEditNumHoras = document.getElementById('inputEditNumHoras');
  const editSolicitante = document.getElementById('editSolicitante');
  const editAgenteSolicitado = document.getElementById('editAgenteSolicitado');
  const editFechaEstimada = document.getElementById('editFechaEstimada');
  const editFechaFin = document.getElementById('editFechaFin');
  const btnCreateTicket = document.getElementById('btnCreateTicket');
  const editDescripcionGeneral = document.getElementById('editDescripcionGeneral');
  const tableBodyTasksEdit = document.getElementById('tableBodyTasksEdit');

  var resultadosAgentesData = window.resultados_agentes_data;
  var resultadosProyectos;

  let contadorFilas = 1,
    nameAgente,
    nameSolicitante,
    estadoTicket = 1,
    arrayTaskMain = [],
    arrayTaskSecond = [];

  // FUNCIONAMIENTO DEL INPUT TITULO
  inputTitleProject.addEventListener("input", function () {
    var inputValueUpperCase = inputTitleProject.value.toUpperCase();
    inputTitleProject.value = inputValueUpperCase;

    if (inputTitleProject.value != "") {
      spanTitleProject.style.display = "none";
      rowAgente.style.display = "";
      rowSolicitante.style.display = "";
    } else {
      spanTitleProject.style.display = "";
      rowAgente.style.display = "none";
      rowSolicitante.style.display = "none";
      rowDescripcionGeneral.style.display = "none";
    }
  });

  // METODO PARA CONTROLAR LAS ACCIONES DEL SELECT DEL AGENTE
  $("#agentesolicitado").on("change", function () {
    nameAgente = agentesolicitado.options[agentesolicitado.selectedIndex].text;

    if (agentesolicitado.value != "") {
      fechaTicketAsignacion.disabled = false;
      rowFechaInformacionFinalizacionEstimada.style.display = "";
      rowFechaInformacionFinalizacion.style.display = "";
      estadoTicket = 2;
    } else {
      fechaTicketAsignacion.value = "";
      fechaTicketEstimado.value = "";
      fechaTicketFinalizacion.value = "";
      rowFechaInformacionFinalizacionEstimada.style.display = "none";
      rowFechaInformacionFinalizacion.style.display = "none";
      fechaTicketAsignacion.disabled = true;
      estadoTicket = 1;
    }
  });

  // METODO PARA CONTROLAR EL AGENTE DEL SELECT SOLICITANTE
  $("#solicitante").on("change", function () {
    rowDescripcionGeneral.style.display = "";
    rowButtonTask.style.display = "";
    rowFechaInformacionCreacion.style.display = "";
    rowFechaInformacionAsignacion.style.display = "";
    rowButtonCreateTicket.style.display = "";

    nameSolicitante = solicitante.options[solicitante.selectedIndex].text;
  });

  // FUNCION DE PARA CREAR UNA NUEVA FILA SIN EL BTON
  function crearNuevaFila(numerador, descripcion, responsable) {
    var nuevaFila = document.createElement("tr");
    nuevaFila.className = "table-dark";

    var celdaNumerador = document.createElement("td");
    celdaNumerador.textContent = numerador;
    nuevaFila.appendChild(celdaNumerador);

    var celdaInput = document.createElement("td");
    celdaInput.textContent = descripcion;
    celdaInput.id = "descripcionTareaSecundaria";
    nuevaFila.appendChild(celdaInput);

    var celdaSelect = document.createElement("td");
    var selectElement = document.createElement("select");
    selectElement.className = "form-control";
    selectElement.name = "responsableTarea";

    // Llenar el select con los datos de resultados_agentes_data
    for (var i = 0; i < resultadosAgentesData.length; i++) {
      var agente = resultadosAgentesData[i];
      var option = document.createElement("option");
      option.value = agente.id;
      option.textContent = agente.full_name;
      selectElement.appendChild(option);
    }
    selectElement.value = responsable;
    selectElement.disabled = true;

    var celdaHoras = document.createElement("td");
    var inputHoras = document.createElement("input");
    inputHoras.type = "number";
    inputHoras.className = "form-control";
    inputHoras.name = "inputHorasAdicionales";
    celdaHoras.appendChild(inputHoras);
    nuevaFila.appendChild(celdaHoras);

    celdaSelect.appendChild(selectElement);
    nuevaFila.appendChild(celdaSelect);

    var celdaTareasAdicionales = document.createElement("td");
    var inputTareasAdicionales = document.createElement("input");
    inputTareasAdicionales.type = "text";
    inputTareasAdicionales.className = "form-control";
    inputTareasAdicionales.name = "tareasAdicionales";
    celdaTareasAdicionales.appendChild(inputTareasAdicionales);
    nuevaFila.appendChild(celdaTareasAdicionales);

    var celdaEliminar = document.createElement("td");
    var divRow = document.createElement("div");
    divRow.className = "row g-1";
    var divCol1 = document.createElement("div");
    divCol1.className = "col-md-12";

    divRow.appendChild(divCol1);

    var btnEliminar = document.createElement("button");
    btnEliminar.textContent = "-";
    btnEliminar.className = "btn btn-danger btn-sm btn-block";

    // Lógica para eliminar la fila
    btnEliminar.onclick = function () {
      nuevaFila.remove();
    };

    divCol1.appendChild(btnEliminar);

    celdaEliminar.appendChild(divRow);
    nuevaFila.appendChild(celdaEliminar);
    return nuevaFila;
  }

  // METODO PARA MANEJAR EL EVENTO CLICK DEL BOTON DE LA NUEVA TAREA PRINCIPAL
  btnNewTask.addEventListener("click", function () {
    rowTableTask.style.display = "";

    var nuevaFila = document.createElement("tr");
    nuevaFila.className = "table-light";

    var celdaNumerador = document.createElement("td");
    celdaNumerador.textContent = contadorFilas;
    nuevaFila.appendChild(celdaNumerador);

    var celdaInput = document.createElement("td");
    var inputText = document.createElement("input");
    inputText.type = "text";
    inputText.className = "form-control";
    inputText.name = "descripcionTarea";
    celdaInput.appendChild(inputText);
    nuevaFila.appendChild(celdaInput);

    var celdaSelect = document.createElement("td");
    var selectElement = document.createElement("select");
    var defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Seleccionar Responsable";
    selectElement.className = "form-control";
    selectElement.name = "responsableTarea";
    selectElement.appendChild(defaultOption);

    // Llenar el select con los datos de resultados_agentes_data
    for (var i = 0; i < resultadosAgentesData.length; i++) {
      var agente = resultadosAgentesData[i];
      var option = document.createElement("option");
      option.value = agente.id;
      option.textContent = agente.full_name;
      selectElement.appendChild(option);
    }

    var celdaHoras = document.createElement("td");
    var inputHoras = document.createElement("input");
    inputHoras.type = "number";
    inputHoras.className = "form-control";
    inputHoras.name = "inputHoras";
    celdaHoras.appendChild(inputHoras);
    nuevaFila.appendChild(celdaHoras);

    celdaSelect.appendChild(selectElement);
    nuevaFila.appendChild(celdaSelect);

    var celdaTareasAdicionales = document.createElement("td");
    var inputTareasAdicionales = document.createElement("input");
    inputTareasAdicionales.type = "text";
    inputTareasAdicionales.className = "form-control";
    inputTareasAdicionales.name = "tareasAdicionales";
    inputTareasAdicionales.disabled = true;
    celdaTareasAdicionales.appendChild(inputTareasAdicionales);
    nuevaFila.appendChild(celdaTareasAdicionales);

    var celdaEliminar = document.createElement("td");
    var divRow = document.createElement("div");
    divRow.className = "row g-1";
    var divCol1 = document.createElement("div");
    divCol1.className = "col-md-6";
    var divCol2 = document.createElement("div");
    divCol2.className = "col-md-6";

    divRow.appendChild(divCol1);
    divRow.appendChild(divCol2);

    var btnEliminar = document.createElement("button");
    var btnAddSecond = document.createElement("button");
    btnEliminar.textContent = "-";
    btnAddSecond.textContent = "+";
    btnEliminar.className = "btn btn-danger btn-sm";
    btnAddSecond.className = "btn btn-success btn-sm";
    btnAddSecond.type = "button";

    // Lógica para eliminar la fila
    btnEliminar.onclick = function () {
      nuevaFila.remove();
    };

    // Logica para agregar tarea secundaria
    btnAddSecond.onclick = function () {
      var descripcion = inputText.value;
      var responsable = selectElement.value;
      var horas = inputHoras.value;
      var tareasAdicionales = "";

      var nuevaFilaSecundaria = crearNuevaFila(
        contadorFilas,
        descripcion,
        responsable,
        horas,
        tareasAdicionales
      );
      cuerpoTabla.appendChild(nuevaFilaSecundaria);
      contadorFilas++;
    };

    divCol1.appendChild(btnEliminar);
    divCol2.appendChild(btnAddSecond);

    celdaEliminar.appendChild(divRow);
    nuevaFila.appendChild(celdaEliminar);

    contadorFilas++;

    cuerpoTabla.appendChild(nuevaFila);
  });

  // // METODO DE CREACION PARA MANEJAR EL BOTON DE CREACION DE TICKET
  $("form").submit(function (event) {
    event.preventDefault(); // Evitar que el formulario se envíe normalmente

    var form = $(this);

    form.find("input[name='estadoTicket']").val(estadoTicket);

    // CREAR EL ARREGLO DE ACTIVIDADES PRINCIPALES
    const filasPrincipales = cuerpoTabla.querySelectorAll("tr.table-light");
    const filasSecundarias = cuerpoTabla.querySelectorAll("tr.table-dark");

    filasPrincipales.forEach(function (fila) {
      const descripcionInput = fila.querySelector('[name="descripcionTarea"]');
      const horasAsignadasInput = fila.querySelector('[name="inputHoras"]');
      const selectResponsable = fila.querySelector('[name="responsableTarea"]');
      const descripcion = descripcionInput ? descripcionInput.value : "";
      const responsable = selectResponsable ? selectResponsable.value || 2 : 2;
      const horasAsignadas = horasAsignadasInput
        ? horasAsignadasInput.value
        : 0;

      const existeDescripcion = arrayTaskMain.some(
        (item) => item.descripcion === descripcion
      );

      if (!existeDescripcion && descripcion.trim() !== "") {
        const objInfoTaskMain = {
          descripcion: descripcion,
          horasAsignadas: horasAsignadas,
          responsable: responsable,
        };
        arrayTaskMain.push(objInfoTaskMain);
      }
    });

    
    filasSecundarias.forEach(function (fila) {
      const descripcionInput = fila.querySelector("#descripcionTareaSecundaria");
      const horasAsignadasInput = fila.querySelector(
        '[name="inputHorasAdicionales"]'
      );
      const idResponsable = fila.querySelector('[name="responsableTarea"]');
      const descripcionSecundaria = fila.querySelector(
        '[name="tareasAdicionales"]'
      );
    
      const descripcionPrincipal = descripcionInput
        ? descripcionInput.textContent
        : "";
      const horasAsignadas = horasAsignadasInput
        ? parseInt(horasAsignadasInput.value)
        : 0;
      const responsable = idResponsable ? parseInt(idResponsable.value) : 0;
      const tareasSecundarias = descripcionSecundaria
        ? descripcionSecundaria.value
        : "";
    
      const existeCombinacion = arrayTaskSecond.some(
        (item) =>
          item.descripcionPrincipal === descripcionPrincipal &&
          item.descripcionSecundaria === tareasSecundarias
      );
    
      if (!existeCombinacion) {
        const objInfoTaskSecond = {
          descripcionPrincipal: descripcionPrincipal,
          horasAsignadas: horasAsignadas,
          responsable: responsable,
          descripcionSecundaria: tareasSecundarias,
        };
    
        // Agregar el objeto al arreglo
        arrayTaskSecond.push(objInfoTaskSecond);
      }
    });

    // Agregar arrayTaskMainData como un campo en los datos del formulario
    form.append(
      $("<input>")
        .attr("type", "hidden")
        .attr("name", "arrayTaskMain")
        .val(JSON.stringify(arrayTaskMain))
    );
    form.append(
      $("<input>")
        .attr("type", "hidden")
        .attr("name", "arrayTaskSecond")
        .val(JSON.stringify(arrayTaskSecond))
    );

    btnCreateTicket.disabled = true;

    $.post(form.attr("action"), form.serialize(), function (data) {
      // Verificar si la respuesta es exitosa
      if (data.status === "success") {
        // Mostrar un toast o alerta con el mensaje
        toastr.success(data.message, "Éxito");

        // Recargar la página después de un breve retraso (por ejemplo, 1 segundo)
        setTimeout(function () {
          window.location.reload();
        }, 1000);
      } else {
        // Manejar otros casos o mostrar mensajes de error
        toastr.error("Error al crear el ticket: " + data.message, "Error");
      }
    }).fail(function (xhr, status, error) {
      // Manejar errores de la solicitud AJAX
      toastr.error("Error en la solicitud AJAX: " + error, "Error");
    });
  });

  // TRAER LA INFORMACION DE TODOS LOS PROYECTOS
  fetch("ticketDesarrolloCreados/")
    .then((response) => response.json())
    .then((data) => {
      resultadosProyectos = data;
    })
    .catch((error) => console.error("Error:", error));


  // FUNCION PARA LA CARGA DE LA TABLA
  function loadListProjects() {
    ticketsTable.innerHTML = "";
    resultadosProyectos.forEach((proyecto) => {
      const row = ticketsTable.insertRow();

      // Agregar celdas con los valores de cada propiedad
      row.insertCell().textContent = `000-${proyecto.NumTicket}`;
      row.insertCell().textContent = proyecto.Empresa;
      row.insertCell().textContent = proyecto.tituloProyecto;
      row.insertCell().textContent = proyecto.Cliente;
      row.insertCell().textContent = proyecto.Agente;
      row.insertCell().textContent = proyecto.EstadoProyecto;

      // Agregar la nueva celda con un botón
      const buttonCell = row.insertCell();
      const button = document.createElement("button");
      button.className = "btn btn-info btn-block btn-sm";
      button.textContent = "Ver";
      button.dataset.toggle = "modal";
      button.dataset.target = "#modalInfoProyect";
      // FUNCIONALIDAD DEL BOTON PARA OTRO MODAL
      button.addEventListener("click", function () {
        modalInfoProyectLabel.innerHTML = "";
        modalInfoProyectLabel.innerHTML = `Proyecto ${proyecto.tituloProyecto}`;

        inputEditTitleProject.value = "";
        inputEditTitleProject.value = proyecto.tituloProyecto;

        inputEditNumHoras.value = "";
        inputEditNumHoras.value = proyecto.HorasTotales;

        editSolicitante.value = "";
        editSolicitante.value = proyecto.idCliente;
        const changeEvent = new Event('change');
        editSolicitante.dispatchEvent(changeEvent);

        editAgenteSolicitado.value = "";
        editAgenteSolicitado.value = proyecto.idAgente;
        const changeEventAgente = new Event('change');
        editAgenteSolicitado.dispatchEvent(changeEventAgente);

        editFechaEstimada.value = "";
        editFechaEstimada.value = proyecto.fechaFinalizacionEstimada;

        editFechaFin.value = "";
        editFechaFin.value = proyecto.fechaFinalizacion;

        editDescripcionGeneral.value = "";
        editDescripcionGeneral.value = proyecto.descripcionActividadGeneral;

        // TABLA PARA LA EDICION DE ACTIVIDADES PRINCIPALES Y SECUNDARIAS
        tableBodyTasksEdit.innerHTML = '';



      });
      buttonCell.appendChild(button);
    });
  }
});
