$("#myTabs a").on("click", function (e) {
  e.preventDefault();
  $(this).tab("show");
});

let resultadosProyectos,
  numTicketSoporte,
  nombreArchivoAgente,
  arrayTasks = [],
  valAgenteAsignadoDefault,
  facturacionText,
  infoGeneraTicket = [],
  infoTareas = [],
  arrayFinishTasks = [],
  numeroSolicitante,
  nombreCompletoSolicitante,
  nombreEmpresaSolicitante,
  idEstadoGeneralTicket,
  estadoGeneraTicket,
  detalleTicket,
  phoneSelected,
  textAgente,
  asunto,
  archivoAdicional,
  orderList,
  orderByDescending = false,
  ticketsCompletos = false;
var resultadosAgentesData = window.resultados_agentes_data;
var resultadosSolicitantesData = window.resultados_solicitantes_data;
var nombreUsuario = document.getElementById("nombreUsuario").value;
var idUsuario = document.getElementById("idUsuario").value;
var razonSocial = document.getElementById("razonSocial").value;
var selectSolicitante = document.getElementById("selectSolicitante");
var solicitante = document.getElementById("solicitante");
const solicitanteAgent = document.getElementById("solicitanteAgent");
const textAreaCausaError = document.getElementById("textAreaCausaError");
const btnStateAwait = document.getElementById("btnStateAwait");
const btnNotificarSolicitante = document.getElementById(
  "btnNotificarSolicitante"
);
const colRequerimientoAgente = document.getElementById(
  "colRequerimientoAgente"
);
const colSolicitanteAgente = document.getElementById("colSolicitanteAgente");
const colPrioridad = document.getElementById("colPrioridad");
const rowProblemaAgente = document.getElementById("rowProblemaAgente");
const textAreaComentarioAdicional = document.getElementById(
  "textAreaComentarioAdicional"
);
const asuntoTicketAgenteEdit = document.getElementById(
  "asuntoTicketAgenteEdit"
);
const asuntoTicket = document.getElementById("asuntoTicket");
const asuntoTicketAgente = document.getElementById("asuntoTicketAgente");

const buscarSolicitante = document.getElementById("buscarSolicitante");
const btnRegresarEstado = document.getElementById("btnRegresarEstado");
let tBodyTicketSoporte = document.getElementById("tbodyTicketTable");
let tbodyTicketComplete = document.getElementById("tbodyTicketComplete");
const modalInfoTicketLabel = document.getElementById("modalInfoTicketLabel");
const inputEditSoporte = document.getElementById("inputEditSoporte");
const textAreaComentarioEdit = document.getElementById(
  "textAreaComentarioEdit"
);
const modalInfoMotivoAnulacion = document.getElementById("modalInfoMotivoAnulacion");
const imageError2 = document.getElementById("imageError2");
const prioridadSelectAgent = document.getElementById("prioridadSelectAgent");
const prioridadSelect = document.getElementById("prioridadSelect");
const btnCreateTicketAgent = document.getElementById("btnCreateTicketAgent");


const fechaCreacionEdit = document.getElementById("fechaCreacionEdit");
const fechaFinalizacionEdit = document.getElementById("fechaFinalizacionEdit");
const fechaFinalizacionRealEdit = document.getElementById(
  "fechaFinalizacionRealEdit"
);
const numRemotoLabel = document.getElementById("numRemotoLabel");
const btnFileExtra = document.getElementById("btnFileExtra");
const selectEditAgenteSolicitado = document.getElementById(
  "selectEditAgenteSolicitado"
);
const imageError = document.getElementById("imageError");
const tbodyListTask = document.getElementById("tbodyListTask");
const datosElemento = document.getElementById("datos");
const mostrarCampo = datosElemento.getAttribute("data-mostrar-campo");
const formularioCliente = document.getElementById("formularioCliente");
const formCrearTicketCliente = document.getElementById(
  "formCrearTicketCliente"
);
const formularioAgente = document.getElementById("formularioAgente");
const btnCreateTicket = document.getElementById("btnCreateTicket");

const btnNotificar = document.getElementById("btnNotificar");
const exampleFormControlTextarea1 = document.getElementById(
  "exampleFormControlTextarea1"
);
const rowPoblema = document.getElementById("rowPoblema");
const colImageAgente = document.getElementById("colImageAgente");

const textAreaProblemaAgent = document.getElementById("textAreaProblemaAgent");
const colImage = document.getElementById("colImage");

const rowTableTaskEdit = document.getElementById("rowTableTaskEdit");

const btnGenerarReporte = document.getElementById("btnGenerarReporte");
const selectFacturacion = document.getElementById("selectFacturacion");
const verticketsCompletos = document.getElementById("verticketsCompletos-tab");
const vertickets = document.getElementById("vertickets-tab");
const btnStateAwaitComplete = document.getElementById("btnStateAwaitComplete");
const buscarSolicitanteCompleto = document.getElementById("buscarSolicitanteCompleto");
const rowArchivoAdicional = document.getElementById("rowArchivoAdicional");
const inputFileExtra = document.getElementById("inputFileExtra");
const numberEnterprise = document.getElementById("numberEnterprise");

// Funcionalidad en caso de que sea cliente o agente
if (mostrarCampo == "True") {
  formularioCliente.style.display = "none";
  formularioAgente.style.display = "";
} else {
  formularioCliente.style.display = "";
  formularioAgente.style.display = "none";
}

verticketsCompletos.addEventListener("click", function () {
  ticketsCompletos = true;
  toastr.info("Cargando tickets", "Espere ...")
  // Consulta a la base para la obtencion de todos los tickets disponibles
  fetch("ticketsoportescreados/")
    .then((response) => response.json())
    .then((data) => {
      if (data.length != 0) {
        const mapaAgrupado = new Map();
        data.forEach((proyecto) => {
          const numTicket = proyecto.NumTicket;
          if (!mapaAgrupado.has(numTicket)) {
            mapaAgrupado.set(numTicket, proyecto);
          }
        });
        const resultadosAgrupados = Array.from(mapaAgrupado.values());
        resultadosProyectos = resultadosAgrupados;

        tabular(resultadosProyectos);
      } else {
        var row = document.createElement("tr");
        var cell = document.createElement("td");
        cell.textContent =
          "No hay tickets de actualizacion creados en ningun estado para este usuario.";
        cell.colSpan = 7;
        cell.style.textAlign = "center";
        row.appendChild(cell);
        tBodyTicketSoporte.appendChild(row);
      }
    })
    .catch((error) => console.error("Error:", error));
});

vertickets.addEventListener("click", function () {
  ticketsCompletos = false;
  toastr.info("Cargando tickets", "Espere ...")
  // Consulta a la base para la obtencion de todos los tickets disponibles
  fetch("ticketsoportescreados/")
    .then((response) => response.json())
    .then((data) => {
      if (data.length != 0) {
        const mapaAgrupado = new Map();
        data.forEach((proyecto) => {
          const numTicket = proyecto.NumTicket;
          if (!mapaAgrupado.has(numTicket)) {
            mapaAgrupado.set(numTicket, proyecto);
          }
        });
        const resultadosAgrupados = Array.from(mapaAgrupado.values());
        resultadosProyectos = resultadosAgrupados;

        tabular(resultadosProyectos);
      } else {
        tBodyTicketSoporte.innerHTML = ""
        var row = document.createElement("tr");
        var cell = document.createElement("td");
        cell.textContent =
          "No hay tickets de actualizacion creados en ningun estado para este usuario.";
        cell.colSpan = 7;
        cell.style.textAlign = "center";
        row.appendChild(cell);
        tBodyTicketSoporte.appendChild(row);
      }
    })
    .catch((error) => console.error("Error:", error));
});

function orderByEstadoDesc(a, b) {
  if (orderByDescending) {
    return a.idEstado - b.idEstado;
  } else {
    return b.idEstado - a.idEstado;
  }
}
function toggleOrder() {
  orderByDescending = !orderByDescending;
}

