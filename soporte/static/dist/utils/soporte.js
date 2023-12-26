$(document).ready(function () {
    $('#myTabs a').on('click', function (e) {
        e.preventDefault();
        $(this).tab('show');
    });

    // Manejar la respuesta del servidor después de enviar el formulario
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
