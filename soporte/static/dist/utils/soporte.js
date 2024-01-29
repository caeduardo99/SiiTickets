$('#myTabs a').on('click', function (e) {
    e.preventDefault();
    $(this).tab('show');
    console.log('Se hizo clic en la pestaña');
});


document.addEventListener("DOMContentLoaded", function () {
    var inputTitleProject = document.getElementById("inputTitleProject");
    var spanTitleProject = document.getElementById("spanTitleProject");
    var rowSolicitante = document.getElementById("rowSolicitante");
    var rowAgente = document.getElementById("rowAgente");
    var rowButtonTask = document.getElementById("rowButtonTask");
    var rowButtonCreateTicket = document.getElementById("rowButtonCreateTicket");
    var rowTableTask = document.getElementById("rowTableTask");
    var form = document.querySelector('form');

    // Ocultar la fila Solicitante inicialmente
    rowSolicitante.style.display = "none";

    inputTitleProject.addEventListener("input", function () {
        var inputValue = inputTitleProject.value.trim();

        // Muestra u oculta los elementos según el contenido del textarea
        if (inputValue !== "") {
            rowSolicitante.style.display = "block";
            rowAgente.style.display = "block";
            rowButtonTask.style.display = "none";
            rowButtonCreateTicket.style.display = "block";
            rowTableTask.style.display = "none";
            spanTitleProject.style.display = "none";
        } else {
            rowSolicitante.style.display = "none";
            rowAgente.style.display = "none";
            rowButtonTask.style.display = "block";
            rowButtonCreateTicket.style.display = "block";
            rowTableTask.style.display = "none";
            spanTitleProject.style.display = "block";
        }
    });

    $('form').submit(function (event) {
        event.preventDefault();  // Evitar que el formulario se envíe normalmente

        var form = $(this);
        var formData = new FormData(form[0]);  // Crear un objeto FormData para manejar archivos

        $.ajax({
            url: form.attr('action'),
            type: 'POST',
            data: formData,
            contentType: false,  // No establecer el tipo de contenido, permitir que jQuery lo configure automáticamente
            processData: false,  // No procesar los datos, permitir que jQuery lo configure automáticamente
            success: function (data) {
                // Verificar si la respuesta es exitosa
                if (data.status === 'success') {
                    // Mostrar un toast o alerta con el mensaje
                    toastr.success(data.message, 'Éxito');

                    //Recargar la página después de un breve retraso (por ejemplo, 1 segundo)
                    setTimeout(function () {
                        window.location.reload();
                    }, 1000);
                } else {
                    // Manejar otros casos o mostrar mensajes de error
                    toastr.error('Error al crear el ticket: ' + data.message, 'Error');
                }
            },
            error: function (xhr, status, error) {
                // Manejar errores de la solicitud AJAX
                toastr.error('Error en la solicitud AJAX: ' + error, 'Error');
            }
        });
    });
});