// Funcion para tabular
function tabular(resultadosProyectos, orderByFunc) {
  toastr.success("Tickets listos", "Todo listo")
  resultadosProyectos.sort(orderByFunc);
  tBodyTicketSoporte.innerHTML = "";
  resultadosProyectos.forEach((proyecto) => {
    var row = document.createElement("tr");

    var cellNumTicket = document.createElement("td");
    cellNumTicket.textContent = `000-${proyecto.NumTicket}`;

    var cellEmpresa = document.createElement("td");
    cellEmpresa.textContent = proyecto.nombreEmpresa;

    var cellMotivo = document.createElement("td");
    cellMotivo.textContent = proyecto.asunto == "" ? "S/E" : proyecto.asunto;

    var cellSolicitante = document.createElement("td");
    cellSolicitante.textContent = proyecto.fullNameSolicitante;

    var cellAgente = document.createElement("td");
    cellAgente.textContent = proyecto.prioridad;

    var cellFechaSolicitud = document.createElement("td");
    const fechaCreacionTicket = proyecto.fechaCreacionTicket;
    const fecha = new Date(fechaCreacionTicket);
    const formattedFecha = `${fecha.getDate()}/${
      fecha.getMonth() + 1
    }/${fecha.getFullYear()} ${fecha.getHours()}:${fecha.getMinutes()}:${fecha.getSeconds()}`;
    cellFechaSolicitud.textContent = formattedFecha;

    let svg;
    if (proyecto.idEstado === 2) {
      svg = createSVG(
        "M304 48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zm0 416a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM48 304a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm464-48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM142.9 437A48 48 0 1 0 75 369.1 48 48 0 1 0 142.9 437zm0-294.2A48 48 0 1 0 75 75a48 48 0 1 0 67.9 67.9zM369.1 437A48 48 0 1 0 437 369.1 48 48 0 1 0 369.1 437z"
      );
      if(ticketsCompletos == true){
        row.style.display = 'none'
      }else{
        row.style.display = ''
      }
    } else if (proyecto.idEstado === 1) {
      svg = createSVG(
        "M64 64c0-17.7-14.3-32-32-32S0 46.3 0 64V320c0 17.7 14.3 32 32 32s32-14.3 32-32V64zM32 480a40 40 0 1 0 0-80 40 40 0 1 0 0 80z"
      );
      row.className = "table-secondary";
      if(ticketsCompletos == true){
        row.style.display = 'none'
      }else{
        row.style.display = ''
      }
    } else if (proyecto.idEstado === 4) {
      svg = createSVG(
        "M192 0c-41.8 0-77.4 26.7-90.5 64H64C28.7 64 0 92.7 0 128V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V128c0-35.3-28.7-64-64-64H282.5C269.4 26.7 233.8 0 192 0zm0 64a32 32 0 1 1 0 64 32 32 0 1 1 0-64zM305 273L177 401c-9.4 9.4-24.6 9.4-33.9 0L79 337c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L271 239c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"
      );
      row.className = "table-info";
      if(ticketsCompletos == true){
        row.style.display = 'none'
      }else{
        row.style.display = ''
      }
    } else if (proyecto.idEstado === 5) {
      svg = createSVG(
        "M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"
      );
      row.className = "table-success";
      if (ticketsCompletos == false) {
        row.style.display = "none";
        tBodyTicketSoporte = document.getElementById("tbodyTicketTable");
      } else {
        row.style.display = "";
        tBodyTicketSoporte = tbodyTicketComplete;
      }
    } else if (proyecto.idEstado === 3) {
      svg = createSVG(
        "M32 0C14.3 0 0 14.3 0 32S14.3 64 32 64V75c0 42.4 16.9 83.1 46.9 113.1L146.7 256 78.9 323.9C48.9 353.9 32 394.6 32 437v11c-17.7 0-32 14.3-32 32s14.3 32 32 32H64 320h32c17.7 0 32-14.3 32-32s-14.3-32-32-32V437c0-42.4-16.9-83.1-46.9-113.1L237.3 256l67.9-67.9c30-30 46.9-70.7 46.9-113.1V64c17.7 0 32-14.3 32-32s-14.3-32-32-32H320 64 32zM288 437v11H96V437c0-25.5 10.1-49.9 28.1-67.9L192 301.3l67.9 67.9c18 18 28.1 42.4 28.1 67.9z"
      );
      row.className = "table-warning";
      if(ticketsCompletos == true){
        row.style.display = 'none'
      }else{
        row.style.display = ''
      }
    } else if (proyecto.idEstado === 6) {
      svg = createSVG(
        "M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"
      );
      row.className = "table-danger";
      if (ticketsCompletos == false) {
        row.style.display = "none";
        tBodyTicketSoporte = document.getElementById("tbodyTicketTable");;
      } else {
        row.style.display = "";
        tBodyTicketSoporte = tbodyTicketComplete;
      }
    }

    var cellEstado = document.createElement("td");
    cellEstado.appendChild(svg);

    var cellAcciones = document.createElement("td");
    var btnVer = document.createElement("button");
    btnVer.className = "btn btn-info btn-sm";
    btnVer.title = "Ver informacion rapida"
    btnVer.type = "button";
    btnVer.dataset.toggle = "modal";
    btnVer.dataset.target = "#modalInfoTicket";
    btnVer.style.marginRight = "5px";
    btnVer.style.marginBottom = "2px";
    btnVer.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" style="width: 1em; height: 1em; fill: white;">
        <path d="M288 80c-65.2 0-118.8 29.6-159.9 67.7C89.6 183.5 63 226 49.4 256c13.6 30 40.2 72.5 78.6 108.3C169.2 402.4 222.8 432 288 432s118.8-29.6 159.9-67.7C486.4 328.5 513 286 526.6 256c-13.6-30-40.2-72.5-78.6-108.3C406.8 109.6 353.2 80 288 80zM95.4 112.6C142.5 68.8 207.2 32 288 32s145.5 36.8 192.6 80.6c46.8 43.5 78.1 95.4 93 131.1c3.3 7.9 3.3 16.7 0 24.6c-14.9 35.7-46.2 87.7-93 131.1C433.5 443.2 368.8 480 288 480s-145.5-36.8-192.6-80.6C48.6 356 17.3 304 2.5 268.3c-3.3-7.9-3.3-16.7 0-24.6C17.3 208 48.6 156 95.4 112.6zM288 336c44.2 0 80-35.8 80-80s-35.8-80-80-80c-.7 0-1.3 0-2 0c1.3 5.1 2 10.5 2 16c0 35.3-28.7 64-64 64c-5.5 0-10.9-.7-16-2c0 .7 0 1.3 0 2c0 44.2 35.8 80 80 80zm0-208a128 128 0 1 1 0 256 128 128 0 1 1 0-256z"></path>
    </svg>
    `;

    var btnNewPage = document.createElement("button");
    btnNewPage.className = "btn btn-info btn-sm";
    btnNewPage.title = "Abrir en otra pagina";
    btnNewPage.type = "button"
    btnNewPage.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" style="width: 1em; height: 1em; fill: white;">
      <path d="M352 224H305.5c-45 0-81.5 36.5-81.5 81.5c0 22.3 10.3 34.3 19.2 40.5c6.8 4.7 12.8 12 12.8 20.3c0 9.8-8 17.8-17.8 17.8h-2.5c-2.4 0-4.8-.4-7.1-1.4C210.8 374.8 128 333.4 128 240c0-79.5 64.5-144 144-144h80V34.7C352 15.5 367.5 0 386.7 0c8.6 0 16.8 3.2 23.2 8.9L548.1 133.3c7.6 6.8 11.9 16.5 11.9 26.7s-4.3 19.9-11.9 26.7l-139 125.1c-5.9 5.3-13.5 8.2-21.4 8.2H384c-17.7 0-32-14.3-32-32V224zM80 96c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16H400c8.8 0 16-7.2 16-16V384c0-17.7 14.3-32 32-32s32 14.3 32 32v48c0 44.2-35.8 80-80 80H80c-44.2 0-80-35.8-80-80V112C0 67.8 35.8 32 80 32h48c17.7 0 32 14.3 32 32s-14.3 32-32 32H80z"/>
    </svg>
    `;

    // Funcionalidad del boton de nueva pagina para ver los tickets con mas facilidad y distribucion
    btnNewPage.addEventListener("click", function(){
      const baseUrl = window.location.origin;
      numTicketSoporte = proyecto.NumTicket;
      // Abre una nueva ventana
      var newWindow = window.open(`${baseUrl}/ticketsoportescreadosid_new_page/${numTicketSoporte}`, "_blank");
      if (newWindow) {
          // La nueva ventana se abrió correctamente
      } else {
          // No se pudo abrir la nueva ventana
          console.error('No se pudo abrir la nueva ventana');
      }
    });

    // Funcionalidad del boton ver
    btnVer.addEventListener("click", function () {
      archivoAdicional = ""
      btnGenerarReporte.style.display = "none";
      btnFileExtra.style.display = "none";
      numTicketSoporte = proyecto.NumTicket;

      modalInfoTicketLabel.textContent = `Ticket número 000-${numTicketSoporte}`;
      tbodyListTask.innerHTML = "";
      arrayTasks = [];
      infoGeneraTicket = [];
      infoTareas = [];
      rowTableTaskEdit.style.display = "none";
      
      numRemotoLabel.innerHTML = "";

      // Consulta para los detalles del Ticket
      fetch(`ticketsoportescreadosid/${numTicketSoporte}/`)
        .then((response) => response.json())
        .then(async (data) => {
          infoGeneraTicket = data.ticket;
          infoTareas = data.actividades;
          asunto =
            infoGeneraTicket[0].asunto == ""
              ? "No se ha especificado el asunto"
              : infoGeneraTicket[0].asunto;

          asuntoTicketAgenteEdit.innerHTML = "";
          asuntoTicketAgenteEdit.value = asunto;

          textAreaComentarioAdicional.innerHTML = "";
          textAreaComentarioAdicional.value = infoGeneraTicket[0].chat;

          textAreaComentarioEdit.innerHTML = "";
          textAreaComentarioEdit.textContent = infoGeneraTicket[0].comentario;
          idEstadoGeneralTicket = infoGeneraTicket[0].idestado_id;
          empresa;
          
          numRemotoLabel.textContent = infoGeneraTicket[0].trabajoRealizado == "" ? "No hay remotos adjuntados/AnyDesk" : "Remoto: "+infoGeneraTicket[0].trabajoRealizado

          // Condicion para poder ver el archivo adicional
          archivoAdicional = infoGeneraTicket[0].archivo;
          if(archivoAdicional == "" || archivoAdicional == null){
            btnFileExtra.style.display = "none"
            
          }else{
            btnFileExtra.style.display = ""
          }
          // Condicion para generar el reporte
          if (
            infoGeneraTicket[0].idestado_id == 5 ||
            infoGeneraTicket[0].idestado_id == 4
          ) {
            btnGenerarReporte.style.display = "";
          } else {
            btnGenerarReporte.style.display = "none";
          }
          textAreaCausaError.innerHTML = "";
          textAreaCausaError.value = infoGeneraTicket[0].causaerror;
          // Mostrar el numero de la empresa
          numberEnterprise.innerHTML = "";
          numberEnterprise.textContent = `Teléfono: ${infoGeneraTicket[0].telefonoSolicitante}`

          // Llenar el select con los datos de resultados_agentes_data
          const idAgenteSeleccionado = infoGeneraTicket[0].idAgente_id;
          $("#selectEditAgenteSolicitado")
            .val(idAgenteSeleccionado)
            .trigger("change");
          valAgenteAsignadoDefault = $("#selectEditAgenteSolicitado").val();

          // Condicion en caso de que el ticket tenga estado 6 = anulacion
          if(infoGeneraTicket[0].idestado_id == 6){
            modalInfoTicketLabel.style.display = "";
            if(infoGeneraTicket[0].motivoAnulacion != ""){
              modalInfoMotivoAnulacion.style.display = "";
              modalInfoMotivoAnulacion.textContent = ` | ${infoGeneraTicket[0].motivoAnulacion}`;
            }else{
              modalInfoMotivoAnulacion.textContent = ` | Sin motivo de anulacion especificado`;
            }
          }else{
            modalInfoTicketLabel.style.display = "";
            modalInfoMotivoAnulacion.style.display = "none";
          }

          // Datos para el envio  de Whatsapp
          numeroSolicitante = infoGeneraTicket[0].telefonoSolicitante;
          nombreCompletoSolicitante = infoGeneraTicket[0].nombreApellido;
          nombreEmpresaSolicitante = infoGeneraTicket[0].nombreEmpresa;
          detalleTicket = infoGeneraTicket[0].comentario;

          const idSolicitanteSeleccionado =
            infoGeneraTicket[0].idSolicitante_id;
          $("#selectSolicitante")
            .val(idSolicitanteSeleccionado)
            .trigger("change");

          fechaCreacionEdit.innerHTML = "";
          fechaCreacionEdit.value = infoGeneraTicket[0].fechaCreacion;
          estadoGeneraTicket = infoGeneraTicket[0].estadoTicket;
          var facturar = infoGeneraTicket[0].facturar;
          facturacionText = infoGeneraTicket[0].facturar;
          $("#selectFacturacion").val(String(facturar)).trigger("change");

          fechaFinalizacionEdit.innerHTML = "";
          fechaFinalizacionEdit.value = infoGeneraTicket[0].fechaFinalizacion;

          fechaFinalizacionRealEdit.innerHTML = "";
          fechaFinalizacionRealEdit.value =
            infoGeneraTicket[0].fechaFinalizacionReal;

          imageError.src = "";
          var urlImageGenera = infoGeneraTicket[0].imagenes;
          const [urlImage1, urlImage2] = urlImageGenera.split(",");
          imageError.src = "/media/" + urlImage1;
          if (urlImage2 == undefined) {
            imageError2.style.display = "none";
          } else {
            imageError2.style.display = "";
            imageError2.src = "/media/" + urlImage2;
          }

          imageError.addEventListener("mouseover", function () {
            this.style.cursor = "pointer";
            this.style.filter = "brightness(50%)";
          });
          imageError2.addEventListener("mouseover", function () {
            this.style.cursor = "pointer";
            this.style.filter = "brightness(50%)";
          });
          imageError.addEventListener("click", function () {
            const imageUrl = this.src;
            window.open(imageUrl, "_blank");
          });
          imageError2.addEventListener("click", function () {
            const imageUrl = this.src;
            window.open(imageUrl, "_blank");
          });
          imageError.addEventListener("mouseout", function () {
            this.style.filter = "";
          });
          imageError2.addEventListener("mouseout", function () {
            this.style.filter = "";
          });

          // Condicion en caso de que sea mafer  y su estado sea 5 para el boton de notificacion del agente para el cliente
          if (
            ((nombreUsuario == "mafer" || nombreUsuario == "joselo") &&
              (infoGeneraTicket[0].idestado_id == 5 ||
                infoGeneraTicket[0].idestado_id == 4)) ||
            infoGeneraTicket[0].idAgente_id == idUsuario
          ) {
            btnNotificarSolicitante.style.display = "";
          } else {
            btnNotificarSolicitante.style.display = "none";
          }

          // En caso de que el usuario logeado sea el solicitante
          if (razonSocial != infoGeneraTicket[0].nombreEmpresa) {
            btnNotificar.style.display = "none";
          } else {
            btnNotificar.style.display = "";
          }

          // Iteracion para la tabulacion de las tareas en  caso de que hayan tareas en los tickets
          if (infoTareas.length != 0) {
            rowTableTaskEdit.style.display = "";
            infoTareas.forEach((tarea) => {
              console.log(tarea)
              const rowTask = document.createElement("tr");
              // En caso de que la tarea se perteneciente al usuario logeado, debe dejar colocar un input
              const cellTarea = document.createElement("td");
              cellTarea.textContent = tarea.descripcion;

              const cellEstado = document.createElement("td");
              cellEstado.textContent = tarea.estado_actividad;

              const cellAgente = document.createElement("td");
              cellAgente.textContent = tarea.agente_actividad_nombre;

              // Ahora en caso de que el fecha final este vacio le permita al usuario participante agregar una fecha
              const cellFechaFinalizacion = document.createElement("td");
              const cellMinutosTrabajados = document.createElement("td");
              const cellImage = document.createElement("td");

              if (tarea.fechafinal == null) {
                cellFechaFinalizacion.textContent = 'Sin asignar';
              } else {
                cellFechaFinalizacion.textContent = tarea.fechafinal;
              }

              if(tarea.minutosTrabajados == 0){
                cellMinutosTrabajados.textContent = 'Sin asignar';
              }else{
                cellMinutosTrabajados.textContent = tarea.minutosTrabajados;
              }

              if (tarea.imagen_actividades == "") {
                cellImage.textContent = 'No hay imagen de la solución'
              } else {
                const verImage = document.createElement("button");
                verImage.textContent = "Imagen";
                verImage.type = "button";
                verImage.className = "btn btn-secondary btn-sm btn-block";
                verImage.addEventListener("click", function () {
                  const newWindow = window.open(
                    "",
                    "ImageWindow",
                    "width=400,height=400"
                  );
                  newWindow.document.write(
                    `<img src="${tarea.imagen_actividades}" style="max-width: 100%; max-height: 100%;">`
                  );
                });
                cellImage.appendChild(verImage);
              }

              rowTask.appendChild(cellTarea);
              rowTask.appendChild(cellEstado);
              rowTask.appendChild(cellAgente);
              rowTask.appendChild(cellFechaFinalizacion);
              rowTask.appendChild(cellMinutosTrabajados);
              rowTask.appendChild(cellImage);

              tbodyListTask.appendChild(rowTask);
            });
          } else {
          }
        });
    });

    cellAcciones.appendChild(btnVer);
    cellAcciones.appendChild(btnNewPage);

    row.appendChild(cellNumTicket);
    row.appendChild(cellEmpresa);
    row.appendChild(cellMotivo);
    row.appendChild(cellSolicitante);
    row.appendChild(cellAgente);
    row.appendChild(cellFechaSolicitud);
    row.appendChild(cellEstado);
    row.appendChild(cellAcciones);

    tBodyTicketSoporte.appendChild(row);
  });
}

