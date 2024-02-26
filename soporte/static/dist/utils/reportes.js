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
    const rowTableTicketsSoporte = document.getElementById('rowTableTicketsSoporte');
    const rowTableTicketsActualizacion = document.getElementById('rowTableTicketsActualizacion');
    const radiosTicketsTime1 = document.getElementById("radiosTicketsTime1");
    const agentesolicitado = document.getElementById("agentesolicitado");
    const inputDateEnd = document.getElementById("inputDateEnd");
    const inputDateStar = document.getElementById("inputDateStar");
    const colFechaInicio = document.getElementById("colFechaInicio");
    const colFechaFinal = document.getElementById("colFechaFinal");
    const tableBodyFilterProjects = document.getElementById(
        "tableBodyFilterProjects"
    );
    const tableBodyFilterSoportes = document.getElementById('tableBodyFilterSoportes');
    const tableBodyActualizaciones = document.getElementById('tableBodyActualizaciones');
    var nombreUsuario = document.getElementById("nombreUsuario").value;
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
                selectStateTicket.value == 4 ||
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
                selectStateTicket.value == 4 ||
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

    // FUNCION PARA GENERAR PDF SOPORTE
    function convertirImagenABase64(rutaImagen, callback) {
        var img = new Image();
        img.crossOrigin = 'Anonymous';

        img.onload = function () {
            var canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;

            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            var dataURL = canvas.toDataURL('image/png');
            callback(dataURL);
        };

        img.src = rutaImagen;
    }
    function convertirImagenesABase64(actividades) {
        return Promise.all(actividades.map(actividad => {
            return new Promise((resolve, reject) => {
                if (actividad.imagen_actividades) {
                    var rutaImagen = 'http://192.168.1.121:8000/media/' + actividad.imagen_actividades;

                    convertirImagenABase64(rutaImagen, function (imagenBase64) {
                        resolve(imagenBase64);
                    });
                } else {
                    resolve(null);
                }
            });
        }));
    }
    function generarpdf(detalleTicket) {
        var fechaCreacionFormateada = moment(detalleTicket.ticket[0].fechaCreacion).format('DD/MM/YYYY');
        var ticket = detalleTicket.ticket[0].id;
        var empresa = detalleTicket.ticket[0].nombreEmpresa;
        var solicitante = detalleTicket.ticket[0].nombreApellido;
        var motivosoporte = detalleTicket.ticket[0].comentario;
        var fechaInicioCompleta = detalleTicket.ticket[0].fechaInicio;
        var fecha = moment(fechaInicioCompleta);
        var horaincio = fecha.format('DD/MM/YYYY HH:mm');

        if (detalleTicket.actividades && detalleTicket.actividades.length > 0) {
            console.log(detalleTicket.actividades)
            console.log(detalleTicket)
            convertirImagenesABase64(detalleTicket.actividades)
                .then(imagenesBase64 => {
                    var todasLasFilasConImagenes = imagenesBase64.every(imagen => imagen !== null);

                    if (!todasLasFilasConImagenes) {
                        // Obtener las filas sin imágenes y los nombres de los agentes correspondientes
                        var filasSinImagenes = detalleTicket.actividades
                            .filter((actividad, index) => imagenesBase64[index] === null)
                            .map(actividad => ({
                                fila: actividad.numero_fila,
                                agente: actividad.agente_actividad_nombre
                            }));

                        // Mostrar mensaje de toast indicando que falta imagen en una o más filas
                        if (filasSinImagenes.length === 1) {
                            mostrarToast(`Necesitas subir la imagen del agente ${filasSinImagenes[0].agente} para generar el PDF`);
                        } else {
                            var filasSinImagenesMensaje = filasSinImagenes.map(fila => `(${fila.agente})`).join(', ');
                            mostrarToast(`Necesitas subir las  imágenes de los agentes ${filasSinImagenesMensaje} para generar el PDF`);
                        }
                        return;
                    }

                    var contenidoPDF = [
                        // Contenido de la primera página
                        {
                            columns: [
                                {
                                    stack: [
                                        {
                                            text: 'INFORME DE SOPORTE',
                                            style: 'header',
                                            alignment: 'left'
                                        },
                                        {
                                            text: [
                                                {
                                                    text: 'TIPO DE SOPORTE:',
                                                    style: 'subheaderRojoNegrita',
                                                    alignment: 'left'
                                                },
                                                {
                                                    text: ' REMOTO',
                                                    style: 'subheaderNegrita',
                                                    alignment: 'left'
                                                },
                                            ],
                                        },
                                    ],
                                },
                                {
                                    image: 'data:image/png;base64,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',
                                    width: 150,
                                    height: 60,  // Ancho de la imagen en puntos (ajusta según tus necesidades)
                                    alignment: 'left',
                                    margin: [0, 0],
                                },
                            ],
                        },
                        '\n',
                        {
                            text: [
                                {text: 'TICKET #: ', style: 'subheaderNegritaFecha', alignment: 'left'},
                                {text: ticket, alignment: 'left'},
                            ]
                        },
                        {
                            text: [
                                {
                                    text: 'FECHA (DD/MM/AAA): ',
                                    style: 'subheaderNegritaFecha',
                                    alignment: 'left'
                                },
                                {text: fechaCreacionFormateada, alignment: 'left'},
                                {
                                    text: '                        ' +
                                        'FACTURAR: ',
                                    style: 'subheaderNegritaFecha',
                                    alignment: 'right'
                                },
                                {
                                    text: detalleTicket.ticket[0].facturar ? 'SI' : 'NO',
                                    style: 'subheaderNegritaFecha',
                                    alignment: 'right'
                                },
                            ]
                        },
                        {
                            text: [
                                {text: 'EMPRESA: ', style: 'subheaderNegritaFecha', alignment: 'left'},
                                {text: empresa, alignment: 'left'},
                                {
                                    text: '                                ' +
                                        '                   ' +
                                        'SOLICITANTE: ',
                                    style: 'subheaderNegritaFecha',
                                    alignment: 'right'
                                },
                                {
                                    text: solicitante,
                                    alignment: 'right'
                                },
                            ]
                        },
                        '\n',
                        {
                            text: [
                                {
                                    text: 'MOTIVO SOPORTE: ',
                                    style: 'subheaderNegritaFecha',
                                    alignment: 'left'
                                },
                                {text: motivosoporte, alignment: 'left'},
                            ]
                        },
                        {
                            text: [
                                {
                                    text: 'HORA INICIO: ',
                                    style: 'subheaderNegritaFecha',
                                    alignment: 'left'
                                },
                                {
                                    text: horaincio,
                                    alignment: 'left'
                                },
                            ],
                        },
                        '\n',
                        // Contenido de la segunda página con todas las imágenes y descripciones
                        {
                            text: 'TRABAJOS REALIZADOS Y REGISTRO FOTOGRÁFICO',
                            fontSize: 14,
                            color: '#000000',
                            bold: true,
                            alignment: 'center',
                            margin: [0, 7],
                        },
                    ];

                    // Filtra las imágenes no nulas antes de construir columnasDeImagenes
                    var imagenesFiltradas = imagenesBase64.filter(imagen => imagen !== null);

                    // Agrupar las imágenes en columnas con margen derecho solo entre imágenes consecutivas
                    var columnasDeImagenes = imagenesFiltradas.map((imagenBase64, index) => {
                        var margenDerecho = (index < imagenesFiltradas.length - 1) ? [0, 10, 20, 0] : [0, 10, 0, 0];
                        return {
                            image: imagenBase64,
                            width: 150,
                            alignment: 'center',
                            margin: margenDerecho,
                        };
                    });


                    // Agrupar las descripciones con "y" entre ellas
                    var descripciones = detalleTicket.actividades.map(actividad => actividad.descripcion).join(' , ');

                    // Agregar las descripciones al contenidoPDF
                    contenidoPDF.push({
                        text: descripciones,
                        fontSize: 12,
                        color: '#000000',
                        alignment: 'left',
                        margin: [0, 10],
                    });

                    // Agrupar los nombres de agentes con "," entre ellos
                    var nombresAgentes = detalleTicket.actividades.map(actividad => actividad.agente_actividad_nombre).join(', ');


                    // Agregar las columnas al contenidoPDF
                    contenidoPDF.push({
                        columns: columnasDeImagenes,
                    });

                    var contenidoPDFSegundaHoja = [
                        '\n',
                        {
                            text: [
                                {
                                    text: 'ASISTIDO POR:',
                                    fontSize: 11,
                                    color: '#000000',
                                    bold: true,
                                    alignment: 'left',
                                    margin: [0, 7]
                                },
                                '', // Agrega un espacio entre 'ASISTIDO POR:' y el nombre del agente
                                {
                                    text: '                ' +
                                        '                  ' +
                                        '                  ' +
                                        '                  ' +
                                        '    ' +
                                        '                  En caso de soporte presencial:'
                                }
                            ],
                        },
                        '\n',
                        {
                            text: [
                                {
                                    text: nombresAgentes,
                                    fontSize: 11,
                                    color: '#000000',
                                    alignment: 'left',
                                    margin: [0, 7],
                                },
                            ]
                        },
                        '\n',
                        '\n',
                        {
                            table: {
                                widths: [170, 160, 170],
                                body: [
                                    [
                                        {
                                            canvas: [
                                                {
                                                    type: 'line',
                                                    x1: 0,
                                                    y1: 0,
                                                    x2: 170,
                                                    y2: 0,
                                                    lineWidth: 2,
                                                    lineColor: '#E20613',
                                                },
                                            ],
                                            margin: [0, 0, 0, 0],
                                            border: [0, 0, 0, 0], // Establece el borde de la celda como transparente
                                        },
                                        {
                                            opacity: 0, // Hace invisible la celda
                                            text: '', // Texto vacío o puedes omitir esta propiedad
                                            margin: [0, 0, 0, 0],
                                            border: [0, 0, 0, 0],
                                        },
                                        {
                                            canvas: [
                                                {
                                                    type: 'line',
                                                    x1: 0,
                                                    y1: 0,
                                                    x2: 170,
                                                    y2: 0,
                                                    lineWidth: 2,
                                                    lineColor: '#E20613',
                                                },
                                            ],
                                            margin: [0, 0, 0, 0],
                                            border: [0, 0, 0, 0], // Establece el borde de la celda como transparente
                                        },
                                    ],
                                    [
                                        {
                                            text: 'FIRMA ISHIDA',
                                            alignment: 'center',
                                            margin: [0, 5, 0, 0],
                                            border: [0, 0, 0, 0],
                                        },
                                        {
                                            opacity: 0, // Hace invisible la celda
                                            text: '', // Texto vacío o puedes omitir esta propiedad
                                            margin: [0, 0, 0, 0],
                                            border: [0, 0, 0, 0],
                                        },
                                        {
                                            text: 'FIRMA ISHIDA',
                                            alignment: 'center',
                                            margin: [0, 5, 0, 0],
                                            border: [0, 0, 0, 0],
                                        },
                                    ],
                                ],
                            },
                        },

                    ];

                    var estilosPDF = {
                        header: {
                            fontSize: 18,
                            bold: true,
                            margin: [0, 0, 0, 10]
                        },
                        subheaderRojoNegrita: {
                            fontSize: 14,
                            bold: true,
                            color: '#E20613',
                            margin: [0, 0, 0, 5],
                        },
                        subheaderNegrita: {
                            fontSize: 14,
                            bold: true,
                            margin: [0, 0, 0, 5],
                        },
                        subheaderNegritaFecha: {
                            fontSize: 11,
                            bold: true,
                            margin: [0, 0, 0, 10],
                        },
                    };

                    var docDefinition = {
                        content: [
                            // Contenido de la primera hoja
                            contenidoPDF,
                            // Agrega un salto de página entre las hojas
                            {text: '\n', pageBreak: 'after'},
                            // Contenido de la segunda hoja
                            contenidoPDFSegundaHoja,
                        ],
                        footer: function () {
                            return {
                                columns: [
                                    {
                                        text: [
                                            'DESARROLLO DE SOFTWARE I VENTA ',
                                            {text: '|', color: '#E20613'},
                                            ' MANTENIMIENTO DE EQUIPOS I ASESORIA CONTABLE ',
                                            {text: '&', color: '#E20613'},
                                            ' ADMINISTRATIVA'
                                        ],
                                        alignment: 'left',
                                        fontSize: 10,
                                        color: '#000000',
                                        margin: [20, 0],
                                        bold: true,
                                    },
                                ],
                                margin: [10, 10],
                                fontSize: 10
                            };
                        },
                        styles: estilosPDF,
                    };

                    // Genera el PDF y abre una nueva ventana con el resultado
                    pdfMake.createPdf(docDefinition).open();
                })
                .catch(error => {
                    console.error('Error al convertir las imágenes a base64:', error);
                });
        } else {
            // Mostrar mensaje de toast indicando que no hay imágenes
            mostrarToast('Necesitas subir imágenes de actividades para generar el PDF');
        }
    }
    function mostrarToast(mensaje) {
        try {
            toastr.options = {
                closeButton: true,
                progressBar: true,
                timeOut: 5000 // Tiempo de duración del toast en milisegundos (5 segundos en este caso)
            };

            toastr.info(mensaje);
        } catch (error) {
            console.error('Error al mostrar el toast:', error);
        }
    }

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

    function formatFecha(fecha) {
        if (fecha != null) {
            var fecha = new Date(fecha);
            var año = fecha.getFullYear();
            var mes = ("0" + (fecha.getMonth() + 1)).slice(-2);
            var dia = ("0" + fecha.getDate()).slice(-2);
            var fechaFormateada = `${dia} - ${mes} - ${año}`;
            return fechaFormateada;
        } else {
            return null;
        }
    }

    function generateTablaReport(arrayDb, table) {
        console.log(arrayDb)
        table.innerHTML = '';
        arrayDb.forEach(function (item) {
            var row = table.insertRow();
            var cellId = row.insertCell(0);
            cellId.innerHTML = `000-0${item.id}`;

            var cellNombreProyecto = row.insertCell(1);

            // Condicion para ver la informacion de la primera columna
            var firstColumn
            if(item.comentario != undefined){
                firstColumn = item.comentario
            }else if(item.descripcionGeneral != undefined){
                firstColumn = item.descripcionGeneral
            } else if(item.tituloProyecto != undefined){
                firstColumn = item.tituloProyecto
            }
            cellNombreProyecto.innerHTML = firstColumn == '' ? 'Vacio' : firstColumn;

            var fechaCreacion = item.fechaCreacion;
            var fechaEstimada = item.fechaFinalizacionEstimada;
            var fechaCreacionFormateada = formatFecha(fechaCreacion);
            var fechaFinalFormateada = formatFecha(fechaEstimada);
            var cellFechaCreacion = row.insertCell(2);
            cellFechaCreacion.innerHTML = fechaCreacionFormateada;

            var cellFechaFinalizacion = row.insertCell(3);
            cellFechaFinalizacion.innerHTML =
                item.fechaFinalizacionEstimada == null
                    ? "Sin asignar"
                    : fechaFinalFormateada;

            var cellEstado = row.insertCell(4);
            cellEstado.innerHTML = item.Estado;

            var cellAgenteAdministrador = row.insertCell(5);
            cellAgenteAdministrador.innerHTML = `${item.Nombre} ${item.Apellido}`;

            // STYLO DE LA FILA Y FUNCIONAMIENTO DEL CLICK
            row.style.cursor = "pointer";
            row.addEventListener("click", function () {

                if (selectTypeTicket.value == 3) {
                    const ticketId = item.id;
                    fetch(`getInfoReport/${ticketId}/`)
                        .then((response) => response.json())
                        .then((data) => {
                            let proyectoinfo,
                                infoTaskMain,
                                infoTaskSecond,
                                infoAgentWork,
                                infoEnterpiseWork;
                            proyectoinfo = data.infoGeneralProject;
                            infoTaskMain = data.tasksMain;
                            infoTaskSecond = data.tasksSecundary;
                            infoAgentWork = data.hourWorkAgent;
                            infoEnterpiseWork = data.hourWorkEnterprise;
                            hoursSuccess =
                                data.hourWorlProject.length == 0
                                    ? null
                                    : data.hourWorlProject[0].horasPrincipales;

                            var fechaCreacionFormateada = formatFecha(
                                proyectoinfo.fechaCreacion
                            );
                            var fechaEstimadaFormateada = formatFecha(
                                proyectoinfo.fechaFinalizacionEstimada
                            );

                            makePdf(
                                proyectoinfo.tituloProyecto,
                                proyectoinfo.descripcionActividadGeneral,
                                `${proyectoinfo.NombreAgenteAdministrador} ${proyectoinfo.ApellidoAgenteAdministrador}`,
                                fechaCreacionFormateada,
                                fechaEstimadaFormateada,
                                proyectoinfo.NombreCompletoSolicitante,
                                proyectoinfo.nombreEmpresa,
                                infoTaskMain,
                                proyectoinfo.EstadoProyecto,
                                proyectoinfo.horasCompletasProyecto,
                                infoTaskSecond,
                                infoAgentWork,
                                infoEnterpiseWork,
                                hoursSuccess
                            );
                        });
                }

                if (selectTypeTicket.value == 1) {
                    const ticketId = item.id;
                    $.ajax({
                        url: 'ticketsoportescreadosid/?id=' + ticketId,
                        method: 'GET',
                        dataType: 'json',
                        
                        success: function (detalleTicket) {
                            generarpdf(detalleTicket);
                        },
                        error: function (error) {
                            console.log('Error en la solicitud AJAX:', error);
                        }
                    });
                }

                if (selectTypeTicket.value == 2){
                    const ticketId = item.id;
                    fetch(`getInfoActualizacionReport/${ticketId}/`)
                        .then((response) => response.json())
                        .then((data) => {
                            let proyectoinfo

                            proyectoinfo = data.infoGeneralProject;
                            makePdfActualizacion(`Ticket 000-0${proyectoinfo.id}`, proyectoinfo.descripcionGeneral, proyectoinfo.nombreAgente,proyectoinfo.apellidoAgente, proyectoinfo.fechaCreacion, proyectoinfo.fechaFinalizacionEstimada, proyectoinfo.nombreApellido, proyectoinfo.nombreEmpresa)
                        });
                }
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
    }

    btnGenerateReport.addEventListener("click", function () {
        rowTableTickets.style.display = "none";
        rowTableTicketsSoporte.style.display = "none";
        rowTableTicketsActualizacion.style.display = "none";

        // FUNCIONAMIENTO DE LA CONSULTA DE LOS RESPORTES
        $.ajax({
            type: "GET",
            url: `generateReport/?tipo_ticket=${selectTypeTicket.value}&estado_ticket=${selectStateTicket.value}&recientes=${masNuevos}&antiguos=${masAntiguos}&agente=${agentesolicitado.value}&fechaInicio=${inputDateStar.value}&fechaFin=${inputDateEnd.value}`,
            dataType: "json",
            success: function (data) {
                // Consulta de Desarrollo
                if (selectTypeTicket.value == 3) {
                    if (data.length != 0) {
                        rowTableTickets.style.display = "";
                        generateTablaReport(data, tableBodyFilterProjects)
                    } else {
                        toastr.error("No se han encontrado datos del reporte seleccionado.");
                    }
                }
                // Consulta de soporte
                if (selectTypeTicket.value == 1) {
                    if (data.length != 0) {
                        rowTableTicketsSoporte.style.display = "";
                        generateTablaReport(data, tableBodyFilterSoportes)
                    } else {
                        toastr.error("No se han encontrado datos del reporte seleccionado.");
                    }
                }
                // consulta de Actualizacion
                if(selectTypeTicket.value == 2){
                    if(data.length != 0){
                        rowTableTicketsActualizacion.style.display = "";
                        generateTablaReport(data, tableBodyActualizaciones)
                    }else{
                        toastr.error("No se han encontrado datos del reporte seleccionado.")
                    }
                }
            },
        });
    });

    // FUNCION PARA LA CREACION DE LOS PDF
    function makePdf(
        tituloProyecto,
        textDescripcionRequerimiento,
        nameAgente,
        fechaCreacion,
        fechaEstimada,
        solicitante,
        empresa,
        arrayTaskPrincipal,
        estadoProyecto,
        horasCompletas,
        arrayTaskSecond,
        arrayWorkAgent,
        arrayWorkEnterprise,
        hoursSuccessProyect
    ) {
        const imageUrl = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABDgAAAQ4CAYAAADsEGyPAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAARHRJREFUeNrs3V9u28b6MGCeg95XB70tUBXofZwVWF5BnBXEXkHiFdheQZIV2FlBnBVEWUGc+wJVgd4WP3cF38exhw2jSNQfS8Mh+TwAoTZOTHE4nHnn5XBYFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA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AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACTAAMAj5Ci1Vvm2+gAAAAASUVORK5CYII=`;
        var fechaActualReport = new Date();
        var opcionesDeFormato = {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            timeZone: "UTC",
        };
        var fechaFormateadaActualReport = fechaActualReport.toLocaleString(
            "es-ES",
            opcionesDeFormato
        );

        var objGeneratePdf = {
            content: [
                {image: imageUrl, width: 100, height: 100, alignment: "center"},
                {
                    text: `Proyecto: ${tituloProyecto}` || "Título predeterminado",
                    fontSize: 18,
                    bold: true,
                    alignment: "center",
                    margin: [0, 0, 0, 10],
                },
                {
                    text:
                        textDescripcionRequerimiento || "No hay descripción del proyecto.",
                    fontSize: 12,
                    margin: [0, 5, 0, 5],
                },
                {
                    text: "Detalles del proyecto",
                    fontSize: 12,
                    bold: true,
                    margin: [0, 15, 0, 0],
                },
                {
                    ul: [
                        `Solicitante: ${solicitante} - ${empresa}`,
                        `Agente Administrador del proyecto: ${
                            nameAgente == null ? "Sin asignar" : nameAgente
                        }`,
                        `Fecha de creación: ${fechaCreacion}`,
                        `Fecha estimada de culminación: ${
                            fechaEstimada == null ? "Sin asignar" : fechaEstimada
                        }`,
                        `Estado del proyecto: ${estadoProyecto}`,
                        `Horas completas del Proyecto: ${horasCompletas} horas`,
                    ],
                    margin: [0, 5, 0, 0], // Ajusta el margen superior según tus necesidades,
                    fontSize: 11,
                },
                {
                    text: "Tareas principales del proyecto",
                    fontSize: 12,
                    bold: true,
                    margin: [0, 20, 0, 5],
                },
                {
                    table: {
                        headerRows: 1,
                        widths: ["*", "*", "*", "*"],
                        body: [
                            ["Tarea principal", "Horas Asignadas", "Agente", "Estado"],
                            ...arrayTaskPrincipal.map((task) => [
                                task.actividadPrincipal,
                                `${task.horasPrincipales} horas`,
                                `${task.NombreAgenteActividad} ${task.ApellidoActividad}`,
                                task.EstadoActividad,
                            ]),
                        ],
                    },
                    layout: "lightHorizontalLines",
                    fontSize: 11,
                    margin: [0, 5, 0, 0],
                },
                {
                    text: "Tareas adicionales del proyecto",
                    fontSize: 12,
                    bold: true,
                    margin: [0, 20, 0, 5],
                },
                {
                    table: {
                        headerRows: 1,
                        widths: ["*", "*", "*", "*", "*"],
                        body: [
                            [
                                "Tarea",
                                "Horas diarias de trabajo",
                                "Fecha de trabajo",
                                "Responsable",
                                "Estado",
                            ],
                            ...arrayTaskSecond.map((task) => [
                                task.actividadSecundaria,
                                `${task.horasDiarias} horas`,
                                formatFecha(task.fechaDesarrollo),
                                `${task.NombreAgente} ${task.ApellidoAgente}`,
                                task.EstadoActividad,
                            ]),
                        ],
                    },
                    layout: "lightHorizontalLines",
                    fontSize: 11,
                    margin: [0, 5, 0, 5],
                },
                {
                    text: "Información de horas trabajadas",
                    fontSize: 12,
                    bold: true,
                    margin: [0, 20, 0, 5],
                },
                {
                    text: "Actividades de trabajo laboradas por agente.",
                    fontSize: 12,
                    margin: [0, 10, 0, 0],
                },
                {
                    table: {
                        headerRows: 1,
                        widths: ["*", "*"],
                        body: [
                            ["Agente", "Horas de actividades finalizadas"],
                            ...(arrayWorkAgent.length > 0
                                ? arrayWorkAgent.map((task) => [
                                    `${task.NombreAgente} ${task.ApellidoAgente}`,
                                    `${task.horasPrincipales} horas`,
                                ])
                                : [
                                    [
                                        {
                                            text: "Aún ningun agente ha cumplido con las tareas asignadas, contactece con el agente administrador del proyecto.",
                                            colSpan: 2,
                                            alignment: "center",
                                        },
                                        {},
                                    ],
                                ]),
                        ],
                    },
                    layout: "lightHorizontalLines",
                    fontSize: 11,
                    margin: [0, 5, 0, 5],
                },
                {
                    text: "Actividades de trabajo laboradas por Empresa.",
                    fontSize: 12,
                    margin: [0, 10, 0, 0],
                },
                {
                    table: {
                        headerRows: 1,
                        widths: ["*", "*"],
                        body: [
                            ["Empresa", "Horas de actividades finalizadas"],
                            ...(arrayWorkEnterprise.length > 0
                                ? arrayWorkEnterprise.map((task) => [
                                    task.nombreEmpresa,
                                    `${task.horasPrincipales} horas`,
                                ])
                                : [
                                    [
                                        {
                                            text: "Aún ningun agente ha cumplido con las tareas asignadas, contactece con el agente administrador del proyecto.",
                                            colSpan: 2,
                                            alignment: "center",
                                        },
                                        {},
                                    ],
                                ]),
                        ],
                    },
                    layout: "lightHorizontalLines",
                    fontSize: 11,
                    margin: [0, 5, 0, 5],
                },
                {
                    text: "Información de horas laboradas en el proyecto.",
                    fontSize: 12,
                    margin: [0, 10, 0, 0],
                },
                {
                    ul: [
                        {
                            text: [
                                {
                                    text: hoursSuccessProyect
                                        ? `Ha sido un total de `
                                        : "Aun no se han completado actividades dentro de este proyecto.",
                                    fontSize: 11,
                                    italics: true,
                                },
                                {
                                    text: hoursSuccessProyect
                                        ? `${hoursSuccessProyect} horas`
                                        : "",
                                    fontSize: 11,
                                    bold: true,
                                },
                                {
                                    text: hoursSuccessProyect
                                        ? " de actividades realizadas en el proyecto."
                                        : "", // Evita mostrar " horas" si no hay valor
                                    fontSize: 11,
                                    italics: true,
                                },
                            ],
                        },
                    ],
                },
            ],
            footer: function (currentPage, pageCount) {
                return [
                    {
                        text: `Proyecto generado por ${nombreUsuario} el día ${fechaFormateadaActualReport}`,
                        fontSize: 9,
                        italics: true,
                        margin: [35, 5, 0, 0],
                        paddin: [10, 0, 0, 0],
                    },
                    {
                        text: `Página ${currentPage} de ${pageCount}`,
                        alignment: "right",
                        margin: [0, 0, 40, 0],
                    },
                ];
            },
        };

        pdfMake.createPdf(objGeneratePdf).open();
    }

    function makePdfActualizacion(encabezado, descripcion, nombreAgente, apellidoAgente, fechaCreacion, fechaEstimada, solicitante, empresa){
        const imageUrl = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABDgAAAQ4CAYAAADsEGyPAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAARHRJREFUeNrs3V9u28b6MGCeg95XB70tUBXofZwVWF5BnBXEXkHiFdheQZIV2FlBnBVEWUGc+wJVgd4WP3cF38exhw2jSNQfS8Mh+TwAoTZOTHE4nHnn5XBYFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA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AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACTAAMAj5Ci1Vvm2+gAAAAASUVORK5CYII=`;
        var fechaActualReport = new Date();
        var agente = `${nombreAgente} ${apellidoAgente}`
        var opcionesDeFormato = {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            timeZone: "UTC",
        };
        var fechaFormateadaActualReport = fechaActualReport.toLocaleString(
            "es-ES",
            opcionesDeFormato
        );

        var objGeneratePdf = {
            content: [
                {image: imageUrl, width: 100, height: 100, alignment: "center"},
                {
                    text: encabezado || "Ticket sin numeracion, revisar el codigo",
                    fontSize: 18,
                    bold: true,
                    alignment: "center",
                    margin: [0, 0, 0, 10],
                },
                {
                    text: descripcion || "No hay descripción del proyecto.",
                    fontSize: 12,
                    margin: [0, 5, 0, 5],
                },
                {
                    text: "Detalles del Ticket",
                    fontSize: 12,
                    bold: true,
                    margin: [0, 15, 0, 0],
                },
                {
                    ul: [
                        `Solicitante: ${solicitante} - ${empresa}`,
                        `Agente Administrador del proyecto: ${
                            agente == null ? "Sin asignar" : agente
                        }`,
                        `Fecha de creación: ${fechaCreacion}`,
                        `Fecha estimada de culminación: ${
                            fechaEstimada == null ? "Sin asignar" : fechaEstimada
                        }`,
                    ],
                    margin: [0, 5, 0, 0], // Ajusta el margen superior según tus necesidades,
                    fontSize: 11,
                },
            ]
        }
        pdfMake.createPdf(objGeneratePdf).open();
    }
});
