$(document).ready(function () {
  $("#myTabs a").on("click", function (e) {
    e.preventDefault();
    $(this).tab("show");
    loadListProjects();
  });

  // FUNCIONAMIENTO GENERAL DE LOS REPORTES-----------------------------------------------------------
  // VARIABLES GENERALES
  const selectTypeTicket = document.getElementById("selectTypeTicket");
  const selectStateTicket = document.getElementById("selectStateTicket");
  const optionTimeTickets = document.getElementById("optionTimeTickets");
  const rowGenerateReport = document.getElementById("rowGenerateReport");
  const btnGenerateReport = document.getElementById("btnGenerateReport");
  const optionsAgentPeriodo = document.getElementById("optionsAgentPeriodo");
  const rowTableTickets = document.getElementById("rowTableTickets");
  const radiosTicketsTime1 = document.getElementById("radiosTicketsTime1");
  const agentesolicitado = document.getElementById("agentesolicitado");
  const inputDateEnd = document.getElementById("inputDateEnd");
  const inputDateStar = document.getElementById("inputDateStar");
  const colFechaInicio = document.getElementById("colFechaInicio");
  const colFechaFinal = document.getElementById("colFechaFinal");
  const tableBodyFilterProjects = document.getElementById(
    "tableBodyFilterProjects"
  );

  var masNuevos = true;
  var masAntiguos = false;

  // FUNCIONAMIENTO PARA LA APARICION DE LAS DE LA FILA AGENTE, FECHAS
  selectTypeTicket.addEventListener("change", function () {
    if (
      (selectTypeTicket.value == 1 ||
        selectTypeTicket.value == 2 ||
        selectTypeTicket.value == 3) &&
      (selectStateTicket.value == 1 ||
        selectStateTicket.value == 2 ||
        selectStateTicket.value == 5)
    ) {
      optionTimeTickets.style.display = "";
      optionsAgentPeriodo.style.display = "";
      rowGenerateReport.style.display = "";
    } else {
      optionTimeTickets.style.display = "none";
      optionsAgentPeriodo.style.display = "none";
      rowGenerateReport.style.display = "none";
    }
  });

  selectStateTicket.addEventListener("change", function () {
    if (
      (selectTypeTicket.value == 1 ||
        selectTypeTicket.value == 2 ||
        selectTypeTicket.value == 3) &&
      (selectStateTicket.value == 1 ||
        selectStateTicket.value == 2 ||
        selectStateTicket.value == 5)
    ) {
      optionTimeTickets.style.display = "";
      optionsAgentPeriodo.style.display = "";
      rowGenerateReport.style.display = "";
    } else {
      optionTimeTickets.style.display = "none";
      optionsAgentPeriodo.style.display = "none";
      rowGenerateReport.style.display = "none";
    }
  });

  // Manejar el cambio en los radio buttons
  $('input[name="radiosTicketsTime"]').change(function () {
    if ($("#radiosTicketsTime1").prop("checked")) {
      masNuevos = true;
      masAntiguos = false;
    } else if ($("#radiosTicketsTime2").prop("checked")) {
      masNuevos = false;
      masAntiguos = true;
    }
  });

  // FUNCIONAMIENTO DE SELECT DE AGENTES
  $("#agentesolicitado").on("change", function () {
    if (agentesolicitado.value != "") {
      colFechaInicio.style.display = "";
    } else {
      colFechaInicio.style.display = "none";
    }
  });

  btnGenerateReport.addEventListener("click", function () {
    tableBodyFilterProjects.innerHTML = "";
    // FUNCIONAMIENTO DE LA CONSULTA DE LOS RESPORTES
    $.ajax({
      type: "GET",
      url: `generateReport/?tipo_ticket=${selectTypeTicket.value}&estado_ticket=${selectStateTicket.value}&recientes=${masNuevos}&antiguos=${masAntiguos}&agente=${agentesolicitado.value}&fechaInicio=${inputDateStar.value}&fechaFin=${inputDateEnd.value}`,
      dataType: "json",
      success: function (data) {
        if (data.length != 0) {
          rowTableTickets.style.display = "";
          console.log(data);
          data.forEach(function (item) {
            var row = tableBodyFilterProjects.insertRow();
            var cellId = row.insertCell(0);
            cellId.innerHTML = `000-0${item.id}`;

            var cellNombreProyecto = row.insertCell(1);
            cellNombreProyecto.innerHTML = item.tituloProyecto;

            var cellFechaCreacion = row.insertCell(2);
            var fechaCreacion = item.fechaCreacion;
            var fechaEstimada = item.fechaFinalizacionEstimada;
            var fecha = new Date(fechaCreacion);
            var fechaEst = new Date(fechaEstimada);
            var año = fecha.getFullYear();
            var mes = ("0" + (fecha.getMonth() + 1)).slice(-2);
            var dia = ("0" + fecha.getDate()).slice(-2);

            var anio = fechaEst.getFullYear();
            var mesEs = ("0" + (fechaEst.getMonth() + 1)).slice(-2);
            var diaEs = ("0" + fechaEst.getDate()).slice(-2);
            cellFechaCreacion.innerHTML = año + "-" + mes + "-" + dia;

            var cellFechaFinalizacion = row.insertCell(3);
            cellFechaFinalizacion.innerHTML =
              item.fechaFinalizacionEstimada == null
                ? "Sin asignar"
                : anio + "-" + mesEs + "-" + diaEs;

            var cellEstado = row.insertCell(4);
            cellEstado.innerHTML = item.Estado;

            var cellAgenteAdministrador = row.insertCell(5);
            cellAgenteAdministrador.innerHTML = `${item.Nombre} ${item.Apellido}`;

            // STYLO DE LA FILA
            row.style.cursor = "pointer";
            row.addEventListener("click", function () {
              console.log("ID del item:", item.id);
              // AJAX PARA HACER UNA CONSULTA... se usa el ID para poder consultar la información

            });
            row.addEventListener("mouseenter", function () {
              var tooltip = new bootstrap.Tooltip(row, {
                title: "Click para generar Reporte de este ticket",
              });
            });
            // Al salir de la fila
            row.addEventListener("mouseleave", function () {
              // Destruye el tooltip al salir del área de la fila
              row.removeAttribute("data-bs-toggle");
              row.removeAttribute("data-bs-placement");
              row.removeAttribute("title");
            });
          });
        } else {
          toastr.error("No se han encontrado datos del reporte seleccionado.");
        }
      },
    });
  });
});
