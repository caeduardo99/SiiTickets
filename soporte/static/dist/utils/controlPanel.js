$(document).ready(function () {
  // VARIABLES PRINCIPALES
  const textBienvenida = document.getElementById("textBienvenida");
  const numTicketsComplete = document.getElementById("numTicketsComplete");
  const numTickestCompleteTotals = document.getElementById(
    "numTickestCompleteTotals"
  );
  const numTicketsAwait = document.getElementById("numTicketsAwait");
  const numTickestAwaitTotals = document.getElementById(
    "numTickestAwaitTotals"
  );
  const numTicketProcess = document.getElementById("numTicketProcess");
  const numTicketProcessVenci = document.getElementById(
    "numTicketProcessVenci"
  );
  const tdTimeLastTicket = document.getElementById("tdTimeLastTicket");
  const tdTimeLastUpdate = document.getElementById("tdTimeLastUpdate");
  const tdTimeDevelop = document.getElementById("tdTimeDevelop");
  const cardTicketsPendientes = document.getElementById(
    "cardTicketsPendientes"
  );
  const cardTicketsCompletos = document.getElementById("cardTicketsCompletos");
  const listCards = document.getElementById("listCards");
  const infoAgenteDiv = document.getElementById("infoAgente");
  const btnReturnListAgent = document.getElementById("btnReturnListAgent");
  const agenteEncargado = document.getElementById("agenteEncargado");
  const cardTicketsProcess = document.getElementById("cardTicketsProcess");
  const tbodyDiarioTrabajo = document.getElementById("tbodyDiarioTrabajo");
  const btnCompleteDailyWork = document.getElementById("btnCompleteDailyWork");
  const rowDiarioTrabajo = document.getElementById("rowDiarioTrabajo");
  const btnGenerateDocuments = document.getElementById("btnGenerateDocuments");
  const btnConsultarDiasAnteriores = document.getElementById(
    "btnConsultarDiasAnteriores"
  );
  const tableResponsiveCreateDayliWork = document.getElementById(
    "tableResponsiveCreateDayliWork"
  );
  const tableResponsiveSearchDayliWork = document.getElementById(
    "tableResponsiveSearchDayliWork"
  );
  const btnBackRegistersActivities = document.getElementById(
    "btnBackRegistersActivities"
  );
  const inputSearchDayliWork = document.getElementById("inputSearchDayliWork");
  const tbodyBuscarDiarioTrabajo = document.getElementById(
    "tbodyBuscarDiarioTrabajo"
  );
  const btnGenerateDocumentsSearch = document.getElementById(
    "btnGenerateDocumentsSearch"
  );

  var calendarEl = document.getElementById("calendar");

  let changeDiv = false,
    selectedInfoDaily = [],
    filteredInfoDailyWork,
    filteredWork,
    updatedInfoDailyWork;

  textBienvenida.textContent =
    infoUsuario.Nombre != ""
      ? `Bienvenid@ ${infoUsuario.Nombre} ${infoUsuario.Apellido}`
      : "Bienvenido empresa";

  // Consulta principal para la información de los tickets
  fetch("info_panel_contro/")
    .then((response) => response.json())
    .then((data) => {
      // Llenar la informacion para el diario de trabajo
      var getInfoDailyWork = data.consult_diario_trabajo;
      var getInfoAllDailyWork = data.resultado_diario_trabajo_all;
      var getInfoActivities = data.resultado_all_activities;
      // console.log(getInfoDailyWork)
      filteredInfoDailyWork = getInfoDailyWork.reduce((acc, current) => {
          // Comprobar si ya existe exactamente el mismo objeto en el acumulador
          const isDuplicate = acc.some(
              (item) =>
                  item.numTicket === current.numTicket &&
                  item.actividadSelect === current.actividadSelect &&
                  item.actividadRealizada === current.actividadRealizada
          );
          // Si no es un duplicado exacto, lo agregamos
          if (!isDuplicate) {
              acc.push(current);
          }
          return acc;
      }, []);
      updatedInfoDailyWork = filteredInfoDailyWork.map((workItem) => {
        // Buscar todas las actividades que tengan el mismo numTicket
        const actividadesRelacionadas = getInfoActivities.filter(
          (activityItem) => activityItem.numTicket === workItem.numTicket
        );
        // Retornar el workItem original con la nueva propiedad actividadesTicket
        return {
          ...workItem,
          actividadesTicket: actividadesRelacionadas, // Arreglo de actividades que coinciden
        };
      });
      if (data.consult_diario_trabajo) {
        rowDiarioTrabajo.style.display = "";
        if (getInfoDailyWork.length != 0) {
          // console.log(updatedInfoDailyWork);
          updatedInfoDailyWork.forEach((item) => {
            const row = document.createElement("tr");
            row.style.cursor = "pointer";
            const cellNumTicket = document.createElement("td");
            const buttonMoreActivity = document.createElement("button");
            buttonMoreActivity.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="10" fill="white" height="10">
    <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"/>
  </svg>`;
            buttonMoreActivity.className = "btn btn-sm btn-dark";
            buttonMoreActivity.style.marginLeft = "10px";
            cellNumTicket.textContent = item.numTicket;
            // Boton para agregar una nueva fila
            buttonMoreActivity.addEventListener("click", function () {
              createNewRow(row, item);
            });
            cellNumTicket.appendChild(buttonMoreActivity);

            const cellSolicitante = document.createElement("td");
            cellSolicitante.textContent = `${item.fullnameSolicitante}/${item.nombreEmpresa}`;

            const cellActividad = document.createElement("td");
            const inputSelectActivity = document.createElement("select");
            inputSelectActivity.className = "custom-select custom-select-sm";
            if (item.actividadRealizada == null) {
              const defaultOption = document.createElement("option");
              defaultOption.textContent = "Seleccionar actividad";
              defaultOption.value = "";
              defaultOption.disabled = true;
              defaultOption.selected = true;
              inputSelectActivity.appendChild(defaultOption);
              var actividades = item.actividadesTicket;
              if (actividades.length != 0) {
                actividades
                  .filter((actividad) => actividad.idEstadoAct == 2 || actividad.idEstadoAct == 4)
                  .forEach((actividad) => {
                    // Crear un elemento <option> para cada actividad
                    const option = document.createElement("option");
                    option.textContent = actividad.actividad;
                    option.value = actividad.idActividad;
                    inputSelectActivity.appendChild(option);
                  });
              } else {
                inputSelectActivity.disabled = true;
              }
              cellActividad.appendChild(inputSelectActivity);
            } else {
              cellActividad.textContent =
                item.actividadSeleccionada == null
                  ? "No especificada"
                  : item.actividadSeleccionada;
            }

            const cellFechaInicio = document.createElement("td");
            const inputFechaInicio = document.createElement("input");
            if (item.actividadRealizada == null) {
              inputFechaInicio.type = "datetime-local";
              inputFechaInicio.className = "form-control form-control-sm";
              cellFechaInicio.appendChild(inputFechaInicio);
            } else {
              const fechaInicio = item.fechaInicio;
              const fechaFormateada = fechaInicio.replace("T", " ");
              cellFechaInicio.textContent = fechaFormateada;
            }

            const cellFechaFin = document.createElement("td");
            const inputFechaFin = document.createElement("input");
            if (item.actividadRealizada == null) {
              inputFechaFin.type = "datetime-local";
              inputFechaFin.className = "form-control form-control-sm";
              cellFechaFin.appendChild(inputFechaFin);
            } else {
              const fechaFin = item.fechaFin;
              const fechaFinFormat = fechaFin.replace("T", " ");
              cellFechaFin.textContent = fechaFinFormat;
            }

            const cellActividadDaily = document.createElement("td");
            const cellActions = document.createElement("td");
            // Condicion en caso de que venga NULL el motivo
            if (item.actividadRealizada == null) {
              const inputActividadDaily = document.createElement("input");
              inputActividadDaily.className = " form-control form-control-sm";
              inputActividadDaily.type = "text";
              // Funcionalidad del input
              inputActividadDaily.addEventListener("input", function () {
                let valorInputActivity = inputActividadDaily.value;
                if (valorInputActivity.length >= 5) {
                  check.disabled = false;
                } else {
                  check.disabled = true;
                }
              });
              cellActividadDaily.appendChild(inputActividadDaily);

              const check = document.createElement("input");
              check.type = "checkbox";
              check.disabled = true;
              // Funcionalidad del check para que aparezca el boton y se guarden las actividades realizadas durante el Día
              check.addEventListener("change", function () {
                if (event.target.checked) {
                  const actividad = inputActividadDaily.value;
                  const fechaInicio = inputFechaInicio.value;
                  const fechaFin = inputFechaFin.value;
                  const actividadSelected = inputSelectActivity.value;
                  const itemWithActivity = {
                    ...item,
                    actividadRealizada: actividad,
                    fechaInicioActividad: fechaInicio,
                    fechaFinActividad: fechaFin,
                    actividadSelected: actividadSelected,
                  };
                  selectedInfoDaily.push(itemWithActivity);
                } else {
                  const index = selectedInfoDaily.findIndex(
                    (selectedItem) => selectedItem.numTicket === item.numTicket
                  );
                  if (index !== -1) {
                    selectedInfoDaily.splice(index, 1);
                  }
                }
                if (selectedInfoDaily.length >= 1) {
                  btnCompleteDailyWork.style.display = "";
                } else {
                  btnCompleteDailyWork.style.display = "none";
                }
              });
              cellActions.appendChild(check);
            } else {
              cellActividadDaily.textContent = item.actividadRealizada;

              const svg = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "svg"
              );
              svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
              svg.setAttribute("viewBox", "0 0 512 512");
              svg.setAttribute("width", "20");
              svg.setAttribute("height", "20");
              const path = document.createElementNS(
                "http://www.w3.org/2000/svg",
                "path"
              );
              path.setAttribute(
                "d",
                "M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"
              );
              svg.appendChild(path);

              cellActions.appendChild(svg);
            }

            row.appendChild(cellNumTicket);
            row.appendChild(cellSolicitante);
            row.appendChild(cellActividad);
            row.appendChild(cellFechaInicio);
            row.appendChild(cellFechaFin);
            row.appendChild(cellActividadDaily);
            row.appendChild(cellActions);
            tbodyDiarioTrabajo.appendChild(row);
          });
        } else {
          const row = document.createElement("tr");
          const cellInfo = document.createElement("td");
          cellInfo.textContent =
            "El Usuario no tiene Ticket Asignados para resolver";
          cellInfo.colSpan = "7";
          cellInfo.style.textAlign = "center";
          row.appendChild(cellInfo);
          tbodyDiarioTrabajo.appendChild(row);
        }
      } else {
        rowDiarioTrabajo.style.display = "none";
      }
      // Para la tabla de busqueda
      const rowSear = document.createElement("tr");
      const cellSearchMain = document.createElement("td");
      cellSearchMain.textContent = "Esperando consulta";
      cellSearchMain.colSpan = "8";
      cellSearchMain.style.textAlign = "center";
      rowSear.appendChild(cellSearchMain);
      tbodyBuscarDiarioTrabajo.appendChild(rowSear);
      // Funcionamiento de input
      inputSearchDayliWork.addEventListener("input", function () {
        const searchTerm = inputSearchDayliWork.value.toLowerCase();
        tbodyBuscarDiarioTrabajo.innerHTML = "";
        filteredWork = getInfoAllDailyWork.filter((item) => {
          return (
            String(item.numTicket || "")
              .toLowerCase()
              .includes(searchTerm) ||
            String(item.fullnameSolicitante || "")
              .toLowerCase()
              .includes(searchTerm) ||
            String(item.nombreEmpresa || "")
              .toLowerCase()
              .includes(searchTerm) ||
            String(item.motivoSolicitud || "")
              .toLowerCase()
              .includes(searchTerm) ||
            String(item.fechaInicio || "")
              .toLowerCase()
              .includes(searchTerm) ||
            String(item.fechaFin || "")
              .toLowerCase()
              .includes(searchTerm)
          );
        });
        if (filteredWork.length === 0) {
          btnGenerateDocumentsSearch.style.display = "none";
          const noResultsRow = document.createElement("tr");
          const noResultsCell = document.createElement("td");
          noResultsCell.textContent = "No se encontraron resultados";
          noResultsCell.colSpan = "8";
          noResultsCell.style.textAlign = "center";
          noResultsRow.appendChild(noResultsCell);
          tbodyBuscarDiarioTrabajo.appendChild(noResultsRow);
        } else {
          // Mostrar las filas filtradas
          filteredWork.forEach((item) => {
            btnGenerateDocumentsSearch.style.display = "";
            const resultsRow = document.createElement("tr");
            const cellNumTicketSearch = document.createElement("td");
            cellNumTicketSearch.textContent = item.numTicket;
            resultsRow.appendChild(cellNumTicketSearch);

            const cellSolicitanteEmpSearch = document.createElement("td");
            cellSolicitanteEmpSearch.textContent = `${item.fullnameSolicitante}/ ${item.nombreEmpresa}`;
            resultsRow.appendChild(cellSolicitanteEmpSearch);

            const cellMotivoSearch = document.createElement("td");
            cellMotivoSearch.textContent = item.motivoSolicitud;
            resultsRow.appendChild(cellMotivoSearch);

            const cellFechaDesdeSearch = document.createElement("td");
            var fechaInicio = item.fechaInicio;
            if (fechaInicio != null) {
              cellFechaDesdeSearch.textContent = fechaInicio.replace("T", " ");
            } else {
              cellFechaDesdeSearch.innerHTML = "Sin Asignar";
            }
            resultsRow.appendChild(cellFechaDesdeSearch);

            const cellFechaHastaSearch = document.createElement("td");
            var fechaFin = item.fechaFin;
            if (fechaFin != null) {
              cellFechaHastaSearch.textContent = fechaFin.replace("T", " ");
            } else {
              cellFechaHastaSearch.innerHTML = "Sin asignar";
            }
            resultsRow.appendChild(cellFechaHastaSearch);

            const cellAgenteSearch = document.createElement("td");
            cellAgenteSearch.textContent = `${item.nombreAgente} ${item.apellidoAgente}`;
            resultsRow.appendChild(cellAgenteSearch);

            const cellActividadDailySearch = document.createElement("td");
            cellActividadDailySearch.textContent =
              item.actividadRealizada == ""
                ? "Aún sin asignar"
                : item.actividadRealizada;
            resultsRow.appendChild(cellActividadDailySearch);

            tbodyBuscarDiarioTrabajo.appendChild(resultsRow);
          });
        }
      });

      var panel_worked = data.panel_list_worked;

      numTicketsComplete.textContent = `${data.numDayliTicketComplete} Tickets completos (Hoy)`;
      numTickestCompleteTotals.textContent =
        idUsuario.value == 2
          ? `${data.numTicketsComplete} Tickets completados por los colaboradores hasta la fecha`
          : `${data.numTicketsComplete} Tickets completados por/para este usuario hasta la fecha`;
      numTickestAwaitTotals.textContent =
        idUsuario.value == 2
          ? `${data.numTicketAwait} Tickets pendientes de asignar a la fecha`
          : `${data.numTicketAwait} Tickets en espera del agente.`;
      numTicketsAwait.textContent = `${data.numTicketAwaitToDay} Tickets en espera (Hoy)`;
      numTicketProcess.textContent = `${data.numTicketProcess} Tickets en proceso (Hoy)`;
      numTicketProcessVenci.textContent = `${data.numTicketProcessVenci} Tickets en proceso con fecha atrasada`;

      tdTimeLastTicket.textContent =
        data.tiempoDiferenciaSoporte == ""
          ? "No hay tickets creados para este usuario"
          : `Utimo ticket creado hace ${data.tiempoDiferenciaSoporte}`;
      tdTimeLastUpdate.textContent =
        data.timeDifUpdate == ""
          ? "No hay actualizaciones creadas para este usuario"
          : `Ultimo ticket creado hace ${data.timeDifUpdate}`;
      tdTimeDevelop.textContent =
        data.timeDifDev == ""
          ? "No hay desarrollos creados para este usuario"
          : `Ultimo ticket creado hace ${data.timeDifDev}`;

      // Crear las cartas
      const groupedByAgent = panel_worked.reduce((acc, curr) => {
        if (!acc[curr.idAgenteActividad]) {
          acc[curr.idAgenteActividad] = {
            idAgenteActividad: curr.idAgenteActividad,
            nombreAgenteTicket: curr.nombreAgenteTicket,
            apellidoAgenteTicket: curr.apellidoAgenteTicket,
          };
        }
        return acc;
      }, {});
      const result_agent = Object.values(groupedByAgent);

      // Agrupacion por fechas (Formatear las fechas)
      const updatedPanelWorked = panel_worked.map((obj) => ({
        ...obj,
        fechaInicioActividad: obj.fechaInicioActividad.split("T")[0],
        fechaFinalActividadFormat:
          obj.fechaFinalActividad == null
            ? obj.fechaFinalizacionEspTicket.split("T")[0]
            : obj.fechaFinalActividad.split("T")[0],
      }));

      const groupedData = updatedPanelWorked.reduce((acc, obj) => {
        const key = `${obj.fechaFinalActividadFormat}-${obj.idAgenteActividad}`;

        if (!acc[key]) {
          acc[key] = {
            fechaInicioActividad: obj.fechaInicioActividad,
            nombreAgenteActividad: obj.nombreAgenteActividad,
            apellidoAgenteActividad: obj.apellidoAgenteActividad,
            descripcionActividad: obj.descripcionActividad,
            fechaFinalizacionEspTicket: obj.fechaFinalizacionEspTicket,
            fechaFinalActividad: obj.fechaFinalActividad,
            fechaFinalizacionTicket: obj.fechaFinalizacionTicket,
            fechaInicioTicket: obj.fechaInicioTicket,
            idActividad: obj.idActividad,
            idAgenteActividad: obj.idAgenteActividad,
            fechaFinalActividadFormat: obj.fechaFinalActividadFormat,
            minutosActividad: 0,
          };
        }
        acc[key].minutosActividad += obj.minutosActividad;
        return acc;
      }, {});
      const result_fecha_agente = Object.values(groupedData);

      const today = new Date().toISOString().split("T")[0];
      const todayData = result_fecha_agente.filter(
        (obj) => obj.fechaFinalActividadFormat == today
      );

      const maxMinutesDay = 480;

      const combinedData = result_agent.map((agent) => {
        const agentData = todayData.find(
          (data) => data.idAgenteActividad === agent.idAgenteActividad
        );
        const minutosActividad = agentData ? agentData.minutosActividad : 0;
        const progressPercentage = (minutosActividad / maxMinutesDay) * 100;

        return {
          ...agent,
          minutosActividad,
          progressPercentage,
        };
      });

      combinedData.forEach((item) => {
        const divRowMain = document.createElement("div");
        divRowMain.className = "row";

        const divCol1 = document.createElement("div");
        divCol1.className = "col-5";

        const divCol2 = document.createElement("div");
        divCol2.className = "col-5";

        const divCol3 = document.createElement("div");
        divCol3.className = "col-2";

        const card = document.createElement("div");
        card.className = "card";
        card.style.backgroundColor = "#DADADA";

        const cardBody = document.createElement("div");
        cardBody.classList.add("card-body");

        const title = document.createElement("h4");
        const ticketHours = document.createElement("p");

        const horasTickets = (item.minutosActividad / 60).toFixed(2);
        title.textContent = `${item.nombreAgenteTicket} ${item.apellidoAgenteTicket}`;
        ticketHours.textContent = `${horasTickets} horas trabajadas`;

        const buttonVer = document.createElement("button");
        buttonVer.className = "btn btn-sm btn-secondary";
        buttonVer.type = "button";
        buttonVer.textContent = "Ver";
        buttonVer.setAttribute("data-toggle", "modal");
        buttonVer.setAttribute("data-target", "#modalWorkAgent");

        // Funcionalidad del boton Ver - cargar el modal ----------------------------------------------------------------
        buttonVer.addEventListener("click", function () {
          const agentActivities = updatedPanelWorked.filter(
            (data) => data.idAgenteActividad === item.idAgenteActividad
          );
          const updatedAgentActivities = agentActivities.map((activity) => {
            return {
              idAgenteActividad: activity.idAgenteActividad,
              title: activity.descripcionActividad,
              start: activity.fechaInicioActividad,
              end:
                activity.fechaFinalActividad == null
                  ? activity.fechaFinalizacionEspTicket
                  : activity.fechaFinalActividad,
            };
          });

          agenteEncargado.innerHTML = "";
          agenteEncargado.textContent = `${agentActivities[0].nombreAgenteActividad} ${agentActivities[0].apellidoAgenteActividad}`;

          // Cambio de pagina
          if (changeDiv == false) {
            changeDiv = true;
            listCards.style.display = "none";
            infoAgenteDiv.style.display = "";
          } else {
            changeDiv = false;
            listCards.style.display = "";
            infoAgenteDiv.style.display = "none";
          }

          // Carga informacion de carga de trbaajo del agente
          var calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: "dayGridMonth",
            initialDate: today.toString(),
            headerToolbar: {
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            },
            events: updatedAgentActivities,
          });

          calendar.render();
        });

        const progressBarContainer = document.createElement("div");
        progressBarContainer.className = "progress";

        const textFecha = document.createElement("p");
        textFecha.textContent = `Día ${today}`;

        const progressBar = document.createElement("div");
        progressBar.className = "progress-bar bg-success";
        progressBar.setAttribute("role", "progressbar");
        progressBar.setAttribute("style", `width: ${item.progressPercentage}%`);
        progressBar.setAttribute("aria-valuenow", item.progressPercentage);
        progressBar.setAttribute("aria-valuemin", "0");
        progressBar.setAttribute("aria-valuemax", "100");

        progressBarContainer.appendChild(progressBar);

        divCol1.style.alignContent = "center";
        divCol2.style.alignContent = "center";
        divCol2.style.textAlign = "center";
        divCol3.style.alignContent = "center";

        divCol1.appendChild(title);
        divCol1.appendChild(ticketHours);
        divCol2.appendChild(textFecha);
        divCol2.appendChild(progressBarContainer);
        divCol3.appendChild(buttonVer);
        divRowMain.appendChild(divCol1);
        divRowMain.appendChild(divCol2);
        divRowMain.appendChild(divCol3);
        cardBody.appendChild(divRowMain);
        card.appendChild(cardBody);
        listCards.appendChild(card);
      });

      // Graficar la informacion en el mapa
      let agentCount = {};
      var ticketCompletos = data.infoTicketComplete;
      ticketCompletos.forEach((obj) => {
        if (agentCount[obj.NombreAgente]) {
          agentCount[obj.NombreAgente]++;
        } else {
          agentCount[obj.NombreAgente] = 1;
        }
      });

      let agentNames = Object.keys(agentCount);
      let agentValues = Object.values(agentCount);

      var barChartCanvas = $("#barChart").get(0).getContext("2d");
      var barChartData = {
        labels: agentNames,
        datasets: [
          {
            label: "Tickets completos el dia de hoy",
            data: agentValues,
            backgroundColor: "rgba(60,141,188,0.9)",
          },
        ],
      };

      var barChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        datasetFill: false,
      };

      new Chart(barChartCanvas, {
        type: "bar",
        data: barChartData,
        options: barChartOptions,
      });
    });

  cardTicketsPendientes.addEventListener("click", function () {
    window.location.href = "/soporte";
  });

  cardTicketsCompletos.addEventListener("click", function () {
    window.location.href = "/soporte";
  });

  cardTicketsProcess.addEventListener("click", function () {
    window.location.href = "/soporte";
  });

  btnReturnListAgent.addEventListener("click", function () {
    if (changeDiv == true) {
      changeDiv = false;
      listCards.style.display = "";
      infoAgenteDiv.style.display = "none";
    } else {
      changeDiv = false;
      listCards.style.display = "none";
      infoAgenteDiv.style.display = "";
    }
  });
  // Funcionalidad del boton para agregar registros en el Diario de trabajo
  btnCompleteDailyWork.addEventListener("click", function () {
    btnCompleteDailyWork.disabled = true;
    fetch("/create_daily_work/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(selectedInfoDaily),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          toastr["success"](
            "Registro de trabajo/s creado exitosamente en el diario de trabajos.",
            "Registro creado"
          );
          toastr.options = {
            closeButton: false,
            debug: false,
            newestOnTop: false,
            progressBar: false,
            positionClass: "toast-top-right",
            preventDuplicates: false,
            onclick: null,
            showDuration: "300",
            hideDuration: "1000",
            timeOut: "5000",
            extendedTimeOut: "1000",
            showEasing: "swing",
            hideEasing: "linear",
            showMethod: "fadeIn",
            hideMethod: "fadeOut",
          };
          setTimeout(function () {
            window.location.reload();
          }, 3000);
        } else {
          toastr["error"](data.message, "Error al registrar las tareas");
          toastr.options = {
            closeButton: false,
            debug: false,
            newestOnTop: false,
            progressBar: false,
            positionClass: "toast-top-right",
            preventDuplicates: false,
            onclick: null,
            showDuration: "300",
            hideDuration: "1000",
            timeOut: "5000",
            extendedTimeOut: "1000",
            showEasing: "swing",
            hideEasing: "linear",
            showMethod: "fadeIn",
            hideMethod: "fadeOut",
          };
          setTimeout(function () {
            window.location.reload();
          }, 3000);
        }
      })
      .catch((error) => {
        console.error("Error al enviar los datos:", error);
      });
  });
  // Funcionalidad para generar un PDF y un Excel
  btnGenerateDocuments.addEventListener("click", function () {
    // Traer la fecha actual
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const currentDate = `${year}-${month}-${day}`;
    const currentTime = `${hours}:${minutes}:${seconds}`;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("landscape");
    // Título del documento
    doc.setFontSize(18);
    doc.text("Diario de Trabajo", 105, 20, null, null, "center");
    doc.setFontSize(11);

    doc.text(
      `Informe de Diario de Trabajo (${currentDate} ${currentTime}), Generado por: ${infoUsuario.Nombre} ${infoUsuario.Apellido}`,
      10,
      30
    );
    // Convertir los datos del arreglo filteredInfoDailyWork en un formato adecuado para la tabla
    const tableColumn = [
      "Ticket",
      "Fecha de Creación",
      "Solicitante / Empresa",
      "Motivo de la Solicitud",
      "Actividad Seleccionada para trabajar",
      "Desde",
      "Hasta",
      "Actividad Realizada",
      "Estado de la Actividad",
    ];
    var filteredInfoDailyWorkEmpty = updatedInfoDailyWork.filter(item => {
      return !(item.actividadSeleccionada == null || item.actividadRealizada == null);
    });
    filteredInfoDailyWorkEmpty = filteredInfoDailyWorkEmpty.filter(item => {
      return !(item.idAgenteDiario != idUsuario.value);
    });
    const tableRows = filteredInfoDailyWorkEmpty.map((item) => [
      item.numTicket,
      item.fechaCreacionTicket,
      `${item.fullnameSolicitante} / ${item.nombreEmpresa}`,
      item.motivoSolicitud,
      item.actividadSeleccionada || "Sin especificar",
      item.fechaInicio || "S/F",
      item.fechaFin || "S/F",
      item.actividadRealizada || "Actividad aún sin registrar",
      item.estadoActividad || "Sin estado"
    ]);
    // Crear la tabla con autoTable
    doc.autoTable({
      startY: 40, // Comienza la tabla un poco más abajo del texto
      head: [tableColumn],
      body: tableRows,
      theme: "grid", // Estilo de tabla
      headStyles: { fillColor: [22, 160, 133] }, // Color de fondo para el encabezado
      styles: { fontSize: 10 }, // Tamaño de fuente para la tabla
      margin: { top: 10 },
    });

    // Crear el Excel
    const worksheetData = filteredInfoDailyWorkEmpty.map((item) => ({
      Ticket: item.numTicket,
      "Solicitante / Empresa": `${item.fullnameSolicitante} / ${item.nombreEmpresa}`,
      "Motivo de la Solicitud": item.motivoSolicitud,
      Desde: item.fechaInicio || "S/F",
      Hasta: item.fechaFin || "S/F",
      "Actividad Realizada":
        item.actividadRealizada || "Actividad aún sin registrar",
    }));
    // Crear un libro de trabajo
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Diario de Trabajo");

    // Guardar el PDF y Excel
    XLSX.writeFile(
      workbook,
      `Diario de Trabajo ${infoUsuario.Nombre} ${infoUsuario.Apellido} (${currentDate}).xlsx`
    );
    doc.save(
      `Diario de Trabajo ${infoUsuario.Nombre} ${infoUsuario.Apellido} (${currentDate}).pdf`
    );
  });
  // Boton para generar un reporte de los registros buscados
  btnGenerateDocumentsSearch.addEventListener("click", function () {
    // Traer la fecha actual
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const currentDate = `${year}-${month}-${day}`;
    const currentTime = `${hours}:${minutes}:${seconds}`;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("landscape");
    // Título del documento
    doc.setFontSize(18);
    doc.text("Diario de Trabajo", 105, 20, null, null, "center");
    doc.setFontSize(11);

    doc.text(
      `Informe de Diario de Trabajo (${currentDate} ${currentTime}), Generado por: ${infoUsuario.Nombre} ${infoUsuario.Apellido}`,
      10,
      30
    );
    // Convertir los datos del arreglo filteredWork en un formato adecuado para la tabla
    const tableColumn = [
      "Ticket",
      "Solicitante / Empresa",
      "Motivo de la Solicitud",
      "Desde",
      "Hasta",
      "Agente",
      "Actividad Realizada",
    ];
    const tableRows = filteredWork.map((item) => [
      item.numTicket,
      `${item.fullnameSolicitante} / ${item.nombreEmpresa}`,
      item.motivoSolicitud,
      item.fechaInicio || "S/F",
      item.fechaFin || "S/F",
      `${item.nombreAgente} ${item.apellidoAgente}`,
      item.actividadRealizada || "Actividad aún sin registrar",
    ]);
    // Crear la tabla con autoTable
    doc.autoTable({
      startY: 40, // Comienza la tabla un poco más abajo del texto
      head: [tableColumn],
      body: tableRows,
      theme: "grid", // Estilo de tabla
      headStyles: { fillColor: [22, 160, 133] }, // Color de fondo para el encabezado
      styles: { fontSize: 10 }, // Tamaño de fuente para la tabla
      margin: { top: 10 },
    });

    // Crear el Excel
    const worksheetData = filteredWork.map((item) => ({
      Ticket: item.numTicket,
      "Solicitante / Empresa": `${item.fullnameSolicitante} / ${item.nombreEmpresa}`,
      "Motivo de la Solicitud": item.motivoSolicitud,
      Desde: item.fechaInicio || "S/F",
      Hasta: item.fechaFin || "S/F",
      Agente: `${item.nombreAgente} ${item.apellidoAgente}`,
      "Actividad Realizada":
        item.actividadRealizada || "Actividad aún sin registrar",
    }));
    // Crear un libro de trabajo
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Diario de Trabajo");

    // Guardar el PDF y Excel
    XLSX.writeFile(workbook, `Diario de Trabajo (${currentDate}).xlsx`);
    doc.save(`Diario de Trabajo (${currentDate}).pdf`);
  });
  // Boto btnConsultarDiasAnteriores para abrir un nua nueva pestaña
  btnConsultarDiasAnteriores.addEventListener("click", function () {
    tableResponsiveCreateDayliWork.style.display = "none";
    btnConsultarDiasAnteriores.style.display = "none";

    tableResponsiveSearchDayliWork.style.display = "";
    btnBackRegistersActivities.style.display = "";
  });
  // Boton para regresar al registro de actividades
  btnBackRegistersActivities.addEventListener("click", function () {
    tableResponsiveSearchDayliWork.style.display = "none";
    btnBackRegistersActivities.style.display = "none";

    tableResponsiveCreateDayliWork.style.display = "";
    btnConsultarDiasAnteriores.style.display = "";
  });

  // Funcion de crear una nueva columna
  function createNewRow(row, data) {
    console.log(data);
    const newRow = document.createElement("tr");

    const newCellNumTicket = document.createElement("td");
    newCellNumTicket.textContent = ` Ticket ${data.numTicket}`;

    const newCellSolicitanteEmp = document.createElement("td");
    newCellSolicitanteEmp.textContent = data.fullnameSolicitante;

    const newCellActividades = document.createElement("td");
    const newSelectAct = document.createElement("select");
    newSelectAct.className = "custom-select custom-select-sm";
    const defaultOption = document.createElement("option");
    defaultOption.textContent = "Seleccionar actividad";
    defaultOption.value = "";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    newSelectAct.appendChild(defaultOption);
    newCellActividades.appendChild(newSelectAct);
    // Llenar el SELECT con las actividades
    var actividades = data.actividadesTicket;
    if (actividades.length != 0) {
      actividades
        .filter((actividad) => actividad.idEstadoAct == 2)
        .forEach((actividad) => {
          const option = document.createElement("option");
          option.textContent = actividad.actividad;
          option.value = actividad.idActividad;
          newSelectAct.appendChild(option);
        });
    } else {
      newSelectAct.disabled = true;
    }
    newCellActividades.appendChild(newSelectAct);

    const cellFechaDesde = document.createElement("td");
    const inputDateDesde = document.createElement("input");
    inputDateDesde.className = "form-control form-control-sm";
    inputDateDesde.type = "datetime-local";
    cellFechaDesde.appendChild(inputDateDesde);

    const cellFechaHasta = document.createElement("td");
    const inputDateHasta = document.createElement("input");
    inputDateHasta.type = "datetime-local";
    inputDateHasta.className = "form-control form-control-sm";
    cellFechaHasta.appendChild(inputDateHasta);

    const cellActHoy = document.createElement("td");
    const inputActHoy = document.createElement("input");
    inputActHoy.type = "text";
    inputActHoy.className = "form-control form-control-sm";
    cellActHoy.appendChild(inputActHoy);

    const cellActions = document.createElement("td");
    const check = document.createElement("input");
    check.type = "checkbox";
    check.disabled = true;
    // Funcionalidad del input
    inputActHoy.addEventListener("input", function () {
      let valorInputActivity = inputActHoy.value;
      if (valorInputActivity.length >= 5) {
        check.disabled = false;
      } else {
        check.disabled = true;
      }
    });
    check.addEventListener("change", function () {
      if (event.target.checked) {
        const actividad = inputActHoy.value;
        const fechaInicio = inputDateDesde.value;
        const fechaFin = inputDateHasta.value;
        const actividadSelected = newSelectAct.value;
        const itemWithActivity = {
          ...data,
          actividadRealizada: actividad,
          fechaInicioActividad: fechaInicio,
          fechaFinActividad: fechaFin,
          actividadSelected: actividadSelected,
        };
        selectedInfoDaily.push(itemWithActivity);
      } else {
        const index = selectedInfoDaily.findIndex(
          (selectedItem) => selectedItem.numTicket === item.numTicket
        );
        if (index !== -1) {
          selectedInfoDaily.splice(index, 1);
        }
      }
      if (selectedInfoDaily.length >= 1) {
        btnCompleteDailyWork.style.display = "";
      } else {
        btnCompleteDailyWork.style.display = "none";
      }
      console.log(selectedInfoDaily)
    });
    cellActions.appendChild(check);

    newRow.appendChild(newCellNumTicket);
    newRow.appendChild(newCellSolicitanteEmp);
    newRow.appendChild(newCellActividades);
    newRow.appendChild(cellFechaDesde);
    newRow.appendChild(cellFechaHasta);
    newRow.appendChild(cellActHoy);
    newRow.appendChild(cellActions)

    row.insertAdjacentElement("afterend", newRow);
  }
});
