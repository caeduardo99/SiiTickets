from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login as auth_login
from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout as logout_django
from django.shortcuts import render
from django.db import connections
import json
from django.conf import settings
from django.views.decorators.http import require_POST
from django.http import JsonResponse
from dateutil import parser
from django.core.mail import send_mail
import os
from .models import (
    TicketSoporte,
    TicketDesarrollo,
    ActividadPrincipal,
    ActividadSecundaria,
    ActividadPrincipalSoporte,
    ActividadPrincipalActualizacion,
    tipoAcceso,
    accesoEmpresas
)
from datetime import datetime, date
from django.contrib.auth.models import User, Group
from .models import Solicitante, EstadosTicket
from django.views.decorators.csrf import csrf_exempt
from .models import TicketSoporte, TicketActualizacion, ModuloSii4, Empresa
from django.contrib.auth.decorators import user_passes_test
from django.core.mail import EmailMessage
from collections import defaultdict
from django.utils import timezone


def login_user(request):
    # Verificar si el usuario ya está autenticado
    if request.user.is_authenticated:
        return redirect("view_control_panel")

    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        user = authenticate(request, username=username, password=password)

        if user is not None:
            auth_login(request, user)
            # Redirige a la página 'contact' después del inicio de sesión
            return redirect("view_control_panel")
        else:
            message = "Usuario o clave incorrectos!"

        context = {
            "message": message,
        }
        return render(request, "login.html", context)
    else:
        return render(request, "login.html")


@login_required
def signout(request):
    """
    Vista para el cierre de sesión.
    """
    logout_django(request)
    return redirect("/")


@login_required
def contact(request):
    nombre_usuario = request.user.username if request.user.is_authenticated else None
    nombre = request.user.first_name if request.user.is_authenticated else None
    apellido = request.user.last_name if request.user.is_authenticated else None
    full_name = nombre + " " + apellido

    context = {"nombre_usuario": nombre_usuario, "fullName": full_name}
    return render(request, "contact.html", context)


@login_required
def soporte(request):
    nombre_usuario = request.user.username if request.user.is_authenticated else None
    nombre = request.user.first_name if request.user.is_authenticated else None
    apellido = request.user.last_name if request.user.is_authenticated else None
    full_name = nombre + " " + apellido

    usuarios_grupo_1 = User.objects.filter(groups__id=1).values_list(
        "username", flat=True
    )

    if nombre_usuario in usuarios_grupo_1:
        # No mostrar el campo en este caso
        mostrar_campo = False
    else:
        # Mostrar el campo
        mostrar_campo = True

    # Llamar a la función solicitantes para obtener los resultados
    resultados_solicitantes = solicitantesjson(request)
    resultados_allSolicitantes = allSolicitnates(request)

    resultados_solicitantes_data = json.loads(resultados_solicitantes.content)
    resultados_allSolicitantes = json.loads(resultados_allSolicitantes.content)
    # Llamar a la función agentes para obtener los resultados
    resultados_agentes = agentesjson(request)

    resultados_agentes_data = json.loads(resultados_agentes.content)

    resultados_estados = estadosjson(request)

    resultados_estados_data = json.loads(resultados_estados.content)

    context = {
        "nombre_usuario": nombre_usuario,
        "mostrar_campo": mostrar_campo,
        "resultados_solicitantes_data": resultados_solicitantes_data,
        "all_solicitantes": resultados_allSolicitantes,
        "resultados_agentes_data": resultados_agentes_data,
        "resultados_estados_data": resultados_estados_data,
        "fullName": full_name,
    }
    return render(request, "soporte.html", context)


@login_required
def desarrollo(request):
    nombre_usuario = request.user.username if request.user.is_authenticated else None

    usuarios_grupo_1 = User.objects.filter(groups__id=1).values_list(
        "username", flat=True
    )
    nombre = request.user.first_name if request.user.is_authenticated else None
    apellido = request.user.last_name if request.user.is_authenticated else None
    full_name = nombre + " " + apellido

    consultGroupUser = """
    SELECT au.id AS idUser, au.first_name, aug.group_id 
 	FROM auth_user au
 	INNER JOIN auth_user_groups aug ON aug.user_id = au.id
 	WHERE au.username = %s
    """
    connection = connections["default"]

    resultados_solicitantes = solicitantesjson(request)
    resultados_allSolicitantes = allSolicitnates(request)
    resultados_solicitantes_data = json.loads(resultados_solicitantes.content)
    resultados_allSolicitantes = json.loads(resultados_allSolicitantes.content)
    resultados_agentes = agentesjson(request)

    resultados_agentes_data = json.loads(resultados_agentes.content)

    # CONSULTA
    with connection.cursor() as cursor:
        cursor.execute(consultGroupUser, [nombre_usuario])
        columns = [col[0] for col in cursor.description]
        resultados = [dict(zip(columns, row)) for row in cursor.fetchall()]

    context = {
        "nombre_usuario": nombre_usuario,
        "resultados_solicitantes_data": resultados_solicitantes_data,
        "resultados_agentes_data": resultados_agentes_data,
        "all_solicitantes": resultados_allSolicitantes,
        "resultados": resultados,
        "fullName": full_name,
    }
    return render(request, "desarrollo.html", context)


@login_required
def desarrolloact(request):
    nombre_usuario = request.user.username if request.user.is_authenticated else None
    nombre = request.user.first_name if request.user.is_authenticated else None
    apellido = request.user.last_name if request.user.is_authenticated else None
    full_name = nombre + " " + apellido

    consultGroupUser = """
        SELECT au.id AS idUser, au.first_name, aug.group_id 
     	FROM auth_user au
     	INNER JOIN auth_user_groups aug ON aug.user_id = au.id
     	WHERE au.username = %s
        """
    connection = connections["default"]

    # Llamar a la función solicitantes para obtener los resultados
    resultados_solicitantes = solicitantesjson(request)
    resultados_allSolicitantes = allSolicitnates(request)
    resultados_solicitantes_data = json.loads(resultados_solicitantes.content)

    # Llamar a la función agentes para obtener los resultados
    resultados_agentes = agentesjson(request)
    resultados_allSolicitantes = json.loads(resultados_allSolicitantes.content)
    resultados_agentes_data = json.loads(resultados_agentes.content)

    # Llamar a la función estados para obtener los resultados
    resultados_estados = estadosjson(request)

    resultados_estados_data = json.loads(resultados_estados.content)

    # Llamar a la función estados para obtener los resultados
    resultados_modulo = modulojson(request)

    resultados_modulos_data = json.loads(resultados_modulo.content)

    # CONSULTA
    with connection.cursor() as cursor:
        cursor.execute(consultGroupUser, [nombre_usuario])
        columns = [col[0] for col in cursor.description]
        resultados = [dict(zip(columns, row)) for row in cursor.fetchall()]

    context = {
        "nombre_usuario": nombre_usuario,
        "resultados_solicitantes_data": resultados_solicitantes_data,
        "resultados_agentes_data": resultados_agentes_data,
        "resultados_estados_data": resultados_estados_data,
        "resultados_modulos_data": resultados_modulos_data,
        "all_solicitantes": resultados_allSolicitantes,
        "resultados": resultados,
        "fullName": full_name,
    }
    return render(request, "desarrollo_actualizacion.html", context)


@login_required
@user_passes_test(lambda u: u.is_superuser or u.groups.filter(name="agentes").exists())
def empresas(request):
    nombre_usuario = request.user.username if request.user.is_authenticated else None
    nombre = request.user.first_name if request.user.is_authenticated else None
    apellido = request.user.last_name if request.user.is_authenticated else None
    full_name = nombre + " " + apellido

    resultados_empresas = empresasjson(request)

    resultados_empresas_data = json.loads(resultados_empresas.content)

    context = {
        "nombre_usuario": nombre_usuario,
        "resultados_solicitantes_data": resultados_empresas_data,
        "fullName": full_name,
    }
    return render(request, "empresas.html", context)


@login_required
@user_passes_test(lambda u: u.is_superuser or u.groups.filter(name="agentes").exists())
def modulos(request):
    nombre_usuario = request.user.username if request.user.is_authenticated else None
    nombre = request.user.first_name if request.user.is_authenticated else None
    apellido = request.user.last_name if request.user.is_authenticated else None
    full_name = nombre + " " + apellido

    resultados_modulos = modulojson(request)

    resultados_modulos_data = json.loads(resultados_modulos.content)

    context = {
        "nombre_usuario": nombre_usuario,
        "resultados_modulos_data": resultados_modulos_data,
        "fullName": full_name,
    }
    return render(request, "modulos.html", context)


@login_required
def usuariosSolicitantes(request):
    resultados_empresas = empresasjson(request)
    nombre_usuario = request.user.username if request.user.is_authenticated else None
    nombre = request.user.first_name if request.user.is_authenticated else None
    apellido = request.user.last_name if request.user.is_authenticated else None
    full_name = nombre + " " + apellido

    resultados_empresas_data = json.loads(resultados_empresas.content)

    context = {
        "nombre_usuario": nombre_usuario,
        "resultados_empresas_data": resultados_empresas_data,
        "fullName": full_name,
    }
    return render(request, "usuarios.html", context)


@login_required
def usuariosEmpresas(request):
    nombre_usuario = request.user.username if request.user.is_authenticated else None
    users = User.objects.all()
    resultados_empresas = empresasjson(request)
    resultados_empresas_data = json.loads(resultados_empresas.content)
    nombre = request.user.first_name if request.user.is_authenticated else None
    apellido = request.user.last_name if request.user.is_authenticated else None
    full_name = nombre + " " + apellido

    context = {
        "users": users,
        "nombre_usuario": nombre_usuario,
        "resultados_empresas_data": resultados_empresas_data,
        "fullName": full_name,
    }

    return render(request, "usuariosEmpresa.html", context)


@login_required
@user_passes_test(lambda u: u.is_superuser or u.groups.filter(name="agentes").exists())
def views_reports(request):
    nombre_usuario = request.user.username if request.user.is_authenticated else None
    nombre = request.user.first_name if request.user.is_authenticated else None
    apellido = request.user.last_name if request.user.is_authenticated else None
    full_name = nombre + " " + apellido

    # Llamar a la función solicitantes para obtener los resultados
    resultados_solicitantes = solicitantesjson(request)

    resultados_solicitantes_data = json.loads(resultados_solicitantes.content)

    # Llamar a la función agentes para obtener los resultados
    resultados_agentes = agentesjson(request)
    resultados_agentes_data = json.loads(resultados_agentes.content)
    resultados_estados = estadosjson(request)
    resultados_estados_data = json.loads(resultados_estados.content)

    # ESTADO DE LOS TICKETS
    consulta_estado = """
    SELECT * from soporte_estadosticket se WHERE se.id <> 3
    """
    connection = connections["default"]

    # Ejecutar la consulta SQL y obtener los resultados
    with connection.cursor() as cursor:
        cursor.execute(consulta_estado)
        columns = [col[0] for col in cursor.description]
        resultados = [dict(zip(columns, row)) for row in cursor.fetchall()]

    context = {
        "nombre_usuario": nombre_usuario,
        "resultados_solicitantes_data": resultados_solicitantes_data,
        "resultados_agentes_data": resultados_agentes_data,
        "resultados_estados_data": resultados_estados_data,
        "estados_tickets": resultados,
        "fullName": full_name,
    }
    return render(request, "reportes.html", context)


@login_required
def consultatareas_view(request):
    nombre_usuario = request.user.username if request.user.is_authenticated else None
    connection = connections["default"]
    with connection.cursor() as cursor:
        if nombre_usuario and nombre_usuario == "mafer":
            # Consulta para el usuario 'mafer'
            cursor.execute(
                """
                SELECT DISTINCT st.id, aps.descripcion as descripciontareas,
                (au.first_name || ' ' || au.last_name) AS agentetareas,
                aps.idestado_id as estado,
                aps.fechainicio, aps.fechafinal,
                se.id as idEstadoTicket, se.descripcion as estadoTicket,
               	st.fechaFinalizacion as fechaEstimadaTicket, st.fechaFinalizacionReal as fechaFinalizacionTicket
                FROM soporte_ticketsoporte st
                LEFT JOIN soporte_actividadprincipalsoporte aps ON st.id = aps.idTicketSoporte_id
                LEFT JOIN auth_user au ON aps.idAgente_id = au.id
                INNER JOIN soporte_estadosticket se ON se.id = st.idestado_id
            """
            )
        else:
            # Consulta para otros usuarios
            cursor.execute(
                """
                SELECT DISTINCT st.id, aps.descripcion as descripciontareas,
                (au.first_name || ' ' || au.last_name) AS agentetareas,
                aps.idestado_id as estado,
                aps.fechainicio, aps.fechafinal,
                se.id as idEstadoTicket, se.descripcion as estadoTicket,
               	st.fechaFinalizacion as fechaEstimadaTicket, st.fechaFinalizacionReal as fechaFinalizacionTicket
                FROM soporte_ticketsoporte st
                LEFT JOIN soporte_actividadprincipalsoporte aps ON st.id = aps.idTicketSoporte_id
                LEFT JOIN auth_user au ON aps.idAgente_id = au.id
                INNER JOIN soporte_estadosticket se ON se.id = st.idestado_id
                WHERE au.username = %s
            """,
                [nombre_usuario],
            )

        # Obtener los resultados de la consulta
        columns = [col[0] for col in cursor.description]
        result = [dict(zip(columns, row)) for row in cursor.fetchall()]

    # Devolver la respuesta como JSON
    return JsonResponse(result, safe=False)


@login_required
def view_control_panel(request):
    nombre_usuario = request.user.username if request.user.is_authenticated else None
    nombre = request.user.first_name if request.user.is_authenticated else None
    apellido = request.user.last_name if request.user.is_authenticated else None
    full_name = nombre + " " + apellido

    consulta_info_agente = """
    SELECT au.id as idUsuario, au.username, au.first_name as Nombre, au.last_name as Apellido
	FROM auth_user au 
    WHERE au.username = %s
    """
    connection = connections["default"]

    # Ejecutar la consulta SQL y obtener los resultados
    with connection.cursor() as cursor:
        cursor.execute(consulta_info_agente, [nombre_usuario])
        columns = [col[0] for col in cursor.description]
        resultados_info_user = [dict(zip(columns, row)) for row in cursor.fetchall()]

    context = {
        "nombre_usuario": nombre_usuario,
        "info_user": resultados_info_user[0],
        "fullName": full_name,
    }

    return render(request, "panelControl.html", context)


########## BACKEND ##################


def solicitantesjson(request):
    # Obtener el nombre de usuario logeado
    nombre_usuario = request.user.username if request.user.is_authenticated else None
    nombre = request.user.first_name if request.user.is_authenticated else None

    # Construir la primera consulta SQL
    consulta_sql = """
        SELECT ss.id, ss.nombreApellido, se.nombreEmpresa 
        FROM soporte_solicitante ss
        INNER JOIN soporte_empresa se ON se.id = ss.idEmpresa_id
    """

    resultados = []  # Inicializar la variable de resultados

    # Agregar condición de filtro si hay un nombre de usuario logeado
    if nombre_usuario:
        consulta_sql += " WHERE se.nombreEmpresa LIKE %s;"

        connection = connections["default"]

        # Ejecutar la primera consulta SQL y obtener los resultados
        with connection.cursor() as cursor:
            cursor.execute(consulta_sql, ["%" + nombre + "%"])
            columns = [col[0] for col in cursor.description]
            resultados = [dict(zip(columns, row)) for row in cursor.fetchall()]

    # Si la primera consulta devuelve un conjunto vacío, ejecutar la segunda consulta sin la condición WHERE
    if len(resultados) == []:
        connection = connections["default"]
        with connection.cursor() as cursor:
            cursor.execute(consulta_sql.replace("WHERE se.nombreEmpresa = %s", ""))
            columns = [col[0] for col in cursor.description]
            resultados = [dict(zip(columns, row)) for row in cursor.fetchall()]
    
    # Devolver la respuesta JSON
    return JsonResponse(resultados, safe=False)


def allSolicitnates(request):
    # Construir la primera consulta SQL
    consulta_sql = """
        SELECT ss.id, ss.nombreApellido, se.nombreEmpresa 
        FROM soporte_solicitante ss
        INNER JOIN soporte_empresa se ON se.id = ss.idEmpresa_id
    """

    resultados = []  # Inicializar la variable de resultados
    connection = connections["default"]

    # Ejecutar la primera consulta SQL y obtener los resultados
    with connection.cursor() as cursor:
        cursor.execute(consulta_sql)
        columns = [col[0] for col in cursor.description]
        resultados = [dict(zip(columns, row)) for row in cursor.fetchall()]

    # Devolver la respuesta JSON
    return JsonResponse(resultados, safe=False)


def agentesjson(request):
    # Construir la consulta SQL
    consulta_sql = """
    SELECT au.id, au.first_name || ' ' || au.last_name AS full_name, aug.group_id 
    FROM auth_user au 
    INNER JOIN auth_user_groups aug ON aug.user_id = au.id
    WHERE aug.group_id <> 1 AND au.id <> 2 AND au.id <> 1 AND au.id <> 126
    """
    connection = connections["default"]

    # Ejecutar la consulta SQL y obtener los resultados
    with connection.cursor() as cursor:
        cursor.execute(consulta_sql)
        columns = [col[0] for col in cursor.description]
        resultados = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
    # Devolver la respuesta JSON
    return JsonResponse(resultados, safe=False)


