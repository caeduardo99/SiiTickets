$(document).ready(function () {
  // VARIABLES PRINCIPALES
  const textBienvenida = document.getElementById("textBienvenida");
  const numTicketsComplete = document.getElementById('numTicketsComplete');
  const numTickestCompleteTotals = document.getElementById('numTickestCompleteTotals');
  const numTicketsAwait = document.getElementById('numTicketsAwait');
  const numTickestAwaitTotals = document.getElementById('numTickestAwaitTotals');
  const numTicketProcess = document.getElementById('numTicketProcess');
  const numTicketProcessVenci = document.getElementById('numTicketProcessVenci');
  const tdTimeLastTicket = document.getElementById('tdTimeLastTicket');
  const tdTimeLastUpdate = document.getElementById('tdTimeLastUpdate');
  const tdTimeDevelop = document.getElementById('tdTimeDevelop');
  const cardTicketsPendientes = document.getElementById('cardTicketsPendientes');
  const cardTicketsCompletos = document.getElementById('cardTicketsCompletos');
  const listCards = document.getElementById('listCards');
  const infoAgenteDiv = document.getElementById("infoAgente");
  const btnReturnListAgent = document.getElementById("btnReturnListAgent");
  const agenteEncargado = document.getElementById("agenteEncargado");
  const cardTicketsProcess = document.getElementById("cardTicketsProcess");
  const tbodyDiarioTrabajo = document.getElementById("tbodyDiarioTrabajo");
  const btnCompleteDailyWork = document.getElementById("btnCompleteDailyWork");
  const rowDiarioTrabajo = document.getElementById("rowDiarioTrabajo");

  var calendarEl = document.getElementById('calendar');

  let changeDiv = false, selectedInfoDaily = []


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
        const filteredInfoDailyWork = getInfoDailyWork.reduce((acc, current) => {
            const existingItemIndex = acc.findIndex(item => item.numTicket === current.numTicket);
            if (existingItemIndex === -1) {
                // Si no existe, agregar el objeto actual al acumulador
                acc.push(current);
            } else {
                if (current.actividadRealizada !== null) {
                    acc[existingItemIndex] = current;
                }
            }
            return acc;
        }, []);
        if(data.consult_diario_trabajo){
            rowDiarioTrabajo.style.display = ""
            if(getInfoDailyWork.length != 0){
                filteredInfoDailyWork.forEach(item => {
                    const row = document.createElement("tr");
                    const cellNumTicket = document.createElement("td");
                    cellNumTicket.textContent = item.numTicket;
        
                    const cellSolicitante = document.createElement("td");
                    cellSolicitante.textContent = `${item.fullnameSolicitante}/${item.nombreEmpresa}`;
        
                    const cellMotivoSoli = document.createElement("td");
                    cellMotivoSoli.textContent = item.motivoSolicitud;
        
                    const cellFechaInicio = document.createElement("td");
                    const inputFechaInicio = document.createElement("input");
                    if(item.actividadRealizada == null){
                        inputFechaInicio.type = "datetime-local";
                        inputFechaInicio.className = "form-control form-control-sm";
                        cellFechaInicio.appendChild(inputFechaInicio);
                    }else{
                        const fechaInicio = new Date(item.fechaInicio);
                        const fechaFormateada = fechaInicio.toISOString().replace("T", " ").substring(0, 19);
                        cellFechaInicio.textContent = fechaFormateada;
                    }
        
                    const cellFechaFin = document.createElement("td");
                    const inputFechaFin = document.createElement("input");
                    if(item.actividadRealizada == null){
                        inputFechaFin.type = "datetime-local";
                        inputFechaFin.className = "form-control form-control-sm";
                        cellFechaFin.appendChild(inputFechaFin);
                    }else{
                        const fechaFin = new Date(item.fechaFin);
                        const fechaFinFormat = fechaFin.toISOString().replace("T", " ").substring(0, 19);
                        cellFechaFin.textContent = fechaFinFormat;
                    }
        
                    const cellActividadDaily = document.createElement("td");
                    const cellActions = document.createElement("td");
                    // Condicion en caso de que venga NULL el motivo
                    if(item.actividadRealizada == null){
                        const inputActividadDaily = document.createElement("input");
                        inputActividadDaily.className = " form-control form-control-sm";
                        inputActividadDaily.type = "text";
                        // Funcionalidad del input
                        inputActividadDaily.addEventListener('input', function(){
                            let valorInputActivity = inputActividadDaily.value;
                            if(valorInputActivity.length >= 5){
                                check.disabled = false
                            }else{
                                check.disabled = true
                            }
                        });
                        cellActividadDaily.appendChild(inputActividadDaily);
        
                        const check = document.createElement("input");
                        check.type = "checkbox";
                        check.disabled = true;
                        // Funcionalidad del check para que aparezca el boton y se guarden las actividades realizadas durante el Día
                        check.addEventListener('change', function(){
                            if (event.target.checked) {
                                const actividad = inputActividadDaily.value; 
                                const fechaInicio = inputFechaInicio.value;
                                const fechaFin = inputFechaFin.value;
                                const itemWithActivity = { ...item, actividadRealizada: actividad, fechaInicioActividad: fechaInicio, fechaFinActividad: fechaFin }; 
                                selectedInfoDaily.push(itemWithActivity);
                            } else {
                                const index = selectedInfoDaily.findIndex(selectedItem => selectedItem.numTicket === item.numTicket);
                                if (index !== -1) {
                                    selectedInfoDaily.splice(index, 1);
                                }
                            }
                            if(selectedInfoDaily.length >= 1){
                                btnCompleteDailyWork.style.display = ""
                            }else{
                                btnCompleteDailyWork.style.display = "none"
                            }
                        });
                        cellActions.appendChild(check);
                    }else{
                        cellActividadDaily.textContent = item.actividadRealizada;
        
                        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                        svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
                        svg.setAttribute("viewBox", "0 0 512 512");
                        svg.setAttribute("width", "20");
                        svg.setAttribute("height", "20");
                        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                        path.setAttribute("d", "M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z");
                        svg.appendChild(path);
                        
                        cellActions.appendChild(svg);
                    }
        
                    row.appendChild(cellNumTicket)
                    row.appendChild(cellSolicitante)
                    row.appendChild(cellMotivoSoli)
                    row.appendChild(cellFechaInicio)
                    row.appendChild(cellFechaFin)
                    row.appendChild(cellActividadDaily)
                    row.appendChild(cellActions)
                    tbodyDiarioTrabajo.appendChild(row)
                })
            }else{
                const row = document.createElement("tr");
                const cellInfo = document.createElement("td");
                cellInfo.textContent = "El Usuario no tiene Ticket Asignados para resolver"
                cellInfo.colSpan = "7";
                cellInfo.style.textAlign = "center";
                row.appendChild(cellInfo)
                tbodyDiarioTrabajo.appendChild(row);
            }
        }else{
            rowDiarioTrabajo.style.display = "none";
        }

        var panel_worked = data.panel_list_worked
        
        numTicketsComplete.textContent = `${data.numDayliTicketComplete} Tickets completos (Hoy)`;
        numTickestCompleteTotals.textContent = idUsuario.value == 2 ? `${data.numTicketsComplete} Tickets completados por los colaboradores hasta la fecha` :  `${data.numTicketsComplete} Tickets completados por/para este usuario hasta la fecha`;
        numTickestAwaitTotals.textContent = idUsuario.value == 2 ? `${data.numTicketAwait} Tickets pendientes de asignar a la fecha` : `${data.numTicketAwait} Tickets en espera del agente.`;
        numTicketsAwait.textContent = `${data.numTicketAwaitToDay} Tickets en espera (Hoy)`;
        numTicketProcess.textContent = `${data.numTicketProcess} Tickets en proceso (Hoy)`;
        numTicketProcessVenci.textContent = `${data.numTicketProcessVenci} Tickets en proceso con fecha atrasada`;

        tdTimeLastTicket.textContent = data.tiempoDiferenciaSoporte == "" ? 'No hay tickets creados para este usuario' : `Utimo ticket creado hace ${data.tiempoDiferenciaSoporte}`;
        tdTimeLastUpdate.textContent = data.timeDifUpdate == "" ? 'No hay actualizaciones creadas para este usuario': `Ultimo ticket creado hace ${data.timeDifUpdate}`;
        tdTimeDevelop.textContent =  data.timeDifDev == "" ? 'No hay desarrollos creados para este usuario' : `Ultimo ticket creado hace ${data.timeDifDev}`;
        
        // Crear las cartas
        const groupedByAgent = panel_worked.reduce((acc, curr) => {
            if (!acc[curr.idAgenteActividad]) {
              acc[curr.idAgenteActividad] = { idAgenteActividad: curr.idAgenteActividad, nombreAgenteTicket: curr.nombreAgenteTicket, apellidoAgenteTicket: curr.apellidoAgenteTicket };
            }
            return acc;
        }, {});
        const result_agent = Object.values(groupedByAgent);

        // Agrupacion por fechas (Formatear las fechas)
        const updatedPanelWorked = panel_worked.map(obj => ({
            ...obj,
            fechaInicioActividad: obj.fechaInicioActividad.split('T')[0],
            fechaFinalActividadFormat: obj.fechaFinalActividad == null ? obj.fechaFinalizacionEspTicket.split('T')[0] : obj.fechaFinalActividad.split('T')[0]
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
                minutosActividad: 0
              };
            }
            acc[key].minutosActividad += obj.minutosActividad;
            return acc;
          }, {});
        const result_fecha_agente = Object.values(groupedData);
        
        const today = new Date().toISOString().split('T')[0];
        const todayData = result_fecha_agente.filter(obj => obj.fechaFinalActividadFormat == today);
        
        const maxMinutesDay = 480
        
        const combinedData = result_agent.map(agent => {
            const agentData = todayData.find(data => data.idAgenteActividad === agent.idAgenteActividad);
            const minutosActividad = agentData ? agentData.minutosActividad : 0;
            const progressPercentage = (minutosActividad / maxMinutesDay) * 100;
          
            return {
              ...agent,
              minutosActividad,
              progressPercentage
            };
        });
        
        combinedData.forEach(item => {
            const divRowMain = document.createElement("div");
            divRowMain.className = "row";
            
            const divCol1 = document.createElement("div");
            divCol1.className = "col-5";
            
            const divCol2 = document.createElement("div");
            divCol2.className = "col-5";
            
            const divCol3 = document.createElement("div");
            divCol3.className = "col-2";
            
            const card = document.createElement('div');
            card.className = 'card';
            card.style.backgroundColor = '#DADADA';
            
            const cardBody = document.createElement('div');
            cardBody.classList.add('card-body');
            
            const title = document.createElement('h4');
            const ticketHours = document.createElement('p');
            
            const horasTickets = (item.minutosActividad / 60).toFixed(2);
            title.textContent = `${item.nombreAgenteTicket} ${item.apellidoAgenteTicket}`;
            ticketHours.textContent = `${horasTickets} horas trabajadas`;
          
            const buttonVer = document.createElement("button");
            buttonVer.className = "btn btn-sm btn-secondary";
            buttonVer.type = "button";
            buttonVer.textContent = "Ver";
            buttonVer.setAttribute('data-toggle', 'modal');
            buttonVer.setAttribute('data-target', '#modalWorkAgent');

            // Funcionalidad del boton Ver - cargar el modal ----------------------------------------------------------------
            buttonVer.addEventListener("click", function(){
                const agentActivities = updatedPanelWorked.filter(data => data.idAgenteActividad === item.idAgenteActividad);
                const updatedAgentActivities = agentActivities.map(activity => {
                    return {
                        idAgenteActividad: activity.idAgenteActividad,
                        title: activity.descripcionActividad,
                        start: activity.fechaInicioActividad,
                        end: activity.fechaFinalActividad == null ? activity.fechaFinalizacionEspTicket : activity.fechaFinalActividad,
                    };
                });

                agenteEncargado.innerHTML = ""
                agenteEncargado.textContent = `${agentActivities[0].nombreAgenteActividad} ${agentActivities[0].apellidoAgenteActividad}`
                
                // Cambio de pagina
                if(changeDiv ==  false){
                    changeDiv = true
                    listCards.style.display = 'none'
                    infoAgenteDiv.style.display = ''
                }else{
                    changeDiv = false
                    listCards.style.display = '' 
                    infoAgenteDiv.style.display = 'none'
                }

                // Carga informacion de carga de trbaajo del agente
                var calendar = new FullCalendar.Calendar(calendarEl, {
                    initialView: 'dayGridMonth',
                    initialDate: today.toString(),
                    headerToolbar: {
                      left: 'prev,next today',
                      center: 'title',
                      right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    },
                    events: updatedAgentActivities
                  });
                
                  calendar.render();
            })
            
            const progressBarContainer = document.createElement('div');
            progressBarContainer.className = 'progress';

            const textFecha = document.createElement("p");
            textFecha.textContent = `Día ${today}`
            
            const progressBar = document.createElement('div');
            progressBar.className = 'progress-bar bg-success';
            progressBar.setAttribute('role', 'progressbar');
            progressBar.setAttribute('style', `width: ${item.progressPercentage}%`);
            progressBar.setAttribute('aria-valuenow', item.progressPercentage);
            progressBar.setAttribute('aria-valuemin', '0');
            progressBar.setAttribute('aria-valuemax', '100');
          
            progressBarContainer.appendChild(progressBar);
          
            divCol1.style.alignContent = "center";
            divCol2.style.alignContent = "center";
            divCol2.style.textAlign = "center";
            divCol3.style.alignContent = "center";
            
            divCol1.appendChild(title);
            divCol1.appendChild(ticketHours);
            divCol2.appendChild(textFecha)
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
        ticketCompletos.forEach(obj => {
            if (agentCount[obj.NombreAgente]) {
                agentCount[obj.NombreAgente]++;
            } else {
                agentCount[obj.NombreAgente] = 1;
            }
        });

        let agentNames = Object.keys(agentCount);
        let agentValues = Object.values(agentCount);

        var barChartCanvas = $('#barChart').get(0).getContext('2d')
        var barChartData = {
            labels: agentNames,
            datasets: [{
                label: 'Tickets completos el dia de hoy',
                data: agentValues,
                backgroundColor: 'rgba(60,141,188,0.9)'
            }]
        }

        var barChartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            datasetFill: false
        }

        new Chart(barChartCanvas, {
            type: 'bar',
            data: barChartData,
            options: barChartOptions
        })
    });

    cardTicketsPendientes.addEventListener('click', function(){
        window.location.href = '/soporte';
    });

    cardTicketsCompletos.addEventListener('click', function(){
        window.location.href = '/soporte';
    })

    cardTicketsProcess.addEventListener('click', function(){
        window.location.href = '/soporte';
    })

    btnReturnListAgent.addEventListener("click", function(){
        if(changeDiv == true){
            changeDiv = false
            listCards.style.display = ''
            infoAgenteDiv.style.display = 'none'
        }else{
            changeDiv = false
            listCards.style.display = 'none'
            infoAgenteDiv.style.display = ''
        }
    })
    // Funcionalidad del boton para agregar registros en el Diario de trabajo
    btnCompleteDailyWork.addEventListener("click", function(){
        btnCompleteDailyWork.disabled = true;
        fetch("/create_daily_work/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(selectedInfoDaily),
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                toastr["success"]("Registro de trabajo/s creado exitosamente en el diario de trabajos.", "Registro creado")
                toastr.options = {
                "closeButton": false,
                "debug": false,
                "newestOnTop": false,
                "progressBar": false,
                "positionClass": "toast-top-right",
                "preventDuplicates": false,
                "onclick": null,
                "showDuration": "300",
                "hideDuration": "1000",
                "timeOut": "5000",
                "extendedTimeOut": "1000",
                "showEasing": "swing",
                "hideEasing": "linear",
                "showMethod": "fadeIn",
                "hideMethod": "fadeOut"
                }
            } else {
                toastr["error"](data.message, "Error al registrar las tareas")
                toastr.options = {
                "closeButton": false,
                "debug": false,
                "newestOnTop": false,
                "progressBar": false,
                "positionClass": "toast-top-right",
                "preventDuplicates": false,
                "onclick": null,
                "showDuration": "300",
                "hideDuration": "1000",
                "timeOut": "5000",
                "extendedTimeOut": "1000",
                "showEasing": "swing",
                "hideEasing": "linear",
                "showMethod": "fadeIn",
                "hideMethod": "fadeOut"
                }
            }
        })
        .catch(error => {
            console.error("Error al enviar los datos:", error);
        });
    })
});
