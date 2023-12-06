$(document).ready(function () {
  $("#myTabs a").on("click", function (e) {
    e.preventDefault();
    $(this).tab("show");
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
  const rowFechaInformacionFinalizacionEstimada = document.getElementById('rowFechaInformacionFinalizacionEstimada');
  const rowFechaInformacionFinalizacion = document.getElementById('rowFechaInformacionFinalizacion');
  const fechaTicketEstimado = document.getElementById('fecha_ticket_estimado');
  const fechaTicketFinalizacion = document.getElementById('fecha_ticket_finalizacion')
  const rowButtonCreateTicket = document.getElementById('rowButtonCreateTicket');
  const inputTitleProject = document.getElementById("inputTitleProject");
  const spanTitleProject = document.getElementById("spanTitleProject");
  const btnCreateTicket = document.getElementById('btnCreateTicket');
  const rowSolicitante = document.getElementById("rowSolicitante");
  const rowButtonTask = document.getElementById("rowButtonTask");
  const cuerpoTabla = document.getElementById("tableBodyTasks");
  const rowTableTask = document.getElementById("rowTableTask");
  const btnNewTask = document.getElementById("btnNewTask");
  const rowAgente = document.getElementById("rowAgente");
  const agentesolicitado = document.getElementById("agentesolicitado");
  const solicitante = document.getElementById('solicitante');
  const fechaTicketCreacion = document.getElementById('fecha_ticket_creacion');
  const fechaTicketAsignacion = document.getElementById('fecha_ticket_asignacion');

  $('#fecha_ticket_asignacion').val('');

  var resultadosAgentesData = window.resultados_agentes_data;
  let contadorFilas = 1, nameAgente, nameSolicitante;

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
    
    if(agentesolicitado.value != ''){
      fechaTicketAsignacion.disabled = false;
      rowFechaInformacionFinalizacionEstimada.style.display = '';
      rowFechaInformacionFinalizacion.style.display = '';
    }else{
      fechaTicketAsignacion.value = '';
      fechaTicketEstimado.value = '';
      fechaTicketFinalizacion.value = '';
      rowFechaInformacionFinalizacionEstimada.style.display = 'none';
      rowFechaInformacionFinalizacion.style.display = 'none';
      fechaTicketAsignacion.disabled = true;
    }
  });

  // METODO PARA CONTROLAR EL AGENTE DEL SELECT SOLICITANTE
  $('#solicitante').on("change", function(){
    rowDescripcionGeneral.style.display = "";
    rowButtonTask.style.display = "";
    rowFechaInformacionCreacion.style.display = "";
    rowFechaInformacionAsignacion.style.display = "";

    nameSolicitante = solicitante.options[solicitante.selectedIndex].text;
  });

  // METODO PARA MANEJAR EL EVENTO CLICK DEL BOTON
  btnNewTask.addEventListener("click", function () {
    rowTableTask.style.display = "";
    rowButtonCreateTicket.style.display = "";

    var nuevaFila = document.createElement("tr");

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

    var celdaHoras = document.createElement('td');
    var inputHoras = document.createElement('input');
    inputHoras.type = 'number';
    inputHoras.className = 'form-control';
    inputHoras.name = "inputHoras";
    celdaHoras.appendChild(inputHoras);
    nuevaFila.appendChild(celdaHoras);

    celdaSelect.appendChild(selectElement);
    nuevaFila.appendChild(celdaSelect);

    var celdaTareasAdicionales = document.createElement("td");
    var inputTareasAdicionales = document.createElement("input");
    inputTareasAdicionales.type = "text";
    inputTareasAdicionales.className = "form-control";
    inputTareasAdicionales.name = "tareasAdicionales[]";
    celdaTareasAdicionales.appendChild(inputTareasAdicionales);
    nuevaFila.appendChild(celdaTareasAdicionales);

    var celdaEliminar = document.createElement("td");
    var btnEliminar = document.createElement("button");
    btnEliminar.textContent = "Quitar";
    btnEliminar.className = "btn btn-danger";
    btnEliminar.onclick = function () {
      // Lógica para eliminar la fila
      nuevaFila.remove();
    };
    celdaEliminar.appendChild(btnEliminar);
    nuevaFila.appendChild(celdaEliminar);

    contadorFilas++;

    cuerpoTabla.appendChild(nuevaFila);
  });

  // METODO DE CREACION PARA MANEJAR EL BOTON DE CREACION DE TICKET
  btnCreateTicket.addEventListener('click', function(){
    const objTicketDevelop = {
      tituloProyecto: inputTitleProject.value,
      idAgente: agentesolicitado.value == '' ? 0 : parseInt(agentesolicitado.value),
      agente: agentesolicitado.value == '' ? '' : nameAgente,
      idSolicitante: solicitante.value == '' ? 0 : parseInt(solicitante.value),
      solicitante: nameSolicitante,
      fechaCreacion: fechaTicketCreacion.value,
      fechaAsignacion: fechaTicketAsignacion.value == '' ? '' : fechaTicketAsignacion.value,
      fechaFinalizacion: fechaTicketEstimado.value == '' ? '' : fechaTicketEstimado.value,
      fechaFinalizacionReal: fechaTicketFinalizacion.value == '' ? '' : fechaTicketFinalizacion.value
    };

    console.log(objTicketDevelop)

  });
});