def estadosjson(request):
    # Construir la consulta SQL
    consulta_sql = """
    select * from soporte_estadosticket se 
    """
    connection = connections["default"]

    # Ejecutar la consulta SQL y obtener los resultados
    with connection.cursor() as cursor:
        cursor.execute(consulta_sql)
        columns = [col[0] for col in cursor.description]
        resultados = [dict(zip(columns, row)) for row in cursor.fetchall()]

    # Devolver la respuesta JSON
    return JsonResponse(resultados, safe=False)


def modulojson(request):
    # Construir la consulta SQL
    consulta_sql = """
    select * from soporte_modulosii4 se 
    """
    connection = connections["default"]
    # Ejecutar la consulta SQL y obtener los resultados
    with connection.cursor() as cursor:
        cursor.execute(consulta_sql)
        columns = [col[0] for col in cursor.description]
        resultados = [dict(zip(columns, row)) for row in cursor.fetchall()]
    # Devolver la respuesta JSON
    return JsonResponse(resultados, safe=False)


def empresasjson(request):
    # Construir la consulta SQL
    consulta_sql = """
    select * from soporte_empresa se 
    """
    connection = connections["default"]

    # Ejecutar la consulta SQL y obtener los resultados
    with connection.cursor() as cursor:
        cursor.execute(consulta_sql)
        columns = [col[0] for col in cursor.description]
        resultados = [dict(zip(columns, row)) for row in cursor.fetchall()]

    # Devolver la respuesta JSON
    return JsonResponse(resultados, safe=False)


def clienteconsultajson(request):
    ruc_parametro = request.GET.get("ruc", "valor_predeterminado")
    # Construir la consulta SQL
    consulta_sql = """
   SELECT 
    nombre,
    ruc,
    direccion1,
    telefono1,
    email,
    fechagrabado
FROM 
    dbo.fn_TabletClientesjson('0102070612aq')  WHERE ruc = %s
    """
    connection = connections["sql_server"]
    # Ejecutar la consulta SQL y obtener los resultados
    with connection.cursor() as cursor:
        cursor.execute(consulta_sql, [ruc_parametro])
        columns = [col[0] for col in cursor.description]
        resultados = [dict(zip(columns, row)) for row in cursor.fetchall()]
    # Devolver la respuesta JSON
    return JsonResponse(resultados, safe=False)


def solicitantescreados(request):
    # Construir la consulta SQL
    consulta_sql = """
    select ss.id as NumSolicitante, ss.ruc as Ruc, ss.nombreApellido as Nombre,
    ss.telefonoSolicitante as Telefono, ss.direccion as Direccion, ss.correo as Correo,
    se.id as idEmpresa, se.nombreEmpresa as Empresa
    from soporte_solicitante ss
    left join soporte_empresa se on se.id = ss.idEmpresa_id 
        """
    connection = connections["default"]

    # Ejecutar la consulta SQL y obtener los resultados
    with connection.cursor() as cursor:
        cursor.execute(consulta_sql)
        columns = [col[0] for col in cursor.description]
        resultados = [dict(zip(columns, row)) for row in cursor.fetchall()]

    # Devolver la respuesta JSON
    return JsonResponse(resultados, safe=False)


def ticketsoportescreados(request):
    nombre_usuario = request.user.username if request.user.is_authenticated else None
    id_usuario = request.user.id if request.user.is_authenticated else None
    nombre = request.user.first_name if request.user.is_authenticated else None

    consulta_sql = """"""
    if id_usuario == 2 or id_usuario == 1 or id_usuario == 126:
        consulta_sql += """
        select st.id as NumTicket, st.comentario, st.asunto, st.chat, st.facturar, st.causaerror, st.fechaCreacion as fechaCreacionTicket, st.fechaInicio as fechaInicioTicket, st.fechaFinalizacion as fechaFinalizacionTicket, st.fechaFinalizacionReal as fechaFinalizacionRealTicket, st.prioridad,
        au.id as idAgente, au.first_name as NombreAgente, au.last_name as ApellidoAgente,
        ss.id as idSolicitante, ss.nombreApellido as fullNameSolicitante,
        se.id as idEstado, se.descripcion as estado,
        sa.id as idActividad, sa.descripcion as actividad, sa.imagen_actividades as imagen, sa.fechainicio as fechaInicioActividad, sa.fechafinal as fechaFinalActividad,
        se2.id as idEstadoActividad, se2.descripcion as estadoActividad,
        se3.id as idEmpresa, se3.nombreEmpresa
        FROM soporte_ticketsoporte st 
        INNER JOIN auth_user au ON au.id  = st.idAgente_id 
        INNER JOIN soporte_solicitante ss ON ss.id  = st.idSolicitante_id 
        INNER JOIN soporte_estadosticket se ON se.id = st.idestado_id 
        LEFT JOIN soporte_empresa se3 ON se3.id = ss.idEmpresa_id 
        LEFT JOIN soporte_actividadprincipalsoporte sa ON sa.idTicketSoporte_id = st.id 
        LEFT JOIN soporte_estadosticket se2 ON se2.id = sa.idestado_id
        """
    else:
        consulta_sql += """
        select st.id as NumTicket, st.comentario, st.asunto, st.chat, st.facturar, st.causaerror, st.fechaCreacion as fechaCreacionTicket, st.fechaInicio as fechaInicioTicket, st.fechaFinalizacion as fechaFinalizacionTicket, st.fechaFinalizacionReal as fechaFinalizacionRealTicket, st.prioridad,
        au.id as idAgente, au.first_name as NombreAgente, au.last_name as ApellidoAgente,
        ss.id as idSolicitante, ss.nombreApellido as fullNameSolicitante,
        se.id as idEstado, se.descripcion as estado,
        sa.id as idActividad, sa.descripcion as actividad, sa.imagen_actividades as imagen, sa.fechainicio as fechaInicioActividad, sa.fechafinal as fechaFinalActividad,
        se2.id as idEstadoActividad, se2.descripcion as estadoActividad,
        se3.id as idEmpresa, se3.nombreEmpresa
        FROM soporte_ticketsoporte st 
        INNER JOIN auth_user au ON au.id  = st.idAgente_id 
        INNER JOIN soporte_solicitante ss ON ss.id  = st.idSolicitante_id 
        INNER JOIN soporte_estadosticket se ON se.id = st.idestado_id 
        INNER JOIN soporte_empresa se3 ON se3.id = ss.idEmpresa_id 
        LEFT JOIN soporte_actividadprincipalsoporte sa ON sa.idTicketSoporte_id = st.id 
        LEFT JOIN soporte_estadosticket se2 ON se2.id = sa.idestado_id  
        WHERE (sa.idAgente_id = %s OR au.username = %s)
        """

    consulta_info_empresa = """
    SELECT * FROM soporte_empresa se WHERE se.email = %s
    """

    consulta_get_projects = """
select st.id as NumTicket, st.comentario, st.asunto, st.chat, st.facturar, st.causaerror, st.fechaCreacion as fechaCreacionTicket, st.fechaInicio as fechaInicioTicket, st.fechaFinalizacion as fechaFinalizacionTicket, st.fechaFinalizacionReal as fechaFinalizacionRealTicket, st.prioridad,
        au.id as idAgente, au.first_name as NombreAgente, au.last_name as ApellidoAgente,
        ss.id as idSolicitante, ss.nombreApellido as fullNameSolicitante,
        se.id as idEstado, se.descripcion as estado,
        sa.id as idActividad, sa.descripcion as actividad, sa.imagen_actividades as imagen, sa.fechainicio as fechaInicioActividad, sa.fechafinal as fechaFinalActividad,
        se2.id as idEstadoActividad, se2.descripcion as estadoActividad,
        se3.id as idEmpresa, se3.nombreEmpresa
        FROM soporte_ticketsoporte st 
        INNER JOIN auth_user au ON au.id  = st.idAgente_id 
        INNER JOIN soporte_solicitante ss ON ss.id  = st.idSolicitante_id 
        INNER JOIN soporte_estadosticket se ON se.id = st.idestado_id 
        LEFT JOIN soporte_empresa se3 ON se3.id = ss.idEmpresa_id 
        LEFT JOIN soporte_actividadprincipalsoporte sa ON sa.idTicketSoporte_id = st.id 
        LEFT JOIN soporte_estadosticket se2 ON se2.id = sa.idestado_id
    WHERE ss.id = %s
    """

    connection = connections["default"]

    # Ejecutar la consulta SQL y obtener los resultados
    with connection.cursor() as cursor:
        if id_usuario == 2 or id_usuario == 1 or id_usuario == 126:
            cursor.execute(consulta_sql)
        else:
            cursor.execute(consulta_sql, [id_usuario, nombre_usuario])

        columns = [col[0] for col in cursor.description]
        resultados = [dict(zip(columns, row)) for row in cursor.fetchall()]

    if len(resultados) != 0:
        return JsonResponse(resultados, safe=False)
    else:
        nombre_empresa = nombre
        # En el caso de que sea una empresa
        consulta_get_projects = consulta_get_projects.replace(
            "WHERE ss.id = %s", "WHERE se3.nombreEmpresa = %s"
        )
        with connection.cursor() as cursor:
            cursor.execute(consulta_get_projects, [nombre_empresa])
            columns = [col[0] for col in cursor.description]
            resultados_empresa_tickets = [
                dict(zip(columns, row)) for row in cursor.fetchall()
            ]

        return JsonResponse(resultados_empresa_tickets, safe=False)


def generateReport(request):
    consulta = ""
    tipo_ticket = request.GET.get("tipo_ticket")
    estado_ticket = request.GET.get("estado_ticket")
    masNuevos = request.GET.get("recientes")
    masAntiguos = request.GET.get("antiguos")
    idAgente = request.GET.get("agente")
    fechaInicio = request.GET.get("fechaInicio")
    fechaFin = request.GET.get("fechaFin")

    if tipo_ticket == "1":
        consulta = """
        select st.id,st.comentario,se.descripcion as Estado, st.fechafinalizacion as fechaFinalizacionEstimada, st.idAgente_id as idAgenteAdministrador,st.fechacreacion as fechaCreacion,
                au.first_name as Nombre, au.last_name as Apellido,
                sa.id as idActividad, sa.descripcion as actividad, sa.minutosTrabajados,
                au2.id as idAgenteActividad, au2.first_name as NombreAgente, au2.last_name as ApellidoAgente
                from soporte_ticketsoporte st
        LEFT JOIN soporte_estadosticket se ON se.id = st.idestado_id
        LEFT JOIN auth_user au ON au.id = st.idAgente_id
        LEFT JOIN soporte_actividadprincipalsoporte sa ON sa.idTicketSoporte_id = st.id 
        LEFT JOIN auth_user au2 ON au2.id = sa.idAgente_id
        """
    elif tipo_ticket == "2":
        consulta = """
        SELECT st.*, se.descripcion as Estado, au.first_name as Nombre, au.last_name as Apellido FROM soporte_ticketactualizacion st 
        INNER JOIN soporte_estadosticket se ON se.id = st.idestado_id
        INNER JOIN auth_user au ON au.id = st.idAgente_id
        """
    elif tipo_ticket == "3":
        consulta = """
        SELECT st.*, se.descripcion as Estado, au.first_name as Nombre, au.last_name as Apellido FROM soporte_ticketdesarrollo st 
        INNER JOIN soporte_estadosticket se ON se.id = st.idestado_id
        INNER JOIN auth_user au ON au.id = st.idAgente_id
        """

    if estado_ticket is not None and estado_ticket != "":
        if estado_ticket == "0":
            consulta += f"WHERE (st.idestado_id = 1  OR st.idestado_id = 2 OR st.idestado_id = 3 OR st.idestado_id = 4 OR st.idestado_id = 5 OR st.idestado_id = 6)"
        else:
            consulta += f" WHERE st.idestado_id = {estado_ticket}"

    if idAgente != "":
        consulta += f" AND sa.idAgente_id = {idAgente}"

    if fechaInicio != "" and fechaFin == "":
        consulta += f" AND DATE(st.fechaCreacion) = '{fechaInicio}'"

    if fechaFin != "" and fechaInicio == "":
        consulta += f" AND st.fechaCreacion >= '1900-01-01' AND st.fechaCreacion <= '{fechaFin}'"

    if fechaInicio != "" and fechaFin != "":
        consulta += f" AND st.fechaCreacion >= '{fechaInicio}' AND st.fechaCreacion <= '{fechaFin}'"

    if masNuevos == "true":
        consulta += f" ORDER BY st.fechaCreacion DESC"

    if masAntiguos == "true":
        consulta += f" ORDER BY st.fechaCreacion"

    connection = connections["default"]
    
    # Ejecutar la consulta SQL y obtener los resultados
    with connection.cursor() as cursor:
        cursor.execute(consulta)
        columns = [col[0] for col in cursor.description]
        resultados = [dict(zip(columns, row)) for row in cursor.fetchall()]
    return JsonResponse(resultados, safe=False)


def getInfoReport(request, id_ticket):
    consulta_general = """
    SELECT st.id, st.tituloProyecto, st.descripcionActividadGeneral, st.fechaCreacion, st.fechaFinalizacionEstimada, st.horasCompletasProyecto,
	au.id as idAgenteAdministrador, au.first_name as NombreAgenteAdministrador, au.last_name as ApellidoAgenteAdministrador,
	ss.id as idSolicitante, ss.nombreApellido as NombreCompletoSolicitante, ss.ruc as RucSolicitante, ss.direccion as direccionSolicitante,
	se.id as idEstado, se.descripcion as EstadoProyecto,
	se2.id as idEmpresa, se2.nombreEmpresa
	FROM soporte_ticketdesarrollo st
	INNER JOIN auth_user au ON au.id = st.idAgente_id
	INNER JOIN soporte_solicitante ss ON ss.id = st.idSolicitante_id
	INNER JOIN soporte_estadosticket se ON se.id = st.idestado_id
	INNER JOIN soporte_empresa se2 ON se2.id = ss.idEmpresa_id
	WHERE st.id = %s
    """
    consulta_actividad_principal = """
    SELECT sa.id as idActividadPrincipal, sa.descripcion as actividadPrincipal, sa.horasDiariasAsignadas as horasPrincipales,
	au.id as idAgenteActividad, au.first_name as NombreAgenteActividad, au.last_name as ApellidoActividad,
	se.id as idEstadoActividad, se.descripcion as EstadoActividad,
	ss.id as idSolicitante, ss.nombreApellido as fullNameSolicitante, 
	se2.id as idEmpresa, se2.nombreEmpresa
	FROM soporte_ticketdesarrollo st
	INNER JOIN soporte_actividadprincipal sa ON sa.idTicketDesarrollo_id = st.id
	INNER JOIN soporte_solicitante ss ON ss.id = st.idSolicitante_id
	INNER JOIN auth_user au ON au.id = sa.idAgente_id 
	INNER JOIN soporte_empresa se2 ON se2.id = ss.idEmpresa_id 
	INNER JOIN soporte_estadosticket se ON se.id = sa.idestado_id  
	WHERE st.id = %s
    """
    consulta_actividad_secundaria = """
    SELECT sa2.id as idActividadSecundaria, sa2.descripcion as actividadSecundaria, sa2.horasDiariasAsignadas as horasDiarias, sa2.fechaDesarrollo, st.id as idProyecto, st.tituloProyecto,
	sa.idAgente_id as idAgente, au.first_name as NombreAgente, au.last_name as ApellidoAgente,
	se.id as idEstadoActividad, se.descripcion as EstadoActividad,
	ss.id as idSolicitante, ss.nombreApellido fullNameSolicitante,
	se2.id as idEmpresa, se2.nombreEmpresa
	FROM soporte_ticketdesarrollo st 
	INNER JOIN soporte_actividadprincipal sa ON sa.idTicketDesarrollo_id = st.id
	INNER JOIN soporte_actividadsecundaria sa2 ON sa2.idActividadPrincipal_id = sa.id
	INNER JOIN auth_user au ON au.id = sa.idAgente_id 
	INNER JOIN soporte_estadosticket se ON se.id = sa2.idestado_id
	INNER JOIN soporte_solicitante ss ON ss.id = st.idSolicitante_id 
	INNER JOIN soporte_empresa se2 ON se2.id = ss.idEmpresa_id 
	WHERE st.id = %s
    """
    connection = connections["default"]
    # Ejecutar la consulta SQL y obtener los resultados
    with connection.cursor() as cursor:
        cursor.execute(consulta_general, [id_ticket])
        columns = [col[0] for col in cursor.description]
        resultados_info_general = [dict(zip(columns, row)) for row in cursor.fetchall()]

    with connection.cursor() as cursor:
        cursor.execute(consulta_actividad_principal, [id_ticket])
        columns = [col[0] for col in cursor.description]
        resultados_actividad_principal = [
            dict(zip(columns, row)) for row in cursor.fetchall()
        ]

    with connection.cursor() as cursor:
        cursor.execute(consulta_actividad_secundaria, [id_ticket])
        columns = [col[0] for col in cursor.description]
        resultados_actividad_secundaria = [
            dict(zip(columns, row)) for row in cursor.fetchall()
        ]

    # Extraer las propiedades del objeto y adjuntar las horas para determinar el trabajo realizado por AGENTE
    agrupado_por_agente = defaultdict(
        lambda: {
            "idAgente": None,
            "idEstadoActividad": None,
            "horasPrincipales": 0,
            "NombreAgente": None,
            "EstadoActividad": None,
        }
    )

    for obj in resultados_actividad_secundaria:
        if obj["idEstadoActividad"] == 5:
            id_agente = obj["idAgente"]
            agrupado_por_agente[id_agente]["idAgente"] = id_agente
            agrupado_por_agente[id_agente]["idEstadoActividad"] = obj[
                "idEstadoActividad"
            ]
            agrupado_por_agente[id_agente]["NombreAgente"] = obj["NombreAgente"]
            agrupado_por_agente[id_agente]["ApellidoAgente"] = obj["ApellidoAgente"]
            agrupado_por_agente[id_agente]["EstadoActividad"] = obj["EstadoActividad"]
            agrupado_por_agente[id_agente]["horasPrincipales"] += obj["horasDiarias"]

    horas_agente = list(agrupado_por_agente.values())

    # Extraer las propiedades del objeto y adjuntar las horas para determinar el trabajo realizado por EMPRESA
    agrupado_por_empresa = defaultdict(
        lambda: {
            "idEmpresa": None,
            "idEstadoActividad": None,
            "horasPrincipales": 0,
            "nombreEmpresa": None,
            "ApellidoAgente": None,
            "EstadoActividad": None,
        }
    )
    for obj in resultados_actividad_secundaria:
        if obj["idEstadoActividad"] == 5:
            id_empresa = obj["idEmpresa"]
            agrupado_por_empresa[id_empresa]["idEmpresa"] = id_empresa
            agrupado_por_empresa[id_empresa]["idEstadoActividad"] = obj[
                "idEstadoActividad"
            ]
            agrupado_por_empresa[id_empresa]["nombreEmpresa"] = obj["nombreEmpresa"]
            agrupado_por_empresa[id_empresa]["EstadoActividad"] = obj["EstadoActividad"]
            agrupado_por_empresa[id_empresa]["horasPrincipales"] += obj["horasDiarias"]

    horas_empresa = list(agrupado_por_empresa.values())

    # Extraer las propiedades del objeto y adjuntar las horas para determinar el trabajo realizado por PROYECTO
    agrupado_por_proyecto = defaultdict(
        lambda: {
            "idProyecto": None,
            "idEstadoActividad": None,
            "horasPrincipales": 0,
            "tituloProyecto": None,
            "EstadoActividad": None,
        }
    )

    for obj in resultados_actividad_secundaria:
        if obj["idEstadoActividad"] == 5:
            id_proyect = obj["idProyecto"]
            agrupado_por_proyecto[id_proyect]["idProyecto"] = id_proyect
            agrupado_por_proyecto[id_proyect]["idEstadoActividad"] = obj[
                "idEstadoActividad"
            ]
            agrupado_por_proyecto[id_proyect]["tituloProyecto"] = obj["tituloProyecto"]
            agrupado_por_proyecto[id_proyect]["EstadoActividad"] = obj[
                "EstadoActividad"
            ]
            agrupado_por_proyecto[id_proyect]["horasPrincipales"] += obj["horasDiarias"]

    horas_proyecto = list(agrupado_por_proyecto.values())

    context = {
        "infoGeneralProject": resultados_info_general[0],
        "tasksMain": resultados_actividad_principal,
        "tasksSecundary": resultados_actividad_secundaria,
        "hourWorkAgent": horas_agente,
        "hourWorkEnterprise": horas_empresa,
        "hourWorlProject": horas_proyecto,
    }

    return JsonResponse(context, safe=False)