//Funcionalidad del select, si oara que muestre los pertenecientes a la empresa
for (var i = 0; i < selectSolicitante.options.length; i++) {
  var option = selectSolicitante.options[i];
  var empresa = option.getAttribute("data-empresa");
  if (empresa !== nombreUsuario) {
    option.style.display = "none";
  }
}

// Funcion para transformar a Base64
function loadImage(inputImagen) {
  return new Promise((resolve, reject) => {
    var file = inputImagen.files[0];
    var reader = new FileReader();
    reader.onload = function (event) {
      resolve(event.target.result);
    };
    reader.onerror = function (error) {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
}

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

function obtenerFechaHoraActual() {
  const ahora = new Date();
  const anio = ahora.getFullYear();
  const mes = String(ahora.getMonth() + 1).padStart(2, "0"); // Se suma 1 porque en JavaScript los meses van de 0 a 11
  const dia = String(ahora.getDate()).padStart(2, "0");
  const horas = String(ahora.getHours()).padStart(2, "0");
  const minutos = String(ahora.getMinutes()).padStart(2, "0");
  const segundos = String(ahora.getSeconds()).padStart(2, "0");
  return `${anio}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;
}

function mostrarNombreArchivo(client, agent) {
  if ((client = 1)) {
    const input = document.getElementById("inputGroupFile03");
    const label = document.querySelector(".custom-file-label");

    if (input.files && input.files.length > 0) {
      const nombreArchivo = input.files[0].name;
      label.innerHTML = nombreArchivo;
      input.setAttribute("value", nombreArchivo);
      colSolicitante.style.display = "";
      colPrioridad.style.display = "";
    } else {
      label.innerHTML = "Sube una imagen del problema que presentas";
      input.setAttribute("value", "");
      colSolicitante.style.display = "none";
      colPrioridad.style.display = "none";
    }
  }
  if ((agent = 1)) {
    const input = document.getElementById("inputFileAgent");
    const label = document.querySelector(".custom-file-label");

    if (input.files && input.files.length > 0) {
      const nombreArchivo = input.files[0].name;
      nombreArchivoAgente = nombreArchivo;
      label.innerHTML = nombreArchivo;
      input.setAttribute("value", nombreArchivo);
      colSolicitanteAgente.style.display = "";
      colRequerimientoAgente.style.display = "";
      rowArchivoAdicional.style.display = "";
    } else {
      label.innerHTML = "Sube una imagen del problema que presentas";
      input.setAttribute("value", "");
      colSolicitanteAgente.style.display = "none";
      colRequerimientoAgente.style.display = "none";
      rowArchivoAdicional.style.display = "none";
    }
  }
}

// Boton para la ver el archivoGuardado
btnFileExtra.addEventListener("click", function(){
  window.open(`/media/${archivoAdicional}`, '_blank');
});

// Funcionalidad para el envio del mensaje
function enviarMensajeWhatsApp(creacionVer) {
  if (creacionVer == true) {
    var selectedIndex = selectSolicitante.selectedIndex;
    var selectedText = selectSolicitante.options[selectedIndex].text;
    const phoneNumber = "+593994606970";
    const message = `Hola, le saluda ${selectedText} para el siguiente requerimiento: 
    Número de ticket: *${numTicketSoporte}*
    Problema:
    *${textAreaComentarioEdit.value}*
    espero su pronta respuesta.
            
    SiiTickets (http://186.3.160.137:120/).`;

    // Crear la URL para enviar el mensaje a WhatsApp
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;

    // Abrir la ventana del navegador para enviar el mensaje
    window.open(url);
  } else {
    var selectedIndex = solicitante.selectedIndex;
    var selectedText = solicitante.options[selectedIndex].text;
    const phoneNumber = "+593994606970";
    const message = `Hola, le saluda ${selectedText} para el siguiente requerimiento:
        Problema:
        *${exampleFormControlTextarea1.value}*
            espero su pronta respuesta.`;

    // Crear la URL para enviar el mensaje a WhatsApp
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;

    // Abrir la ventana del navegador para enviar el mensaje
    window.open(url);
  }
}

// Funcionalidad del boton para llamar a la notificacion
btnNotificar.addEventListener("click", function () {
  creacionVer = true;
  enviarMensajeWhatsApp(creacionVer);
});

// CREAR EL TICKET PARA LOS CLIENTES
document
  .querySelector(".form-group")
  .addEventListener("submit", function (event) {
    creacionVer = false;
    event.preventDefault();
    btnCreateTicket.disabled = true;
    var formData = new FormData(this);
    fetch("crear_ticket_soporte/", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "success") {
          toastr.success(data.message, "Su ticket a sido enviado");
          enviarMensajeWhatsApp(creacionVer);

          setTimeout(function () {
            window.location.reload();
          }, 1000);
        } else {
          console.error("Error al crear el Ticket:", data.message);
        }
      })
      .catch((error) => {
        toastr.error(data.message, error);
        console.error("Error al realizar la solicitud:", error);
      });
  });

// Funcionamiento del boton para generarl el PDF
btnGenerarReporte.addEventListener("click", function () {
  var comentario = textAreaComentarioEdit.value;
  var selectAgente = selectEditAgenteSolicitado.selectedOptions[0];
  var agente = selectAgente.textContent.toString();
  var agenteForamt = agente.replace(/^\s+|\s+$/g, "");
  var asunto = asuntoTicketAgenteEdit.value;

  var solicitanteSelect = selectSolicitante.selectedOptions[0];
  var solcitante = solicitanteSelect.textContent.toString();
  var solicitanteFormat = solcitante.replace(/^\s+|\s+$/g, "");

  var fechaCreacion = fechaCreacionEdit.value.toString();
  var fechaFormateada = fechaCreacion.replace("T", " ").replace(/\.\d+$/, "");

  var fechaEstimadaFinalizacion = fechaFinalizacionEdit.value.toString();
  var fechaEstimadaFormateada = fechaEstimadaFinalizacion
    .replace("T", " ")
    .replace(/\.\d+$/, "");

  var fechaFinalizacion = fechaFinalizacionRealEdit.value.toString();
  var fechaFinalizacionFormateada = fechaFinalizacion
    .replace("T", " ")
    .replace(/\.\d+$/, "");

  var causaError = textAreaCausaError.value.toString();

  makePdf(
    comentario.toString(),
    asunto.toString(),
    solicitanteFormat,
    agenteForamt,
    fechaFormateada,
    fechaEstimadaFormateada,
    fechaFinalizacionFormateada,
    infoTareas,
    causaError
  );
});


// Funcion para crear el PDF
function makePdf(
  comentario,
  asunto,
  solicitante,
  agente,
  fechaCreacion,
  fechaEstimada,
  fechaFinalizacion,
  arrayActivities,
  causaError
) {
  const imageUrl =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABDgAAAQ4CAYAAADsEGyPAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAARHRJREFUeNrs3V9u28b6MGCeg95XB70tUBXofZwVWF5BnBXEXkHiFdheQZIV2FlBnBVEWUGc+wJVgd4WP3cF38exhw2jSNQfS8Mh+TwAoTZOTHE4nHnn5XBYFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAC/6jCL76++ffDsqP1wM41Nuf/vr9bMsyOik/XgygjN6VZXS9ZRmFOnQwgDI6K8vodo/X40X5cb7vgyiPQTtIn/u1/5dgN5fldXShtNGu05F6OCk/PibY1VFZF6dKHNL6QRF8Y1RuE8XQaDyQMvr0iH97MJAyGrkcAACAXPxXEQAAAABdJ8EBAAAAdJ4EBwAAANB5EhwAAABA50lwAAAAAJ0nwQEAAAB0ngQHAAAA0HkSHAAAAEDnSXAAAAAAnSfBAQAAAHSeBAcAAADQeRIcAAAAQOdJcAAAAACdJ8EBAAAAdJ4EBwAAANB5EhwAAABA50lwAAAAAJ0nwQEAAAB03g+KAMjUrNymigFAuw4A65DgALL001+/X5cf10oCQLsOAOvwiAoAAADQeRIcAAAAQOdJcAAAAACdJ8EBAAAAdJ4EBwAAANB5EhwAAABA50lwAAAAAJ0nwQEAAAB0ngQHAAAA0HkSHAAAAEDnSXAAAAAAnSfBAQAAAHSeBAcAAADQeRIcAAAAQOdJcAAAAACdJ8EBAAAAdJ4EBwAAANB5EhwAAABA50lwAAAAAJ0nwQEAAAB0ngQHAAAA0HkSHAAAAEDnSXAAAAAAnSfBAQAAAHSeBAcAAADQeRIcAAAAQOdJcAAAAACdJ8EBAAAAdJ4EBwAAANB5PygCIEd///zbuPwY73s/P/31+1RpJzunkwV/fFeeg1ulQyZ18rasj3dKRrvO/s6588M+2xP1CwkOIFcn5XaeYD//UdQbBRQH5ceo3KrP4LD2V+p/vu7vbPrxfKDyacHPZmVAM3N2KOtSVTerwPeXWgA82bI+/lvPyu3P+DkTRGvXtf/fXF8LB5sbtPkh0X03187f/5lrbRBtdr2N/rH2ZxvHFQ0xxV2sU/U690/9z9W1fpDgAGBRgDCJQcUvcwPG1CYN/38+F9Dc1YLkL9VAtHBXvq91dBzrZtgOiy2Sa1vWwXqdu41bqG9Ts5Ho6bWVov0/WHbNzbXvn2K7PpXY7kx9GtXq0yjWqdHcOU9hNFe3Jkva9aquhfoVktpTcUS3SHAACD7GsaN/Ej8POnoo9eDleO4Y72qD0T+r/xawdLKeHsbPcQZf66B+vZTfcRaD4Q9l3bpx1ujItXUwd22NMvyaVfs+mWvXw/UWkh4SjPnUpYMYT9STGl2NJYLzWvteT2hPnfE8SXAADDMICZ33s6LbCY1HBceLApZC0iPHYPlFh+rpuHh4DOMkDr5CkuOtgRcZXlvHsQ847uAAtN6uH8etqF1zIeFxoy3fex0aF19vjhwUaz4G2GHjuIX6dh5ne9Tr20ytyIMEB8BwgpFJHCx2OaDda8ASy6ma6VHdFRS0pK2nB7V6Ou7woYRr7KR4SHaE+hQSHdfOMC1eW1VS46Snh/jvNVduV+XxhsHnh0KyY5dtc4gjqkcCx0rl3wTb69jOT2NbL25okQQHQL8DknEM9l4IRtZWTas9iWU4K76dBi1w2X09re7Eviz6OaPoIA64QhLtUqKDxH3Ay9ieDS2xXQ0+/012uPY2rjuT4iGh4cbI+rHDqyqpXUiutUKC41uhMh4N4Dgfc6FdF9+/1aCPHjOAORtIJ2DKdf6ByXnR3zt1KY2Lr3cFq4RH9ejBTPHspJ4OJXgex8FWGHCeeYabPV5bYWD6sphbj2jA7pMdZbm8Hkgcu229GcU2eVIM4/HVfblPahcPMztCvHApXkhHgqMmZtg0es1lNHvk4H8IZWTgTw4DxhOlsddB6qviYeqz9nD7wVcVRA81+P1YlsObGPi6w4drK41qthjL26ZXimGn9S3EY+FRxetCoiOJ/yoCgF4EtaN4Z+qPQnKDjAdf5fYxDO4NwO6FgcTn+Gw7PObaGru2IGshNvujvE6v4s0o9kSCA6D7gW24G/VH4a4L+dZRiY3lQqAbkhyuX7a5turJbdcW5O8ktvkXimI/JDgAuh3Yvi//M2wW/yLHOuqu8vrCs9pXioENrq+Q3P5cSG5D19yvdVJew2bw7YEEB0A3A9uDGNh6lpgc66e7yts5keRgg+srJLfHSgQ66z6WM5tjtyQ4ALoX3J4UD3fEBbbkWj89MrU9SQ6arq+D2P67vqA/wmyOj/EtNjySBAdA9waPYfCjEyS3ulk9jqJ+Pp4kB8va/3CNmdIO/TMpHt6u5fp+JAkOgG4FtwY95Fg3798GUngcZZdO4mMIUF1jkofQb9UrxCU5HkGCA6Abwe1JIblBnl6W22sDr714Fa99ht3+X8VrDOi/0JdKcjyCBAdA/sFt6OQkN8g5GGN/Xgt0B93+h7b/REnA4PpVSY4tSXAA5B3c3ndySgIGHehKcA6z/ZfcgGG3/RYe3YIEB0De3hfukMPQHXiN4LBIbgAx/nOTa0M/KIJvOpPJQCrR9Ke/fj/asoxCgHU+gDK6LMvoYssyCnVoMoAyOirLaKrl2Gub9KqwaCPwILxG8Lpsd2eKYhBt/4mSAIqHBPfrsu0/UxTrkeAAyDPADVn7riYT78rtdu7Pwv//s+Tv/1gsfu3hOG7Ag3BX/0gx9LrtPy4sKAp10wV/tmlM0fV4Iiw4/cGNxfVIcADkKfe3UoROdlZuf1bBxz473pjwOZgLVKogZlQsTpAwrAC4qo+zuFXuyrp5W9ahRQHuJH4ediQAnoTZpoLcfrKgNANS3QgJn19q7fi/bfYer7NJrf2v4oiDIv/Hga/K7/60LJs71aeZBAdAfkFuGGSdZBaIhMDjU/HwiNtt6i8QO/TpGuU2joHKLx0KWtjMbK4+ztasQ7Pi28RHMV+nYiItBL2H8TPHxNn5qmuBzrrqWHtVDVKru+lbDVBrA86i1mb/UnxNOo5Vjc66je3ul/jfd20naGv7ny6IIertf271Lnyf8PjahWrVTIIDIM8BTA6uyy1MibzpQqHVBrCLBq0HMWB5Ev9bwNy9IPldud3scw2KmEi7iVs92fgiozpjFkcPhWfsi/xnot0W3yYX73Z03dXr8nRJ+VQDzie19py8TGMduU9mtHEzZAcxxHXcqvb/OLb/uVyb1mJagwQHQF5B7qhod/ZG6DTfhg6+L9Mga7M/prVyHseAJec79UNX1cWbtoK5uN+LsJV1JlyX50UeiY6XhVkcfWr3Qxv0KtOvF5J9H+J12FqfsCihF8ttUmvHSds+h3MSkhnTriUzNmj/34QtPj4W2t2Q8Gh7llXoh05VweUkOADyctLSfkPgGt4e9GYIhVyb7VHdqe/CowlDEc7J29xmKJTf57r8uI6JjrbXyDkOSTp38Xojt3U3Qr3KPtEd24jpXBv+LJNBaN/Mii0eDexRzBASOKdlPQtvMgnJyJct1rGT8ntcav+Xk+AAyMuLlgaUp0NeuGrBowmjGCQfCpaTCQmE7IO2kOgo68dNHJQet/hVTgrPYndeWZfCORxnNIi9jMm8Lrfhp/FtNJId26tmPobZO1OD6W/qWZjRF66R1y32AWZxNJDgAMgn0A1BbuqZA6ddDGYTBTHXcTuNU6GrYHmshHbquuhAYmNB/Xhe1otXRXuv9AzJ0AvVp/Ntfg5rLoX6fNanviCuHXUT77iHdvtlYWbeOkI7fGSNn5X1axb7gJOinRl9YRbfmTeqLPZfRQCQjZR3AkKn+FRyY+1gJtzBCsHEr6HciofncgUWjzONdfC0q3cH4yNdbd1FG8fnwumuHJIboQ7/2te+IAwAw7GVW2i3j4q4gCTLB+6SGxuV13WsV6nXIBkV7c4gzJoZHAD5OEy4r6M+LgqWKKC5bSGY6ZNe3S2Oj6yE/2xjHYUX6mI3ZfA68PtZSEMazFZrdpRlHx67eK8WsquYoKxTIcnxsUg7SyjMKr12Br5nBgdAPiaJ9nMquUFLenm3OB5PGzM53MHrrjZnb9zG63A60LI3+45d9wGhToUkxyxl+x/XC2OOBAdABuJU8xQd1Y3HUmhpQHEUH/Pp5eAiXlep30LkMZVutvfjor3ZG/ePa3h2H3beB9zPiirSJtAkuReQ4ADIQ6pBypmiJrGw2N9Q7hZfFmnv4AUTVaxz2pq9EZIb3rwAexJnx14m3OWhUv+eBAdAHsaJgtuZoiahMGPj+VDuFsfjTD2AFOB2SJxSftLCriU3IE0/EGbypXoMeKLEvyfBAZCHJwn28VYxk8iseHhDypuhHXicqXKdcJcC3G45aWGfU8kNSCrVbNmxdTi+J8EBkId9d1AzC4uSSKhnTwde31JOUR7FNR3ohpeJ9zcrHtYFABKJie5Zot1Zh2mOBAdAHvY9QLlRxCRgAcOH4HaW+JoT4HZAXBB2nHi3zy0oCq1INWt2oqi/JcEBkId9B71fFDF7dmka/DfeJdyXBEc3vGzhmjRzD9qRKsn9i6L+lgQHwDDMFAF7dFoOpC4Uw1dledwkvO6eKPFOSPlKx1vXJLTaB8wS9QFjpf0tCQ6AYTBFmX15UwZy14phoVR38AS4mfv7598mxf7XWqrzSnBoX4oZVNr/ORIcAANgmjJ79I8iWOpDov14RCV/zxLu6zoucgi0K8XjwWPF/C0JDgCAPUg5yPSqwOylfDzlUnEDQyXBATAAXiMJrZkm2o9ZHHm3v6na4Ov47D8wkPZfgvtbEhwAwzBWBNAKj4cxSbivt4obBkeCu0aCAwBgf1K9onmiqLN1mGg/t9ZbAoZOggNgGAx+oB0zRaD9TbQfszeAwZPgAMjDdM+//xdFDK1wR33A4rPx40S7u1HiwNBJcAAMw0QRQHo//fX7XaJdSWLmKdWz8TcJ6xpAtiQ4APKw78B0/PfPv1mECvp5fd9f44o5S5NE+/mgqAEkOABykWIhwheKGVrhMZXhepJoP1NFDSDBAZCLFHd4T7wrHSCpcYJ9hLenzBQ1gAQHQC5S3OENyY1XihogmRSPBpohBBBJcADkIVWA+vLvn38bK26A/UrY1n5S2gAPJDgAMhBXv58l2FWYxfHeoyoAezdOtB8zOACiHxQBQDZuEwXEYcr0Vbk9V+QAe5OiPQ8JcgkOeim+/a26ITMqdvfI16xYcFOpvJamSr37JDgA8hGmGR8n2tdxGTh8Lj+P4uwRAHZrnGAfkht0VkxghOskfP4S/3uXiYxNv0/9f+9q11f47+ptd7O43Uku5kmCAyAf08T7CwHE57JDP3XXAmDnfkywj5lipgtiMmNSPLw6+aBoKYmxgVH8vpXjBcdUj9+qJMgsbpIfLZHgAMhEuBNQdpahUxwn3G3Y18dyv6FzvpToANiZFAO4L4qZHNUSGofxs89rf03i57Ez3z4JDoC83BTtvMo1dM6TMiAJdxzehe/x01+/z5wOgKx5xJBsxKTGizjQHysR2iDBAZCXD0U7CY5KNW30dZxNEhIe9SmX98z0AFgpxR1r0+BpVXwr20m5vSwkNciABAdARkLioIXHVJYZx63pudM2hIC+umv5qf5nEi9ARg4UAX0VZ2uEpMaJ0iAnEhwA+QmPiJwrhrUGDZO5gCt8hGTHrHhIftxKegA9NlMEpFT2s5MYo0yUBjmS4ADIz5vi4a7ISFFspXrM5jgGY2G2x7R4SHhYWwToDe0ZqZR96bh4SGycKA1y9l9FAJBdwBoG5DdKYmdCoigkO16X2x9lkBZejXsSnxsGABqU/eVF+fG5kNygAyQ4APJ0WVgdf1/C7I6r4iHZcRXvSgHsckCoXaEP9fgg3BQoHmZuuClAJ0hwAGQoTjt+qyT2qlr5PSQ63huQADukPaHTwkzH8uNjYbFcOkaCAyBfYS2OmWJIIjzCUs3ocJcKgMEKfWHxMNNRf0jnSHAAZCquxXGqJJI6KR4SHa8UBQBDEhL8YUZjYa0NOkyCAyBj8RWnb5REUuGO1esyyPtoNgcAQxD7u/BIyrHSoMskOAAy99Nfv5+VH7dKIrlJ8TCbw/PHAPRWLbmhv6PzJDgAuuGosB5HG+6DvrjYGgD0UXiNuuQGvSDBAdABcT2O54VXx7YhJDmuJDkA6Juyb7sorLlBj0hwAHTET3/9Hh5TCTM5JDnaIckBQG+UfVpYb+NcSdAnEhwAHRKTHE8La3K0JSQ5JooBWEEbTdbiuhtXSoK+keAA6Jif/vp9VjzM5LhRGq14XwaGY8UANLTTZtqRu5Dc8KYweucHRQDQ2eD5eTnQflU8LA5GOiEgfF88zKQBaE14y1Oc2Qeb1JtJ0Z3XwU6Lh0dzv8T/nxW7WXR9HLe6H4tvF1td9HfInAQHQIeVge2bMlAJnX9IckyUSDIHYWG2svwvFAXQInfg2Uauj6aEeOZT8fCI122csZqFOHNzHP+3ireexGvwwLWYDwmObwcK4aL6j5JoLKMQzAvom8voSCmQuM7dLz4aF8A8L9xtSOW8LPMbd08B6IoYK+QUJ1yX24dym+b8aFdMtszi/06XlO2k+JrweBLL2et3E5PgAOiJsvMNQcK1REdSYeaMpCbQFu08m8rhrSkhUXBZbjd9Wq8m3iwP7tdIiwmPj6pcWhYZBeiZkOgot1/L/3xeWIh03ybxNXsA86YJ9jFWzKwr9ldt1plZuZ2GGCXGKhbjZeckOAB6qgwcwp2RkOQIyY6zRMH2EFnkFWjLj4qADbxocd9hxsbTONsU9sYjKgA9F58bfRO2+N77Sbkdxk/Phj7eONwVCwklRQEkpg1nLXGRzDZmHN6/9a32+AbslQQHwIDE6aA3Re3RlfiM6Dhuh/GPJ0prIy8LjwMB37pN0JZ6cwPrOm7pGnie09tQ6D8JDoCBa7qrEmd8tHmHsP7qtV+KhyTMJMNiDGtxjAVxQM0/idpIWEfqx1Pu3/BmnQ1Sk+AAYKkYmExb/AoL9x2n2k7K7Vn8zOEu5knhNdrAV0kGdpKrrFFHUt+sqB5LkdwgOYuMAtA5IZiPK7BXi6ieFl/fT9+WZ84MUHObaD9jRc0Kk8T7O5V0oy0SHAB0WrhDVHs1bpuJjoM4swQgSHX3eqKoWeEw4b5uLLpNmyQ4AOiN+Pq5p0V7C34eOwtAbI9SzeB4orRZIeXjKWeKmzZJcADQt0HFXXx05bKF3R86A0BNilkcFhpllUmi/Vx7NIW2SXAA0EtlkHVRpE9yTJQ8UJNiFsfY43Esk7huvFXitM1bVL5tAEJg+nEAhzotA/+jLcsoDBjOB1BGl3FwtE0ZfRzIIOeo6fWikINwHZfXZJi+nerRkZE3GgA1t4ligrCPa8XNAuNUdT3hY1mwlBkcAPRdWHg05avqxoociP5MtB+Px7FMqkeYpoqaHEhwANBrYU2OIu2jKhOlDkSp7mhrd1hmlGg/HxQ1OZDgAGAIrot0szh+UdxAlCrBEdbhsNgobfZJHk8hCxIcAPRenMVxnWqgocSBWtszS7S7iRKnrT4p1nVonQQHAEPxLtF+RooaqEl1Z/uFoqYlU0VALiQ4ABiEuLp7ijtMpokDdZ8S7efA62KBoZPgAGBIPCMM9Lndeam4gSGT4ADAQANgT3766/dpwt2dKHFgyCQ4ABiSf1LsxNsMgDk3ifYzKtufE8UNDJUEBwBDMks1yFDUQM2nhPs6V9zAUElwADAkM0UAtGCacF/jv3/+baLIgSGS4AAAgD2Kb3GaJdzla6VOQhNFQC4kOAAAYP9uEu7rwFocpFTWN49mkgUJDgCGZKIIgJZ8SLy/c4NOinTrv1hcmyxIcADAjiV+LSTQnXZhlnCX48KCo6QjwUEWJDgAGJJDRQC06Cbx/l5ZcHTwZvpXhkSCA4AhEegDbXrXwj6vPKoyaLNE+zlW1ORAggOAQSgD/FTB11RpA4vEt6ncJt7tuNyulP5gJatvFrYlBxIcAAzFM0UAZOBtC/s8LgefXh07QD/99ftd+XGXaHcvlDhtk+AAoPfKwH5cfpwk2t0nJQ40uEk44Kx75Q77YKWaxTGx5gttk+AAYAhS3rmcKW5gmXhH/W1Lu7+S5BiklIl3b+75aqII0pPgAKDX4tobKRc/u1XqwApvWty3JMfwpOyXJgnXvMo17hiV2/tCsqcVEhwA9DnIOCjSLq53FxcRBFgqzuK4bvErhCSHhUeHY9pC/Rrkm3vK435VfvxReKtMayQ4APLuKMfhTptX/G1VdqHMQgCfsuxulDywpsuinbU4KqFv+ah/6b+YUJsm3GWoU4OqW2HtkXL7XDw8EuuaapEEB0DexnGQ/n9huqNkx9qBRpi5EQKNg8S7tsAosO6gc1a0txZHZVJufwz9kYKB+JB4f6H/fd/3mCUmNj6W//mxhZiDBSQ4ALojBKBVsuNzmAYZB/J8G2ycxEBj3MLuzeAANhHW4rhr+TuM4kD0Y3zjVN8N9SZBG/3TpOjpTI65xMZEU5aPHxQBQCcdxC10srPiYeppmD0wjXcFBycG5mFqaFt3Im/iNGCAtYQ2o2y7zoq0awU1DUbDbI7r8vOyT31J7B9C3/CiGOhd9nA+y3KYtjAYv59RWe77tPwO047Xo5CoOSm3l0U7N1FYgwQHQPeNY4d7EjvgEJSGIGIQCY8YuJ5Xx9+id6oisMXA87psx14U+dwFvu9PYqLjbVcXTo6P3RzGcjXb8Ws/1UY9C/10mMkRZixddu1mQKxL4Rr1KFcHSHAA9M+4+DbhUS0u9iV+3vZhpkFmAcesLFOPpwDbCrM4Pmf2ne77kbKtvY0D45tcE+Yx0R2SGIfxc6JKfS8m086L9mYfvIp1Kqw98ybXWCTWp1CHnhWSGp0jwQHQf6PYQYftPHbeIUgN26f4Oct96micGlrdkTsu8nqO+lI1Ax4x8Lwt27jLqo3OTPVI5OuY7AiLVU7b6DNiP3AQB+jj4mtCw+Lb63vXcj0bxf2fx1lCH9q+QRDXM6sSZJPC4yedJsEBMExVcDipdfDhI9xNCQHsrNz+rP1/kTKYjXdPqu/3S+YBR0gOXatSwGOU7chF2fYdFnnPPqgGguexz6j6iy/xM2x32zzWEhZtnNtPGAj/WHx9vGSiluxEeEzkZZFHUuikeJjRUc00DTddbvcVb8RExqgWW4zVq/6R4ACgbrSss4/BbPBv0iMK//3PooF/3OYt+v2H8XNcdO/OyZlqA+zI83L7o+jOjIQq4XG8pL8gM3Fh2zBb6HVmsUc107SqP7Pa9mdDbFHN6lkWVyyLO+gpCQ4AtglEJgKHe1NrbwA7HnweFfmtx0G/6tmbuLBtzouvjguPirCF/yoCANhKmMlyqhiAHQ8+b7UtJGD2Ib0kwQEA2znt+yt4gXbEdX3eKAn2WMem6hh9JMEBAJt749EUYM8D0HCH/VpJsOc6dqsk6BMJDgDYzE0MCgH2PQANj6pcKwn2KCxse6cY6AsJDgBYn2fjgaQkOdhz/ZqVH2FhW0kOekGCAwDWE5IbR+EtB4oCSDwIDUmOSyXBnuqX5D29IcEBAKtdlwHgU8kNoMVB6EUchGqH2Ef9ulG/6AMJDgBodhnvngK0PQi9Lh4eJ5gpDfZYvyQ56CwJDgBYLAR4z+NdU4BcBqHhcYKn5eZNTuyrfoUkh7er0EkSHADwvTBw+NWrYIFMB6F35RbefuENGOyjflVJjmulsbOYQsIoEQkOAPhqVjzM2nhuvQ2gAwPR+2SsgWiW7jpet+7i45mSaNubFg+Lk4cyNCsmEQkOAHgI3sJaG2ZtAF0diB7FARXt9SPVQp3/i7Mg+lC/JNE2F8oqxBMhuTGtrtNCkiOJHxQBQNZmMWCdKIq9BaRvy+2NGRtAxweioa+Y/v3zbyfl53m5jZXK3t3GPvpDNZDtad0K/eNpWbdCf/laTLI0XntXPLx1bbasHMsyDEmOj+V2oMj2Q4IDIO+gInSSR2WHOIoBxWH81DE+Pih9G1eMB+hTvxHateuy3zguP18ajO58EDstt0/ldjO0xHi1NkdZtyaxbh2rEvezdt6tO/tTkmP/JDgAuhFUVFNf7ztQCY+tA9MqEDFFFOh7v3HfZ5T9xUFtMDpSMhuZFg8J8ZDQmJrp92/dCuUSZguNY906GVjdCtfWh2LLJJckx35JcAB0M7j4JuERxDsqYXsSO8yxkpLUAAbfX4S2L6wLcRofX3lWuPM+L/Spt3H7Ej71GWvVrdDHnoUtzhh6EeOQUQ/rx7R4RFJjURwnybEfEhwA/Qk0pkVtgbk4y+MgBhu/FA8Jj0nPi2FWfJ0+PF32HCzAQPuJ6yIuFhkHpM9ivzAeSBHUExn/xP5ipq/YSd2qzzINdSvMMD3uaN2q6kn1KNLtnspMkmMPJDgA+htsVHccpvU/j1NKxzGo/TF2qqMOdq4h4AhB6Zd4jLemDwNsNSCt+oRqBuCko4dVDUyLODgtqj6wz4uAZly3zmLdCnXqMH5WMUdudaaV2TuSHLsnwQEwvMBjVnyd6fCN2qyPohbgVrM/iiJtImRaCz6+1IKQO1OHAXbeL1zP9QfVo47hs61keD1hUcS+688FP5Pgzj/mqD9SO67VrVCnDuOP9pX8uI31pao/1XfKot5IcuyWBAeQq+tFA3D238nWyn1l+c8lRB7LNOHdO0qwD+dstbNi/3csuzC40653qz+o7mrfJGj/7+uw5PVg6laVYJg2xBePSnZ0bcZOLcmxzTXluqmR4ABy7/zIvEM2YMn6/Dg3+QwUlYN2XfsP2k3X1J79VxEAAAAAXSfBAQAAAHSeR1S+NZRpQY+Z8jUbSBnNWirfrl0vAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB0338UAQAA5Ovvn38blR8Hi37201+/T5UQwAMJDgAAyMzfP/92Un48K7dJuY1W/PVZud2W24dyu/npr9/vlCAwRBIc33Yk4/LjZMmPr8vOYqaUOnEeL5b8aOouB+zsOpvEoPs75XV2oYT0lcDW19ir8uO8WJ3UKBrinSMlCQzRD4rgG+PYoSzsLIqH7Dj5O2/q9BUP7MSk4Vq7UDz6SmAz8TGU98WS5DEAq0lwAABA+z4WS9bZAGA9/1UEAADQnvh4reQGwCOZwQEAAC2J69o0PV47K7e35XY7v5ZY+W9DUqR6w8ph4fEWYOAkOL4VVpyeNvwMgK8B91QxADzay4afXZfb2bK3opR/fhv/M7THb8J/xKQHwCBJcHzfSVh1GmB1e3kdA28AHud4yZ+Ht6GcbhnPAgySBAcweH///NtJ8fBmiHpQOVUyAOy5/xnP9T91bzP5jhdzf+R10EC2JDgAiuJF8e1zy78UHr8AYP/GDT/LpR+aXx8kPC7zxqkDcuQtKgDfmygCANrsb5atu5GBQ6cNyJUEB8D3xnHaMADwrYkiAHIlwQGwmFXoAeB7I29qAXIlwQGwmCm4ALCYBAeQJYuM1sRs9OslPz5L8dqt+DaHF/U/K/d7tOLfjGJHMykeFkccz/2V8L3/LB7eDHHbkXMxjsd0sOSYquP6p8jsjRcp6lG5j49LfvQuvr6z7eM/iOds2bkLZrFe3sVzOctsVfaTVXeoVl2bqduD+H2rduBgn23Xou+WqlzWbA/DFv77Sfxc5FP8DO3HbcbPu6e4VheVUyiPL/Fave3aqyfn+sYflwzIZrX+cdrz810vj6Apifup1s/e5V42tbZv1HBcn6r+pivnuqGvz6HvPy+/34uGn4dyPttxeVwtiwe33VdDzDbb5hW9tRj2KlW5rHF841r7d7hOTJZZXP16rv1uPDfl35/Mj4kyiEsm8RgG3xdJcKQ3KpY/VzhK9B3G898hXKiLKnscYDwrlr8/vTKp/ZtwAV22PQhu6BCqY1rnzsCk1smGz5ty+zCQejRZEZSmPneTONg9fswxlr+nSnZ8yqCRbzqPRS7tQew4X8XyHydsu8YZlE/VbhzHoO2gaH4jwdI2JP6u29iG9PYViFtcq8dz1+dNDMJyHsSfxGPc5A5z1Y9cx8HitCfne9vymG93qmRHvX2edawuTxbU5dzP9bptbBt9/3jD9nafZRLq9rZJgxfLyrmsJ5db1vODtuK02uD+8DF9dD2uzmDMcLCgTTqr35SIscDL2N6N2r5wH9kXVe3TpdcxS3D0Wbiop3ODmZdbXsChAbgqf0/496c53JGrHdP5I3/VcbE62cNuz11152NXA90qqTCJ9eE/SnlhR1+1B9V1MxpweVztsP5VMxpCgBECurO+zOrY0bVaBWy5HuPFI/rGSji+MHvrTQwu7zp8zndRHouuj1BGl+V20YO6HM71NJ7raUHuPi1pg+7XBNkypj1e8bNtXofbNDtq3/Xs4w5/131cXZbteZHfzdFJTAJUbd15Ll9sB23vqE99URuswdENT+IFEyr7Hzsa0IQA4WPbi0TF/X/OqWFi7XN3Es/dRGkkdRiSgnHq8uuBJzf26b697cNCen2/VuP18LnYbbLvVewjR8ojq2N7tYe6PInn+kKzl73pivO4TQw6bvgrLx8RYy/U0URaKKNwc/QqozbxIJy/WluXQ/s01hflQYKjGyZxMHO142BlFBusUUsNwX2SpWhniiOPO3fHxfLnS9lzexCvm4mi2LtRkUEi+JHX6lWfr9V4bv4o9rPgYdVHdc37oocLQMa6/HqPuziP+yBTcbr+bMmPt1kY/MWqgf2W7f+y/nna8VNwEtuXHLyI7XMWbV3thu2++qL3WoD1eUSlO0H2qsFMtXbB/AUxWuOiCdnBi8QNwTg2TJsmV+4Kd6zbbsRHGwyYpsXXhQrrqgUNR5kH4iGQepdhe3Cwxvee1a6ZIaq3idWCxJVqka9xsTrBGsr7fVnvn3ZtimicuXGyZb0fd+D4qrZotMbx3M61Q1UdWNW3hjuEF+W5v+jIOX9VrJf8nNXKZdG1sW4MkfK41q3L0+Lrgn1BtdDgOuUSpoT/mdH5vtzgmNsQ9vupoY7ta58nGyQVmqzzWPOLBfF1U11t+h6fWqxL1TXfFJOtc81PMmkTxxscc4q+6P0aZVetY/TnXJs7WSOuC+X+qiz3NwUSHAMI4K+Lh0Wybhsa2vMVDf/L8IxX4uD9as2GIAwupyuOLzQKh4X1N1I5WXHuqoXbbjboHKpnu5/E85jL4GrWlYFNDPqq62U2sDp5F4//S7HhG1Fqi5S+bKh34c+TJ4IfGXCF77zO3e7Qh3yIZTZb8nuqweG6C0Cn7EcOVhxb4yJta64B1UYfua2XK66TMGC+WbeNmHvzypPi65tKUtblgzXq8rRY400icfbhyxUxUZjJkcWbDDrQ/3xq4Ts2rcMx3qBur7sodagzmyxgerAiPkqVzJjGstroDVixXF4WzQnF+3WqMo01qhcO3CRss69W1KV1+qJxLPPzNcrdehwSHL0N5t+W28qAK3bQ03gnb9ld91FswK8TBSsnK4KL0ACcrhNcVMcXyqK2YvFrVWSvnjX87HSbRahi51t1wGe1QSfrBTKnA14g71GvwY0Bx5vYhlw1BHUvupTgKFYnkW9i2c3WKJ8qWL6oJU5avT5jcvu4oY98vmYfchePK5THslmFVd+S9Z2zWCbLguxwjRxtGhjHv1/1s/UkQcoA+/UabcCbNY8nnOebOCPk9Yp9PtW9ZKnpup5sEMu+WPPvjTdcwPTJsnYp0cL+vz4m8RC/42l5zG+L5iTytguw7rNenKZOuuywL5qt2RclG691mTU4uic0PGGq9MUmgUocdDY1RIcJj+HlGse38WAtlIepW0lMlvz5zlbYDg29c7mW622vl77YZcBY/q7ThuB53JW1OGISYtJUb8pjfb5NIBj/zdsMDrOpH3m+6TVRBfU7GAzl2DbfbZPcaEoSpGpzaq+8XOZ0m74i/pum830QEznk1+aHNmi2g1h2k/P7YgfX4TRh+eyqb226Rp5lVC1CkvOopRklTTMujrbsi846Uu4SHOxmMFNW/KePuICbnuVMErjXHkVYFoQ9N/Wqs24UQfL24NT1snNNg/dxR46hafB/ExM5nbVihtebbQff8e7+tM0+ck+mHW4nmgaWbx6TVI//9nJHg1oS1+kNkwuL2pDxkjh0kZM1f++ooZ/41LVCjoPt68eUdQKnbd0QW3Ez4XLbGzCxbVr2byVe1yDB0a2G5vSR//6uYRCaKnhrujAvB7h2QJ/q561S6E57QOMgt+j4ILepnT3rwWlq7Ece+bvfNQSzk46W15cenuu7HZzrIAyMlsUdx17NmK1lyYJxHHRuW6+WJbhHa87oaWojph0t6z8z/m7TXc0c3kP79NikS1NfdKAJaCbBMTxtBzrLpg96vKTj1gwqgP1fh8uuxeueJJGX9SO7WFSuj4naJx2ty2GwOGqoy4+elRJ/x7stB6y0OLB95DlbNjvnTcPvXufRgIOGGLerbYubV8stqxPTPfdFEq8rSHAMz+2KYGLflu3D4w3dJxCE9jXd2fnQ87bm0Qn8FYOQSc/KS11eHX+4U5qhFetwNCb0YhJ40Xm9WZHwWmcGx2EPY1yPwW7etn7aQR2fNvx4rOibeYvK8LTWUK24w//JqemM2yXBweuw+rM1IcjJihkN6wQSvRkUbvLq5swtu3s1HXh1X5acCdPrLzr0yuuVA9VdXrMhqVWWz92SenVYkKtQB042GHRWliUqqqRZaCevllxHxyva0b0NeHfYJ64qnzuPHD96TLPv8hs7A80kOEip6YKcKZ5OBdEHSwYdf5SNfnjGf2o9FVoKOkLw+izW0YM1/029HZr1+Lrtw/ltCs5fdHidjH2f4/OybELC4G2HEnrjhoHtPspuyHWni0LS4GTBn4c34IwabrYsezzlPnER/l18VeeiRMizYslsjBXrIrRyzdUWZD6M9Xu05r/rVb/Rwphm6H1R6yQ4EHyzqXfF8hXFQ+d5NddBFis6/RCEhKnlN+4asGUQF+rdq+Lh7SGPeTZ1XHT/zsjSdY4GUBVOhnwdhKRyeS1MGwbqYaBzvGbbPIvbba197nMdWpbgMEjJV1PSYLIoEbHG4yn1OGdRgiNcP2dLroVldWWW+oZPPM7XxePfuOERrTz7opkibmYNDnIJzDzW0J1zNS12dzdiEjvg8B7xz2Wn/FnWmw0DuRCAfY51yMJb7HsQnLvLHf2ecWyfQ+IwJK3D7LyrxG8VOUh4Hv5RvTsXi8waBnrLEr2rHk+pfndIjiyKS0cNv2PZI1XTlOVSXqPhmv2j8DrRPpspgmYSHMA2zor93BEOAe3HEEgrYtYI5O7rS+F5VNLIPhEfE9DXe/jVYWB3UjwkOlLd1V2WTJGMYFXyYLLkz5e99eJmzT9r+h3Lrotk62+U12aYtfFatWDoJDiAbYLocAftaI8B/4kkBysCuTD4eV+YtUE6nZhpWLbPp8V+khxFvN4+JkxyQJNlyYOD+dlG8f8nC/7uslcOL32bypLfveyaSLK4c1x/6pUqMQgzRdBMgoNcBitjpdAtMcnxdI+B9EnssGGREMitajdC3QyDvadlff3Poi3W4aO4hen9bwzCaWjzuvJdT2Pd30cg/O9aSy3V5R/VRtZIHswnHNZ6PKV2DU0brp/jFfuq3CZ8BHvVzI1Z7N9CX/frkv7wf7X+8HnsE6eqWXbt+0wpNLPIKLkYFzKSXW1kT//++bfL2OE/K3a7UOProtvvj2d/Xjb8LAxEn68TBMwNWu8DufgMc1d9WRLIjwdQJ4569srfx7bP1+XHdUwUH8ZB2GRHvz7cIT+J+9iXZQt/7mP2yC9qTCfreHjjybI3u03mBueLHi25W/Ha1/CzRf1B+F3Xc/taJEl7FK/xpjb+cp3XRMdkTP0738R10SZq20Z+lYRolwQHKTVd7GPF0+kgI5zbN8UGd7/jFOdJHKguO//j8Pe8XYUFdWfUMCg6snBxb9tYbcHm7fNNsUGiuDbdPrxO86Thr84P8lIZJbw+pmpQ9qbF4gTH4VydXpT4XXVdhMdUFiU4judeRbtsUdNU6288a/jZWskNNna3oj2ZKaL2eESF1IPgZQ6V0ODqQ5i6GRIiT1cMWjymwrzJimBuyMmN24aB66QH7UbTubUuxI7KOMyEqT3m0lbbPEt4ntWd7vq0Rj+x0eMp9TiloU09WaP+TBOVwXjZIFxyY38x7Bbng0QkOMgl+J4omuEG08XDs57LPFFKzBk11KehP9I0a/jZs54c47JBg0T57tvn66JhlsaeFxv90rDfnSVXVswI+6QWdLY9qCd1t3k8pbJssdEXK+pPyvU3Wl3g1JhGX5QbCQ5yaQzGfbi7+JiB2cCD6FlD3VBmsP61NITZUMuO8bu3G7ATH1rq05rq8i6TdS+2/A7k0ebdNZynySMeT1n19w7iAvkHW1w3qWLLP9UQfdEQSXCQWtPdkPOeHOOs4WeyustZMwF2Y1lAHhLJJz0fcHtNYk/a5rhg7N0+BxDxdzRdE1OnvxOmDTHXVo+n1OrhrOH3h9/9JOO6441D7fRFI31RuyQ4yCXwDiZ9eC3oirVGHnV8IRgrt6ue1g3Zbh5tz1Pm+5AAOO/6naUVr288H8hswKG0zTcN32kXN0VeNRzfjcWKOzOAblqHY9GNpbsNH2dsekxl0tBOpeLx73b6olCH7hr6IvFISyQ4SN0YhIbguuGvXPWkQVjWsY23fQVlLJePRfPdpq4OSsfF8mmesxa/ms4pT3t7DKMn00qbgq5wrb3vwTG+a/jZe0mOnWp6HOSuxfP86jEzkuINlaYkyQenfuV5zqWPnG7YJ2y6NsVNw/EfbPh9kp6fGF89hptPzd42/OyjJEc7JDjILTAdxQah68Fp46M4mxxfnLVxUf7n51yCifD9dzXbJg4omwZcXxIc0mxZfTRQytLtiuvrYNt6Ha+zTouJ5KagK1y/nzuezHnTENRX/cjFEJ+DDkn0HQxqqt8VEgjLkgh3+36Fd7wL3jRYvNrmpkE8rqZ+ZxYXWKW5zZ3sqq7toM3bZB2vD1v8/k2SIqkXp23a3/tt2sFa7Ple9X9UX/R5qH2RBAeDEgOW6zWSHO/XHUTHAXcI6nJpiNc5vtdNgUEYpIW/U/7nH0V+65NMYqf5f/E8vdo0ERA7z5NideImxSrgX1YE0DLwebUhsxWDno/rDnrCNRjrb7jOwgypcU+KqSnoKuI190cMvMZrXq+T2CZdZVAHwrGdrvhr5/EYX2+bqIzHfJLDIG4Dr+Nxf47Hfrzp94/9z9WKc53qDQ1nq463/K4f14kX4vn8uEYdPi2om+16AL0H0zX/3t2Wb9t6t8HfTf32kusVbf3aNw7jNXKVaeyZYzwS+qLLRH3Rq471Ra35QRHQkhCwHBfNU9/Cz0NgVnVcd3Eg+mNtQDzOcUASBmDl9w4dzknDXwsDsNBY3cZju43lMY7H14Vsb7U6+XFsgKtAqNoWreD9SzzGdRr56xVrmqQIjMJ3DQOFm/lEiPfLt+ptQx0axUHPebyu5u9uVW1IV66zrYKu8vjDIO39ius3lFGY9TJ/3T6plU2W5RQGKWu0s6NaWzvflyzypNYO1/uWo6Ldx+W2UdXxV7X2uWrrlt3xPdygX71MdJ5vy+9+FhM3y4S2IAwA7pZc84cb1OM3iddP6IJPDddZlSy9mevzU8+C+VSst7DjzSPam7s16tDeZzYtiTmnDX1ileSYxTbgzyXt3kRV36r835Rl+yRRX3Tbwb5IgoPBNAYh+A4B48c1A45JLenRFZdrJHGKWrJmk47lJuOyWDc4XiU0/GeJ6uPtiuCgqnvzZS7B0e7gdtV1UAVskwGX0Zs1g/5dXbepj/E0Bosna/6TLvYluzTZor9Z2L8lSj5vMoDYxTUfkupnBYtijtcN8cyit9GEPjVlgmO65t/78MhyONnR99i1kND+vCLmHBc9XMdNX8Q8j6jQZmMQspBHRU9fDxqDv11Pcw2/83n5u58X/c7ghjpxlHgF+0tXZeeE6+tWMTS2Q2d9r9shsHT9JnXdxuy1eJ73mXx4E/fB92V/l/s1tmIdjn9jiy0fT6m8XePvfGrp+Gd9jqk71Be9URLtk+Cg7cYgdEa/FmmeV5y1cHw3O+pwquDiaa1z7uvALhzfry1M8ZwWnrvuYtB9tOOAYtWbnrpYThdFmkcs7toKruMxPi3au3s6BOHcPm8zCRBmcuzhPN8PDM3cWKvsc28bV9WL60eWwTqPB0xbPEfVjcNdxk+3Rfo1Rbp8nZzFc6AvapEEB1kMUuKMhKMdd57TOPAJv/t/ba2IHgfOv8YExabBf+hUTsvfEb7/xdyMhk8tnrbrmAy43tGgqRpUhgTO88QzN+rn6jrWl5krs1Ptx9kO2o9prNO/xgHcac/KaVpuvxa7nfUyi21UlXz9X+rE5HxwX25Htbqwy3akS3dFj+I52VWAHc7pWbw2bjKoy7s6z+FYQn/zqzU31i770y1jmVRWxUXvdrCPpmvgrs02sHZ9PH1kW1/FZCHx9zTG6NeugI362330RXeFGTprsQbH9xVn2nJwMyv2m/XL4RibEgHTuJjYpHhYm6K+0F1T8PVP8XWhzlnKZ4PXHYQVD+s1XMSV3sOxHTZ00OE4pisG+tMF53KW6HhmsdG+7/DiCur1RRurhURXBSJ38ThvMzpXIXi5ieepWpiuLftuD3rz3WqvkzyNq5RPVtTD8P3/jP/mdv5aC8mu+Dzti9TX157L6f66jSuxT2L5HK7Rb3yplcFsUZllWhcO4nGO1jjOer3Itj/Z4PiL2D5X7fIk/tHhmmWwTj+U0zV/EK/5gxWxwrQjCY3bTMv9Iq7tU/WR44y+/7Qpxt1RrPG2oY59yug8bdrWN8ZkcY2Ju5ZiotsuXSM76ouyH9sAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/589OCQAAAAAEPT/td0NAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACTAAMAj5Ci1Vvm2+gAAAAASUVORK5CYII=";
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
      { image: imageUrl, width: 100, height: 100, alignment: "center" },
      {
        text: `Ticket número: 000-${numTicketSoporte}`,
        fontSize: 18,
        alignment: "center",
        bold: true,
        margin: [0, 15, 0, 0],
      },
      {
        text: "Asunto",
        fontSize: 12,
        bold: true,
        margin: [0, 15, 0, 0],
      },
      {
        text: asunto,
        fontSize: 11,
        margin: [0, 8, 0, 0],
      },
      {
        text: "Detalle ",
        fontSize: 12,
        bold: true,
        margin: [0, 15, 0, 0],
      },
      {
        text: comentario,
        fontSize: 11,
        margin: [0, 8, 0, 0],
      },
      {
        text: "Detalles del ticket",
        fontSize: 12,
        bold: true,
        margin: [0, 15, 0, 0],
      },
      {
        ul: [
          `Solicitante: ${solicitante}`,
          `Agente Administrador del proyecto: ${
            agente == null ? "Sin asignar" : agente
          }`,
          `Fecha de solicitud: ${fechaCreacion}`,
          `Fecha estimada de finalización: ${fechaEstimada}`,
          `Fecha de finalización del ticket: ${fechaFinalizacion}`,
          `Este requerimiento necesita facturación: ${
            facturacionText == true ? "Si" : "No"
          }`,
        ],
        margin: [0, 5, 0, 0], // Ajusta el margen superior según tus necesidades,
        fontSize: 11,
      },
      {
        text: "Actividades",
        fontSize: 12,
        bold: true,
        margin: [0, 15, 0, 0],
      },
      {
        ul: arrayActivities.map((activity) => [
          `Actividad: ${activity.descripcion}
          Hecho por: ${activity.agente_actividad_nombre}.
          ${
            razonSocial != nombreEmpresaSolicitante
              ? `Minutos trabajados por el agente: ${activity.minutosTrabajados} minutos.
              FIS: ${activity.fechainicio} FFS: ${activity.fechafinal}.`
              : ""
          }
          `,
          {
            image: activity.imagen_actividades,
            width: 430,
            fit: [400, 370],
            alignment: "center",
          },
        ]),
        margin: [0, 5, 10, 10],
        fontSize: 11,
      },
      {
        text: "Causante del error - comentario del agente administrador",
        fontSize: 12,
        bold: true,
        margin: [0, 15, 0, 0],
      },
      {
        text: causaError,
        fontSize: 11,
        margin: [0, 8, 0, 0],
      },
    ],
    footer: function (currentPage, pageCount) {
      return [
        {
          text: `Reporte generado por ${razonSocial} el día ${fechaFormateadaActualReport}`,
          fontSize: 8,
          italics: true,
          margin: [35, 5, 0, 0],
          paddin: [10, 0, 0, 0],
        },
        {
          text: 'El valor a facturar será por hora técnica o fracción de hora.',
          fontSize: 8,
          bold: true,
          margin: [35, 2, 0, 0],
          paddin: [5, 0, 0, 0],
        },
        {
          text: `Página ${currentPage} de ${pageCount}`,
          alignment: "right",
          margin: [0, 0, 35, 0],
        },
      ];
    },
  };
  pdfMake.createPdf(objGeneratePdf).open();
}


