$(document).ready(function () {
  $("#myTabs a").on("click", function (e) {
    e.preventDefault();
    $(this).tab("show");
  });

  const rowDescripcionGeneral = document.getElementById(
    "rowDescripcionGeneral"
  );
  const inputTitleProject = document.getElementById("inputTitleProject");
  const spanTitleProject = document.getElementById("spanTitleProject");
  const rowSolicitante = document.getElementById("rowSolicitante");
  const rowButtonTask = document.getElementById("rowButtonTask");
  const cuerpoTabla = document.getElementById("tableBodyTasks");
  const rowTableTask = document.getElementById("rowTableTask");
  const btnNewTask = document.getElementById("btnNewTask");
  const rowAgente = document.getElementById("rowAgente");
  var resultadosAgentesData = window.resultados_agentes_data;

  var contadorFilas = 1;

  // FUNCIONAMIENTO DEL INPUT TITULO
  inputTitleProject.addEventListener("input", function () {
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

  // METODO PARA CONTROLAR LAS ACCIONES DEL SELECT
  $("#agentesolicitado").on("change", function () {
    rowDescripcionGeneral.style.display = "";
    rowButtonTask.style.display = "";
  });

  // METODO PARA MANEJAR EL EVENTO CLICK DEL BOTON
  btnNewTask.addEventListener("click", function () {
    rowTableTask.style.display = "";

    var nuevaFila = document.createElement("tr");

        var celdaNumerador = document.createElement("td");
        celdaNumerador.textContent = contadorFilas;
        nuevaFila.appendChild(celdaNumerador);

        var celdaInput = document.createElement("td");
        var inputText = document.createElement("input");
        inputText.type = "text";
        inputText.className = "form-control";
        inputText.name = "descripcionTarea[]";
        celdaInput.appendChild(inputText);
        nuevaFila.appendChild(celdaInput);

        var celdaSelect = document.createElement("td");
        var selectElement = document.createElement("select");
        selectElement.className = "form-control";
        selectElement.name = "responsableTarea[]";

        // Llenar el select con los datos de resultados_agentes_data
        for (var i = 0; i < resultadosAgentesData.length; i++) {
            var agente = resultadosAgentesData[i];
            var option = document.createElement("option");
            option.value = agente.id;
            option.textContent = agente.full_name;
            selectElement.appendChild(option);
        }

        celdaSelect.appendChild(selectElement);
        nuevaFila.appendChild(celdaSelect);

        var celdaTareasAdicionales = document.createElement("td");
        var inputTareasAdicionales = document.createElement("input");
        inputTareasAdicionales.type = "text";
        inputTareasAdicionales.className = "form-control";
        inputTareasAdicionales.name = "tareasAdicionales[]";
        celdaTareasAdicionales.appendChild(inputTareasAdicionales);
        nuevaFila.appendChild(celdaTareasAdicionales);

        contadorFilas++;

        cuerpoTabla.appendChild(nuevaFila);
  });
});