def getInfoReportSoport(request, id_ticket):
    consulta_general = """
    SELECT st.id as idTicket, st.fechaCreacion as fechaCreacion, st.asunto , st.fechaInicio, st.comentario,
	st.prioridad, st.facturar, st.causaerror, st.imagenes as imagenProblema, st.fechaFinalizacion as fechaFinalizacionTicket,
	st.fechaFinalizacionReal as fechaFinalizacionRealTicket,st.facturar, 
	au.id as idAgenteAdministrador, au.first_name as NombreAgente, au.last_name as ApellidoAgente,
	ss.id as idSolicitante, ss.ruc as Ruc, ss.nombreApellido as NombreCompletoSolicitante, ss.correo as mailSolicitante,
	se.id as idEmpresaSolicitante, se.nombreEmpresa as NombreEmpresaSolicitante,
	se2.id as estadoTicket, se2.descripcion as estadoTicket
	FROM soporte_ticketsoporte st
	INNER JOIN auth_user au ON au.id = st.idAgente_id 
	INNER JOIN soporte_solicitante ss ON ss.id = st.idSolicitante_id 
	INNER JOIN soporte_empresa se ON se.id = ss.idEmpresa_id 
	INNER JOIN soporte_estadosticket se2 ON se2.id = st.idestado_id
	WHERE st.id = %s
    """
    consulta_actividades = """
    SELECT st.id as idTicket, sa.id as idActividad, sa.descripcion as descripcionActividad, sa.imagen_actividades, sa.fechainicio,
	sa.fechafinal, sa.minutosTrabajados,
	sa.idAgente_id as idAgenteActividad, au.first_name as NombreAgenteActividad, au.last_name as ApellidoAgenteActividad,
	se.id as idEstadoActividad, se.descripcion as estadoActividad
	FROM soporte_ticketsoporte st 
	INNER JOIN soporte_actividadprincipalsoporte sa ON sa.idTicketSoporte_id = st.id 
	INNER JOIN auth_user au ON au.id = sa.idAgente_id
	INNER JOIN soporte_estadosticket se ON se.id = sa.idestado_id 
    WHERE st.id = %s
    """
    connection = connections["default"]
    # Ejecutar la consulta SQL y obtener los resultados
    with connection.cursor() as cursor:
        cursor.execute(consulta_general, [id_ticket])
        columns = [col[0] for col in cursor.description]
        resultados_info_general = [dict(zip(columns, row)) for row in cursor.fetchall()]

    with connection.cursor() as cursor:
        cursor.execute(consulta_actividades, [id_ticket])
        columns = [col[0] for col in cursor.description]
        resultados_info_actividades = [
            dict(zip(columns, row)) for row in cursor.fetchall()
        ]

    # Extraer las propiedades del objeto y adjuntar las horas para determinar el trabajo realizado por AGENTE
    agrupado_por_agente = defaultdict(
        lambda: {
            "idAgenteActividad": None,
            "idEstadoActividad": None,
            "NombreAgenteActividad": None,
            "estadoActividad": None,
        }
    )

    for obj in resultados_info_actividades:
        if obj["idEstadoActividad"] == 5:
            id_agente = obj["idAgenteActividad"]
            agrupado_por_agente[id_agente]["idAgenteActividad"] = id_agente
            agrupado_por_agente[id_agente]["idEstadoActividad"] = obj[
                "idEstadoActividad"
            ]
            agrupado_por_agente[id_agente]["NombreAgenteActividad"] = obj[
                "NombreAgenteActividad"
            ]
            agrupado_por_agente[id_agente]["ApellidoAgenteActividad"] = obj[
                "ApellidoAgenteActividad"
            ]
            agrupado_por_agente[id_agente]["estadoActividad"] = obj["estadoActividad"]

    horas_agente = list(agrupado_por_agente.values())

    context = {
        "ticket": resultados_info_general,
        "actividades": resultados_info_actividades,
        "hourWorkAgent": horas_agente,
    }
    return JsonResponse(context, safe=False)


def getInfoActualizacionReport(request, id_ticket):
    consulta_general = """
    SELECT st.*, 
	ss.id as idSolicitante, ss.nombreApellido,
	se.id as idEstado, se.descripcion as estado,
	au.id as idAgente, au.first_name as nombreAgente, au.last_name as apellidoAgente,
	se2.id as idEmpresa, se2.nombreEmpresa 
	FROM soporte_ticketactualizacion st 
	INNER JOIN auth_user au ON au.id = st.idAgente_id
	INNER JOIN soporte_solicitante ss ON ss.id = st.idSolicitante_id
	INNER JOIN soporte_estadosticket se ON se.id = st.idestado_id
	INNER JOIN soporte_empresa se2 ON se2.id = ss.idEmpresa_id
    WHERE st.id = %s
    """
    connection = connections["default"]
    # Ejecutar la consulta SQL y obtener los resultados
    with connection.cursor() as cursor:
        cursor.execute(consulta_general, [id_ticket])
        columns = [col[0] for col in cursor.description]
        resultados_info_general = [dict(zip(columns, row)) for row in cursor.fetchall()]

    context = {
        "infoGeneralProject": resultados_info_general[0],
    }

    return JsonResponse(context, safe=False)


def getNumberInfo(request, id_agente):
    consult = """
    select au.phone from auth_user au WHERE au.id = %s"""
    connection = connections["default"]
    with connection.cursor() as cursor:
        cursor.execute(consult, [id_agente])
        columns = [col[0] for col in cursor.description]
        resultados = [dict(zip(columns, row)) for row in cursor.fetchall()]

    return JsonResponse(resultados, safe=False)


@require_POST
@csrf_exempt
def addImgAlter(request, id_ticket):
    try:
        image_file = request.FILES.get("image")
        if image_file:
            image_name = image_file.name
            path = os.path.join(settings.MEDIA_ROOT, "ticket_images", image_name)
            with open(path, "wb") as f:
                for chunk in image_file.chunks():
                    f.write(chunk)
            actividad_soporte = TicketSoporte.objects.get(id=id_ticket)
            img = str(actividad_soporte.imagenes) + f",ticket_images/{image_name}"
            actividad_soporte.imagenes = img;
            actividad_soporte.save()

            return JsonResponse({"status": "success"})
        else:
            return JsonResponse(
                {"status": "error", "message": "No se recibió ninguna imagen"},
                status=400,
            )
    except Exception as e:
        return JsonResponse(
            {"status": "error", "message": f"Error al crear la imagen: {str(e)}"},
            status=400,
        )


def ticketsActualizacionCreados(request):
    nombre_usuario = request.user.username if request.user.is_authenticated else None
    id_usuario = request.user.id if request.user.is_authenticated else None
    email_usuario = request.user.email if request.user.is_authenticated else None

    consulta_sql = """"""
    if id_usuario == 2 or id_usuario == 1:
        consulta_sql += """
        SELECT st.id as NumTicket, sm.modulo as Modulo, ss.id as idSolicitante,ss.nombreapellido as Solicitante, st.descripcionGeneral,
        st.prioridad as Prioridad, ses.id as idEstado,ses.descripcion as Estado,se.nombreEmpresa as NombreEmpresa,
        sm2.id as idModulo, st.fechaCreacion, st.fechaInicio as fechaAsignacion, st.fechaFinalizacionEstimada, st.fechaFinalizacion,
        au.id as idAgente, au.username as nombreUsuario, au.first_name as nombreAgente, au.last_name as apellidoAgente
        FROM soporte_ticketactualizacion st
        left JOIN soporte_solicitante ss ON ss.id = st.idSolicitante_id
        LEFT JOIN soporte_empresa se on se.id = ss.idEmpresa_id
        left join soporte_estadosticket ses on ses.id = st.idestado_id
        LEFT JOIN soporte_modulosii4 sm on sm.id = st.moduloActualizar_id
        LEFT JOIN auth_user au ON au.id = st.idAgente_id
        LEFT JOIN soporte_modulosii4 sm2 on sm2.id = st.moduloActualizar_id
        where au.username = %s OR ses.id = 4 OR ses.id = 5 OR ses.id = 2
        """
    else:
        consulta_sql += """
        SELECT st.id as NumTicket, sm.modulo as Modulo, ss.nombreapellido as Solicitante, ss.id as idSolicitante,
        st.prioridad as Prioridad, ses.descripcion as Estado,se.nombreEmpresa as NombreEmpresa,
        sm2.id as idModulo, sm2.modulo,st.fechaCreacion, st.fechaInicio as fechaAsignacion, st.fechaFinalizacionEstimada, st.fechaFinalizacion, ses.id as idEstado,ses.descripcion as Estado,
        au.id as idAgente, au.username as nombreUsuario, au.first_name as nombreAgente, au.last_name as apellidoAgente
        FROM soporte_ticketactualizacion st
        left JOIN soporte_solicitante ss ON ss.id = st.idSolicitante_id
        LEFT JOIN soporte_empresa se on se.id = ss.idEmpresa_id
        left join soporte_estadosticket ses on ses.id = st.idestado_id
        LEFT JOIN soporte_modulosii4 sm on sm.id = st.moduloActualizar_id
        LEFT JOIN auth_user au ON au.id = st.idAgente_id
        LEFT JOIN soporte_modulosii4 sm2 on sm2.id = st.moduloActualizar_id
        INNER JOIN soporte_actividadprincipalactualizacion sa on sa.idTicketDesarrollo_id = st.id 
        WHERE (sa.idAgente_id = %s OR au.username = %s) AND ses.id = 2
        """

    consulta_info_solicitantes = """
    SELECT * FROM soporte_solicitante ss WHERE ss.correo = %s
    """
    consulta_get_projects = """
    SELECT st.id as NumTicket, sm.modulo as Modulo, ss.nombreapellido as Solicitante, ss.id as idSolicitante,
    st.prioridad as Prioridad, ses.id as idEstado,ses.descripcion as Estado,se.nombreEmpresa as NombreEmpresa,
    sm2.id as idModulo, sm2.modulo,st.fechaCreacion, st.fechaInicio as fechaAsignacion, st.fechaFinalizacionEstimada, st.fechaFinalizacion,
    au.id as idAgente, au.username as nombreUsuario, au.first_name as nombreAgente, au.last_name as apellidoAgente
    FROM soporte_ticketactualizacion st
    left JOIN soporte_solicitante ss ON ss.id = st.idSolicitante_id
    LEFT JOIN soporte_empresa se on se.id = ss.idEmpresa_id
    left join soporte_estadosticket ses on ses.id = st.idestado_id
    LEFT JOIN soporte_modulosii4 sm on sm.id = st.moduloActualizar_id
    LEFT JOIN auth_user au ON au.id = st.idAgente_id
    LEFT JOIN soporte_modulosii4 sm2 on sm2.id = st.moduloActualizar_id
    WHERE ss.id = %s
    """

    connection = connections["default"]

    # Ejecutar la consulta SQL y obtener los resultados
    with connection.cursor() as cursor:
        if id_usuario == 2 or id_usuario == 1:
            cursor.execute(consulta_sql, [nombre_usuario])
        else:
            cursor.execute(consulta_sql, [id_usuario, nombre_usuario])

        columns = [col[0] for col in cursor.description]
        resultados = [dict(zip(columns, row)) for row in cursor.fetchall()]

    # COMPROBAR SI ESTA VACIO O NO
    if len(resultados) != 0:
        return JsonResponse(resultados, safe=False)
    else:
        with connection.cursor() as cursor:
            cursor.execute(consulta_info_solicitantes, [email_usuario])
            columns = [col[0] for col in cursor.description]
            info_solicitante = [dict(zip(columns, row)) for row in cursor.fetchall()]

        if len(info_solicitante) != 0:
            idSolicitante = info_solicitante[0]["id"]
            with connection.cursor() as cursor:
                cursor.execute(consulta_get_projects, [idSolicitante])
                columns = [col[0] for col in cursor.description]
                resultados = [dict(zip(columns, row)) for row in cursor.fetchall()]

            return JsonResponse(resultados, safe=False)
        else:
            # En el caso de que sea una empresa
            consulta_get_projects = consulta_get_projects.replace(
                "WHERE ss.id = %s", "WHERE se.nombreEmpresa = %s"
            )
            with connection.cursor() as cursor:
                cursor.execute(consulta_get_projects, [nombre_usuario])
                columns = [col[0] for col in cursor.description]
                resultados_empresa_tickets = [
                    dict(zip(columns, row)) for row in cursor.fetchall()
                ]

            return JsonResponse(resultados_empresa_tickets, safe=False)