// Funcionalidad del boton para crear un nuevo ticket con los agentes
btnCreateTicketAgent.addEventListener("click", function () {
  event.preventDefault();
  
  var csrftoken = getCookie("csrftoken");
  var asunto = asuntoTicketAgente.value;
  var problema = textAreaProblemaAgent.value;
  var solicitante = solicitanteAgent.value;
  var prioridad = prioridadSelectAgent.value;
  var file = document.getElementById("inputFileAgent").files[0];
  var fileExtra = document.getElementById("inputFileExtra").files[0];
  var data = new FormData();
  data.append("asuntoTicketAgente", asunto);
  data.append("textAreaProblemaAgent", problema);
  data.append("solicitanteAgent", solicitante);
  data.append("prioridadSelectAgent", prioridad);
  data.append("file", file);
  data.append("fileExtra", fileExtra)
  btnCreateTicketAgent.disabled = true;
  
  // Enviar la solicitud al servidor
  fetch("crear_ticket_soporte_agente/", {
    method: "POST",
    body: data,
    headers: {
      "X-CSRFToken": csrftoken,
    },
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error("Error en la solicitud.");
    })
    .then((data) => {
      if (data.status === "success") {
        toastr.success(data.message, "Su ticket a sido enviado");

        setTimeout(function () {
          window.location.reload();
        }, 1000);
      } else {
        console.error("Error al crear el Ticket:", data.message);
        toastr.error(data.message, "Error en el ticket");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
  });

  // Función para obtener el token CSRF de las cookies
  function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      var cookies = document.cookie.split(";");
      for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();
        // Buscar el token CSRF en las cookies
        if (cookie.substring(0, name.length + 1) === name + "=") {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

btnNotificarSolicitante.addEventListener("click", function () {
  const phoneNumber = String(numeroSolicitante);
  var message;
  if (idEstadoGeneralTicket == 4) {
    message = `Estimado/s ${nombreCompletoSolicitante}, le informamos que su requerimiento: *${detalleTicket}*, Ticket *#${numTicketSoporte}* fue atendido, por favor confirmar si su solicitud fue resuelta.`;
  } else {
    message = `Estimado/s, le saluda ${razonSocial} del departamento de soporte de Ishida Software, me dirijo con respecto al ticket *#${numTicketSoporte}* con asunto: *${detalleTicket}* 
    Que solicitó el usuario ${nombreCompletoSolicitante} - ${nombreEmpresaSolicitante}.
    Por lo tanto solicito los siguientes requerimiento para completar su solicitud:`;
  }

  // Crear la URL para enviar el mensaje a WhatsApp
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    message
  )}`;

  // Abrir la ventana del navegador para enviar el mensaje
  window.open(url);
});

btnRegresarEstado.addEventListener("click", function () {
  fetch(`regresar_estado_proceso/${numTicketSoporte}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status == "success") {
        toastr.success("Ticket modificado", data.message);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toastr.error("Error al modificar el ticket", data.message);
      }
    })
    .catch((error) => {
      console.error("Error al modificar el ticket:", error);
      toastr.error("Error al modificar el ticket", data.message);
    });
});

