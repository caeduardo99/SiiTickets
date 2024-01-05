$(document).ready(function () {
    $("#myTabs a").on("click", function (e) {
        e.preventDefault();
        $(this).tab("show");
        loadListProjects();
      });

    // FUNCIONAMIENTO GENERAL DE LOS REPORTES-----------------------------------------------------------
    // VARIABLES GENERALES
    const selectTypeTicket = document.getElementById('selectTypeTicket');
    const selectStateTicket = document.getElementById('selectStateTicket');
    const optionTimeTickets = document.getElementById('optionTimeTickets');
    const rowGenerateReport = document.getElementById('rowGenerateReport');
    const btnGenerateReport = document.getElementById('btnGenerateReport');
    const optionsAgentPeriodo = document.getElementById('optionsAgentPeriodo');
    const rowTableTickets = document.getElementById('rowTableTickets');
    const radiosTicketsTime1 = document.getElementById('radiosTicketsTime1');
    const agentesolicitado = document.getElementById('agentesolicitado');
    const inputDateEnd = document.getElementById('inputDateEnd');
    const inputDateStar = document.getElementById('inputDateStar');
    const colFechaInicio = document.getElementById('colFechaInicio');
    const colFechaFinal = document.getElementById('colFechaFinal');
    
    var masNuevos = true;
    var masAntiguos = false;

    // FUNCIONAMIENTO PARA LA APARICION DE LAS DE LA FILA AGENTE, FECHAS
    selectTypeTicket.addEventListener('change', function(){
        if((selectTypeTicket.value == 1 || selectTypeTicket.value == 2 || selectTypeTicket.value == 3)&&(selectStateTicket.value == 1 || selectStateTicket.value == 2 || selectStateTicket.value == 5)){
            optionTimeTickets.style.display = ''
            optionsAgentPeriodo.style.display = ''
            rowGenerateReport.style.display = ''
        }else{
            optionTimeTickets.style.display = 'none'
            optionsAgentPeriodo.style.display = 'none'
            rowGenerateReport.style.display = 'none'
        }
    });

    selectStateTicket.addEventListener('change', function(){
        if((selectTypeTicket.value == 1 || selectTypeTicket.value == 2 || selectTypeTicket.value == 3)&&(selectStateTicket.value == 1 || selectStateTicket.value == 2 || selectStateTicket.value == 5)){
            optionTimeTickets.style.display = ''
            optionsAgentPeriodo.style.display = ''
            rowGenerateReport.style.display = ''
        }else{
            optionTimeTickets.style.display = 'none'
            optionsAgentPeriodo.style.display = 'none'
            rowGenerateReport.style.display = 'none'
        }
    });

    // Manejar el cambio en los radio buttons
    $('input[name="radiosTicketsTime"]').change(function() {
        if ($('#radiosTicketsTime1').prop('checked')) {
            masNuevos = true;
            masAntiguos = false;
        } else if ($('#radiosTicketsTime2').prop('checked')) {
            masNuevos = false;
            masAntiguos = true;
        }
    });

    // FUNCIONAMIENTO DE SELECT DE AGENTES
    $("#agentesolicitado").on("change", function () {
        if(agentesolicitado.value != ''){
            colFechaInicio.style.display = '';
        }else{
            colFechaInicio.style.display = 'none';
        }
    })

    // FUNCIONAMIENTO DEL SELECT PARA LA FECHA DE INICIO
    inputDateStar.addEventListener('change', function(){
        if(inputDateStar.value != ''){
            colFechaFinal.style.display = ''
        }else{
            colFechaFinal.style.display = 'none'
        }
    })

    btnGenerateReport.addEventListener('click', function(){
        const objConsults = {
            tipoTicket: selectTypeTicket.value,
            estado: selectStateTicket.value,
            recientes: masNuevos,
            antiguos: masAntiguos,
            agente: agentesolicitado.value,
            fechaInicio: inputDateStar.value,
            fechaFin: inputDateEnd.value,
        }

        console.log(objConsults)
    })
})