def ticketsoportescreadosid(request, ticket_id):
    # Construir la consulta SQL para obtener la información del ticket principal
    consulta_sql_ticket = """
    SELECT 
        st.id,
        st.fechaCreacion,
        st.archivo,
        st.fechaInicio,
        st.fechaFinalizacion,
        st.fechaFinalizacionReal,
        st.comentario,
        st.asunto,
        st.causaerror,
        st.facturar,
        st.idAgente_id,
        au.first_name || ' ' || au.last_name AS agente_nombre, au.phone,
        st.idSolicitante_id,
        st.idestado_id,
        st.chat,
        st.prioridad,
        ss.nombreApellido,
        ss.telefonoSolicitante,
        st.imagenes,
        st.trabajoRealizado,
        st.motivoAnulacion,
        se.nombreEmpresa,
        se2.descripcion as estadoTicket
    FROM 
        soporte_ticketsoporte st
    LEFT JOIN 
        auth_user au ON au.id = st.idAgente_id
    LEFT JOIN
        soporte_solicitante ss ON ss.id = st.idSolicitante_id
    LEFT JOIN 
        soporte_empresa se ON se.id = ss.idEmpresa_id 
    LEFT JOIN 
    	soporte_estadosticket se2 ON se2.id = st.idestado_id 
    """

    # Agregar un filtro por ID si se proporciona el parámetro "id"
    if ticket_id is not None:
        consulta_sql_ticket += f" WHERE st.id = {ticket_id}"

    # Construir la consulta SQL para obtener las actividades principales del ticket
    consulta_sql_actividades = f"""
    SELECT
        aps.id,
        aps.descripcion,
        aps.idAgente_id,
        au_aps.first_name || ' ' || au_aps.last_name AS agente_actividad_nombre,
        aps.idestado_id,
        est.descripcion AS estado_actividad,
        aps.imagen_actividades,
        aps.fechainicio,
        aps.fechafinal,
        aps.minutosTrabajados
    FROM
        soporte_actividadprincipalsoporte aps
    LEFT JOIN
        auth_user au_aps ON au_aps.id = aps.idAgente_id
    LEFT JOIN
        soporte_estadosticket est ON est.id = aps.idestado_id
    LEFT JOIN
    	soporte_estadosticket se ON se.id = aps.id 
    WHERE
        aps.idTicketSoporte_id = {ticket_id}
    """

    connection = connections["default"]

    # Ejecutar la consulta SQL para obtener la información del ticket principal
    with connection.cursor() as cursor:
        cursor.execute(consulta_sql_ticket)
        columns_ticket = [col[0] for col in cursor.description]
        resultados_ticket = [
            dict(zip(columns_ticket, row)) for row in cursor.fetchall()
        ]

    # Ejecutar la consulta SQL para obtener las actividades principales del ticket
    with connection.cursor() as cursor:
        cursor.execute(consulta_sql_actividades)
        columns_actividades = [col[0] for col in cursor.description]
        resultados_actividades = [
            dict(zip(columns_actividades, row)) for row in cursor.fetchall()
        ]

    # Devolver la respuesta JSON con ambos conjuntos de resultados
    return JsonResponse(
        {"ticket": resultados_ticket, "actividades": resultados_actividades}, safe=False
    )

# Servicio que incluye el template
def ticketsoportescreadosid_new_page(request, ticket_id):
    nombre_usuario = request.user.username if request.user.is_authenticated else None
    usuarios_grupo_1 = User.objects.filter(groups__id=1).values_list(
        "username", flat=True
    )
    nombre = request.user.first_name if request.user.is_authenticated else None
    apellido = request.user.last_name if request.user.is_authenticated else None
    full_name = nombre + " " + apellido

    if nombre_usuario in usuarios_grupo_1:
        # No mostrar el campo en este caso
        mostrar_campo = False
    else:
        # Mostrar el campo
        mostrar_campo = True

    resultados_agentes = agentesjson(request)
    resultados_agentes_data = json.loads(resultados_agentes.content)
    
    resultados_allSolicitantes = allSolicitnates(request)
    resultados_allSolicitantes = json.loads(resultados_allSolicitantes.content)


    # Construir la consulta SQL para obtener la información del ticket principal
    consulta_sql_ticket = """
    SELECT 
        st.id,
        st.fechaCreacion,
        st.archivo,
        st.fechaInicio,
        st.fechaFinalizacion,
        st.fechaFinalizacionReal,
        st.comentario,
        st.asunto,
        st.causaerror,
        st.facturar,
        st.idAgente_id,
        au.first_name || ' ' || au.last_name AS agente_nombre, au.phone,
        st.idSolicitante_id,
        st.idestado_id,
        st.chat,
        st.prioridad,
        ss.nombreApellido,
        ss.telefonoSolicitante,
        st.imagenes,
        st.trabajoRealizado,
        st.motivoAnulacion,
        se.nombreEmpresa,
        se2.descripcion as estadoTicket
    FROM 
        soporte_ticketsoporte st
    LEFT JOIN 
        auth_user au ON au.id = st.idAgente_id
    LEFT JOIN
        soporte_solicitante ss ON ss.id = st.idSolicitante_id
    LEFT JOIN 
        soporte_empresa se ON se.id = ss.idEmpresa_id 
    LEFT JOIN 
    	soporte_estadosticket se2 ON se2.id = st.idestado_id 
    """

    # Agregar un filtro por ID si se proporciona el parámetro "id"
    if ticket_id is not None:
        consulta_sql_ticket += f" WHERE st.id = {ticket_id}"

    # Construir la consulta SQL para obtener las actividades principales del ticket
    consulta_sql_actividades = f"""
    SELECT
        aps.id,
        aps.descripcion,
        aps.idAgente_id,
        au_aps.first_name || ' ' || au_aps.last_name AS agente_actividad_nombre,
        aps.idestado_id,
        est.descripcion AS estado_actividad,
        aps.imagen_actividades,
        aps.fechainicio,
        aps.fechafinal,
        aps.minutosTrabajados
    FROM
        soporte_actividadprincipalsoporte aps
    LEFT JOIN
        auth_user au_aps ON au_aps.id = aps.idAgente_id
    LEFT JOIN
        soporte_estadosticket est ON est.id = aps.idestado_id
    LEFT JOIN
    	soporte_estadosticket se ON se.id = aps.id 
    WHERE
        aps.idTicketSoporte_id = {ticket_id}
    """

    connection = connections["default"]

    # Ejecutar la consulta SQL para obtener la información del ticket principal
    with connection.cursor() as cursor:
        cursor.execute(consulta_sql_ticket)
        columns_ticket = [col[0] for col in cursor.description]
        resultados_ticket = [
            dict(zip(columns_ticket, [
                val if not isinstance(val, datetime) else val.isoformat()
                for val in row
            ])) for row in cursor.fetchall()
        ]
    resultados_ticket = json.dumps(resultados_ticket)

    # Ejecutar la consulta SQL para obtener las actividades principales del ticket
    with connection.cursor() as cursor:
        cursor.execute(consulta_sql_actividades)
        columns_actividades = [col[0] for col in cursor.description]
        resultados_actividades = [
            dict(zip(columns_actividades, [
                val if not isinstance(val, datetime) else val.isoformat()
                for val in row
            ])) for row in cursor.fetchall()
        ]
    resultados_actividades = json.dumps(resultados_actividades)

    context = {
        "nombre_usuario": nombre_usuario,
        "mostrar_campo": mostrar_campo,
        "ticket": resultados_ticket,
        "actividades": resultados_actividades,
        "fullName": full_name,
        "resultados_agentes_data": resultados_agentes_data,
        "all_solicitantes": resultados_allSolicitantes
    }
    # Devolver la respuesta JSON con ambos conjuntos de resultados
    return render(request, 'detail_ticket.html', context)


def ticketDesarrolloCreados(request):
    nombre_usuario = request.user.username if request.user.is_authenticated else None
    id_usuario = request.user.id if request.user.is_authenticated else None
    email_usuario = request.user.email if request.user.is_authenticated else None

    consulta_sql = """"""
    if id_usuario == 2 or id_usuario == 1:
        consulta_sql += """
        SELECT st.id as NumTicket, ss.id as idCliente, ss.nombreApellido as Cliente, au.id as idAgente, au.first_name as Agente,
        se.nombreEmpresa as Empresa , st.tituloProyecto,st.idestado_id as idEstado, ses.descripcion as EstadoProyecto, 
        st.descripcionActividadGeneral, st.horasCompletasProyecto as HorasTotales,
        st.fechaCreacion, st.fechaAsignacion, st.fechaFinalizacionEstimada, st.fechaFinalizacion 
        FROM soporte_ticketdesarrollo st 
        INNER JOIN soporte_solicitante ss ON ss.id = st.idSolicitante_id
        INNER JOIN soporte_empresa se on se.id = ss.idEmpresa_id
        INNER JOIN soporte_estadosticket ses on ses.id = st.idestado_id
        INNER JOIN auth_user au on au.id = st.idAgente_id
        WHERE au.username = %s OR ses.id = 4 OR ses.id = 5 OR ses.id = 2
        """
    else:
        consulta_sql += """
        SELECT st.id as NumTicket, ss.id as idCliente, ss.nombreApellido as Cliente, au.id as idAgente, au.first_name as Agente,
        se.nombreEmpresa as Empresa , st.tituloProyecto,st.idestado_id as idEstado, ses.descripcion as EstadoProyecto, 
        st.descripcionActividadGeneral, st.horasCompletasProyecto as HorasTotales,
        st.fechaCreacion, st.fechaAsignacion, st.fechaFinalizacionEstimada, st.fechaFinalizacion ,
        sa.idAgente_id as idAgenteAtreaPrincipal
        FROM soporte_ticketdesarrollo st 
        INNER JOIN soporte_solicitante ss ON ss.id = st.idSolicitante_id
        INNER JOIN soporte_empresa se on se.id = ss.idEmpresa_id
        INNER JOIN soporte_estadosticket ses on ses.id = st.idestado_id
        INNER JOIN auth_user au on au.id = st.idAgente_id
        INNER JOIN soporte_actividadprincipal sa ON sa.idTicketDesarrollo_id = st.id
        WHERE (sa.idAgente_id = %s OR au.username = %s) AND ses.id = 2
        """

    consulta_info_solicitantes = """
    SELECT * FROM soporte_solicitante ss WHERE ss.correo = %s
    """
    consulta_get_projects = """
    SELECT st.id as NumTicket, ss.id as idCliente, ss.nombreApellido as Cliente, au.id as idAgente, au.first_name as Agente,
	se.nombreEmpresa as Empresa , st.tituloProyecto,st.idestado_id as idEstado, ses.descripcion as EstadoProyecto, 
	st.descripcionActividadGeneral, st.horasCompletasProyecto as HorasTotales,
	st.fechaCreacion, st.fechaAsignacion, st.fechaFinalizacionEstimada, st.fechaFinalizacion 
    FROM soporte_ticketdesarrollo st 
    LEFT JOIN soporte_solicitante ss ON ss.id = st.idSolicitante_id
    LEFT JOIN soporte_empresa se on se.id = ss.idEmpresa_id
    LEFT JOIN soporte_estadosticket ses on ses.id = st.idestado_id
    LEFT JOIN auth_user au on au.id = st.idAgente_id
    WHERE ss.id = %s
    """

    connection = connections["default"]

    # Ejecutar la consulta SQL y obtener los resultados
    with connection.cursor() as cursor:
        if id_usuario == 2 or id_usuario == 1:
            cursor.execute(consulta_sql, [nombre_usuario])
        else:
            cursor.execute(consulta_sql, [id_usuario, nombre_usuario])

        columns = [col[0] for col in cursor.description]
        resultados = [dict(zip(columns, row)) for row in cursor.fetchall()]

    # COMPROBAR SI ESTA VACIO O NO
    if len(resultados) != 0:
        return JsonResponse(resultados, safe=False)
    else:
        with connection.cursor() as cursor:
            cursor.execute(consulta_info_solicitantes, [email_usuario])
            columns = [col[0] for col in cursor.description]
            info_solicitante = [dict(zip(columns, row)) for row in cursor.fetchall()]

        if len(info_solicitante) != 0:
            idSolicitante = info_solicitante[0]["id"]
            with connection.cursor() as cursor:
                cursor.execute(consulta_get_projects, [idSolicitante])
                columns = [col[0] for col in cursor.description]
                resultados = [dict(zip(columns, row)) for row in cursor.fetchall()]

            return JsonResponse(resultados, safe=False)
        else:
            # En el caso de que sea una empresa
            consulta_get_projects = consulta_get_projects.replace(
                "WHERE ss.id = %s", "WHERE se.nombreEmpresa = %s"
            )
            with connection.cursor() as cursor:
                cursor.execute(consulta_get_projects, [nombre_usuario])
                columns = [col[0] for col in cursor.description]
                resultados_empresa_tickets = [
                    dict(zip(columns, row)) for row in cursor.fetchall()
                ]

            return JsonResponse(resultados_empresa_tickets, safe=False)


def detalleTicketActualizacion(request, ticket_id):
    id_usuario = request.user.id if request.user.is_authenticated else None
    consulta_sql = """
    SELECT st.id as idTicket, st.descripcionGeneral, st.observaciones ,st.fechaCreacion, st.fechaInicio, st.fechaFinalizacionEstimada, st.fechaFinalizacion,au.username,
	st.facturar, st.idestado_id as idEstadoProyecto,
	sm.id as idModulo, sm.modulo,
	se.id as idEstado, se.descripcion as Estado,
	ss.id as idSolicitante, ss.nombreApellido as fullNameSolicitante, ss.telefonoSolicitante,
	au.id as idAgente, au.first_name as NombreAgente, au.last_name as ApellidoAgente,
	sa.id as idTarea, sa.descripcion as DescripcionTarea, sa.fechaDesarrollo, sa.horasDiariasAsignadas as horasTarea
    FROM soporte_ticketactualizacion st 
    INNER JOIN soporte_modulosii4 sm on sm.id = st.moduloActualizar_id
    INNER JOIN soporte_estadosticket se on se.id = sa.idestado_id 
    INNER JOIN soporte_solicitante ss on ss.id = st.idSolicitante_id 
    INNER JOIN soporte_actividadprincipalactualizacion sa on sa.idTicketDesarrollo_id = st.id 
    INNER JOIN auth_user au on au.id = sa.idAgente_id   
    WHERE st.id = %s
    """

    connection = connections["default"]

    # Ejecutar la consulta SQL y obtener los resultados
    with connection.cursor() as cursor:
        cursor.execute(consulta_sql, [ticket_id])
        columns = [col[0] for col in cursor.description]
        resultados = [dict(zip(columns, row)) for row in cursor.fetchall()]

    # Devolver la respuesta JSON
    return JsonResponse(resultados, safe=False)


def detalleTicketDesarrollo(request, ticket_id):
    id_usuario = request.user.id if request.user.is_authenticated else None
    consulta_sql = """
    SELECT st.id as NumTicket, st.tituloProyecto , st.idAgente_id as idAgenteAdmin, st.fechaFinalizacion,
	au.first_name as nomAgenteAdmin, au.last_name as apellidoAgente ,st.idestado_id as idEstadoProyecto, au.username,
	sa.id as idTareaPrincipal, sa.descripcion as TareaPrincipal, sa.idAgente_id as idAgenteTarPrincipal, 
	sa.horasDiariasAsignadas as horasPrincipales, se.id as idEstadoActividadPrincipal ,se.descripcion as estadoActividadPrincipal,
	au2.first_name as nomAgentTareaPrincipal,
	sa2.id as idTareaSecundaria, sa2.descripcion as TareaSecundaria, sa2.horasDiariasAsignadas as horasSecundarias,
	se2.id as idEstadoActividadSecundaria, se2.descripcion as estadoActividadSecundaria,
	ss.id as idSolicitante, ss.nombreApellido as Solicitante, ss.telefonoSolicitante
    FROM soporte_ticketdesarrollo st 
    LEFT JOIN soporte_actividadprincipal sa ON sa.idTicketDesarrollo_id = st.id
    LEFT JOIN soporte_actividadsecundaria sa2 ON sa2.idActividadPrincipal_id = sa.id 
    LEFT JOIN auth_user au ON au.id = st.idAgente_id
    LEFT JOIN auth_user au2 ON au2.id = sa.idAgente_id
    LEFT JOIN soporte_estadosticket se ON se.id = sa.idestado_id 
    LEFT JOIN soporte_estadosticket se2 ON se2.id = sa2.idestado_id
    INNER JOIN soporte_solicitante ss ON ss.id = st.idSolicitante_id 
    WHERE st.id = %s
    """

    connection = connections["default"]

    # Ejecutar la consulta SQL y obtener los resultados
    with connection.cursor() as cursor:
        cursor.execute(consulta_sql, [ticket_id])
        columns = [col[0] for col in cursor.description]
        resultados = [dict(zip(columns, row)) for row in cursor.fetchall()]

    # Devolver la respuesta JSON
    return JsonResponse(resultados, safe=False)


def infoAgenteSolicitado(request, id_agente):
    consulta_sql = """
    SELECT au.id, au.first_name as Nombre, au.last_name as Apellido, au.date_joined as FechaIngreso,
	sa.descripcion as tareaPrincipal,
	sa2.descripcion as tareaSecundaria,sa2.horasDiariasAsignadas as horasDiariasTrabajo, sa2.fechaDesarrollo,
	st.tituloProyecto as Proyecto
	FROM auth_user au 
	LEFT JOIN soporte_actividadprincipal sa ON sa.idAgente_id = au.id
	LEFT JOIN soporte_actividadsecundaria sa2 ON sa2.idActividadPrincipal_id = sa.id
	LEFT JOIN soporte_ticketdesarrollo st ON st.id = sa.idTicketDesarrollo_id  
	WHERE au.id = %s and sa2.idestado_id = 2
    """
    consulta_proyecto = """
    SELECT st.id as idProyecto, st.tituloProyecto, st.fechaCreacion, sa.horasDiariasAsignadas as HorasTotales,
	au.first_name as NombreAgente, au.last_name as ApellidoAgente
	from soporte_ticketdesarrollo st 
	INNER JOIN soporte_actividadprincipal sa ON sa.idTicketDesarrollo_id = st.id 
	INNER JOIN auth_user au ON au.id = sa.idAgente_id 
    WHERE sa.idAgente_id = %s
    """
    consulta_actividad_principal = """
    SELECT au.id, au.first_name as Nombre, au.last_name as Apellido, au.date_joined as fechaIngreso,
	sa.descripcion as actividadPrincipal, sa.horasDiariasAsignadas as horasPrincipalesDesarrollo
	FROM auth_user au 
	LEFT JOIN soporte_actividadprincipal sa ON sa.idAgente_id = au.id
	WHERE au.id = %s
    """
    connection = connections["default"]

    # Ejecutar la consulta SQL y obtener los resultados
    with connection.cursor() as cursor:
        cursor.execute(consulta_sql, [id_agente])
        columns = [col[0] for col in cursor.description]
        resultados = [dict(zip(columns, row)) for row in cursor.fetchall()]

    with connection.cursor() as cursor:
        cursor.execute(consulta_proyecto, [id_agente])
        columns = [col[0] for col in cursor.description]
        resultados_project = [dict(zip(columns, row)) for row in cursor.fetchall()]

    with connection.cursor() as cursor:
        cursor.execute(consulta_actividad_principal, [id_agente])
        columns = [col[0] for col in cursor.description]
        resultados_main = [dict(zip(columns, row)) for row in cursor.fetchall()]

    context = {
        "infoProject": resultados_project,
        "infoTareasPrincipales": resultados_main,
        "infoTareasAdicionales": resultados,
    }
    # Devolver la respuesta JSON
    return JsonResponse(context, safe=False)


