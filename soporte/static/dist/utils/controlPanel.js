$(document).ready(function () {
    // VARIABLES PRINCIPALES
    const textBienvenida = document.getElementById("textBienvenida");
    const bodyTableProyectos = document.getElementById("bodyTableProyectos");
    const bodyTableProyectosVenci = document.getElementById(
        "bodyTableProyectosVenci"
    );
    const bodyTableProyectosProgress = document.getElementById(
        "bodyTableProyectosProgress"
    );
    const bodyTableProyectosProgressVenci = document.getElementById(
        "bodyTableProyectosProgressVenci"
    );
    const bodyTableProyectosEsperandoFinalizacionAtrasado = document.getElementById('bodyTableProyectosEsperandoFinalizacionAtrasado')
    const rowInfoAdmin = document.getElementById('rowInfoAdmin');
    const bodyTableProyectosEsperandoFinalizacion = document.getElementById('bodyTableProyectosEsperandoFinalizacion');
    const bodyTableProyectosFinalizados = document.getElementById('bodyTableProyectosFinalizados');
    const bodyTableProyectosFinalizadosAtrasados = document.getElementById('bodyTableProyectosFinalizadosAtrasados');
    const numProjectNoAsign = document.getElementById('numProjectNoAsign');
    const numProjectNoAsignVenci = document.getElementById('numProjectNoAsignVenci');
    const numProjectProcess = document.getElementById('numProjectProcess');
    const numProjectProcessVenci = document.getElementById('numProjectProcessVenci');
    const numProjectJetFinish = document.getElementById('numProjectJetFinish');
    const numProjectJetFinishVenci = document.getElementById('numProjectJetFinishVenci');
    const numProjectFinish = document.getElementById('numProjectFinish');
    const numProjectFinishVenci = document.getElementById('numProjectFinishVenci');
    const numTasksProcess = document.getElementById('numTasksProcess');
    const numTasksProcessVenci = document.getElementById('numTasksProcessVenci');
    const numTasksJustFinish = document.getElementById('numTasksJustFinish');
    const numTasksJustFinishVenci = document.getElementById('numTasksJustFinishVenci');
    const bodyTableTaskProcess = document.getElementById('bodyTableTaskProcess');
    const bodyTableTaskProcessVenci = document.getElementById('bodyTableTaskProcessVenci');
    const bodyTableTaskJustSuccess = document.getElementById('bodyTableTaskJustSuccess');
    const bodyTableTaskJustSuccessVenci = document.getElementById('bodyTableTaskJustSuccessVenci');
    const bodyTableTaskSuccess = document.getElementById('bodyTableTaskSuccess');
    const numTasksSuccess = document.getElementById('numTasksSuccess');
    const bodyTableTaskSuccessVenci = document.getElementById('bodyTableTaskSuccessVenci');
    const numTasksSuccessVenci = document.getElementById('numTasksSuccessVenci');

    let fullName = `${infoUsuario.Nombre} ${infoUsuario.Apellido}`;
    textBienvenida.innerHTML = `Bienvenid@ ${
        infoUsuario.Nombre == null ? infoUsuario.username : fullName
    }`;


    if (infoUsuario.username == 'mafer' || infoUsuario.username == 'superadmin') {
        rowInfoAdmin.style.display = ''
    } else {
        rowInfoAdmin.style.display = 'none'
    }

    // CONSULTA A LA VISTA
    $.ajax({
        url: "get_tickets_cpanel/",
        method: "GET",
        success: function (data) {
            let projectsPorAsignar, projectsPorAsignarVeci, projectsProcess, projectsProcessVenci, projectsJustSuccess,
                projectsJustSuccessVenci, projectsSuccess, projectsSuccessVenci, tasksProcess, tasksProcessVenci,
                tasksJustSuccess, tasksJustSuccessVenci, tasksSuccess, tasksSuccessVenci;

            projectsPorAsignar = data.resultados_project_por_asignar;
            projectsPorAsignarVeci = data.projects_venci_no_asign;
            projectsProcess = data.resultados_project_process;
            projectsProcessVenci = data.projects_process_venci;
            projectsJustSuccess = data.resultados_project_just_success;
            projectsJustSuccessVenci = data.projects_just_success_venci;
            projectsSuccess = data.resultados_project_success;
            projectsSuccessVenci = data.projects_success_venci;
            tasksProcess = data.resultados_tasks_process;
            tasksProcessVenci = data.tasks_process_venci;
            tasksJustSuccess = data.resultados_tasks_just_success;
            tasksJustSuccessVenci = data.taks_just_success_venci;
            tasksSuccess = data.resultados_tasks_success
            tasksSuccessVenci = data.tasks_success_venci;
            console.log(data)

            if (projectsPorAsignar.length !== 0) {
                projectsPorAsignar.forEach(function (project) {
                    const fullName = `${project.nombreAgente} ${project.ApellidoAgente}`;
                    crearTablaRowFunction(
                        bodyTableProyectos,
                        fullName,
                        project.idEstado,
                        project,
                        1
                    );
                });
            } else {
                const row = bodyTableProyectos.insertRow();
                const cell = row.insertCell();
                cell.innerHTML =
                    "No hay proyectos por asignar que se encuentren a tiempo";
                cell.style.textAlign = "center";
            }

            //   TABULACION DE PROYECTOS POR ASIGNAR VENCIDOS
            if (projectsPorAsignarVeci.length !== 0) {
                projectsPorAsignarVeci.forEach(function (project) {
                    const fullName = `${project.NombreAgente} ${project.ApellidoAgente}`;
                    crearTablaRowFunction(
                        bodyTableProyectosVenci,
                        fullName,
                        project.idEstado,
                        project,
                        1
                    );
                });
            } else {
                const row = bodyTableProyectosVenci.insertRow();
                const cell = row.insertCell();
                cell.innerHTML =
                    "No hay proyectos por asignar que se encuentren a tiempo";
                cell.style.textAlign = "center";
            }

            if (projectsProcess.length !== 0) {
                projectsProcess.forEach(function (project) {
                    const fullName = `${project.NombreAgente} ${project.ApellidoAgente}`;
                    crearTablaRowFunction(
                        bodyTableProyectosProgress,
                        fullName,
                        project.idEstado,
                        project,
                        1
                    );
                });
            } else {
                const row = bodyTableProyectosProgress.insertRow();
                const cell = row.insertCell();
                cell.innerHTML = "No hay proyectos que esten eproceso.";
                cell.style.textAlign = "center";
            }

            if (projectsProcessVenci.length != 0) {
                projectsProcessVenci.forEach(function (project) {
                    const fullName = `${project.NombreAgente} ${project.ApellidoAgente}`;
                    crearTablaRowFunction(
                        bodyTableProyectosProgressVenci,
                        fullName,
                        project.idEstado,
                        project,
                        1
                    );
                });
            } else {
                const row = bodyTableProyectosProgressVenci.insertRow();
                const cell = row.insertCell();
                cell.innerHTML = "No hay proyectos que esten en proceso atrasados.";
                cell.style.textAlign = "center";
            }

            if (projectsJustSuccess.length != 0) {
                projectsJustSuccess.forEach(function (project) {
                    const fullName = `${project.NombreAgente} ${project.ApellidoAgente}`
                    crearTablaRowFunction(bodyTableProyectosEsperandoFinalizacion, fullName, project.idEstado, project, 1)
                })
            } else {
                const row = bodyTableProyectosEsperandoFinalizacion.insertRow();
                const cell = row.insertCell();
                cell.innerHTML = "No hay projectos que esten en espera de ser Finalizado."
                cell.style.textAlign = "center";
            }

            if (projectsJustSuccessVenci.length != 0) {
                projectsJustSuccessVenci.forEach(function (project) {
                    const fullName = `${project.NombreAgente} ${project.ApellidoAgente}`
                    crearTablaRowFunction(bodyTableProyectosEsperandoFinalizacionAtrasado, fullName, project.idEstado, project, 1)
                })
            } else {
                const row = bodyTableProyectosEsperandoFinalizacionAtrasado.insertRow();
                const cell = row.insertCell();
                cell.innerHTML = "No hay projectos que esten en espera de ser Finalizado que esten atrasados."
                cell.style.textAlign = "center";
            }

            if (projectsSuccess.length != 0) {
                projectsSuccess.forEach(function (project) {
                    const fullName = `${project.NombreAgente} ${project.ApellidoAgente}`
                    crearTablaRowFunction(bodyTableProyectosFinalizados, fullName, project.idEstado, project, 1)
                })
            } else {
                const row = bodyTableProyectosFinalizados.insertRow();
                const cell = row.insertCell();
                cell.innerHTML = "No hay projectos que esten en Finalizados."
                cell.style.textAlign = "center";
            }

            if (projectsSuccessVenci.length != 0) {
                projectsSuccessVenci.forEach(function (project) {
                    const fullName = `${project.NombreAgente} ${project.ApellidoAgente}`
                    crearTablaRowFunction(bodyTableProyectosFinalizadosAtrasados, fullName, project.idEstado, project, 1)
                })
            } else {
                const row = bodyTableProyectosFinalizadosAtrasados.insertRow();
                const cell = row.insertCell();
                cell.innerHTML = "No hay projectos que esten en Finalizados."
                cell.style.textAlign = "center";
            }

            if (tasksProcess.length != 0) {
                tasksProcess.forEach(function (project) {
                    const fullName = `${project.NombreAgenteTask} ${project.ApellidoAgenteTask}`
                    crearTablaRowFunction(bodyTableTaskProcess, fullName, project.idEstado, project, 2)
                })
            } else {
                const row = bodyTableTaskProcess.insertRow();
                const cell = row.insertCell();
                cell.innerHTML = "No hay tareas en proceso pendientes."
                cell.style.textAlign = "center";
            }

            if (tasksProcessVenci.length != 0) {
                tasksProcessVenci.forEach(function (project) {
                    const fullName = `${project.NombreAgenteTask} ${project.ApellidoAgenteTask}`
                    crearTablaRowFunction(bodyTableTaskProcessVenci, fullName, project.idEstado, project, 2)
                })
            } else {
                const row = bodyTableTaskProcessVenci.insertRow();
                const cell = row.insertCell();
                cell.innerHTML = "No hay tareas en proceso atrasadas."
                cell.style.textAlign = "center";
            }

            if (tasksJustSuccess.length != 0) {
                tasksJustSuccess.forEach(function (project) {
                    const fullName = `${project.NombreAgenteTask} ${project.ApellidoAgenteTask}`
                    crearTablaRowFunction(bodyTableTaskJustSuccess, fullName, project.idEstado, project, 2)
                })
            } else {
                const row = bodyTableTaskJustSuccess.insertRow();
                const cell = row.insertCell();
                cell.innerHTML = "No hay tareas esperando finalización."
                cell.style.textAlign = "center";
            }

            if (tasksJustSuccessVenci.length != 0) {
                tasksJustSuccessVenci.forEach(function (project) {
                    const fullName = `${project.NombreAgenteTask} ${project.ApellidoAgenteTask}`
                    crearTablaRowFunction(bodyTableTaskJustSuccessVenci, fullName, project.idEstado, project, 2)
                })
            } else {
                const row = bodyTableTaskJustSuccessVenci.insertRow();
                const cell = row.insertCell();
                cell.innerHTML = "No hay tareas esperando finalización Vencidas."
                cell.style.textAlign = "center";
            }

            if (tasksSuccess.length != 0) {
                tasksSuccess.forEach(function (project) {
                    const fullName = `${project.NombreAgenteTask} ${project.ApellidoAgenteTask}`
                    crearTablaRowFunction(bodyTableTaskSuccess, fullName, project.idEstado, project, 2)
                })
            } else {
                const row = bodyTableTaskSuccess.insertRow();
                const cell = row.insertCell();
                cell.innerHTML = "No hay tareas finalizadas."
                cell.style.textAlign = "center";
            }

            if (tasksSuccessVenci.length != 0) {
                tasksSuccessVenci.forEach(function (project) {
                    const fullName = `${project.NombreAgenteTask} ${project.ApellidoAgenteTask}`
                    crearTablaRowFunction(bodyTableTaskSuccessVenci, fullName, project.idEstado, project, 2)
                })
            } else {
                const row = bodyTableTaskSuccessVenci.insertRow();
                const cell = row.insertCell();
                cell.innerHTML = "No hay tareas finalizadas sin entregar a tiempo."
                cell.style.textAlign = "center";
            }

            //Numerador para proyectos y tareas
            numProjectNoAsign.textContent = `(${projectsPorAsignar.length})`
            numProjectNoAsignVenci.textContent = `(${projectsPorAsignarVeci.length})`
            numProjectProcess.textContent = `(${projectsProcess.length})`
            numProjectProcessVenci.textContent = `(${projectsProcessVenci.length})`
            numProjectJetFinish.textContent = `(${projectsJustSuccess.length})`
            numProjectJetFinishVenci.textContent = `(${projectsJustSuccessVenci.length})`
            numProjectFinish.textContent = `(${projectsSuccess.length})`
            numProjectFinishVenci.textContent = `(${projectsSuccessVenci.length})`
            numTasksProcess.textContent = `(${tasksProcess.length})`
            numTasksProcessVenci.textContent = `(${tasksProcessVenci.length})`
            numTasksJustFinish.textContent = `(${tasksJustSuccess.length})`
            numTasksJustFinishVenci.textContent = `(${tasksJustSuccessVenci.length})`
            numTasksSuccess.textContent = `(${tasksSuccess.length})`
            numTasksSuccessVenci.textContent = `(${tasksSuccessVenci.length})`
        },
        error: function (error) {
            console.error("Error al obtener los datos:", error);
        },
    });

    $.ajax({
        url: 'consultatareas_view/',  // Reemplaza con la URL correcta
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            console.log(data);  // Imprimir el JSON completo en la consola

            // Obtener la fecha actual
            var fechaActual = new Date();

            // Filtrar el JSON para obtener solo las tareas en proceso atrasadas
            var tareasEnProcesoAtrasadas = data.filter(function (tarea) {
                var fechaFinal = new Date(tarea.fechafinal);

                // Verificar si la tarea está en proceso y la fecha final es mayor a la fecha actual
                return tarea.estado === 2 && fechaFinal > fechaActual;
            });

            console.log(tareasEnProcesoAtrasadas);  // Imprimir las tareas en proceso atrasadas en la consola

            // Actualizar el conteo en el HTML
            $('#enprocesoatrasadas').text('(' + tareasEnProcesoAtrasadas.length + ')');

            // Actualizar la tabla en el HTML para las tareas en proceso atrasadas
            var tablaEnProcesoAtrasada = $('#tablaenprocesoatrasada');
            tablaEnProcesoAtrasada.empty();  // Limpiar la tabla antes de agregar filas

            // Encabezados de la tabla
            tablaEnProcesoAtrasada.append('<tr><th># Ticket</th><th>Descripción</th><th>Agente</th></tr>');

            // Agregar filas a la tabla con la información de las tareas en proceso atrasadas
            tareasEnProcesoAtrasadas.forEach(function (tarea) {
                var fila = '<tr><td>' + tarea.id + '</td><td>' + tarea.descripciontareas + '</td><td>' + tarea.agentetareas + '</td></tr>';
                tablaEnProcesoAtrasada.append(fila);
            });

            // Filtrar el JSON para obtener solo las tareas en proceso (estado = 2)
            var tareasEnProceso = data.filter(function (tarea) {
                return tarea.estado === 2;  // Ajustar la clave a 'estado'
            });

            console.log(tareasEnProceso);  // Imprimir las tareas en proceso en la consola

            // Actualizar el conteo en el HTML
            $('#enproceso').text('(' + tareasEnProceso.length + ')');

            // Actualizar la tabla en el HTML
            var tablaEnProceso = $('#tablaenproceso');
            tablaEnProceso.empty();  // Limpiar la tabla antes de agregar filas

            // Encabezados de la tabla
            tablaEnProceso.append('<tr><th># Ticket</th><th>Descripción</th><th>Agente</th></tr>');

            // Agregar filas a la tabla con la información de las tareas en proceso
            tareasEnProceso.forEach(function (tarea) {
                var fila = '<tr><td>' + tarea.id + '</td><td>' + tarea.descripciontareas + '</td><td>' + tarea.agentetareas + '</td></tr>';
                tablaEnProceso.append(fila);
            });

            // Filtrar el JSON para obtener solo las tareas en espera de finalización vencidas (estado = 4)
            var tareasEsperandoFinalizacionVencidas = data.filter(function (tarea) {
                if (tarea.estado === 4) {
                    var fechaFinal = new Date(tarea.fechafinal);

                    // Verificar si la tarea está en espera de finalización y la fecha final es menor o igual a la fecha actual
                    return fechaFinal <= fechaActual;
                }
                return false;
            });

            console.log(tareasEsperandoFinalizacionVencidas);  // Imprimir las tareas en espera de finalización vencidas en la consola

            // Actualizar el conteo en el HTML
            $('#esperandofinalizacionvencidas').text('(' + tareasEsperandoFinalizacionVencidas.length + ')');

            // Actualizar la tabla en el HTML
            var tablaEsperandoFinalizacionVencidas = $('#tablaesperandofinalizacionvencidas');
            tablaEsperandoFinalizacionVencidas.empty();  // Limpiar la tabla antes de agregar filas

            // Encabezados de la tabla
            tablaEsperandoFinalizacionVencidas.append('<tr><th># Ticket</th><th>Descripción</th><th>Agente</th></tr>');

            // Agregar filas a la tabla con la información de las tareas en espera de finalización vencidas
            tareasEsperandoFinalizacionVencidas.forEach(function (tarea) {
                var fila = '<tr><td>' + tarea.id + '</td><td>' + tarea.descripciontareas + '</td><td>' + tarea.agentetareas + '</td></tr>';
                tablaEsperandoFinalizacionVencidas.append(fila);
            });

            // Filtrar el JSON original para obtener solo las tareas en espera de finalización que no están vencidas
            var tareasEsperandoFinalizacion = data.filter(function (tarea) {
                if (tarea.estado === 4) {
                    var fechaFinal = new Date(tarea.fechafinal);

                    // Verificar si la tarea está en espera de finalización y la fecha final es mayor a la fecha actual
                    return fechaFinal > fechaActual;
                }
                return false;
            });

            // Actualizar el conteo en el HTML para las tareas en espera de finalización
            $('#esperandofinalizacion').text('(' + tareasEsperandoFinalizacion.length + ')');

            // Actualizar la tabla en el HTML para las tareas en espera de finalización
            var tablaEsperandoFinalizacion = $('#tablaesperandofinalizacion');
            tablaEsperandoFinalizacion.empty();  // Limpiar la tabla antes de agregar filas

            // Encabezados de la tabla
            tablaEsperandoFinalizacion.append('<tr><th># Ticket</th><th>Descripción</th><th>Agente</th></tr>');

            // Agregar filas a la tabla con la información de las tareas en espera de finalización
            tareasEsperandoFinalizacion.forEach(function (tarea) {
                var fila = '<tr><td>' + tarea.id + '</td><td>' + tarea.descripciontareas + '</td><td>' + tarea.agentetareas + '</td></tr>';
                tablaEsperandoFinalizacion.append(fila);
            });

            // Filtrar el JSON original para obtener solo las tareas en proceso que no están atrasadas
            var tareasEnProceso = data.filter(function (tarea) {
                return tarea.estado === 2 && !tareasEnProcesoAtrasadas.some(atrasada => atrasada.id === tarea.id);
            });

            // Actualizar el conteo en el HTML para las tareas en proceso
            $('#enproceso').text('(' + tareasEnProceso.length + ')');

            // Actualizar la tabla en el HTML para las tareas en proceso
            var tablaEnProceso = $('#tablaenproceso');
            tablaEnProceso.empty();  // Limpiar la tabla antes de agregar filas

            // Encabezados de la tabla
            tablaEnProceso.append('<tr><th># Ticket</th><th>Descripción</th><th>Agente</th></tr>');

            // Agregar filas a la tabla con la información de las tareas en proceso
            tareasEnProceso.forEach(function (tarea) {
                var fila = '<tr><td>' + tarea.id + '</td><td>' + tarea.descripciontareas + '</td><td>' + tarea.agentetareas + '</td></tr>';
                tablaEnProceso.append(fila);
            });

            // Filtrar el JSON para obtener solo las tareas finalizadas vencidas (estado = 5)
            var tareasFinalizadasVencidas = data.filter(function (tarea) {
                if (tarea.estado === 5) {
                    var fechaFinal = new Date(tarea.fechafinal);

                    // Verificar si la tarea está finalizada y la fecha final es menor o igual a la fecha actual
                    return fechaFinal <= fechaActual;
                }
                return false;
            });

            console.log(tareasFinalizadasVencidas);  // Imprimir las tareas finalizadas vencidas en la consola

// Filtrar el JSON para obtener solo las tareas finalizadas (estado = 5) que no están vencidas
            var tareasFinalizadas = data.filter(function (tarea) {
                return tarea.estado === 5 && !(tareasFinalizadasVencidas.includes(tarea));
            });

            console.log(tareasFinalizadas);  // Imprimir las tareas finalizadas en la consola

// Actualizar el conteo en el HTML para las tareas finalizadas vencidas
            $('#finalizadasvencidas').text('(' + tareasFinalizadasVencidas.length + ')');

// Actualizar la tabla en el HTML para las tareas finalizadas vencidas
            var tablaFinalizadasVencidas = $('#tablafinalizadasvencidas');
            tablaFinalizadasVencidas.empty();  // Limpiar la tabla antes de agregar filas

// Encabezados de la tabla
            tablaFinalizadasVencidas.append('<tr><th># Ticket</th><th>Descripción</th><th>Agente</th></tr>');

// Agregar filas a la tabla con la información de las tareas finalizadas vencidas
            tareasFinalizadasVencidas.forEach(function (tarea) {
                var fila = '<tr><td>' + tarea.id + '</td><td>' + tarea.descripciontareas + '</td><td>' + tarea.agentetareas + '</td></tr>';
                tablaFinalizadasVencidas.append(fila);
            });

// Actualizar el conteo en el HTML para las tareas finalizadas
            $('#finalizadas').text('(' + tareasFinalizadas.length + ')');

// Actualizar la tabla en el HTML para las tareas finalizadas
            var tablaFinalizadas = $('#tablafinalizadas');
            tablaFinalizadas.empty();  // Limpiar la tabla antes de agregar filas

// Encabezados de la tabla
            tablaFinalizadas.append('<tr><th># Ticket</th><th>Descripción</th><th>Agente</th></tr>');

// Agregar filas a la tabla con la información de las tareas finalizadas
            tareasFinalizadas.forEach(function (tarea) {
                var fila = '<tr><td>' + tarea.id + '</td><td>' + tarea.descripciontareas + '</td><td>' + tarea.agentetareas + '</td></tr>';
                tablaFinalizadas.append(fila);
            });


            // Filtrar el JSON para obtener solo las tareas en proceso atrasadas
            var tareasEnProcesoAtrasadas = data.filter(function (tarea) {
                var fechaFinal = new Date(tarea.fechafinal);

                // Verificar si la tarea está en proceso y la fecha final es mayor a la fecha actual
                return tarea.estado === 2 && fechaFinal > fechaActual;
            });

            console.log(tareasEnProcesoAtrasadas);  // Imprimir las tareas en proceso atrasadas en la consola

            // Actualizar el conteo en el HTML
            $('#enprocesoatrasadas').text('(' + tareasEnProcesoAtrasadas.length + ')');

            // Actualizar la tabla en el HTML
            var tablaEnProcesoAtrasada = $('#tablaenprocesoatrasada');
            tablaEnProcesoAtrasada.empty();  // Limpiar la tabla antes de agregar filas

            // Encabezados de la tabla
            tablaEnProcesoAtrasada.append('<tr><th># Ticket</th><th>Descripción</th><th>Agente</th></tr>');

            // Agregar filas a la tabla con la información de las tareas en proceso atrasadas
            tareasEnProcesoAtrasadas.forEach(function (tarea) {
                var fila = '<tr><td>' + tarea.id + '</td><td>' + tarea.descripciontareas + '</td><td>' + tarea.agentetareas + '</td></tr>';
                tablaEnProcesoAtrasada.append(fila);
            });

        },
        error: function (error) {
            // Aquí puedes manejar errores si la solicitud falla
            console.error(error);
        }
    });

    //FUNCION PARA LA CREACION DE TABLAS
    function crearTablaRowFunction(bodyTable, agent, idEstado, project, typeTable) {
        const row = bodyTable.insertRow();
        const cellId = row.insertCell();
        const cell = row.insertCell();

        if (idEstado != 1) {
            const cellAgente = row.insertCell();
            cellAgente.innerHTML = agent == undefined ? "" : agent;
            cellAgente.textAlign = "center";
        }

        if (typeTable == 1) {
            cell.innerHTML = project.tituloProyecto;
            cell.style.textAlign = "center";
        }
        if (typeTable == 2) {
            cell.innerHTML = project.actividadSecondary;
            cell.style.textAlign = "center";
        }

        cellId.innerHTML = `000-${project.idProyecto}`
    }

});



