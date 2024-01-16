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
  let projectsPorAsignar = [],
    projectsPorAsignarVeci = [];
    
  let fullName = `${infoUsuario.Nombre} ${infoUsuario.Apellido}`;
  textBienvenida.innerHTML = `Bienvenid@ ${
    infoUsuario.Nombre == null ? infoUsuario.username : fullName
  }`;


  if(infoUsuario.username == 'mafer' || infoUsuario.username == 'superadmin'){
    rowInfoAdmin.style.display = ''
  }else{
    rowInfoAdmin.style.display = 'none'
  }

  // CONSULTA A LA VISTA
  $.ajax({
    url: "get_tickets_cpanel/",
    method: "GET",
    success: function (data) {
      projectsPorAsignar = data.resultados_project_por_asignar;
      projectsPorAsignarVeci = data.projects_venci_no_asign;
      projectsProcess = data.resultados_project_process;
      projectsProcessVenci = data.projects_process_venci;
      projectsJustSuccess = data.resultados_project_just_success;
      projectsJustSuccessVenci = data.projects_just_success_venci;
      projectsSuccess = data.resultados_project_success;
      projectsSuccessVenci = data.projects_success_venci;
      
      if (projectsPorAsignar.length !== 0) {
        projectsPorAsignar.forEach(function (project) {
          const fullName = `${project.nombreAgente} ${project.ApellidoAgente}`;
          crearTablaRowFunction(
            bodyTableProyectos,
            fullName,
            project.idEstado,
            project
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
            project
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
            project
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
            project
          );
        });
      } else {
        const row = bodyTableProyectosProgressVenci.insertRow();
        const cell = row.insertCell();
        cell.innerHTML = "No hay proyectos que esten en proceso atrasados.";
        cell.style.textAlign = "center";
      }

      if(projectsJustSuccess.length != 0){
        projectsJustSuccess.forEach(function (project){
            const fullName = `${project.NombreAgente} ${project.ApellidoAgente}`
            crearTablaRowFunction(bodyTableProyectosEsperandoFinalizacion ,fullName, project.idEstado, project)
        })
      }else{
        const row = bodyTableProyectosEsperandoFinalizacion.insertRow();
        const cell = row.insertCell();
        cell.innerHTML = "No hay projectos que esten en espera de ser Finalizado."
        cell.style.textAlign = "center";
      }

      if(projectsJustSuccessVenci.length != 0){
        projectsJustSuccessVenci.forEach(function (project){
            const fullName = `${project.NombreAgente} ${project.ApellidoAgente}`
            crearTablaRowFunction(bodyTableProyectosEsperandoFinalizacionAtrasado ,fullName, project.idEstado, project)
        })
      }else{
        const row = bodyTableProyectosEsperandoFinalizacionAtrasado.insertRow();
        const cell = row.insertCell();
        cell.innerHTML = "No hay projectos que esten en espera de ser Finalizado que esten atrasados."
        cell.style.textAlign = "center";
      }
      
      if(projectsSuccess.length != 0){
        projectsSuccess.forEach(function (project){
            const fullName = `${project.NombreAgente} ${project.ApellidoAgente}`
            crearTablaRowFunction(bodyTableProyectosFinalizados ,fullName, project.idEstado, project)
        })
      }else{
        const row = bodyTableProyectosFinalizados.insertRow();
        const cell = row.insertCell();
        cell.innerHTML = "No hay projectos que esten en Finalizados."
        cell.style.textAlign = "center";
      }

      if(projectsSuccessVenci.length != 0){
        projectsSuccessVenci.forEach(function (project){
            const fullName = `${project.NombreAgente} ${project.ApellidoAgente}`
            crearTablaRowFunction(bodyTableProyectosFinalizadosAtrasados ,fullName, project.idEstado, project)
        })
      }else{
        const row = bodyTableProyectosFinalizadosAtrasados.insertRow();
        const cell = row.insertCell();
        cell.innerHTML = "No hay projectos que esten en Finalizados."
        cell.style.textAlign = "center";
      }

    //   NUMERO DE PROYECTOS
    numProjectNoAsign.textContent = `(${projectsPorAsignar.length})`
    numProjectNoAsignVenci.textContent = `(${projectsPorAsignarVeci.length})`
    numProjectProcess.textContent = `(${projectsProcess.length})`
    numProjectProcessVenci.textContent = `(${projectsProcessVenci.length})`
    numProjectJetFinish.textContent = `(${projectsJustSuccess.length})`
    numProjectJetFinishVenci.textContent = `(${projectsJustSuccessVenci.length})`
    numProjectFinish.textContent = `(${projectsSuccess.length})`
    numProjectFinishVenci.textContent = `(${projectsSuccessVenci.length})`

    },
    error: function (error) {
      console.error("Error al obtener los datos:", error);
    },
  });

  //FUNCION PARA LA CREACION DE TABLAS
  function crearTablaRowFunction(bodyTable, agent, idEstado ,project) {
    const row = bodyTable.insertRow();
    const cell = row.insertCell();
    if (idEstado != 1) {
      const cellAgente = row.insertCell();
      cellAgente.innerHTML = agent == undefined ? "" : agent;
      cellAgente.textAlign = "center";
    }

    cell.innerHTML = project.tituloProyecto;
    cell.style.textAlign = "center";

    // FUNCIONALIDAD DE LA FILA
    row.addEventListener("click", function () {
      console.log(project.idProyecto);
    });

    row.addEventListener("mouseover", function () {
      row.style.cursor = "pointer";
    });

    row.addEventListener("mouseout", function () {
      row.style.cursor = "default";
    });
  }
});