def info_panel_contro(request):
    id_usuario = request.user.id if request.user.is_authenticated else None
    nombre_usuario = request.user.first_name if request.user.is_authenticated else None

    if id_usuario == 2 or id_usuario == 1 or id_usuario == 126:
        fecha_actual = date.today()
        fecha_actual_time = datetime.now()
        fecha_actual_con_hora = datetime.combine(
            fecha_actual_time.date(), fecha_actual_time.time()
        )

        consulta_admin_complete = """
        SELECT st.*, au.last_name as ApellidoAgente, au.first_name as NombreAgente
        FROM soporte_ticketsoporte st 
        INNER JOIN auth_user au ON au.id = st.idAgente_id
        WHERE st.idestado_id = 5
        """
        consulta_admin_process_venci = """
        SELECT * FROM soporte_ticketsoporte st WHERE st.idestado_id = 2
        """
        consulta_admin_await = """
        SELECT * FROM soporte_ticketsoporte st WHERE st.idestado_id = 1
        """
        consulta_admin_all = """
        SELECT * FROM soporte_ticketsoporte st 
        """
        consult_admin_all_update = """
        SELECT * FROM soporte_ticketactualizacion st
        """
        consult_admin_all_dev = """
        SELECT * FROM soporte_ticketdesarrollo st 
        """
        consult_panel_work = """
        SELECT st.id as idTicket, st.asunto, st.fechaInicio as fechaInicioTicket, st.fechaFinalizacionReal as fechaFinalizacionTicket, st.fechaFinalizacion as fechaFinalizacionEspTicket,
			sa.id as idActividad, sa.descripcion as descripcionActividad, sa.fechainicio as fechaInicioActividad, sa.fechafinal as fechaFinalActividad, sa.minutosTrabajados as minutosActividad,
			au.id as idAgenteTicket, au.first_name as nombreAgenteTicket, au.last_name as apellidoAgenteTicket,
			au2.id as idAgenteActividad, au2.first_name as nombreAgenteActividad, au2.last_name as apellidoAgenteActividad
			FROM soporte_ticketsoporte st 
			INNER JOIN soporte_actividadprincipalsoporte sa ON sa.idTicketSoporte_id = st.id 
			INNER JOIN auth_user au ON au.id = st.idAgente_id
			INNER JOIN auth_user au2 ON au2.id = sa.idAgente_id 
			WHERE st.idestado_id <> 1 AND st.idestado_id <> 6
        """

        connection = connections["default"]

        with connection.cursor() as cursor:
            cursor.execute(consulta_admin_complete)
            columns = [col[0] for col in cursor.description]
            resultados_admin = [dict(zip(columns, row)) for row in cursor.fetchall()]

        with connection.cursor() as cursor:
            cursor.execute(consulta_admin_await)
            columns = [col[0] for col in cursor.description]
            resultados_admin_await = [
                dict(zip(columns, row)) for row in cursor.fetchall()
            ]

        with connection.cursor() as cursor:
            cursor.execute(consulta_admin_process_venci)
            columns = [col[0] for col in cursor.description]
            resultados_admin_process = [
                dict(zip(columns, row)) for row in cursor.fetchall()
            ]

        with connection.cursor() as cursor:
            cursor.execute(consulta_admin_all)
            columns = [col[0] for col in cursor.description]
            resultados_admin_all = [
                dict(zip(columns, row)) for row in cursor.fetchall()
            ]

        with connection.cursor() as cursor:
            cursor.execute(consult_admin_all_update)
            columns = [col[0] for col in cursor.description]
            resultados_admin_update = [
                dict(zip(columns, row)) for row in cursor.fetchall()
            ]

        with connection.cursor() as cursor:
            cursor.execute(consult_admin_all_dev)
            columns = [col[0] for col in cursor.description]
            resultados_admin_dev = [
                dict(zip(columns, row)) for row in cursor.fetchall()
            ]
        # Consulta para el listado de trabajos
        with connection.cursor() as cursor:
            cursor.execute(consult_panel_work)
            columns = [col[0] for col in cursor.description]
            resultados_panel_list = [
                dict(zip(columns, row)) for row in cursor.fetchall()
            ]

    else:
        fecha_actual = date.today()
        fecha_actual_time = datetime.now()
        fecha_actual_con_hora = datetime.combine(
            fecha_actual_time.date(), fecha_actual_time.time()
        )

        consulta_admin_complete = """
        SELECT st.*, au.first_name as NombreAgente, au.last_name as ApellidoAgente
        FROM soporte_ticketsoporte st 
        INNER JOIN auth_user au ON au.id = st.idAgente_id
        WHERE st.idestado_id = 5 AND st.idAgente_id = %s
        """
        consulta_admin_process_venci = """
        SELECT * FROM soporte_ticketsoporte st WHERE st.idestado_id = 2 AND st.idAgente_id = %s
        """
        consulta_admin_await = """
        SELECT * FROM soporte_ticketsoporte st WHERE (st.idestado_id = 1 OR st.idestado_id = 2 OR st.idestado_id = 3) AND st.idAgente_id = %s
        """
        consulta_admin_all = """
        SELECT * FROM soporte_ticketsoporte st WHERE st.idAgente_id = %s
        """
        consult_admin_all_update = """
        SELECT * FROM soporte_ticketactualizacion st WHERE st.idAgente_id = %s
        """
        consult_admin_all_dev = """
        SELECT * FROM soporte_ticketdesarrollo st WHERE st.idAgente_id = %s
        """

        consult_panel_work = """
            SELECT st.id as idTicket, st.asunto, st.fechaInicio as fechaInicioTicket, st.fechaFinalizacionReal as fechaFinalizacionTicket, st.fechaFinalizacion as fechaFinalizacionEspTicket,
			sa.id as idActividad, sa.descripcion as descripcionActividad, sa.fechainicio as fechaInicioActividad, sa.fechafinal as fechaFinalActividad, sa.minutosTrabajados as minutosActividad,
			au.id as idAgenteTicket, au.first_name as nombreAgenteTicket, au.last_name as apellidoAgenteTicket,
			au2.id as idAgenteActividad, au2.first_name as nombreAgenteActividad, au2.last_name as apellidoAgenteActividad
			FROM soporte_ticketsoporte st 
			INNER JOIN soporte_actividadprincipalsoporte sa ON sa.idTicketSoporte_id = st.id 
			INNER JOIN auth_user au ON au.id = st.idAgente_id
			INNER JOIN auth_user au2 ON au2.id = sa.idAgente_id 
			WHERE st.idestado_id <> 1 AND st.idestado_id <> 6 AND sa.idAgente_id = %s
        """

        connection = connections["default"]

        with connection.cursor() as cursor:
            cursor.execute(consulta_admin_complete, [id_usuario])
            columns = [col[0] for col in cursor.description]
            resultados_admin = [dict(zip(columns, row)) for row in cursor.fetchall()]

        with connection.cursor() as cursor:
            cursor.execute(consulta_admin_await, [id_usuario])
            columns = [col[0] for col in cursor.description]
            resultados_admin_await = [
                dict(zip(columns, row)) for row in cursor.fetchall()
            ]

        with connection.cursor() as cursor:
            cursor.execute(consulta_admin_process_venci, [id_usuario])
            columns = [col[0] for col in cursor.description]
            resultados_admin_process = [
                dict(zip(columns, row)) for row in cursor.fetchall()
            ]

        with connection.cursor() as cursor:
            cursor.execute(consulta_admin_all, [id_usuario])
            columns = [col[0] for col in cursor.description]
            resultados_admin_all = [
                dict(zip(columns, row)) for row in cursor.fetchall()
            ]

        with connection.cursor() as cursor:
            cursor.execute(consult_admin_all_update, [id_usuario])
            columns = [col[0] for col in cursor.description]
            resultados_admin_update = [
                dict(zip(columns, row)) for row in cursor.fetchall()
            ]

        with connection.cursor() as cursor:
            cursor.execute(consult_admin_all_dev, [id_usuario])
            columns = [col[0] for col in cursor.description]
            resultados_admin_dev = [
                dict(zip(columns, row)) for row in cursor.fetchall()
            ]

        with connection.cursor() as cursor:
            cursor.execute(consult_panel_work, [id_usuario])
            columns = [col[0] for col in cursor.description]
            resultados_panel_list = [
                dict(zip(columns, row)) for row in cursor.fetchall()
            ]

        # EN CASO DE QUE SEA CLIENTE EL USUARIO LOGEADO
        if (
            len(resultados_admin) == 0
            and len(resultados_admin_await) == 0
            and len(resultados_admin_process) == 0
            and len(resultados_admin_all) == 0
            and len(resultados_admin_update) == 0
            and len(resultados_admin_dev) == 0
        ):
            consulta_admin_complete = """
            SELECT st.*
            FROM soporte_ticketsoporte st 
            INNER JOIN soporte_solicitante ss ON ss.id = st.idSolicitante_id 
            INNER JOIN soporte_empresa se ON se.id = ss.idEmpresa_id 
            WHERE st.idestado_id = 5 AND se.nombreEmpresa = %s
            """
            consulta_admin_process_venci = """
             SELECT st.* 
 			FROM soporte_ticketsoporte st 
 			INNER JOIN soporte_solicitante ss ON ss.id = st.idSolicitante_id 
			INNER JOIN soporte_empresa se ON se.id = ss.idEmpresa_id
 			WHERE st.idestado_id = 2 AND se.nombreEmpresa = %s
            """
            consulta_admin_await = """
            SELECT st.* 
			FROM soporte_ticketsoporte st 
			INNER JOIN soporte_solicitante ss ON ss.id = st.idSolicitante_id 
			INNER JOIN soporte_empresa se ON se.id = ss.idEmpresa_id 
			WHERE (st.idestado_id = 1 OR st.idestado_id = 4) AND se.nombreEmpresa = %s
            """
            consulta_admin_all = """
            SELECT st.* 
			FROM soporte_ticketsoporte st 
			INNER JOIN soporte_solicitante ss ON ss.id = st.idSolicitante_id 
			INNER JOIN soporte_empresa se ON se.id = ss.idEmpresa_id 
			WHERE se.nombreEmpresa = %s
            """
            consult_admin_all_update = """
            SELECT st.* 
			FROM soporte_ticketactualizacion st 
			INNER JOIN soporte_solicitante ss ON ss.id = st.idSolicitante_id 
			INNER JOIN soporte_empresa se ON se.id = ss.idEmpresa_id
			WHERE se.nombreEmpresa = %s
            """
            consult_admin_all_dev = """
            SELECT st.* 
			FROM soporte_ticketdesarrollo st 
			INNER JOIN soporte_solicitante ss ON ss.id = st.idSolicitante_id 
			INNER JOIN soporte_empresa se ON se.id = ss.idEmpresa_id
			WHERE se.nombreEmpresa = %s
            """
            connection = connections["default"]

            with connection.cursor() as cursor:
                cursor.execute(consulta_admin_complete, [nombre_usuario])
                columns = [col[0] for col in cursor.description]
                resultados_admin = [
                    dict(zip(columns, row)) for row in cursor.fetchall()
                ]

            with connection.cursor() as cursor:
                cursor.execute(consulta_admin_process_venci, [nombre_usuario])
                columns = [col[0] for col in cursor.description]
                resultados_admin_process = [
                    dict(zip(columns, row)) for row in cursor.fetchall()
                ]

            with connection.cursor() as cursor:
                cursor.execute(consulta_admin_await, [nombre_usuario])
                columns = [col[0] for col in cursor.description]
                resultados_admin_await = [
                    dict(zip(columns, row)) for row in cursor.fetchall()
                ]

            with connection.cursor() as cursor:
                cursor.execute(consulta_admin_all, [nombre_usuario])
                columns = [col[0] for col in cursor.description]
                resultados_admin_all = [
                    dict(zip(columns, row)) for row in cursor.fetchall()
                ]

            with connection.cursor() as cursor:
                cursor.execute(consult_admin_all_update, [nombre_usuario])
                columns = [col[0] for col in cursor.description]
                resultados_admin_update = [
                    dict(zip(columns, row)) for row in cursor.fetchall()
                ]

            with connection.cursor() as cursor:
                cursor.execute(consult_admin_all_dev, [nombre_usuario])
                columns = [col[0] for col in cursor.description]
                resultados_admin_dev = [
                    dict(zip(columns, row)) for row in cursor.fetchall()
                ]

    numTicketsComplete = len(resultados_admin)

    if len(resultados_admin) != 0:
        resultados_hoy = [
            ticket
            for ticket in resultados_admin
            if ticket.get("fechaFinalizacion").date() == fecha_actual
        ]
    else:
        resultados_hoy = []

    if len(resultados_admin_await) != 0:
        result_await_to_day = [
            ticket
            for ticket in resultados_admin_await
            if ticket.get("fechaCreacion").date() == fecha_actual
        ]
    else:
        result_await_to_day = []

    if len(resultados_admin_process) != 0:
        result_proccess_venci = [
            obj
            for obj in resultados_admin_process
            if obj["fechaInicio"] < fecha_actual_con_hora
        ]
    else:
        result_proccess_venci = []

    if len(resultados_admin_all) != 0:
        objeto_mas_cercano = min(
            resultados_admin_all,
            key=lambda x: abs(fecha_actual_time - x["fechaCreacion"]),
        )
        diferencia_tiempo = abs(fecha_actual_time - objeto_mas_cercano["fechaCreacion"])
        dias_totales = diferencia_tiempo.days
        meses_totales = dias_totales // 30
        dias = dias_totales % 30
        horas, segundos_restantes = divmod(diferencia_tiempo.seconds, 3600)
        minutos, segundos = divmod(segundos_restantes, 60)
        tiempo = f"{meses_totales} meses, {dias} días, {horas} horas, {minutos} minutos, {segundos} segundos"
    else:
        objeto_mas_cercano = []
        diferencia_tiempo = ""
        dias_totales = 0
        meses_totales = 0
        dias = 0
        horas = 0
        segundos_restantes = 0
        minutos = 0
        segundos = 0
        tiempo = ""

    if len(resultados_admin_update) != 0:
        obj_more_update = min(
            resultados_admin_update,
            key=lambda x: abs(fecha_actual_time - x["fechaCreacion"]),
        )
        dif_time_update = abs(fecha_actual_time - obj_more_update["fechaCreacion"])
        dias_update = dif_time_update.days
        meses_update = dias_update // 30
        dias_update = dias_update % 30
        horas_update, sec_update_rest = divmod(dif_time_update.seconds, 3600)
        min_update, sec_update = divmod(sec_update_rest, 60)
        time_update = f"{meses_update} meses, {dias_update} días, {horas_update} horas, {min_update} minutos, {sec_update} segundos"
    else:
        obj_more_update = []
        dif_time_update = ""
        dias_update = 0
        meses_update = 0
        horas_update = 0
        sec_update_rest = 0
        min_update = 0
        sec_update = 0
        time_update = ""

    if len(resultados_admin_dev) != 0:
        obj_more_dev = min(
            resultados_admin_dev,
            key=lambda x: abs(fecha_actual_time - x["fechaCreacion"]),
        )
        dif_time_dev = abs(fecha_actual_time - obj_more_dev["fechaCreacion"])
        dias_totales_dev = dif_time_dev.days
        meses_totales_dev = dias_totales_dev // 30
        dias_dev = dias_totales_dev % 30
        horas_dev, segundos_restantes_dev = divmod(dif_time_dev.seconds, 3600)
        minutos_dev, segundos_dev = divmod(segundos_restantes_dev, 60)
        time_dev = f"{meses_totales_dev} meses, {dias_dev} días, {horas_dev} horas, {minutos_dev} minutos, {segundos_dev} segundos"
    else:
        obj_more_dev = []
        dif_time_dev = ""
        dias_totales_dev = 0
        meses_totales_dev = 0
        dias_dev = 0
        horas_dev = 0
        segundos_restantes_dev = 0
        minutos_dev = 0
        segundos_dev = 0
        time_dev = ""

    context = {
        "numTicketsComplete": numTicketsComplete,
        "numDayliTicketComplete": len(resultados_hoy),
        "numTicketAwait": len(resultados_admin_await),
        "numTicketAwaitToDay": len(result_await_to_day),
        "numTicketProcess": len(resultados_admin_process),
        "numTicketProcessVenci": len(result_proccess_venci),
        "tiempoDiferenciaSoporte": tiempo,
        "timeDifUpdate": time_update,
        "timeDifDev": time_dev,
        "infoTicketComplete": resultados_hoy,
        "panel_list_worked": resultados_panel_list
    }

    return JsonResponse(context, safe=False)


