$(document).ready(function () {
  $("#myTabs a").on("click", function (e) {
    e.preventDefault();
    $(this).tab("show");
  });

  const inputEmail = document.getElementById("inputEmail");
  const rowBtnNewUser = document.getElementById("rowBtnNewUser");
  const inputPassword = document.getElementById("inputPassword");
  const inputPasswordVerificacion = document.getElementById(
    "inputPasswordVerificacion"
  );
  const spanPasswordValid = document.getElementById('spanPasswordValid');

  //EVENTO DE VERIFICACION DE INPUTS DE CONTRASEÑA Y VALIDACION DE CONTRASEÑA
  inputPasswordVerificacion.addEventListener('input', function(){
    if(inputPassword.value != inputPasswordVerificacion.value){
        spanPasswordValid.style.display = '';
    }else{
        spanPasswordValid.style.display = 'none';
    }
  });
  //EVENTO DEL INPUT DE CORREO ELECTRONICO PARA HABILITAR EL BOTON
  inputEmail.addEventListener("input", function () {
    if (inputEmail.value != "") {
      rowBtnNewUser.style.display = "";
    } else {
      rowBtnNewUser.style.display = "none";
    }
  });

  $("form").submit(function (event) {
    event.preventDefault(); // Evitar que el formulario se envíe normalmente
    var form = $(this);

    $.post(form.attr("action"), form.serialize(), function (data) {
      // Verificar si la respuesta es exitosa
      if (data.status === "success") {
        // Mostrar un toast o alerta con el mensaje
        toastr.success(
          data.message,
          "Se ha creado la el usuario y el correo han sido enviados con exito."
        );

        // Recargar la página después de un breve retraso (por ejemplo, 1 segundo)
        setTimeout(function () {
          window.location.reload();
        }, 1000);
      } else {
        // Manejar otros casos o mostrar mensajes de error
        toastr.error("Error al crear el usuario agente: " + data.message, "Error");
      }
    }).fail(function (xhr, status, error) {
      // Manejar errores de la solicitud AJAX
      toastr.error("Error en la solicitud AJAX: " + error, "Error");
    });
  });
});