// Input para buscar
buscarSolicitante.addEventListener("keyup", function () {
  const textoBusqueda = buscarSolicitante.value.toLowerCase();
  const tabla = document.getElementById("tbodyTicketTable");
  
  Array.from(tabla.children).forEach(function (fila) {
    const textoFila = fila.textContent.toLowerCase();
    if ((textoFila.includes(textoBusqueda)) && (!fila.classList.contains("table-success")) && (!fila.classList.contains("table-danger"))) {
      fila.style.display = "";
    } else {
      fila.style.display = "none";
    }
  });
});

buscarSolicitanteCompleto.addEventListener("keyup", function(){
  const textoBusquedaCompleta = buscarSolicitanteCompleto.value.toLowerCase();
  const tabla = document.getElementById("tbodyTicketComplete");

  Array.from(tabla.children).forEach(function (fila) {
    const textoFila = fila.textContent.toLowerCase();
    if ((textoFila.includes(textoBusquedaCompleta)) && (fila.classList.length > 0) && (!fila.classList.contains("table-warning")) && (!fila.classList.contains("table-secondary"))) {
      fila.style.display = "";
    } else {
      fila.style.display = "none";
    }
  });
})

// Boton para ordenar la tabla
btnStateAwait.addEventListener("click", function () {
  toggleOrder();
  tabular(resultadosProyectos, orderByEstadoDesc);
});
btnStateAwaitComplete.addEventListener("click", function(){
  toggleOrder();
  tabular(resultadosProyectos, orderByEstadoDesc);
})