@require_POST
def crear_ticket_soporte(request):
    try:
        fecha_actual = datetime.now()
        asunto = request.POST.get("asuntoTicket", "")
        detalle_problema = request.POST.get("exampleFormControlTextarea1", "")
        imagen_problema = request.FILES.get("inputGroupFile03", None)
        prioridad = request.POST.get("prioridadSelect", "")
        solicitante = request.POST.get("solicitante", "")
        numRemoto = request.POST.get("numeroRemoto", "")
        url_imagen = "ticket_images/" + str(imagen_problema)
        fecha_inicio = None
        fecha_finalizacion = None
        fecha_finalizacion_real = None
        causa_error = " "
        factura = None
        chat = None
        trabajo_realizado = numRemoto
        idAgente = 2
        idEstado = 1

        # Guardar la imagen en el directorio /media/ticket_images/
        if imagen_problema:
            image_name = str(imagen_problema)
            path = os.path.join(settings.MEDIA_ROOT, "ticket_images", image_name)
            with open(path, "wb") as f:
                f.write(imagen_problema.read())
            url_imagen = "ticket_images/" + image_name

        nuevo_ticket = TicketSoporte(
            idAgente=User.objects.get(id=idAgente),
            idSolicitante=Solicitante.objects.get(id=solicitante),
            fechaCreacion=fecha_actual,
            fechaInicio=fecha_inicio,
            fechaFinalizacion=fecha_finalizacion,
            fechaFinalizacionReal=fecha_finalizacion_real,
            comentario=detalle_problema,
            prioridad=prioridad,
            asunto=asunto,
            causaerror=causa_error,
            idestado=EstadosTicket.objects.get(id=idEstado),
            facturar=factura,
            chat=chat,
            trabajoRealizado=trabajo_realizado,
            imagenes=url_imagen,
        )

        nuevo_ticket.save()

        return JsonResponse(
            {"status": "success", "message": "Ticket creado exitosamente"}
        )
    except Exception as e:
        return JsonResponse(
            {"status": "error", "message": f"Error al crear el Usuario: {str(e)}"},
            status=400,
        )


@require_POST
def crear_ticket_soporte_agente(request):
    if request.method == "POST":
        asunto = request.POST.get("asuntoTicketAgente")
        detalle_problema = request.POST.get("textAreaProblemaAgent")
        solicitante = request.POST.get("solicitanteAgent")
        prioridad = request.POST.get("prioridadSelectAgent")
        files = request.FILES.get("file")
        files_extra = request.FILES.get("fileExtra", None)
        fecha_creacion = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")
        fecha_inicio = None
        fecha_finalizacion = None
        fecha_finalizacion_real = None
        causa_error = " "
        factura = None
        chat = None
        trabajo_realizado = None
        idAgente = 2
        idEstado = 1

        # Guardar la imagen en el directorio /media/ticket_images/
        if files:
            image_name = str(files)
            path = os.path.join(settings.MEDIA_ROOT, "ticket_images", image_name)
            with open(path, "wb") as f:
                f.write(files.read())
            url_imagen = "ticket_images/" + image_name

        nuevo_ticket = TicketSoporte(
            idAgente=User.objects.get(id=idAgente),
            idSolicitante=Solicitante.objects.get(id=solicitante),
            fechaCreacion=fecha_creacion,
            fechaInicio=fecha_inicio,
            fechaFinalizacion=fecha_finalizacion,
            fechaFinalizacionReal=fecha_finalizacion_real,
            asunto=asunto,
            comentario=detalle_problema,
            prioridad=prioridad,
            causaerror=causa_error,
            idestado=EstadosTicket.objects.get(id=idEstado),
            facturar=factura,
            chat=chat,
            trabajoRealizado=trabajo_realizado,
            imagenes=url_imagen,
            archivo=files_extra,
        )

        nuevo_ticket.save()

        return JsonResponse(
            {"status": "success", "message": "Datos recibidos correctamente"}
        )
    else:
        return JsonResponse(
            {
                "status": "error",
                "message": "No se pudo crear el ticket, revise los datos",
            }
        )


def enviar_credenciales(request):
    if request.method == "POST":
        data = json.loads(request.body)
        email_destino = data.get("email")
        telefono = data.get("telefono")
        nombre_empresa = data.get("nombreEmpresa")

        # Dividir el nombre de la empresa en palabras
        palabras = nombre_empresa.split()

        # Verificar si el nombre de la empresa tiene más de una palabra
        if len(palabras) > 1:
            # Formatear la primera palabra completa y las tres primeras sílabas de las otras palabras
            primera_palabra = palabras[0].upper()
            siguientes_palabras = [palabra[:2].upper() for palabra in palabras[1:]]
            nombre_formateado = "".join([primera_palabra] + siguientes_palabras)
        else:
            # Si solo tiene una palabra, usarla directamente en mayúsculas
            nombre_formateado = nombre_empresa.upper()

        asunto = "Credenciales para el ingreso a al sistema de Tickets de Ishida"
        mensaje = f"""
<html>
<body>
<p>Reciba un cordial saludo desde el departamento administrativo de Ishida Software, el presente correo es para indicarle las credenciales que han sido enviadas para su acceso como empresa <b>{nombre_empresa}</b>, a nuestro nuevo portal de soporte "SiiTickets" en (http://186.3.160.137:120/), que tiene como finalidad principal optimizar y obtener una atención más personalizada.
</p>
<p>El nombre de usuario es: <b>{nombre_formateado}</b></p>
<p>La contraseña es: <b>8soptativa</b></p>
<p><i>En caso de no acceder o tener algún requerimiento adicional sobre estas credenciales, por favor contactarse con cualquiera de nuestros canales oficiales de Ishida Software.</i></p>
</body>
</html>
"""
        try:
            send_mail(
                asunto,
                "",
                settings.EMAIL_HOST_USER,
                [email_destino],
                html_message=mensaje,
            )
            return JsonResponse({"mensaje": "Correo enviado correctamente"})
        except Exception as e:
            return JsonResponse(
                {"mensaje": f"Error al enviar el correo: {e}"}, status=500
            )
    else:
        return JsonResponse({"mensaje": "Método no permitido"}, status=405)


def send_manual(request):
    if request.method == "POST":
        data = json.loads(request.body)
        email_destino = data.get("email")
        ruta_archivo = os.path.join(
            settings.BASE_DIR,
            "soporte\static\documents",
            "MANUAL DE USUARIO PARA EMPRESAS.pdf",
        )
        # Verificar si el archivo existe
        if os.path.exists(ruta_archivo):
            with open(ruta_archivo, "rb") as archivo:
                contenido = archivo.read()
                nombre_archivo = os.path.basename(ruta_archivo)

                email = EmailMessage(
                    "Manual de uso para Clientes",
                    "Reciba un cordial saludo desde el departamento de desarrollo de Ishida Software, el objetivo de este correo es adjuntar el manual de uso del sistema de gestión de tickets (SiiTickets).",
                    settings.EMAIL_HOST_USER,
                    [email_destino],
                )
                email.attach(nombre_archivo, contenido, "application/pdf")
                email.send()

                return JsonResponse({"status": "success"})
        else:
            return JsonResponse(
                {"status": "error", "message": "El archivo no existe"}, status=404
            )
    else:
        return JsonResponse({"status": "error"}, status=405)


def asign_admin_ticket_support(request, id_agente, id_ticket):
    try:
        fecha_actual = datetime.now()
        fechaAsignacion = fecha_actual.strftime("%Y-%m-%d %H:%M:%S")
        ticket = TicketSoporte.objects.get(id=id_ticket)
        comentario_adicional = request.GET.get('comentario_adicional')
        # Cambio de agente administrador
        ticket.idAgente_id = id_agente
        # Cambio de estado a en proceso
        ticket.idestado_id = 3
        ticket.fechaInicio = fechaAsignacion
        ticket.chat = comentario_adicional
        ticket.save()
        # Devolver la respuesta JSON
        return JsonResponse(
            {"status": "success", "message": "Datos recibidos correctamente"}
        )
    except:
        return JsonResponse(
            {
                "error": "No se pudo realizar el cambio de Agente administrador del proyecto"
            },
            status=405,
        )


@require_POST
def crear_usuario_empresa(request):
    try:
        fecha_actual = datetime.now()
        fecha_creacion = fecha_actual.strftime("%Y-%m-%d %H:%M:%S")
        nickName = request.POST.get("inputNickname", "")
        password = request.POST.get("inputPassword", "")
        nombres = request.POST.get("inputNombres", "")
        apellidos = request.POST.get("inputApellidos", "")
        email = request.POST.get("inputEmail", "")
        fullName = nombres + " " + apellidos
        idempresa = request.POST.get("empresaSolicitante", "")
        telefono = request.POST.get("telefonoUsuario", "")
        ruc = request.POST.get("rucUsuario", "")
        direccion = request.POST.get("direccionUsuario", "")

        consulta_comprobacion_username = """
        SELECT au.id as idUser, au.username, au.email 
	    FROM auth_user au 
        """

        if nickName != "":
            # CONSULTA PARA COMPROBAR SI EL USUARIO EXISTE O NO EN LA TABLA AU
            consulta_comprobacion_username += " WHERE au.username = %s "
            connection = connections["default"]
            with connection.cursor() as cursor:
                cursor.execute(consulta_comprobacion_username, [nickName])
                columns = [col[0] for col in cursor.description]
                resultados_comprobados = [
                    dict(zip(columns, row)) for row in cursor.fetchall()
                ]

            if len(resultados_comprobados) == 0:
                # CONSULTA DE COMPROBACION EN CASO DE QUE EXISTA EL SUAURIO EN LA TABLA SOLICITANTE
                consulta_comprobacion_solcitante = """
                SELECT * FROM soporte_solicitante ss WHERE ss.nombreApellido = %s
                """

                with connection.cursor() as cursor:
                    cursor.execute(consulta_comprobacion_solcitante, [fullName])
                    columns = [col[0] for col in cursor.description]
                    resultados_solicitante = [
                        dict(zip(columns, row)) for row in cursor.fetchall()
                    ]

                if len(resultados_solicitante) == 0:
                    # CREACION DEL USUARIO EN LA TABLA AU
                    nuevo_usuario = User.objects.create_user(
                        password=password,
                        last_login=None,
                        username=nickName,
                        last_name=apellidos,
                        email=email,
                        is_staff=False,
                        is_active=True,
                        date_joined=fecha_creacion,
                        first_name=nombres,
                    )

                    # CREACION DEL SOLICITANTE
                    nuevo_solicitante = nuevo_solicitante = Solicitante(
                        nombreApellido=fullName,
                        telefonoSolicitante=telefono,
                        idEmpresa_id=idempresa,
                        ruc=ruc,
                        direccion=direccion,
                        correo=email,
                    )

                    grupo = Group.objects.get(id=1)
                    nuevo_usuario.groups.add(grupo)
                    nuevo_solicitante.save()
                    # CREACION Y ENVIO DEL CORREO ELECTRONICO
                    asunto = "Credenciales para el acceso a SiiTickets."
                    cuerpo = f"Las credenciales de acceso para el sistema SiiTickets de Ishida son:\n\nUsuario: {nickName}\nContraseña: {password}"
                    complet_email = EmailMessage(
                        subject=asunto,
                        body=cuerpo,
                        to=[email],
                    )
                    complet_email.send()

                    if nickName != "" and password != "":
                        return JsonResponse(
                            {"status": "success", "message": "Usuario creado con éxito"}
                        )
                    else:
                        return JsonResponse(
                            {
                                "status": "error",
                                "message": "No se pudo enviar el correo por falta de información",
                            }
                        )
                else:
                    return JsonResponse(
                        {
                            "status": "error",
                            "message": "Ya existe un solicitante con ese nombre",
                        }
                    )
            else:
                return JsonResponse(
                    {"status": "error", "message": "El usuario ya existe"}
                )
        else:
            return JsonResponse(
                {
                    "status": "error",
                    "message": "No se pudo enviar el correo por falta de información",
                }
            )

    except Exception as e:
        return JsonResponse(
            {"status": "error", "message": f"Error al crear el Usuario: {str(e)}"},
            status=400,
        )


@csrf_exempt
def agregar_tareas(request, id_ticket):
    try:
        data = json.loads(request.body)
        descripcion = data.get("descripcion")
        idAgente = data.get("idAgente")
        fecha = data.get("fechaFinalizacion")
        fecha_actual = datetime.now()
        fecha_creacion = fecha_actual.strftime("%Y-%m-%d %H:%M:%S")
        imagen = data.get("imagen")

        nueva_actividad = ActividadPrincipalSoporte(
            descripcion=descripcion,
            idTicketSoporte=TicketSoporte.objects.get(id=id_ticket),
            idestado=EstadosTicket.objects.get(id=2),
            imagen_actividades=imagen,
            idAgente=User.objects.get(id=idAgente),
            fechainicio=fecha_creacion,
            fechafinal=fecha,
        )
        nueva_actividad.save()

        return JsonResponse(
            {"status": "success", "message": "Tareas agregadas correctamente"}
        )
    except Exception as e:
        return JsonResponse(
            {"status": "error", "message": f"Error al crear el Usuario: {str(e)}"},
            status=400,
        )


@csrf_exempt
def eliminar_tarea(request, id_ticket):
    try:
        data = json.loads(request.body)
        descripcion = data.get("descripcion")
        actividad = ActividadPrincipalSoporte.objects.filter(
            idTicketSoporte_id=id_ticket, descripcion=descripcion
        ).first()
        if actividad:
            actividad.delete()
            return JsonResponse(
                {"status": "success", "message": "Tarea eliminada correctamente"}
            )
        else:
            return JsonResponse(
                {"status": "error", "message": "Actividad no encontrada"}, status=404
            )

    except Exception as e:
        return JsonResponse(
            {"status": "error", "message": f"Error al eliminar la tarea: {str(e)}"},
            status=400,
        )


@csrf_exempt
def editar_tareas_soporte(request):
    try:
        data = json.loads(request.body)
        tasks = data.get("tasks", [])

        task_ids = [task.get("id") for task in tasks]

        actividades = ActividadPrincipalSoporte.objects.filter(id__in=task_ids)

        for actividad, task in zip(actividades, tasks):
            actividad.idestado = EstadosTicket.objects.get(id=4)
            actividad.descripcion = task.get("descripcion")
            actividad.fechafinal = task.get("fechaFinalizacion")
            actividad.minutosTrabajados = task.get("minutos")
            actividad.imagen_actividades = task.get("imagen")

            actividad.save()

        return JsonResponse(
            {"status": "success", "message": "La/s tarea/s se ha/n puesto en revisión"}
        )
    except Exception as e:
        return JsonResponse(
            {"status": "error", "message": f"Error al eliminar la tarea: {str(e)}"},
            status=400,
        )

@require_POST
@csrf_exempt
def update_file_extra(request, id_ticket):
    file_extra = request.FILES.get("fileExtra")
    print(file_extra)
    if file_extra:
        ticket = TicketSoporte.objects.get(id=id_ticket)
        ticket.archivo = file_extra
        ticket.save()
        return JsonResponse({"status": "success", "message": "Archivo guardado con éxito"})
    else:
        return JsonResponse({"status": "error", "message": "No se ha subido ningún archivo"})

@csrf_exempt
def finalizar_tareas_soporte(request):
    try:
        data = json.loads(request.body)
        tasks = data.get("tasks", [])

        ActividadPrincipalSoporte.objects.filter(id__in=tasks).update(idestado=5)

        id_tickets = ActividadPrincipalSoporte.objects.filter(id__in=tasks).values_list(
            "idTicketSoporte", flat=True
        )

        todas_tareas_estado_5 = (
            ActividadPrincipalSoporte.objects.filter(idTicketSoporte__in=id_tickets)
            .exclude(idestado=5)
            .count()
            == 0
        )

        if todas_tareas_estado_5:
            for id_ticket in id_tickets:
                TicketSoporte.objects.filter(id=id_ticket).update(idestado=4)

        return JsonResponse(
            {"status": "success", "message": "La/s tarea/s se ha/n fue finalizada"}
        )
    except Exception as e:
        return JsonResponse(
            {"status": "error", "message": f"Error al eliminar la tarea: {str(e)}"},
            status=400,
        )


@csrf_exempt
def cerrar_ticket(request, id_ticket):
    try:
        fecha_actual = datetime.now()
        fecha_finalizacion = fecha_actual.strftime("%Y-%m-%d %H:%M:%S")

        ticket = TicketSoporte.objects.get(id=id_ticket)
        ticket.idestado_id = 5
        ticket.fechaFinalizacionReal = fecha_finalizacion
        ticket.save()

        return JsonResponse(
            {"status": "success", "message": "El ticket ha sido cerrado"}
        )
    except Exception as e:
        return JsonResponse(
            {"status": "error", "message": f"Error al cerrar el ticket: {str(e)}"},
            status=400,
        )


