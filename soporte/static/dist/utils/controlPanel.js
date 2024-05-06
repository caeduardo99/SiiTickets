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

  textBienvenida.textContent =
    infoUsuario.Nombre != ""
      ? `Bienvenid@ ${infoUsuario.Nombre} ${infoUsuario.Apellido}`
      : "Bienvenido empresa";

  // Consulta principal para la información de los tickets
  fetch("info_panel_contro/")
    .then((response) => response.json())
    .then((data) => {
        console.log(data)
        numTicketsComplete.textContent = `${data.numDayliTicketComplete} Tickets completos (Hoy)`;
        numTickestCompleteTotals.textContent = idUsuario.value == 2 ? `${data.numTicketsComplete} Tickets completados por los colaboradores hasta la fecha` :  `${data.numTicketsComplete} Tickets completados por/para este usuario hasta la fecha`;
        numTickestAwaitTotals.textContent = idUsuario.value == 2 ? `${data.numTicketAwait} Tickets pendientes de asignar a la fecha` : `${data.numTicketAwait} Tickets en espera del agente.`;
        numTicketsAwait.textContent = `${data.numTicketAwaitToDay} Tickets en espera (Hoy)`;
        numTicketProcess.textContent = `${data.numTicketProcess} Tickets en proceso (Hoy)`;
        numTicketProcessVenci.textContent = `${data.numTicketProcessVenci} Tickets en proceso con fecha atrasada`;

        tdTimeLastTicket.textContent = data.tiempoDiferenciaSoporte == "" ? 'No hay tickets creados para este usuario' : `Utimo ticket creado hace ${data.tiempoDiferenciaSoporte}`;
        tdTimeLastUpdate.textContent = data.timeDifUpdate == "" ? 'No hay actualizaciones creadas para este usuario': `Ultimo ticket creado hace ${data.timeDifUpdate}`;
        tdTimeDevelop.textContent =  data.timeDifDev == "" ? 'No hay desarrollos creados para este usuario' : `Ultimo ticket creado hace ${data.timeDifDev}`;

        // Graficar la informacion en el mapa
        let agentCount = {};
        var ticketCompletos = data.infoTicketComplete;
        ticketCompletos.forEach(obj => {
            console.log(obj)
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
});
