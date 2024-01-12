$(document).ready(function () {
  // VARIABLES PRINCIPALES
  const textBienvenida = document.getElementById("textBienvenida");
  const bodyTableProyectos = document.getElementById("bodyTableProyectos");

  let projectPorAgente = [];

  let fullName = `${infoUsuario.Nombre} ${infoUsuario.Apellido}`;
  textBienvenida.innerHTML = `Bienvenid@ ${
    infoUsuario.Nombre == null ? infoUsuario.username : fullName
  }`;

  // CONSULTA A LA VISTA
  $.ajax({
    url: "get_tickets_cpanel/",
    method: "GET",
    success: function (data) {
      projectPorAgente = data.project_por_agente;

      projectPorAgente.forEach(function (project) {
        const row = bodyTableProyectos.insertRow();
        const cell = row.insertCell();

        cell.innerHTML = project.tituloProyecto;
        cell.style.textAlign = "center"; // Aplica estilo para centrar el texto

        row.addEventListener("click", function () {
          console.log(project.idProyecto);
        });

        row.addEventListener("mouseover", function () {
          row.style.cursor = "pointer";
        });

        // Restaura el cursor a su valor predeterminado cuando el puntero sale de la fila
        row.addEventListener("mouseout", function () {
          row.style.cursor = "default";
        });
      });
    },
    
    error: function (error) {
      console.error("Error al obtener los datos:", error);
    },
  });
});