@csrf_exempt
def regresar_estado_proceso(request, id_ticket):
    try:
        ticket = TicketSoporte.objects.get(id=id_ticket)
        ticket.idestado_id = 2
        ticket.save()

        actividades = ActividadPrincipalSoporte.objects.filter(
            idTicketSoporte=id_ticket
        )
        for actividad in actividades:
            actividad.idestado_id = 4
            actividad.save()

        return JsonResponse(
            {"status": "success", "message": "El ticket ha sido modificado"}
        )
    except Exception as e:
        return JsonResponse(
            {"status": "error", "message": f"Error al modificar el ticket: {str(e)}"},
            status=400,
        )


@require_POST
def crear_solicitante(request):
    fecha_actual = datetime.now()
    # Obtener los datos del formulario
    nombre = request.POST.get("nombreUsuario", "")
    ruc = request.POST.get("rucUsuario", "")
    direccion = request.POST.get("direccionUsuario", "")
    telefono = request.POST.get("telefonoUsuario", "")
    correo = request.POST.get("correoUsuario", "")
    idempresa = request.POST.get("empresaSolicitante", "")

    try:
        # Obtener la instancia del solicitante
        empresa = Empresa.objects.get(id=idempresa)

        # Crear una instancia de TicketSoporte con los datos del formulario
        nuevo_solicitante = Solicitante(
            nombreApellido=nombre,
            telefonoSolicitante=telefono,
            idEmpresa_id=idempresa,
            ruc=ruc,
            direccion=direccion,
            correo=correo,
        )

        # Guardar el nuevo ticket en la base de datos
        nuevo_solicitante.save()

        return JsonResponse(
            {"status": "success", "message": "Usuario creado con éxito"}
        )
    except Exception as e:
        return JsonResponse(
            {"status": "error", "message": f"Error al crear el Usuario: {str(e)}"},
            status=400,
        )


@csrf_exempt
def editar_ticket_soporte(request, ticket_id):
    try:
        data = json.loads(request.body)
        causa_error = data.get("causaError")
        fecha_finalizacion = data.get("fechaFinalizacion", None)
        facturacion = data.get("facturacion")
        comentario = data.get("comentario", "")
        idEstado = data.get("idEstado", "")
        
        # Buscar el ticket por su ID
        ticket = TicketSoporte.objects.get(id=ticket_id)

        ticket.causaerror = causa_error
        ticket.fechaFinalizacion = fecha_finalizacion
        ticket.comentario = comentario

        # Actualizar las propiedades para revisar las condiciones
        if fecha_finalizacion == None or facturacion == "":
            estado = EstadosTicket.objects.get(id=idEstado)
            ticket.idestado = estado
        else:
            if idEstado == 4:
                estado = EstadosTicket.objects.get(id=idEstado)
                ticket.idestado = estado
            else:
                estado = EstadosTicket.objects.get(id=2)
                ticket.idestado = estado

        # Condicion en caso de que llegue de alguna forma la facturacion
        if facturacion == "true":
            facturacion = True
        else:
            facturacion = False
        ticket.facturar = facturacion

        # Guardar los cambios
        ticket.save()

        return JsonResponse(
            {"status": "success", "message": "El ticket ha sido cerrado"}
        )
    except Exception as e:
        return JsonResponse(
            {"status": "error", "message": f"Error al cerrar el ticket: {str(e)}"},
            status=400,
        )


@require_POST
def crear_ticket_desarrollo(request):
    id_solicitante = request.POST.get("solicitante", "")
    agentesolicitado = request.POST.get("agentesolicitado", "")
    id_estado = request.POST.get("estadoTicket", "")
    fecha_actual = datetime.now()

    # CONTROL EN CASO DE QUE NO VENGA NADA
    if agentesolicitado:
        try:
            id_agente = int(agentesolicitado)
        except ValueError:
            id_agente = 2
    else:
        id_agente = 2

    if id_agente != 2:
        fechaAsignacion = fecha_actual.strftime("%Y-%m-%d %H:%M:%S")
    else:
        fechaAsignacion = None

    try:
        # Obtener los datos del formulario
        inputTitleProject = request.POST.get("inputTitleProject")
        agente_modelo = User.objects.get(
            id=id_agente
        )  # Usar User en lugar de Solicitante
        solicitante_modelo = Solicitante.objects.get(id=id_solicitante)
        fechaCreacion = fecha_actual.strftime("%Y-%m-%d %H:%M:%S")
        fechaEstimada = request.POST.get("fecha_estimado", None)
        fechaFinalizacion = request.POST.get("fecha_finalizacion")
        textDescripcionRequerimiento = request.POST.get(
            "textDescripcionRequerimiento", ""
        )
        numHorasCompletas = request.POST.get("inputNumHorasCompletas", "")
        estado = EstadosTicket.objects.get(id=id_estado)
        facturar = True

        if fechaEstimada is None:
            fechaEstimada = fechaCreacion

        # Crear una instancia de TicketDesarrollo con los datos del formulario
        nuevo_ticket_desarrollo = TicketDesarrollo(
            tituloProyecto=inputTitleProject,
            descripcionActividadGeneral=textDescripcionRequerimiento,
            idAgente=agente_modelo,
            idSolicitante=solicitante_modelo,
            fechaCreacion=fechaCreacion,
            fechaFinalizacionEstimada=fechaEstimada if fechaEstimada else None,
            fechaAsignacion=fechaAsignacion if fechaAsignacion else None,
            fechaFinalizacion=fechaFinalizacion if fechaFinalizacion else None,
            idestado=estado,
            facturar=facturar,
            horasCompletasProyecto=numHorasCompletas,
        )

        # Guardar el nuevo ticket en la base de datos
        nuevo_ticket_desarrollo.save()

        # Creacion de las actividades principales
        # Consulta para el ID de las personas
        consulta_sql = """
        SELECT * FROM soporte_ticketdesarrollo
        """
        if inputTitleProject is not None:
            consulta_sql += f" WHERE tituloProyecto = %s"

        connection = connections["default"]

        with connection.cursor() as cursor:
            cursor.execute(consulta_sql, [inputTitleProject])
            columns = [col[0] for col in cursor.description]
            resultados = [dict(zip(columns, row)) for row in cursor.fetchall()]

        id_ticket_actual = resultados[0]["id"]

        # Creacion de la informacion de la tabla para la facturacion
        # Controlar cuantas filas principales hay
        # JUSTO AQUI DEBE ESTAR EL ARREGLO arrayTaskMain
        array_task_main_json = request.POST.get("arrayTaskMain", "[]")
        array_task_second_json = request.POST.get("arrayTaskSecond", "[]")

        array_task_main = json.loads(array_task_main_json)
        array_task_second = json.loads(array_task_second_json)

        array_descripcion_main = []

        if len(array_task_main) > 0:
            for task in array_task_main:
                ticket_desarrollo = TicketDesarrollo.objects.get(id=id_ticket_actual)
                descripcionPrincipal = task["descripcion"]
                array_descripcion_main.append(descripcionPrincipal)
                id_agente_principal = task["responsable"]
                agente = User.objects.get(id=id_agente_principal)

                if id_agente_principal == 2:
                    id_estado_principal = 1
                else:
                    id_estado_principal = 2

                new_task_main = ActividadPrincipal(
                    descripcion=task["descripcion"],
                    idTicketDesarrollo=ticket_desarrollo,
                    horasDiariasAsignadas=task["horasAsignadas"],
                    idestado=EstadosTicket.objects.get(id=id_estado_principal),
                    idAgente=agente,
                )
                new_task_main.save()

        if len(array_task_second) > 0:
            consult_main = []
            for descripcionMain in array_descripcion_main:
                consulta_principal = """
                SELECT * FROM soporte_actividadprincipal
                """
                if descripcionMain is not None:
                    consulta_principal += (
                        f" WHERE descripcion = %s AND idTicketDesarrollo_id = %s"
                    )

                connection = connections["default"]

                with connection.cursor() as cursor:
                    cursor.execute(
                        consulta_principal, [descripcionMain, id_ticket_actual]
                    )
                    columns = [col[0] for col in cursor.description]
                    resultados = [dict(zip(columns, row)) for row in cursor.fetchall()]

                consult_main.append(resultados[0])

            for obj in consult_main:
                id_objeto = obj.get("id")
                descripcion_objeto = obj.get("descripcion")

                for obj_task_second in array_task_second:
                    descripcion_secundaria = obj_task_second.get("descripcionPrincipal")
                    descripcion_adicional = obj_task_second.get("descripcionSecundaria")
                    horas_secundarias = obj_task_second.get("horasAsignadas")
                    fecha_desarrollo = obj_task_second.get("fechaDesarrollo")
                    task_main_obj = ActividadPrincipal.objects.get(id=id_objeto)

                    if descripcion_objeto == descripcion_secundaria:
                        new_task_second = ActividadSecundaria(
                            descripcion=descripcion_adicional,
                            idActividadPrincipal=task_main_obj,
                            horasDiariasAsignadas=horas_secundarias,
                            idestado=EstadosTicket.objects.get(id=id_estado_principal),
                            fechaDesarrollo=fecha_desarrollo,
                        )
                        new_task_second.save()

        return JsonResponse({"status": "success", "message": "Ticket creado con éxito"})
    except Exception as e:
        return JsonResponse(
            {"status": "error", "message": f"Error al crear el ticket: {str(e)}"},
            status=400,
        )


def ticketactualizacioncreadosid(request):
    # Obtener el valor del parámetro "id" de la solicitud
    ticket_id = request.GET.get("id", None)

    # Construir la consulta SQL
    consulta_sql = """
    SELECT * FROM soporte_ticketactualizacion
    """

    # Agregar un filtro por ID si se proporciona el parámetro "id"
    if ticket_id is not None:
        consulta_sql += f" WHERE id = {ticket_id}"

    connection = connections["default"]

    # Ejecutar la consulta SQL y obtener los resultados
    with connection.cursor() as cursor:
        cursor.execute(consulta_sql)
        columns = [col[0] for col in cursor.description]
        resultados = [dict(zip(columns, row)) for row in cursor.fetchall()]

    # Devolver la respuesta JSON
    return JsonResponse(resultados, safe=False)


def empresascreados(request):
    # Construir la consulta SQL
    consulta_sql = """
        select se.id as NumEmpresa, se.nombreEmpresa, se.direccion as direccion,
se.telefono as telefono, se.email as email
from soporte_empresa se

        """
    connection = connections["default"]

    # Ejecutar la consulta SQL y obtener los resultados
    with connection.cursor() as cursor:
        cursor.execute(consulta_sql)
        columns = [col[0] for col in cursor.description]
        resultados = [dict(zip(columns, row)) for row in cursor.fetchall()]

    # Devolver la respuesta JSON
    return JsonResponse(resultados, safe=False)


def moduloscreados(request):
    # Construir la consulta SQL
    consulta_sql = """
        select sm.id as NumModulo, sm.modulo, sm.descripcionModulo 
from soporte_modulosii4 sm

        """
    connection = connections["default"]

    # Ejecutar la consulta SQL y obtener los resultados
    with connection.cursor() as cursor:
        cursor.execute(consulta_sql)
        columns = [col[0] for col in cursor.description]
        resultados = [dict(zip(columns, row)) for row in cursor.fetchall()]

    # Devolver la respuesta JSON
    return JsonResponse(resultados, safe=False)


@require_POST
def crear_ticket_actualizacion(request):
    try:
        id_solicitante = request.POST.get("selectSolicitante")
        id_agente = request.POST.get("agentesolicitado", None)
        id_modulo = request.POST.get("selectModulo")
        horas_totales = request.POST.get("horasDiariasAsignadas")
        observaciones = request.POST.get("observaciones", "")
        descripcion = request.POST.get("descripcionGeneral")
        prioridad = request.POST.get("selectPrioridad")
        id_estado = 1
        fecha_inicio = None
        fecha_finalizacion_estimada = request.POST.get("fecha_estimado")
        array_tasks_main_json = request.POST.get("arrayTasksMain")
        array_tasks_main = json.loads(array_tasks_main_json)
        fecha_actual = datetime.now()
        fecha_creacion = fecha_actual.strftime("%Y-%m-%d %H:%M:%S")

        # Cambio de estado dependiendo de la seleccion del agente
        if id_agente == "2" or id_agente == "":
            id_estado = 1
            id_agente = 2
            fecha_asignacion = None
            fecha_inicio = None
        else:
            id_estado = 2
            fecha_inicio = fecha_actual.strftime("%Y-%m-%d %H:%M:%S")

        # Creacion del registro de ticket principal
        newTicketActualizacion = TicketActualizacion(
            idAgente=User.objects.get(id=id_agente),
            idSolicitante=Solicitante.objects.get(id=id_solicitante),
            fechaCreacion=fecha_creacion,
            fechaInicio=fecha_inicio,
            fechaFinalizacionEstimada=fecha_finalizacion_estimada,
            fechaFinalizacion=None,
            moduloActualizar=ModuloSii4.objects.get(id=id_modulo),
            descripcionGeneral=descripcion,
            observaciones=observaciones,
            prioridad=prioridad,
            idestado=EstadosTicket.objects.get(id=id_estado),
            facturar=True,
        )

        newTicketActualizacion.save()

        # # Creacion de la consulta para ver el nombre del soporte
        # # Consulta para el ID de las personas
        consulta_sql = """
        SELECT * FROM soporte_ticketactualizacion
        """
        if descripcion is not None:
            consulta_sql += f" WHERE descripcionGeneral = %s AND observaciones = %s AND idAgente_id = %s"

        connection = connections["default"]

        with connection.cursor() as cursor:
            cursor.execute(consulta_sql, [descripcion, observaciones, id_agente])
            columns = [col[0] for col in cursor.description]
            resultados = [dict(zip(columns, row)) for row in cursor.fetchall()]

        id_ticket_actual = resultados[0]["id"]

        if len(array_tasks_main) != 0:
            for task in array_tasks_main:
                newTaskMain = ActividadPrincipalActualizacion(
                    descripcion=task["descripcionTarea"],
                    idTicketDesarrollo=TicketActualizacion.objects.get(
                        id=id_ticket_actual
                    ),
                    fechaDesarrollo=task["fechaDesarrollo"],
                    horasDiariasAsignadas=task["numeroHoras"],
                    idestado=EstadosTicket.objects.get(id=2),
                    idAgente=User.objects.get(id=task["responsableTarea"]),
                )
                newTaskMain.save()

        return JsonResponse(
            {"status": "success", "message": "Ticket de actualización creado con exito"}
        )
    except Exception as e:
        return JsonResponse(
            {"status": "error", "message": f"Error al crear el ticket: {str(e)}"},
            status=400,
        )


from django.db import transaction


def crear_empresa(request):
    fecha_actual = datetime.now()
    # Obtener los datos del formulario
    fecha_creacion = fecha_actual.strftime("%Y-%m-%d %H:%M:%S")
    nombreEmpresa = request.POST.get("nombreEmpresa", "")
    direccion = request.POST.get("direccion", "")
    telefono = request.POST.get("telefono", "")
    email = request.POST.get("email", "")

    # Verificar si la empresa ya existe
    if Empresa.objects.filter(nombreEmpresa=nombreEmpresa).exists():
        return JsonResponse({"status": "error", "message": "La empresa ya existe"})

    # Crear la empresa y el usuario asociado dentro de una transacción atómica
    with transaction.atomic():
        # Crear la nueva empresa
        nueva_empresa = Empresa(
            fechaCreacion=fecha_creacion,
            nombreEmpresa=nombreEmpresa,
            direccion=direccion,
            telefono=telefono,
            email=email,
        )
        nueva_empresa.save()

        # Crear el usuario asociado a la empresa

        username = nombreEmpresa.split()
        primera_palabra = username[0]
        username = "".join([palabra[:2] for palabra in username[1:]])
        username = primera_palabra + username
        password = "8soptativa"  # Contraseña por defecto
        user = User.objects.create_user(
            username=username, first_name=nombreEmpresa, password=password, email=email
        )

        # Asignar el usuario al grupo correspondiente (group_id=1)
        group = Group.objects.get(
            pk=1
        )  # Suponiendo que el grupo Administradores tiene pk=1
        user.groups.add(group)

    return JsonResponse({"status": "success", "message": "Empresa creada con éxito"})


@require_POST
def crear_modulo(request):
    fecha_actual = datetime.now()
    # Obtener los datos del formulario
    modulo = request.POST.get("modulo", "")
    descripcionModulo = request.POST.get("descripcionModulo", "")
    nuevo_modulo = ModuloSii4(
        modulo=modulo,
        descripcionModulo=descripcionModulo,
    )

    nuevo_modulo.save()

    return JsonResponse({"status": "success", "message": "Modulo creado con éxito"})


def detalles_empresa(request):
    # Obtén el valor de numEmpresa desde la solicitud GET
    num_empresa = request.GET.get("numEmpresa")

    # Construir la consulta SQL con filtrado por numModulo
    consulta_sql = """
        SELECT se.id as NumEmpresa, se.nombreEmpresa, se.direccion, se.telefono, se.email,
		sac.id as idAcceso, sac.nombreEquipo, sac.direccion as direccionMaquina, sac.usuario, sac.password,
		sta.id as idTipoAcceso, sta.descripcion as tipoAcceso
        FROM soporte_empresa se
        LEFT JOIN soporte_accesoempresas sac ON sac.idEmpresa_id = se.id
        LEFT JOIN soporte_tipoacceso sta ON sta.id = sac.idTipoAcceso_id
        WHERE se.id = %s
    """

    connection = connections["default"]

    # Ejecutar la consulta SQL y obtener los resultados
    with connection.cursor() as cursor:
        cursor.execute(consulta_sql, [num_empresa])
        columns = [col[0] for col in cursor.description]
        resultados = [dict(zip(columns, row)) for row in cursor.fetchall()]

    # Devolver la respuesta JSON
    return JsonResponse(resultados, safe=False)

