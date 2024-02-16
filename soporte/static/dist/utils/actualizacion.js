$(document).ready(function () {
    cargarTablaTickets();
    $("#myTabs a").on("click", function (e) {
        e.preventDefault();
        $(this).tab("show");
        cargarTablaTickets();
    });

    //   Variables listas para usar
    const tbodyTicketsActualizacionCreados = document.getElementById(
        "tbodyTicketsActualizacionCreados"
    );
    const cardAlertNoPermissions = document.getElementById('cardAlertNoPermissions')
    const rowModulo = document.getElementById("rowModulo");
    const rowHorasAsignadas = document.getElementById("rowHorasAsignadas");
    const horasDiariasAsignadas = document.getElementById(
        "horasDiariasAsignadas"
    );
    const selectPrioridad = document.getElementById("selectPrioridad");
    const rowObservaciones = document.getElementById("rowObservaciones");
    const observaciones = document.getElementById("observaciones");
    const rowDescripcionGeneral = document.getElementById(
        "rowDescripcionGeneral"
    );
    const newTicketActualizacion = document.getElementById('newTicketActualizacion');
    const descripcionGeneral = document.getElementById("descripcionGeneral");
    const rowPrioridad = document.getElementById("rowPrioridad");
    const btnCreateTicket = document.getElementById("btnCreateTicket");
    const btnNewTask = document.getElementById("btnNewTask");
    const rowTableTasks = document.getElementById("rowTableTasks");
    const tbodyTasksMain = document.getElementById("tbodyTasksMain");
    const rowFechaEstimada = document.getElementById("rowFechaEstimada");
    var resultadosAgentesData = window.resultados_agentes_data;
    let arrayTasksMain = [], idTicket, infoTicketActualizar, horasCompletasTicket= 0, detalleTicket;

    // Variables para el modal de edicion de tareas
    const inputDescripcionGeneral = document.getElementById('inputDescripcionGeneral');
    const inputEditNumHoras = document.getElementById('inputEditNumHoras');
    const selectEditPrioridad = document.getElementById('selectEditPrioridad');
    const selectEditAgenteSolicitado = document.getElementById('selectEditAgenteSolicitado');
    const selectEditSolicitante = document.getElementById('selectEditSolicitante');
    var nombreUsuario = document.getElementById("nombreUsuario").value;
    const editFechaCreacion = document.getElementById('editFechaCreacion');
    const editFechaFinEstimada = document.getElementById('editFechaFinEstimada');
    const tbodyTareas = document.getElementById('tbodyTareas');

    //   Funcion principal para la carga de datos en la lista de ticket
    function cargarTablaTickets() {
        fetch("ticketsActualizacionCreados/")
            .then((response) => response.json())
            .then((data) => {
                tbodyTicketsActualizacionCreados.innerHTML = "";

                if (resultadosConsulta[0].group_id != 1) {
                    cardAlertNoPermissions.style.display = 'none';
                    newTicketActualizacion.style.display = '';
                } else {
                    cardAlertNoPermissions.style.display = '';
                     newTicketActualizacion.style.display = 'none';
                }
                // Informacion de la tabla y carga de la tabla
                if (data.length != 0) {
                    // En caso de que la consulta tenga datos
                    tbodyTicketsActualizacionCreados.innerHTML = '';
                    data.forEach(function (item) {
                        var row = document.createElement("tr");

                        var cellTicket = document.createElement("td");
                        cellTicket.textContent = item.NumTicket;

                        var cellEmpresa = document.createElement("td");
                        cellEmpresa.textContent = item.NombreEmpresa;

                        var cellModulo = document.createElement("td");
                        cellModulo.textContent = item.Modulo;

                        var cellSolicitante = document.createElement("td");
                        cellSolicitante.textContent = item.Solicitante;

                        var cellPrioridad = document.createElement("td");
                        cellPrioridad.textContent = item.Prioridad;

                        var cellEstado = document.createElement("td");
                        cellEstado.textContent = item.Estado;

                        var cellAccion = document.createElement("td");
                        var btnVer = document.createElement('button');
                        btnVer.className = 'btn btn-info btn-sm';
                        btnVer.id = 'btnVerDetallesTicket';
                        btnVer.textContent = 'Ver';
                        btnVer.dataset.toggle = "modal";
                        btnVer.dataset.target = "#detalleTicketModal";

                        // Funcionamiento del boton Ver
                        btnVer.addEventListener('click', function(){
                            idTicket = item.NumTicket
                            infoTicketActualizar = item;
                            inputDescripcionGeneral.textContent = infoTicketActualizar.descripcionGeneral;
                            // Consulta para los detalles del Ticket
                            fetch(`detalleTicketActualizacion/${idTicket}/`)
                            .then((response) => response.json())
                            .then(async (data) => {
                                detalleTicket = data
                                horasCompletasTicket = 0
                                console.log(detalleTicket)
                                // Sumatoria de las horas
                                for (let i = 0; i < detalleTicket.length; i++) {
                                    horasCompletasTicket += detalleTicket[i].horasTarea;
                                }
                                inputEditNumHoras.value = horasCompletasTicket;

                                selectEditPrioridad.value = "";
                                selectEditPrioridad.value = infoTicketActualizar.Prioridad
                                const changeEvent = new Event("change");
                                selectEditPrioridad.dispatchEvent(changeEvent);
                                
                                selectEditAgenteSolicitado.value = "";
                                selectEditAgenteSolicitado.value = infoTicketActualizar.idAgente
                                const changeEventAgente = new Event("change");
                                selectEditAgenteSolicitado.dispatchEvent(changeEventAgente);
                                
                                if(infoTicketActualizar.idEstado == 1 && (nombreUsuario == 'mafer' || nombreUsuario == 'superadmin')){
                                    selectEditAgenteSolicitado.disabled = false
                                }else{
                                    selectEditAgenteSolicitado.disabled = true
                                }

                                // Aqui deberia ir el evento donde se cambia el valor del Select Agente para poder asignar al nuevo agente

                                selectEditSolicitante.value = "";
                                selectEditSolicitante.value = infoTicketActualizar.idSolicitante
                                const changeEventSolicitante = new Event("change");
                                selectEditSolicitante.dispatchEvent(changeEventSolicitante);

                                editFechaCreacion.value = "";
                                editFechaCreacion.value = infoTicketActualizar.fechaCreacion;

                                editFechaFinEstimada.value = "";
                                editFechaFinEstimada.value = infoTicketActualizar.fechaFinalizacionEstimada;

                                // Tabulacion de las tareas
                                tbodyTareas.innerHTML = ''
                                detalleTicket.forEach(tarea => {
                                    const row = document.createElement('tr');

                                    const cellTarea = document.createElement('td');
                                    cellTarea.textContent = tarea.DescripcionTarea;
                                    row.appendChild(cellTarea);

                                    const cellHoras = document.createElement('td');
                                    cellHoras.textContent = tarea.horasTarea;
                                    row.appendChild(cellHoras);

                                    const cellFecha = document.createElement('td');
                                    cellFecha.textContent = tarea.fechaDesarrollo;
                                    row.appendChild(cellFecha)

                                    const cellResponsable = document.createElement('td');
                                    cellResponsable.textContent = `${tarea.NombreAgente} ${tarea.ApellidoAgente}`;
                                    row.appendChild(cellResponsable);

                                    // Aqui debe ir la funcionalidad de los checks primeramente ver el usuario que esta logeado, usar la variable nombreUsuario que ya esta definida globalmente


                                    tbodyTareas.appendChild(row);
                                })
                            })
                        });
                        cellAccion.appendChild(btnVer);

                        row.appendChild(cellTicket);
                        row.appendChild(cellEmpresa);
                        row.appendChild(cellModulo);
                        row.appendChild(cellSolicitante);
                        row.appendChild(cellPrioridad);
                        row.appendChild(cellEstado);
                        row.appendChild(cellAccion);

                        tbodyTicketsActualizacionCreados.appendChild(row);
                    })
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

    $("#selectPrioridad").on("change", function () {
        if (selectPrioridad.value != "") {
            rowFechaEstimada.style.display = "";
            btnNewTask.disabled = false;
        } else {
            rowFechaEstimada.style.display = "none";
            btnNewTask.disabled = true;
        }
    });

    //   Funcionamiento para la creacion del Ticket de Desarrollo
    $("form").submit(function (event) {
        event.preventDefault();
        var form = $(this);
        //   Vaciar el arreglo
        arrayTasksMain = [];
        // Iterar sobre los registros de la tabla
        $("#tbodyTasksMain tr").each(function () {
            var rowData = {};
            rowData.descripcionTarea = $(this).find("td:eq(0) input").val();
            rowData.numeroHoras = $(this).find("td:eq(1) input").val();
            rowData.fechaDesarrollo = $(this).find("td:eq(2) input").val();
            rowData.responsableTarea = $(this).find("td:eq(3) select").val();

            arrayTasksMain.push(rowData);
        });

        console.log(arrayTasksMain);
        form.append(
            '<input type="hidden" name="arrayTasksMain" value=\'' +
            JSON.stringify(arrayTasksMain) +
            "'>"
        );

        $.post(form.attr("action"), form.serialize(), function (data) {
            if (data.status === "success") {
                toastr.success(data.message, "Ticket creado con exito");
                //   Funcion para reseteo de pagina
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

    // Funcionamiento del boton para agregar una nueva tarea principal
    btnNewTask.addEventListener("click", function () {
        btnCreateTicket.disabled = true;
        btnNewTask.disabled = true;
        rowTableTasks.style.display = "";
        var row = document.createElement("tr");
        var cellInputTarea = document.createElement("td");
        var cellInputHorasDiarias = document.createElement("td");
        var cellInputDate = document.createElement("td");
        var cellSelect = document.createElement("td");

        // Input para la descripcion de la tarea
        var inputTarea = document.createElement("input");
        inputTarea.type = "text";
        inputTarea.className = "form-control form-control-sm";
        inputTarea.id = "inputTarea";

        // Input para el numero de horas diarias que se van a trabajar
        var inputNumHoras = document.createElement("input");
        inputNumHoras.type = "number";
        inputNumHoras.className = "form-control form-control-sm";
        inputNumHoras.id = "inputNumHoras";

        // Input para la fecha y hora del desarrollo de la actividad
        var inputDate = document.createElement("input");
        inputDate.type = "datetime-local";
        inputDate.className = "form-control form-control-sm";
        inputDate.id = "inputDateTask";

        // Input con un select para agregar al agente encargado de esta actividad
        var selectElement = document.createElement("select");
        var defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Seleccionar Responsable";
        selectElement.className = "form-control form-control-sm";
        selectElement.name = "responsableTarea";
        selectElement.id = "responsableTarea";
        selectElement.appendChild(defaultOption);
        // Llenar el select
        for (var i = 0; i < resultadosAgentesData.length; i++) {
            var agente = resultadosAgentesData[i];
            var option = document.createElement("option");
            option.value = agente.id;
            option.textContent = agente.full_name;
            selectElement.appendChild(option);
        }
        // Funcionamiento del select
        selectElement.addEventListener("change", function () {
            if (
                inputTarea.value != "" &&
                inputNumHoras.value != 0 &&
                inputDate.value != "" &&
                selectElement.value != ""
            ) {
                toastr.success("Puede agregar una nueva tarea o terminar el ticket");
                btnCreateTicket.disabled = false;
                btnNewTask.disabled = false;
            } else {
                toastr.error(
                    "Por favor agrege un valor y vuelva hacer la seleccion del agente.",
                    "Uno de los campos se encuentra sin datos."
                );
                btnCreateTicket.disabled = true;
                btnNewTask.disabled = true;
            }
        });

        cellInputTarea.appendChild(inputTarea);
        cellInputHorasDiarias.appendChild(inputNumHoras);
        cellInputDate.appendChild(inputDate);
        cellSelect.appendChild(selectElement);

        row.appendChild(cellInputTarea);
        row.appendChild(cellInputHorasDiarias);
        row.appendChild(cellInputDate);
        row.appendChild(cellSelect);

        tbodyTasksMain.appendChild(row);
    });
});
