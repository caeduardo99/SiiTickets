$(document).ready(function () {
    $("#myTabs a").on("click", function (e) {
      e.preventDefault();
      $(this).tab("show");
      cargarTablaTickets();
    });
  
    //   Variables listas para usar
    const tbodyTicketsActualizacionCreados = document.getElementById(
      "tbodyTicketsActualizacionCreados"
    );
    const rowModulo = document.getElementById("rowModulo");
    const rowHorasAsignadas = document.getElementById("rowHorasAsignadas");
    const horasDiariasAsignadas = document.getElementById(
      "horasDiariasAsignadas"
    );
    const selectPrioridad = document.getElementById('selectPrioridad');
    const rowObservaciones = document.getElementById("rowObservaciones");
    const observaciones = document.getElementById("observaciones");
    const rowDescripcionGeneral = document.getElementById(
      "rowDescripcionGeneral"
    );
    const descripcionGeneral = document.getElementById("descripcionGeneral");
    const rowPrioridad = document.getElementById("rowPrioridad");
    const btnCreateTicket = document.getElementById('btnCreateTicket');
    const btnNewTask = document.getElementById("btnNewTask");
    const rowTableTasks = document.getElementById("rowTableTasks");
    const tbodyTasksMain = document.getElementById("tbodyTasksMain");
    const rowFechaEstimada = document.getElementById('rowFechaEstimada');
    var resultadosAgentesData = window.resultados_agentes_data;
    let arrayTasksMain = []

  
    //   Funcion principal para la carga de datos en la lista de ticket
    function cargarTablaTickets() {
      fetch("ticketsActualizacionCreados/")
        .then((response) => response.json())
        .then((data) => {
          tbodyTicketsActualizacionCreados.innerHTML = "";
          console.log(data);
          // Informacion de la tabla y carga de la tabla
          if (data.length != 0) {
          } else {
            var row = document.createElement("tr");
            var cell = document.createElement("td");
            cell.textContent =
              "No hay tickets de desarrollo creados en ningun estado.";
            cell.colSpan = 7;
            cell.style.textAlign = "center";
            row.appendChild(cell);
            tbodyTicketsActualizacionCreados.appendChild(row);
          }
        })
        .catch((error) => console.error("Error:", error));
    }
  
    //   Funcionalidad del select para los Solicitantes
    $("#selectSolicitante").on("change", function () {
      rowModulo.style.display = "";
    });
    //   Funcionalidad del select de Modulos
    $("#selectModulo").on("change", function () {
      rowHorasAsignadas.style.display = "";
    });
  
    //   Funcionalidad del input para las horas completas
    horasDiariasAsignadas.addEventListener("input", function () {
      if (horasDiariasAsignadas.value != 0) {
        rowObservaciones.style.display = "";
      } else {
        rowObservaciones.style.display = "none";
      }
    });
  
    //   Funciones del input para las observaciones
    observaciones.addEventListener("input", function () {
      if (observaciones.value != "") {
        rowDescripcionGeneral.style.display = "";
      } else {
        rowDescripcionGeneral.style.display = "none";
      }
    });
  
    // Funcionamiento del input Descripcion
    descripcionGeneral.addEventListener("input", function () {
      if (descripcionGeneral.value != "") {
        rowPrioridad.style.display = "";
      } else {
        rowPrioridad.style.display = "none";
      }
    });

    $("#selectPrioridad").on("change", function(){
        if(selectPrioridad.value != ''){
            rowFechaEstimada.style.display = ''
            btnNewTask.disabled = false;
        }else{
            rowFechaEstimada.style.display = 'none'
            btnNewTask.disabled = true;
        }
    });
  
    //   Funcionamiento para la creacion del Ticket de Desarrollo
    $("form").submit(function (event) {
      event.preventDefault();
      var form = $(this);
    //   Vaciar el arreglo
      arrayTasksMain = []
    //   Objeto que va dentro del arreglo
      var rowData = {};
      rowData.descripcionTarea = $('#inputTarea').val();
      rowData.numeroHoras = $('#inputNumHoras').val();
      rowData.fechaDesarrollo = $('#inputDateTask').val();
      rowData.responsableTarea = $('select[name="responsableTarea"]').val();

      arrayTasksMain.push(rowData);
  
      console.log(arrayTasksMain)
      form.append('<input type="hidden" name="arrayTasksMain" value=\'' + JSON.stringify(arrayTasksMain) + '\'>');

      $.post(form.attr("action"), form.serialize(), function (data) {
        if (data.status === "success") {
          toastr.info(data.message, "Información recibida con exito");
        } else {
          // Manejar otros casos o mostrar mensajes de error
          toastr.error("Error al crear el ticket: " + data.message, "Error");
        }
      }).fail(function (xhr, status, error) {
        // Manejar errores de la solicitud AJAX
        toastr.error("Error en la solicitud AJAX: " + error, "Error");
      });
    });

    // Funcionamiento del boton para agregar una nueva tarea principal
    btnNewTask.addEventListener('click', function(){
        rowTableTasks.style.display = '';
        var row = document.createElement('tr');
        var cellInputTarea = document.createElement('td');
        var cellInputHorasDiarias = document.createElement('td');
        var cellInputDate = document.createElement('td');
        var cellSelect = document.createElement("td");
        
        // Input para la descripcion de la tarea
        var inputTarea = document.createElement('input');
        inputTarea.type = 'text';
        inputTarea.className = 'form-control form-control-sm';
        inputTarea.id = 'inputTarea';

        // Input para el numero de horas diarias que se van a trabajar
        var inputNumHoras = document.createElement('input');
        inputNumHoras.type = 'number';
        inputNumHoras.className = 'form-control form-control-sm';
        inputNumHoras.id = 'inputNumHoras';

        // Input para la fecha y hora del desarrollo de la actividad
        var inputDate = document.createElement('input');
        inputDate.type = 'date';
        inputDate.className = 'form-control form-control-sm';
        inputDate.id = 'inputDateTask';

        // Input con un select para agregar al agente encargado de esta actividad
        var selectElement = document.createElement("select");
        var defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Seleccionar Responsable";
        selectElement.className = "form-control form-control-sm";
        selectElement.name = "responsableTarea";
        selectElement.appendChild(defaultOption);
        // Llenar el select
        for (var i = 0; i < resultadosAgentesData.length; i++) {
            var agente = resultadosAgentesData[i];
            var option = document.createElement("option");
            option.value = agente.id;
            option.textContent = agente.full_name;
            selectElement.appendChild(option);
        }
        

        cellInputTarea.appendChild(inputTarea)
        cellInputHorasDiarias.appendChild(inputNumHoras)
        cellInputDate.appendChild(inputDate)
        cellSelect.appendChild(selectElement);

        row.appendChild(cellInputTarea)
        row.appendChild(cellInputHorasDiarias)
        row.appendChild(cellInputDate)
        row.appendChild(cellSelect)

        tbodyTasksMain.appendChild(row)
    })
  });
  