// Funcion alerta
function mostrarAlerta() {
  var razonAnulacion = prompt('Agregar motivo de anulación: ');
  if (razonAnulacion !== null) {
    alert('Ticket anulado por el siguiente motivo: ' + razonAnulacion);
    fetch(`null_ticket/${numTicketSoporte}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ motivo: razonAnulacion }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status == "success") {
          toastr.success(
            "El ticket ha sido anulado correctamente.",
            data.message
          );
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          toastr.error(
            "Error al anular el ticket, revise el servicio",
            data.message
          );
        }
      })
      .catch((error) => {
        console.error("Error al anular el ticket, revise el servicio:", error);
        toastr.error(
          "Error al anular el ticket, revise el servicio",
          data.message
        );
      });
  }
}


// Funcionalidad para llenar la informacion de los tickets
asuntoTicketAgente.addEventListener("input", function () {
  if (asuntoTicketAgente.value.length > 4) {
    rowProblemaAgente.style.display = "";
  } else {
    rowProblemaAgente.style.display = "none";
  }
});
asuntoTicket.addEventListener("input", function () {
  if (asuntoTicket.value.length > 4) {
    rowPoblema.style.display = "";
  } else {
    rowPoblema.style.display = "none";
  }
});

textAreaProblemaAgent.addEventListener("input", function () {
  if (textAreaProblemaAgent.value.length > 10) {
    colImageAgente.style.display = "";
  } else {
    colImageAgente.style.display = "none";
  }
});
exampleFormControlTextarea1.addEventListener("input", function () {
  if (exampleFormControlTextarea1.value.length > 10) {
    colImage.style.display = "";
  } else {
    colImage.style.display = "none";
  }
});

prioridadSelect.addEventListener("change", function () {
  btnCreateTicket.disabled = false;
});
prioridadSelectAgent.addEventListener("change", function () {
  btnCreateTicketAgent.disabled = false;
});
