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
  const btnSaveChange = document.getElementById("btnSaveChange");
  const modalInfoProyectLabel = document.getElementById(
    "modalInfoProyectLabel"
  );
  const ticketsTable = document
    .getElementById("tickets-table")
    .getElementsByTagName("tbody")[0];
  const inputEditTitleProject = document.getElementById(
    "inputEditTitleProject"
  );
  const inputEditNumHoras = document.getElementById("inputEditNumHoras");
  const editSolicitante = document.getElementById("editSolicitante");
  const editAgenteSolicitado = document.getElementById("editAgenteSolicitado");
  const editFechaEstimada = document.getElementById("editFechaEstimada");
  const btnCreateTicket = document.getElementById("btnCreateTicket");
  const editDescripcionGeneral = document.getElementById(
    "editDescripcionGeneral"
  );
  const btnRunEdit = document.getElementById("btnRunEdit");
  const tableBodyTasksEdit = document.getElementById("tableBodyTasksEdit");
  const tableTasksEdit = document.getElementById("tableTasksEdit");
  const btnChangeState = document.getElementById("btnChangeState");

  var resultadosAgentesData = window.resultados_agentes_data;
  var resultadosProyectos;

  let contadorFilas = 1,
    nameAgente,
    nameSolicitante,
    estadoTicket = 1,
    arrayTaskMain = [],
    arrayTaskSecond = [],
    infoGeneralProject,
    detalleTicket,
    arrayIdMainTask = [],
    arrayIdSecondsTask = [];

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
    var agenteValue = $(this).val();
    nameAgente = agentesolicitado.options[agentesolicitado.selectedIndex].text;

    let horasSecundariasArray = [];

    // Realizar la solicitud AJAX
    $.ajax({
      type: "GET",
      url: `infoAgenteSolicitado/${agenteValue}/`, // La URL de tu vista con el id_agente
      dataType: "json",
      success: function (data) {
        $("#modalInfoAgente").modal("show");
        let infoProject = [],
          infoTareasPrincipales = [],
          infoTareasAdicionales = [];

        infoProject = data.infoProject;
        infoTareasPrincipales = data.infoTareasPrincipales;
        infoTareasAdicionales = data.infoTareasAdicionales;

        const titleModalAgente = document.getElementById("titleModalAgente");
        let tbodyTareasPrincipales = document.getElementById(
          "tbodyTareasPrincipales"
        );
        let rowTableTaskMain = document.getElementById("rowTableTaskMain");
        let tbodyActividadesSecundarias = document.getElementById(
          "tbodyActividadesSecundarias"
        );
        let rowTableTaskSecond = document.getElementById("rowTableTaskSecond");
        let rowTrabajo = document.getElementById("rowTrabajo");

        tbodyTareasPrincipales.innerHTML = "";
        tbodyActividadesSecundarias.innerHTML = "";
        rowTableTaskMain.style.display = "";
        rowTableTaskSecond.style.display = "";

        titleModalAgente.textContent = `${infoProject[0].first_name} ${infoProject[0].last_name}`;

        if (infoTareasPrincipales.length != 0) {
          rowTrabajo.style.display = "none";
          infoTareasPrincipales.forEach((project) => {
            let row = tbodyTareasPrincipales.insertRow();

            let cellTarea = row.insertCell(0);
            let cellHoras = row.insertCell(1);

            cellTarea.textContent =
              project.actividadPrincipal == null
                ? (rowTableTaskMain.style.display = "none")
                : project.actividadPrincipal;
            cellHoras.textContent =
              project.horasPrincipales == null
                ? (rowTableTaskMain.style.display = "none")
                : `${project.horasPrincipales} horas`;
          });
        } else {
          rowTableTaskMain.style.display = "none";
          rowTrabajo.style.display = "";
        }

        let sumasPorFecha = {};

        if (infoTareasAdicionales.length != 0) {
          infoTareasAdicionales.forEach((project) => {
            rowTrabajo.style.display = "none";
            let row = tbodyActividadesSecundarias.insertRow();

            let cellProject = row.insertCell(0);
            let cellTask = row.insertCell(1);
            let cellHorasSecundarias = row.insertCell(2);
            let cellFechaDesarrollo = row.insertCell(3);

            cellProject.textContent = project.Proyecto;
            cellTask.textContent =
              project.tareaSecundaria == null
                ? "Sin tareas"
                : project.tareaSecundaria;
            cellHorasSecundarias.textContent =
              project.horasSecundarias == null
                ? "Sin tareas"
                : `${project.horasSecundarias} hora/s`;
            cellFechaDesarrollo.textContent = project.fechaDesarrollo.substring(
              0,
              10
            );
            if (!sumasPorFecha[project.fechaDesarrollo]) {
              sumasPorFecha[project.fechaDesarrollo] = 0;
            }
            sumasPorFecha[project.fechaDesarrollo] += project.horasSecundarias;
            horasSecundariasArray.push(project.horasSecundarias);
          });
        } else {
          rowTableTaskSecond.style.display = "none";
          rowTrabajo.style.display = "";
        }

        const horasTotales = 8;
        $("#divProgressBarTime").empty();
        const divProgressBarSelector = "#divProgressBarTime";
        for (let fecha in sumasPorFecha) {
          if (sumasPorFecha.hasOwnProperty(fecha)) {
            let horasPorFecha = sumasPorFecha[fecha];
            let porcentajePorFecha = (horasPorFecha / horasTotales) * 100;
            let parrafoHTML = `<p><b>${horasPorFecha}</b> horas ocupadas el <b>${fecha.substring(
              0,
              10
            )}</b>.</p>`;
            let progressBarHTML = `<div class="progress">
                              <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: ${porcentajePorFecha}%" aria-valuenow="${porcentajePorFecha}" aria-valuemin="0" aria-valuemax="100">
                                ${porcentajePorFecha.toFixed(2)}%
                              </div>
                            </div>`;
            $(divProgressBarSelector).append(progressBarHTML + parrafoHTML);
            progressBarHTML.innerHTML = "";
            parrafoHTML.innerHTML = "";
          }
        }
      },
      error: function (error) {
        console.error("Error en la solicitud AJAX:", error);
      },
    });

    if (agentesolicitado.value != "") {
      rowFechaInformacionFinalizacionEstimada.style.display = "";
      rowFechaInformacionFinalizacion.style.display = "";
      estadoTicket = 2;

      const today = new Date();
      const formattedDateTime = today.toISOString();
      fechaTicketAsignacion.value = formattedDateTime;
    } else {
      fechaTicketAsignacion.value = "";
      fechaTicketEstimado.value = "";
      fechaTicketFinalizacion.value = "";
      rowFechaInformacionFinalizacionEstimada.style.display = "none";
      rowFechaInformacionFinalizacion.style.display = "none";
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
    inputHoras.placeholder = "Horas diarias";
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

    var celdaFechaDesarrollo = document.createElement("td");
    var inputFechaDesarrollo = document.createElement("input");
    inputFechaDesarrollo.type = "date";
    inputFechaDesarrollo.className = "form-control";
    inputFechaDesarrollo.id = "fechaDesarrolloAdicional";
    celdaFechaDesarrollo.appendChild(inputFechaDesarrollo);
    nuevaFila.appendChild(celdaFechaDesarrollo);

    $("#fechaDesarrollo").datetimepicker({
      dateFormat: "yy-mm-dd",
      timeFormat: "HH:mm:ss",
      showSecond: true,
    });

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

    // FUNCIONAMIENTO DE SELECT
    selectElement.addEventListener("change", function () {
      var selectedId = this.value;
      let horasSecundariasArray = [];

      // Realizar la solicitud AJAX
      $.ajax({
        type: "GET",
        url: `infoAgenteSolicitado/${selectedId}/`, // La URL de tu vista con el id_agente
        dataType: "json",
        success: function (data) {
          $("#modalInfoAgente").modal("show");
          let infoProject = [],
            infoTareasPrincipales = [],
            infoTareasAdicionales = [];

          infoProject = data.infoProject;
          infoTareasPrincipales = data.infoTareasPrincipales;
          infoTareasAdicionales = data.infoTareasAdicionales;

          const titleModalAgente = document.getElementById("titleModalAgente");
          let tbodyTareasPrincipales = document.getElementById(
            "tbodyTareasPrincipales"
          );
          let rowTableTaskMain = document.getElementById("rowTableTaskMain");
          let tbodyActividadesSecundarias = document.getElementById(
            "tbodyActividadesSecundarias"
          );
          let rowTableTaskSecond =
            document.getElementById("rowTableTaskSecond");
          let rowTrabajo = document.getElementById("rowTrabajo");

          tbodyTareasPrincipales.innerHTML = "";
          tbodyActividadesSecundarias.innerHTML = "";
          rowTableTaskMain.style.display = "";
          rowTableTaskSecond.style.display = "";

          titleModalAgente.textContent = `${infoProject[0].first_name} ${infoProject[0].last_name}`;

          if (infoTareasPrincipales.length != 0) {
            rowTrabajo.style.display = "none";
            infoTareasPrincipales.forEach((project) => {
              let row = tbodyTareasPrincipales.insertRow();

              let cellTarea = row.insertCell(0);
              let cellHoras = row.insertCell(1);

              cellTarea.textContent =
                project.actividadPrincipal == null
                  ? (rowTableTaskMain.style.display = "none")
                  : project.actividadPrincipal;
              cellHoras.textContent =
                project.horasPrincipales == null
                  ? (rowTableTaskMain.style.display = "none")
                  : `${project.horasPrincipales} horas`;
            });
          } else {
            rowTableTaskMain.style.display = "none";
            rowTrabajo.style.display = "";
          }

          let sumasPorFecha = {};

          if (infoTareasAdicionales.length != 0) {
            infoTareasAdicionales.forEach((project) => {
              rowTrabajo.style.display = "none";
              let row = tbodyActividadesSecundarias.insertRow();

              let cellProject = row.insertCell(0);
              let cellTask = row.insertCell(1);
              let cellHorasSecundarias = row.insertCell(2);
              let cellFechaDesarrollo = row.insertCell(3);

              cellProject.textContent = project.Proyecto;
              cellTask.textContent =
                project.tareaSecundaria == null
                  ? "Sin tareas"
                  : project.tareaSecundaria;
              cellHorasSecundarias.textContent =
                project.horasSecundarias == null
                  ? "Sin tareas"
                  : `${project.horasSecundarias} hora/s`;
              cellFechaDesarrollo.textContent =
                project.fechaDesarrollo.substring(0, 10);
              if (!sumasPorFecha[project.fechaDesarrollo]) {
                sumasPorFecha[project.fechaDesarrollo] = 0;
              }
              sumasPorFecha[project.fechaDesarrollo] +=
                project.horasSecundarias;
              horasSecundariasArray.push(project.horasSecundarias);
            });
          } else {
            rowTableTaskSecond.style.display = "none";
            rowTrabajo.style.display = "";
          }

          const horasTotales = 8;
          $("#divProgressBarTime").empty();
          const divProgressBarSelector = "#divProgressBarTime";
          for (let fecha in sumasPorFecha) {
            if (sumasPorFecha.hasOwnProperty(fecha)) {
              let horasPorFecha = sumasPorFecha[fecha];
              let porcentajePorFecha = (horasPorFecha / horasTotales) * 100;
              let parrafoHTML = `<p><b>${horasPorFecha}</b> horas ocupadas el <b>${fecha.substring(
                0,
                10
              )}</b>.</p>`;
              let progressBarHTML = `<div class="progress">
                              <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: ${porcentajePorFecha}%" aria-valuenow="${porcentajePorFecha}" aria-valuemin="0" aria-valuemax="100">
                                ${porcentajePorFecha.toFixed(2)}%
                              </div>
                            </div>`;
              $(divProgressBarSelector).append(progressBarHTML + parrafoHTML);
              progressBarHTML.innerHTML = "";
              parrafoHTML.innerHTML = "";
            }
          }
        },
        error: function (error) {
          console.error("Error en la solicitud AJAX:", error);
        },
      });
    });

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

    var celdaFechaDesarrollo = document.createElement("td");
    var inputFechaDesarrollo = document.createElement("input");
    inputFechaDesarrollo.type = "date";
    inputFechaDesarrollo.className = "form-control";
    inputFechaDesarrollo.id = "fechaDesarrollo";
    inputFechaDesarrollo.disabled = true;
    celdaFechaDesarrollo.appendChild(inputFechaDesarrollo);
    nuevaFila.appendChild(celdaFechaDesarrollo);

    $("#fechaDesarrollo").datetimepicker({
      dateFormat: "yy-mm-dd",
      timeFormat: "HH:mm:ss",
      showSecond: true,
    });

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
      const responsable = selectResponsable ? selectResponsable.value || 5 : 5;
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
      const descripcionInput = fila.querySelector(
        "#descripcionTareaSecundaria"
      );
      const horasAsignadasInput = fila.querySelector(
        '[name="inputHorasAdicionales"]'
      );
      const idResponsable = fila.querySelector('[name="responsableTarea"]');
      const descripcionSecundaria = fila.querySelector(
        '[name="tareasAdicionales"]'
      );
      const inputFechaDesarrollo = fila.querySelector(
        "#fechaDesarrolloAdicional"
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
          fechaDesarrollo: inputFechaDesarrollo.value,
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

  // Función para crear elementos SVG
  function createSVG(pathData) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svg.setAttribute("height", "16");
    svg.setAttribute("width", "16");
    svg.setAttribute("viewBox", "0 0 512 512");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathData);

    svg.appendChild(path);

    return svg;
  }

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

      // Condición para verificar el EstadoProyecto y agregar el SVG
      if (proyecto.idEstado === 2) {
        const svg = createSVG(
          "M304 48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zm0 416a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM48 304a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm464-48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM142.9 437A48 48 0 1 0 75 369.1 48 48 0 1 0 142.9 437zm0-294.2A48 48 0 1 0 75 75a48 48 0 1 0 67.9 67.9zM369.1 437A48 48 0 1 0 437 369.1 48 48 0 1 0 369.1 437z"
        );
        row.insertCell().appendChild(svg);
      } else if (proyecto.idEstado === 1) {
        const svg = createSVG(
          "M64 64c0-17.7-14.3-32-32-32S0 46.3 0 64V320c0 17.7 14.3 32 32 32s32-14.3 32-32V64zM32 480a40 40 0 1 0 0-80 40 40 0 1 0 0 80z"
        );
        row.insertCell().appendChild(svg);
      }

      // Agregar la nueva celda con un botón
      const buttonCell = row.insertCell();
      const button = document.createElement("button");
      button.className = "btn btn-info btn-block btn-sm";
      button.textContent = "Ver";
      button.dataset.toggle = "modal";
      button.dataset.target = "#modalInfoProyect";

      // FUNCIONALIDAD DEL BOTON PARA OTRO MODAL
      button.addEventListener("click", function () {
        const ticketId = proyecto.NumTicket;
        // btnRunEdit.style.display = "";
        btnSaveChange.style.display = "none";
        infoGeneralProject = proyecto;
        
        // Realizar la solicitud al backend para el detalle del proyecto
        fetch(`detalleTicketDesarrollo/${ticketId}/`)
          .then((response) => response.json())
          .then((data) => {
            // TABLA PARA LA EDICION DE ACTIVIDADES PRINCIPALES Y SECUNDARIAS
            tableBodyTasksEdit.innerHTML = "";
            detalleTicket = data;
            
            if (detalleTicket.length == 0) {
              tableTasksEdit.style.display = "none";
              btnRunEdit.style.display = "none";
              btnSaveChange.style.display = "";
            } else {
              // Iterar sobre los detalles del ticket y crear filas en la tabla
              detalleTicket.forEach((tarea) => {
                tableTasksEdit.style.display = "";
                // btnRunEdit.style.display = "";
                const row = tableBodyTasksEdit.insertRow();

                row.insertCell().textContent = tarea.TareaPrincipal || "";
                row.insertCell().textContent = tarea.horasPrincipales || "";
                row.insertCell().textContent = tarea.nomAgentTareaPrincipal || "";
                row.insertCell().textContent = tarea.TareaSecundaria || "Sin datos";
                row.insertCell().textContent = tarea.horasSecundarias || "Sin datos";

                // Agregar una nueva celda con un checkbox
                const checkboxCell = row.insertCell();
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkboxCell.appendChild(checkbox);

                checkbox.addEventListener("change", function () {
                  if (this.checked) {
                    if (tarea.idTareaSecundaria !== null) {
                      arrayIdSecondsTask.push(tarea.idTareaSecundaria);
                      const allSecundariasPresentes = tarea.idTareaPrincipal &&
                        detalleTicket
                          .filter((item) => item.idTareaPrincipal === tarea.idTareaPrincipal)
                          .every((item) => arrayIdSecondsTask.includes(item.idTareaSecundaria));
                      if (allSecundariasPresentes) {
                        arrayIdMainTask.push(tarea.idTareaPrincipal);
                      }
                    } else {
                      arrayIdMainTask.push(tarea.idTareaPrincipal);
                    }
                  } else {
                    if (tarea.idTareaSecundaria !== null) {
                      const indexSeconds = arrayIdSecondsTask.indexOf(tarea.idTareaSecundaria);
                      if (indexSeconds !== -1) {
                        arrayIdSecondsTask.splice(indexSeconds, 1);
                      }
                      const allSecundariasPresentes = tarea.idTareaPrincipal &&
                        detalleTicket
                          .filter((item) => item.idTareaPrincipal === tarea.idTareaPrincipal)
                          .every((item) => arrayIdSecondsTask.includes(item.idTareaSecundaria));
                      if (!allSecundariasPresentes) {
                        const indexMain = arrayIdMainTask.indexOf(tarea.idTareaPrincipal);
                        if (indexMain !== -1) {
                          arrayIdMainTask.splice(indexMain, 1);
                        }
                      }
                    } else {
                      const indexMain = arrayIdMainTask.indexOf(tarea.idTareaPrincipal);
                      if (indexMain !== -1) {
                        arrayIdMainTask.splice(indexMain, 1);
                      }
                    }
                  }

                  if(arrayIdMainTask.length > 0 || arrayIdSecondsTask.length > 0){
                    btnChangeState.style.display = '';
                  }else{
                    btnChangeState.style.display = 'none';
                  }
                });
              });
            }
          })
          .catch((error) => console.error("Error:", error));

        modalInfoProyectLabel.innerHTML = "";
        modalInfoProyectLabel.innerHTML = proyecto.tituloProyecto;

        inputEditTitleProject.value = "";
        inputEditTitleProject.value = proyecto.tituloProyecto;

        inputEditNumHoras.value = "";
        inputEditNumHoras.value = proyecto.HorasTotales;

        editSolicitante.value = "";
        editSolicitante.value = proyecto.idCliente;
        const changeEvent = new Event("change");
        editSolicitante.dispatchEvent(changeEvent);

        editAgenteSolicitado.value = "";
        editAgenteSolicitado.value = proyecto.idAgente;
        const changeEventAgente = new Event("change");
        editAgenteSolicitado.dispatchEvent(changeEventAgente);

        editFechaEstimada.value = "";
        editFechaEstimada.value = proyecto.fechaFinalizacionEstimada;

        editDescripcionGeneral.value = "";
        editDescripcionGeneral.value = proyecto.descripcionActividadGeneral;
      });

      buttonCell.appendChild(button);
    });
  }

  btnRunEdit.addEventListener("click", function () {
    tableBodyTasksEdit.innerHTML = "";
    btnRunEdit.style.display = "none";
    btnSaveChange.style.display = "";

    detalleTicket.forEach((tarea) => {
      const row = tableBodyTasksEdit.insertRow();

      row.insertCell().textContent = tarea.TareaPrincipal || "";
      row.insertCell().textContent = tarea.horasPrincipales || "";
      row.insertCell().textContent = tarea.nomAgentTareaPrincipal || "";

      const tareasSecundariasCell = row.insertCell();
      const inputTareasSecundarias = document.createElement("input");
      inputTareasSecundarias.type = "text";
      inputTareasSecundarias.value = tarea.TareaSecundaria || "";
      tareasSecundariasCell.appendChild(inputTareasSecundarias);

      const horasSecundariasCell = row.insertCell();
      const inputHorasSecundarias = document.createElement("input");
      inputHorasSecundarias.type = "text";
      inputHorasSecundarias.value = tarea.horasSecundarias || "";
      horasSecundariasCell.appendChild(inputHorasSecundarias);

      const actionCell = row.insertCell();
      const buttonAddTaskSecond = document.createElement("button");
      buttonAddTaskSecond.type = "button";
      buttonAddTaskSecond.className = "btn btn-success btn-sm btn-block";
      buttonAddTaskSecond.textContent = "+";
      actionCell.appendChild(buttonAddTaskSecond);
    });
  });

  function obtenerFechaActual() {
    const fechaActual = new Date();
    const formatoFecha = fechaActual
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    return formatoFecha;
  }

  btnSaveChange.addEventListener("click", function () {
    let objInfoGeneral = {
      id: infoGeneralProject.NumTicket,
      tituloProyecto: inputEditTitleProject.value,
      descripcionActividadGeneral: editDescripcionGeneral.value,
      idAgente: parseInt(editAgenteSolicitado.value),
      idSolicitante: parseInt(editSolicitante.value),
      fechaCreacion: infoGeneralProject.fechaCreacion,
      fechaAsignacion:
        parseInt(editAgenteSolicitado.value) == 2 ? null : obtenerFechaActual(),
      fechaFinalizacion: infoGeneralProject.fechaFinalizacion,
      fechaFinalizacionEstimada: editFechaEstimada.value,
      idestado:
        parseInt(editAgenteSolicitado.value) == 2
          ? infoGeneralProject.idEstado
          : 2,
      facturar: true,
      horasCompletasProyecto: inputEditNumHoras.value,
    };

    console.log(objInfoGeneral);
  });

  btnChangeState.addEventListener("click", function(){
    console.log(`Tareas Main:${arrayIdMainTask}, tareas secundarias:${arrayIdSecondsTask}`)
    $.ajax({
      type: "POST",
      url: "/tareas_desarrollo_success/",
      data: {
        'arrayIdMainTask[]': arrayIdMainTask,
        'arrayIdSecondsTask[]': arrayIdSecondsTask,
      },
      dataType: "json",
      success: function (response) {
        if(response.status == 'success'){
          toastr.success(response.status, "Tareas hechas existosamente.");

        // Recargar la página después de un breve retraso (por ejemplo, 1 segundo)
        setTimeout(function () {
          window.location.reload();
        }, 1000);
        } else {
          toastr.error("Error al crear el ticket: " + response.message, "Error");
        }
      },
      error: function (error) {
        console.error("Error en la solicitud AJAX:", error);
      },
    });
  })
});