@csrf_exempt
def create_acces_empresa(request):
    if request.method == 'POST':
        nombre_maquina = request.POST.get('modalNombreMaquina')
        direccion_equipo = request.POST.get('modalDireccionEquipo')
        usuario = request.POST.get('modalUsuario')
        contrasena = request.POST.get('modalPassword')
        tipo_acceso = request.POST.get('selectTipoAccesoModal')
        idEmpresa = request.POST.get('idEmpresa')

        nuevo_acceso = accesoEmpresas(
            nombreEquipo=nombre_maquina,
            direccion=direccion_equipo,
            usuario=usuario,
            password=contrasena,
            idTipoAcceso=tipoAcceso.objects.get(id=tipo_acceso),
            idEmpresa=Empresa.objects.get(id=idEmpresa)
        )
        nuevo_acceso.save()
        return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'error'}, status=400)


def detalles_modulo(request):
    # Obtén el valor de numEmpresa desde la solicitud GET
    num_modulo = request.GET.get("numModulo")

    # Construir la consulta SQL con filtrado por numEmpresa
    consulta_sql = """
        select sm.id as NumModulo, sm.modulo, sm.descripcionModulo
from soporte_modulosii4 sm
        WHERE sm.id = %s
    """

    connection = connections["default"]

    # Ejecutar la consulta SQL y obtener los resultados
    with connection.cursor() as cursor:
        cursor.execute(consulta_sql, [num_modulo])
        columns = [col[0] for col in cursor.description]
        resultados = [dict(zip(columns, row)) for row in cursor.fetchall()]

    # Devolver la respuesta JSON
    return JsonResponse(resultados, safe=False)


def actualizar_empresa(request):
    if request.method == "POST":
        try:
            # Obtén los datos del formulario
            num_empresa = request.POST.get("numEmpresa")
            nombre_empresa = request.POST.get("nombreEmpresa")
            direccion = request.POST.get("direccion")
            telefono = request.POST.get("telefono")
            email = request.POST.get("email")

            # Construir la consulta SQL de actualización
            consulta_sql = """
                UPDATE soporte_empresa
                SET nombreEmpresa = %s, direccion = %s, telefono = %s, email = %s
                WHERE id = %s
            """

            connection = connections["default"]

            # Ejecutar la consulta SQL de actualización
            with connection.cursor() as cursor:
                cursor.execute(
                    consulta_sql,
                    [nombre_empresa, direccion, telefono, email, num_empresa],
                )

            return JsonResponse({"status": "success", "success": True})
        except Exception as e:
            return JsonResponse({"error": "Error al actualizar la empresa"})
    else:
        return JsonResponse({"error": "Método no permitido"})


def actualizar_modulo(request):
    if request.method == "POST":
        try:
            # Obtén los datos del formulario
            num_modulo = request.POST.get("numModulo")
            modulo = request.POST.get("nombreModulo")
            descripcionModulo = request.POST.get("descripcion")

            # Construir la consulta SQL de actualización
            consulta_sql = """
                UPDATE soporte_modulosii4
                SET modulo = %s, descripcionModulo = %s
                WHERE id = %s;
            """

            connection = connections["default"]

            # Ejecutar la consulta SQL de actualización
            with connection.cursor() as cursor:
                cursor.execute(consulta_sql, [modulo, descripcionModulo, num_modulo])

            return JsonResponse({"success": True})
        except Exception as e:
            return JsonResponse({"error": "Error al actualizar el Modulo"})
    else:
        return JsonResponse({"error": "Método no permitido"})


@csrf_exempt
def actualizar_solicitante(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            # Realiza la lógica para actualizar el solicitante
            solicitante = Solicitante.objects.get(id=data["numSolicitante"])
            solicitante.nombreApellido = data["Nombre"]
            solicitante.telefonoSolicitante = data["Telefono"]
            solicitante.direccion = data["Direccion"]
            solicitante.correo = data["Correo"]
            solicitante.idEmpresa = Empresa.objects.get(id=data["Empresa"])
            solicitante.save()

            return JsonResponse({"status": "success", "success": True})
        except Exception as e:
            print("Error:", e)
            return JsonResponse({"error": "Error al actualizar el Modulo"})
    else:
        return JsonResponse({"error": "Método no permitido"})


def detalles_actualizacion(request):
    num_ticket = request.GET.get("numTicket")
    consulta_sql = """
        SELECT st.id,sm.modulo,(au.first_name || ' ' || au.last_name) AS full_name,
    (ss.nombreApellido || ' ' || se.nombreEmpresa) AS solicitante_empresa,st.prioridad,
    ses.descripcion,se.nombreEmpresa,st.horasDiariasAsignadas,st.descripcionGeneral,
    st.prioridad,st.fechaCreacion,st.fechaInicio,st.fechaFinalizacion,st.fechaFinalizacionReal,
    st.observaciones,st.facturar
FROM
    soporte_ticketactualizacion st
LEFT JOIN soporte_solicitante ss ON ss.id = st.idSolicitante_id
LEFT JOIN soporte_empresa se ON se.id = ss.idEmpresa_id
LEFT JOIN soporte_estadosticket ses ON ses.id = st.idestado_id
LEFT JOIN soporte_modulosii4 sm ON sm.id = st.moduloActualizar_id
LEFT JOIN auth_user au ON au.id = st.idAgente_id
LEFT JOIN soporte_estadosticket se2 ON se2.id = st.idestado_id
        WHERE st.id = %s
    """
    connection = connections["default"]
    with connection.cursor() as cursor:
        cursor.execute(consulta_sql, [num_ticket])
        columns = [col[0] for col in cursor.description]
        resultados = [dict(zip(columns, row)) for row in cursor.fetchall()]
    return JsonResponse(resultados, safe=False)


@csrf_exempt
def editar_ticket_actualizar(request):
    if request.method in ("PUT", "POST"):
        ticket_id = request.POST.get("numeroticketedit")
        # Obtener los datos del formulario
        id_agente = request.POST.get("agentesolicitadoedit", "")
        id_solicitante = request.POST.get("solicitanteEdit", "")
        horasAsignadas = request.POST.get("horasDiariasAsignadasedit", "")
        descripcion = request.POST.get("descripcionGeneraledit", "")
        prioridad = request.POST.get("prioridadEdit", "")
        observacion = request.POST.get("observacionesedit", "")
        id_estado = request.POST.get("estadoEdit", "")
        id_modulo = request.POST.get("moduloEdit", "")
        facturar = request.POST.get("facturaEdit", "")

        try:
            # Obtener la instancia del solicitante
            solicitante = Solicitante.objects.get(id=id_solicitante)

            # Obtener la instancia del usuario (agente)
            agente = User.objects.get(id=id_agente)

            estado = EstadosTicket.objects.get(id=id_estado)

            modulo = ModuloSii4.objects.get(id=id_modulo)

            # Obtener el ticket existente para editar
            ticket = TicketActualizacion.objects.get(id=ticket_id)

            # Actualizar los campos del ticket con los nuevos datos del formulario
            ticket.idAgente = agente
            ticket.idSolicitante = solicitante
            ticket.horasDiariasAsignadas = horasAsignadas
            ticket.descripcion = descripcion
            ticket.prioridad = prioridad
            ticket.observacion = observacion
            ticket.idestado = estado
            ticket.moduloActualizar_id = modulo
            ticket.facturar = facturar
            # Guardar los cambios en el ticket
            ticket.save()

            return JsonResponse(
                {"status": "success", "message": "Ticket editado con éxito"}
            )
        except Solicitante.DoesNotExist:
            return JsonResponse(
                {"status": "error", "message": "Solicitante no encontrado"}, status=400
            )
        except User.DoesNotExist:
            return JsonResponse(
                {"status": "error", "message": "Usuario (agente) no encontrado"},
                status=400,
            )
        except EstadosTicket.DoesNotExist:
            return JsonResponse(
                {"status": "error", "message": "Estado de ticket no encontrado"},
                status=400,
            )
        except TicketSoporte.DoesNotExist:
            return JsonResponse(
                {"status": "error", "message": "Ticket no encontrado"}, status=400
            )
        except Exception as e:
            return JsonResponse(
                {"status": "error", "message": f"Error al editar el ticket: {str(e)}"},
                status=400,
            )
    else:
        return JsonResponse(
            {"status": "error", "message": "Método no permitido"}, status=405
        )


@csrf_exempt
def editar_desarrollo(request):
    pass


@csrf_exempt
def finalizar_proyecto(request, id_ticket):
    try:
        ticket = TicketDesarrollo.objects.get(id=id_ticket)

        if request.method == "POST":
            estado_finalizado = EstadosTicket.objects.get(id=5)
            ticket.idestado = estado_finalizado
            # Obtener la fecha y hora actuales
            fecha_actual = timezone.now()
            # Asignar la fecha actual a la propiedad fechaFinalizacion
            ticket.fechaFinalizacion = fecha_actual
            ticket.save()
            return JsonResponse(
                {"status": "success", "message": "Registro actualizado correctamente"}
            )

    except TicketDesarrollo.DoesNotExist:
        return JsonResponse(
            {"status": "error", "message": "El ticket no existe"}, status=404
        )


@csrf_exempt
def tareas_actualizacion_success(request):
    if request.method == "POST":
        array_ids_tasks = request.POST.getlist("arrayIdsTasks")
        array_finish_tasks = request.POST.getlist("arrayTaskFinish")

        array_ids_tasks = json.loads(array_ids_tasks[0])
        array_finish_tasks = json.loads(array_finish_tasks[0])

        if len(array_ids_tasks) > 0:
            for tarea in array_ids_tasks:
                id_tarea_principal = tarea["idPrincipalTask"]
                registros_filtrados_process = (
                    ActividadPrincipalActualizacion.objects.filter(
                        id=id_tarea_principal, idestado_id=2
                    )
                )
                registros_filtrados_process.update(idestado_id=4)

        if len(array_finish_tasks) > 0:
            for tarea in array_finish_tasks:
                id_tarea_principal = tarea["idPrincipalTask"]
                registros_filtrados_just_finish = (
                    ActividadPrincipalActualizacion.objects.filter(
                        id=id_tarea_principal, idestado_id=4
                    )
                )
                registros_filtrados_just_finish.update(idestado_id=5)
                # Obtencion del ticke de desarrollo principal
                registro_actividades = ActividadPrincipalActualizacion.objects.filter(
                    id=id_tarea_principal
                )
                for registro in registro_actividades:
                    id_ticket_desarrollo = registro.idTicketDesarrollo_id

                registros_ticket = ActividadPrincipalActualizacion.objects.filter(
                    idTicketDesarrollo_id=id_ticket_desarrollo
                )
                todos_en_estado_5 = all(
                    registro.idestado_id == 5 for registro in registros_ticket
                )
                if todos_en_estado_5:
                    registro_ticket_general = TicketActualizacion.objects.filter(
                        id=id_ticket_desarrollo
                    )
                    registro_ticket_general.update(idestado_id=4)

        return JsonResponse(
            {"status": "success", "message": "Tareas cambiadas con exito"}
        )

    else:
        return JsonResponse({"error": "Método no permitido"}, status=405)


@csrf_exempt
def tareas_desarrollo_success(request):
    if request.method == "POST":
        array_ids_tasks = request.POST.getlist("arrayIdsTasks")
        array_ids_mains = request.POST.getlist("arrayTaskMains")

        array_ids_tasks = json.loads(array_ids_tasks[0])
        array_ids_mains = json.loads(array_ids_mains[0])
        # Iteracion del arreglo para editar los registros
        if len(array_ids_tasks) > 0:
            for tarea in array_ids_tasks:
                id_tarea_principal = tarea["idPrincipalTask"]
                id_tarea_secundaria = tarea["idSecondaryTask"]

                # Para la actividad principal en caso de que todas las secundarias esten hechas en estado 5
                actividad_secundaria = ActividadSecundaria.objects.get(
                    id=id_tarea_secundaria
                )
                actividad_secundaria.idestado_id = 5
                actividad_secundaria.save()
                # Aquí se compara si es que todas las actividades se encuentran estado 5 para poder cambiar el estado de la actividad principal a 4 (esperando finalización)
                tareas_completas = (
                    ActividadSecundaria.objects.filter(
                        idActividadPrincipal_id=id_tarea_principal, idestado_id=5
                    ).count()
                    == ActividadSecundaria.objects.filter(
                        idActividadPrincipal_id=id_tarea_principal
                    ).count()
                )
                # Se cambia el estado de la tarea principal en caso de que exista la condicion de arriba.
                if tareas_completas:
                    actividad_principal = ActividadPrincipal.objects.get(
                        id=id_tarea_principal
                    )
                    actividad_principal.idestado_id = 4
                    actividad_principal.save()

        if len(array_ids_mains) > 0:
            for task in array_ids_mains:
                actividad_principal = ActividadPrincipal.objects.get(id=task)
                actividad_principal.idestado_id = 5
                actividad_principal.save()

                # Comprobacion en caso de que todas las actividades esten realizadas para darle el cambio al proyecto en general
                # Traer el id de del desarrollo principal
                ticket_desarrollo = actividad_principal.idTicketDesarrollo
                id_ticket_desarrollo = ticket_desarrollo.id

                tareas_completas_principales = (
                    ActividadPrincipal.objects.filter(
                        idTicketDesarrollo_id=id_ticket_desarrollo, idestado_id=5
                    ).count()
                    == ActividadPrincipal.objects.filter(
                        idTicketDesarrollo_id=id_ticket_desarrollo
                    ).count()
                )

                if tareas_completas_principales:
                    proyecto_main = TicketDesarrollo.objects.get(
                        id=id_ticket_desarrollo
                    )
                    proyecto_main.idestado_id = 4
                    proyecto_main.save()

        return JsonResponse(
            {"status": "success", "message": "Datos recibidos correctamente"}
        )
    else:
        return JsonResponse({"error": "Método no permitido"}, status=405)


@csrf_exempt
def asgin_admin_project(request, id_agente, id_ticket):
    try:
        fecha_actual = datetime.now()
        fechaAsignacion = fecha_actual.strftime("%Y-%m-%d %H:%M:%S")
        proyecto = TicketDesarrollo.objects.get(id=id_ticket)
        # Cambio de agente administrador
        proyecto.idAgente_id = id_agente
        # Cambio de estado a en proceso
        proyecto.idestado_id = 2
        proyecto.fechaAsignacion = fechaAsignacion
        proyecto.save()
        # Devolver la respuesta JSON
        return JsonResponse(
            {"status": "success", "message": "Datos recibidos correctamente"}
        )
    except:
        return JsonResponse(
            {
                "error": "No se pudo realizar el cambio de Agente administrador del proyecto"
            },
            status=405,
        )


def asgin_agent_actualizacion(request, id_agente, id_ticket):
    try:
        fecha_actual = datetime.now()
        fechaInicio = fecha_actual.strftime("%Y-%m-%d %H:%M:%S")
        proyecto = TicketActualizacion.objects.get(id=id_ticket)
        # Cambio de agente administrador
        proyecto.idAgente_id = id_agente
        # Cambio de estado a en proceso
        proyecto.idestado_id = 2
        proyecto.fechaInicio = fechaInicio
        proyecto.save()
        # Devolver la respuesta JSON
        return JsonResponse(
            {"status": "success", "message": "Datos recibidos correctamente"}
        )
    except:
        return JsonResponse(
            {
                "error": "No se pudo realizar el cambio de Agente administrador del proyecto"
            },
            status=405,
        )


@csrf_exempt
def finish_ticket_update(request, id_ticket):
    try:
        ticket = TicketActualizacion.objects.get(id=id_ticket)

        if request.method == "POST":
            estado_finalizado = EstadosTicket.objects.get(id=5)
            ticket.idestado = estado_finalizado
            # Obtener la fecha y hora actuales
            fecha_actual = timezone.now()
            # Asignar la fecha actual a la propiedad fechaFinalizacion
            ticket.fechaFinalizacion = fecha_actual
            ticket.save()
            return JsonResponse(
                {"status": "success", "message": "Ticket cerrado correctamente"}
            )

    except TicketDesarrollo.DoesNotExist:
        return JsonResponse(
            {"status": "error", "message": "El ticket no existe"}, status=404
        )

@csrf_exempt
def null_ticket(request, id_ticket):
    try:
        fecha_actual = datetime.now()
        fecha_finalizacion = fecha_actual.strftime("%Y-%m-%d %H:%M:%S")
        data = json.loads(request.body)
        motivo = data.get('motivo', '')

        ticket = TicketSoporte.objects.get(id=id_ticket)
        ticket.idestado_id = 6
        ticket.fechaFinalizacionReal = fecha_finalizacion
        ticket.motivoAnulacion = motivo
        ticket.save()

        return JsonResponse(
            {"status": "success", "message": "Anulacion Exitosa"}
        )
    except Exception as e:
        return JsonResponse(
            {"status": "error", "message": f"Error al anular el ticket: {str(e)}"},
            status=400,
        )