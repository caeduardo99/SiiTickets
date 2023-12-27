from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login as auth_login
from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout as logout_django
from django.shortcuts import render
from django.db import connections
import json
from django.views.decorators.http import require_POST
from django.http import JsonResponse
from .models import (
    TicketSoporte,
    TicketDesarrollo,
    ActividadPrincipal,
    ActividadSecundaria,
)
from django.contrib.auth.models import User
from .models import Solicitante, EstadosTicket
from datetime import datetime
from django.views.decorators.csrf import csrf_exempt
from .models import TicketSoporte, TicketActualizacion, ModuloSii4, Empresa
from django.contrib.auth.decorators import user_passes_test


def login_user(request):
    # Verificar si el usuario ya está autenticado
    if request.user.is_authenticated:
        return redirect("contact")

    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        user = authenticate(request, username=username, password=password)

        if user is not None:
            auth_login(request, user)
            # Redirige a la página 'contact' después del inicio de sesión
            return redirect("contact")
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
    print("nombre_usuario", nombre_usuario)

    context = {"nombre_usuario": nombre_usuario}
    return render(request, "contact.html", context)


@login_required
def soporte(request):
    nombre_usuario = request.user.username if request.user.is_authenticated else None

    # Llamar a la función solicitantes para obtener los resultados
    resultados_solicitantes = solicitantesjson(request)

    resultados_solicitantes_data = json.loads(resultados_solicitantes.content)

    # Llamar a la función agentes para obtener los resultados
    resultados_agentes = agentesjson(request)

    resultados_agentes_data = json.loads(resultados_agentes.content)

    resultados_estados = estadosjson(request)

    resultados_estados_data = json.loads(resultados_estados.content)

    context = {
        'nombre_usuario': nombre_usuario,
        'resultados_solicitantes_data': resultados_solicitantes_data,
        'resultados_agentes_data': resultados_agentes_data,
        'resultados_estados_data': resultados_estados_data
    }
    return render(request, 'soporte.html', context)


@login_required
@user_passes_test(lambda u: u.is_superuser or u.groups.filter(name='agentes').exists())
def desarrollo(request):
    nombre_usuario = request.user.username if request.user.is_authenticated else None
    print("nombre_usuario", nombre_usuario)

    resultados_solicitantes = solicitantesjson(request)

    resultados_solicitantes_data = json.loads(resultados_solicitantes.content)
    resultados_agentes = agentesjson(request)

    resultados_agentes_data = json.loads(resultados_agentes.content)

    context = {
        "nombre_usuario": nombre_usuario,
        "resultados_solicitantes_data": resultados_solicitantes_data,
        "resultados_agentes_data": resultados_agentes_data,
    }
    return render(request, "desarrollo.html", context)


@login_required
@user_passes_test(lambda u: u.is_superuser or u.groups.filter(name='agentes').exists())
def desarrolloact(request):
    nombre_usuario = request.user.username if request.user.is_authenticated else None

    # Llamar a la función solicitantes para obtener los resultados
    resultados_solicitantes = solicitantesjson(request)

    resultados_solicitantes_data = json.loads(resultados_solicitantes.content)

    # Llamar a la función agentes para obtener los resultados
    resultados_agentes = agentesjson(request)

    resultados_agentes_data = json.loads(resultados_agentes.content)

    # Llamar a la función estados para obtener los resultados
    resultados_estados = estadosjson(request)

    resultados_estados_data = json.loads(resultados_estados.content)

    # Llamar a la función estados para obtener los resultados
    resultados_modulo = modulojson(request)

    resultados_modulos_data = json.loads(resultados_modulo.content)

    context = {
        'nombre_usuario': nombre_usuario,
        'resultados_solicitantes_data': resultados_solicitantes_data,
        'resultados_agentes_data': resultados_agentes_data,
        'resultados_estados_data': resultados_estados_data,
        'resultados_modulos_data': resultados_modulos_data,
    }
    return render(request, 'desarrollo_actualizacion.html', context)


@login_required
@user_passes_test(lambda u: u.is_superuser or u.groups.filter(name='agentes').exists())
def empresas(request):
    # nombre_usuario = request.user.username if request.user.is_authenticated else None
    # print('nombre_usuario', nombre_usuario)

    resultados_empresas = empresasjson(request)

    resultados_empresas_data = json.loads(resultados_empresas.content)

    context = {
        'resultados_solicitantes_data': resultados_empresas_data,
    }
    return render(request, 'empresas.html', context)


@login_required
@user_passes_test(lambda u: u.is_superuser or u.groups.filter(name='agentes').exists())
def modulos(request):
    # nombre_usuario = request.user.username if request.user.is_authenticated else None
    # print('nombre_usuario', nombre_usuario)

    resultados_modulos = modulojson(request)

    resultados_modulos_data = json.loads(resultados_modulos.content)

    context = {
        'resultados_modulos_data': resultados_modulos_data,
    }
    return render(request, 'modulos.html', context)


@login_required
def usuarios(request):
    # nombre_usuario = request.user.username if request.user.is_authenticated else None
    # print('nombre_usuario', nombre_usuario)

    resultados_empresas = empresasjson(request)

    resultados_empresas_data = json.loads(resultados_empresas.content)

    context = {
        'resultados_empresas_data': resultados_empresas_data,
    }
    return render(request, 'usuarios.html', context)


########## BACKEND ##################

def solicitantesjson(request):
    # Obtener el nombre de usuario logeado
    nombre_usuario = request.user.username if request.user.is_authenticated else None

    # Construir la primera consulta SQL
    consulta_sql = """
        SELECT ss.id, ss.nombreApellido, se.nombreEmpresa 
        FROM soporte_solicitante ss
        INNER JOIN soporte_empresa se ON se.id = ss.idEmpresa_id
    """

    resultados = []  # Inicializar la variable de resultados

    # Agregar condición de filtro si hay un nombre de usuario logeado
    if nombre_usuario:
        consulta_sql += " WHERE se.nombreEmpresa = %s;"

        connection = connections["default"]

        # Ejecutar la primera consulta SQL y obtener los resultados
        with connection.cursor() as cursor:
            cursor.execute(consulta_sql, [nombre_usuario])
            columns = [col[0] for col in cursor.description]
            resultados = [dict(zip(columns, row)) for row in cursor.fetchall()]

        # Imprimir los resultados y nombre de usuario (para depuración)
        print("Nombre de usuario:", nombre_usuario)

    # Si la primera consulta devuelve un conjunto vacío, ejecutar la segunda consulta sin la condición WHERE
    if not resultados:
        print("La primera consulta devolvió un conjunto vacío. Ejecutando la segunda consulta.")
        connection = connections["default"]
        with connection.cursor() as cursor:
            cursor.execute(consulta_sql.replace("WHERE se.nombreEmpresa = %s", ""))
            columns = [col[0] for col in cursor.description]
            resultados = [dict(zip(columns, row)) for row in cursor.fetchall()]

    # Devolver la respuesta JSON
    return JsonResponse(resultados, safe=False)


def agentesjson(request):
    # Construir la consulta SQL
    consulta_sql = """
    SELECT id, first_name || ' ' || last_name AS full_name
FROM auth_user
WHERE (first_name IS NOT NULL AND first_name <> '') OR (last_name IS NOT NULL AND last_name <> '')
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
    connection = connections['default']
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
    connection = connections['default']

    # Ejecutar la consulta SQL y obtener los resultados
    with connection.cursor() as cursor:
        cursor.execute(consulta_sql)
        columns = [col[0] for col in cursor.description]
        resultados = [dict(zip(columns, row)) for row in cursor.fetchall()]

    # Devolver la respuesta JSON
    return JsonResponse(resultados, safe=False)


def clienteconsultajson(request):
    ruc_parametro = request.GET.get('ruc', 'valor_predeterminado')
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
    connection = connections['sql_server']
    # Ejecutar la consulta SQL y obtener los resultados
    with connection.cursor() as cursor:
        cursor.execute(consulta_sql, [ruc_parametro])
        columns = [col[0] for col in cursor.description]
        resultados = [dict(zip(columns, row)) for row in cursor.fetchall()]
    # Devolver la respuesta JSON
    return JsonResponse(resultados, safe=False)


def ticketsoportescreados(request):
    nombre_usuario = request.user.username if request.user.is_authenticated else None

    # Construir la consulta SQL original
    consulta_sql = """
        SELECT st.id as NumTicket, st.comentario as Motivo, ss.nombreapellido as Solicitante,
        st.prioridad as Prioridad, ses.descripcion as Estado, se.nombreEmpresa as NombreEmpresa
        FROM soporte_ticketsoporte st
        LEFT JOIN soporte_solicitante ss ON ss.id = st.idSolicitante_id
        LEFT JOIN soporte_empresa se ON se.id = ss.idEmpresa_id
        LEFT JOIN soporte_estadosticket ses ON ses.id = st.idestado_id
        LEFT JOIN auth_user au ON au.id = st.idAgente_id
    """

    # Crear una copia de la consulta original
    consulta_sql_copia = consulta_sql

    # Agregar condición de filtro si hay un nombre de usuario logeado
    if nombre_usuario:
        consulta_sql_copia += " WHERE au.username = %s "
    consulta_sql_copia += " ORDER BY st.id DESC "

    print('consulta_sql_copia', consulta_sql_copia)
    connection = connections["default"]

    # Ejecutar la consulta SQL y obtener los resultados
    with connection.cursor() as cursor:
        cursor.execute(consulta_sql_copia, [nombre_usuario])
        resultados = [dict(zip([col[0] for col in cursor.description], row)) for row in cursor.fetchall()]

        # Imprimir los resultados y nombre de usuario (para depuración)
        print("Nombre de usuario:", nombre_usuario)
        print("Resultados de la consulta JSON:", resultados)

    # Si la consulta devuelve un conjunto vacío y había un nombre de usuario, ejecutar la segunda consulta sin la condición WHERE original
    if not resultados and nombre_usuario:
        print("La consulta devolvió un conjunto vacío. Ejecutando la segunda consulta.")
        # Imprimir la consulta_sql_sin_filtro con el valor de nombre_usuario

        consulta_sql_sin_filtro = consulta_sql.replace("WHERE au.username = %s", "")
        consulta_sql_sin_filtro += " WHERE se.nombreEmpresa = %s"  # Nueva condición WHERE
        consulta_sql_sin_filtro += " ORDER BY st.id DESC "  # Cláusula ORDER BY agregada
        print("Consulta SQL sin filtro:", consulta_sql_sin_filtro % nombre_usuario)
        with connection.cursor() as cursor:
            cursor.execute(consulta_sql_sin_filtro, [nombre_usuario])
            resultados = [dict(zip([col[0] for col in cursor.description], row)) for row in cursor.fetchall()]

    # Si la segunda consulta también devuelve un conjunto vacío y el nombre de usuario es "mafer", ejecutar una tercera consulta sin la condición WHERE original
    if not resultados and nombre_usuario == "mafer":
        print("La segunda consulta también devolvió un conjunto vacío y el nombre de usuario es 'mafer'. Ejecutando la tercera consulta.")
        consulta_sql_tercera = consulta_sql.replace("WHERE au.username = %s", "")
        consulta_sql_tercera += " ORDER BY st.id DESC "  # Cláusula ORDER BY agregada
        print("Consulta SQL tercera sin filtro")
        with connection.cursor() as cursor:
            cursor.execute(consulta_sql_tercera)
            resultados = [dict(zip([col[0] for col in cursor.description], row)) for row in cursor.fetchall()]

            # Imprimir los resultados de la tercera consulta (para depuración)
            print("Resultados de la tercera consulta JSON:", resultados)

    # Devolver la respuesta JSON
    return JsonResponse(resultados, safe=False)


def ticketactualizacioncreados(request):
    nombre_usuario = request.user.username if request.user.is_authenticated else None
    # Construir la consulta SQL
    consulta_sql = """
        SELECT st.id as NumTicket, sm.modulo as Modulo, ss.nombreapellido as Solicitante,
st.prioridad as Prioridad, ses.descripcion as Estado,se.nombreEmpresa as NombreEmpresa
FROM soporte_ticketactualizacion st
left JOIN soporte_solicitante ss ON ss.id = st.idSolicitante_id
LEFT JOIN soporte_empresa se on se.id = ss.idEmpresa_id
left join soporte_estadosticket ses on ses.id = st.idestado_id
LEFT JOIN soporte_modulosii4 sm on sm.id = st.moduloActualizar_id
LEFT JOIN auth_user au ON au.id = st.idAgente_id
      WHERE au.username = %s
        """
    connection = connections['default']

    # Ejecutar la consulta SQL y obtener los resultados
    with connection.cursor() as cursor:
        cursor.execute(consulta_sql, [nombre_usuario])
        columns = [col[0] for col in cursor.description]
        resultados = [dict(zip(columns, row)) for row in cursor.fetchall()]

    # Devolver la respuesta JSON
    return JsonResponse(resultados, safe=False)


def ticketsoportescreadosid(request):
    # Obtener el valor del parámetro "id" de la solicitud
    ticket_id = request.GET.get('id', None)
    print(ticket_id)

    # Construir la consulta SQL
    consulta_sql = """
    SELECT 
  st.id,
  st.fechaCreacion,
  st.fechaInicio,
  st.fechaFinalizacion,
  st.fechaFinalizacionReal,
  st.comentario,
  st.causaerror ,
  st.facturar,
  st.idAgente_id,
  au.first_name || ' ' || au.last_name AS agente_nombre,
  st.idSolicitante_id,
  st.idestado_id,
  st.chat,
  st.prioridad,
  ss.nombreApellido,
  st.imagenes,
  st.imagensoporte,
  st.trabajoRealizado,
  se.nombreEmpresa
FROM 
  soporte_ticketsoporte st
LEFT JOIN 
  auth_user au ON au.id = st.idAgente_id
LEFT JOIN
  soporte_solicitante ss ON ss.id = st.idSolicitante_id
LEFT JOIN 
  soporte_empresa se on se.id = ss.idEmpresa_id 
    """

    # Agregar un filtro por ID si se proporciona el parámetro "id"
    if ticket_id is not None:
        consulta_sql += f" WHERE st.id = {ticket_id}"

    connection = connections['default']

    # Ejecutar la consulta SQL y obtener los resultados
    with connection.cursor() as cursor:
        cursor.execute(consulta_sql)
        columns = [col[0] for col in cursor.description]
        resultados = [dict(zip(columns, row)) for row in cursor.fetchall()]

    # Devolver la respuesta JSON
    return JsonResponse(resultados, safe=False)


def ticketDesarrolloCreados(request):
    nombre_usuario = request.user.username if request.user.is_authenticated else None
    consulta_sql = """
    SELECT st.id as NumTicket, ss.id as idCliente, ss.nombreApellido as Cliente, au.id as idAgente, au.first_name as Agente,
	se.nombreEmpresa as Empresa , st.tituloProyecto,st.idestado_id as idEstado, ses.descripcion as EstadoProyecto, 
	st.descripcionActividadGeneral, st.horasCompletasProyecto as HorasTotales,
	st.fechaCreacion, st.fechaAsignacion, st.fechaFinalizacionEstimada, st.fechaFinalizacion 
    FROM soporte_ticketdesarrollo st 
    LEFT JOIN soporte_solicitante ss ON ss.id = st.idSolicitante_id
    LEFT JOIN soporte_empresa se on se.id = ss.idEmpresa_id
    LEFT JOIN soporte_estadosticket ses on ses.id = st.idestado_id
    LEFT JOIN auth_user au on au.id = st.idAgente_id
    WHERE au.username = %s
    """
    connection = connections["default"]

    # Ejecutar la consulta SQL y obtener los resultados
    with connection.cursor() as cursor:
        cursor.execute(consulta_sql, [nombre_usuario])
        columns = [col[0] for col in cursor.description]
        resultados = [dict(zip(columns, row)) for row in cursor.fetchall()]

    # Devolver la respuesta JSON
    return JsonResponse(resultados, safe=False)


def detalleTicketDesarrollo(request, ticket_id):
    consulta_sql = """
    SELECT st.id as NumTicket, st.tituloProyecto , st.idAgente_id as idAgenteAdmin, au.first_name as nomAgenteAdmin,
	sa.id as idTareaPrincipal, sa.descripcion as TareaPrincipal, sa.idAgente_id as idAgenteTarPrincipal, 
	sa.horasDiariasAsignadas as horasPrincipales,
	au2.first_name as nomAgentTareaPrincipal,
	sa2.id as idTareaSecundaria, sa2.descripcion as TareaSecundaria, sa2.horasDiariasAsignadas as horasSecundarias
    FROM soporte_ticketdesarrollo st 
    LEFT JOIN soporte_actividadprincipal sa ON sa.idTicketDesarrollo_id = st.id
    LEFT JOIN soporte_actividadsecundaria sa2 ON sa2.idActividadPrincipal_id = sa.id 
    LEFT JOIN auth_user au ON au.id = st.idAgente_id
    LEFT JOIN auth_user au2 ON au2.id = sa.idAgente_id
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
    SELECT au.id, au.first_name, au.last_name, au.date_joined,
	sa.descripcion as tareaPrincipal,
	sa2.descripcion as tareaSecundaria,sa2.horasDiariasAsignadas as horasSecundarias, sa2.fechaDesarrollo,
	st.tituloProyecto as Proyecto
	FROM auth_user au 
	LEFT JOIN soporte_actividadprincipal sa ON sa.idAgente_id = au.id
	LEFT JOIN soporte_actividadsecundaria sa2 ON sa2.idActividadPrincipal_id = sa.id
	LEFT JOIN soporte_ticketdesarrollo st ON st.id = sa.idTicketDesarrollo_id  
	WHERE au.id = %s and sa2.idestado_id = 2
    """
    consulta_proyecto = """
    SELECT au.id, au.first_name, au.last_name, au.date_joined as fechaGrabado,
    st.id as idProject, st.tituloProyecto, st.horasCompletasProyecto 
    FROM auth_user au 
    LEFT JOIN soporte_ticketdesarrollo st ON st.idAgente_id = au.id 
    WHERE au.id = %s
    """
    consulta_actividad_principal = """
    SELECT au.id, au.first_name, au.last_name, au.date_joined as fechaGrabado,
	sa.descripcion as actividadPrincipal, sa.horasDiariasAsignadas as horasPrincipales
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


@require_POST
def crear_ticket_soporte(request):
    fecha_actual = datetime.now()
    # Obtener los datos del formulario
    id_agente = request.POST.get('agentesolicitado', '')
    id_solicitante = request.POST.get('solicitante', '')
    fecha_creacion = fecha_actual.strftime('%Y-%m-%d %H:%M:%S')
    fecha_inicio = request.POST.get('fecha_asignacion', '')
    print('fecha_inicio', fecha_inicio)
    fecha_finalizacion = request.POST.get('fecha_estimado', '')
    fecha_finalizacion_real = request.POST.get('fecha_finalizacion', '')
    comentario = request.POST.get('motivo', '')
    prioridad = request.POST.get('prioridad', '')
    print('prioridad', prioridad)
    observacion = request.POST.get('observaciones', '')
    id_estado = request.POST.get('estado', '')
    print('id_estado', id_estado)
    facturar = request.POST.get('factura', '')
    imagenes = request.FILES.get('imagenes')
    imagensoporte = request.FILES.get('imagensoporte')

    try:
        # Obtener la instancia del solicitante
        solicitante = Solicitante.objects.get(id=id_solicitante)

        # Obtener la instancia del usuario (agente)
        agente = User.objects.get(id=id_agente)

        if id_estado:
            estado = EstadosTicket.objects.get(id=id_estado)
        else:
            # Si id_estado es vacío o None, asignar el estado por defecto (id=1)
            estado = EstadosTicket.objects.get(id=1)

        # Verificar y asignar fechas

        fecha_inicio = fecha_inicio if fecha_inicio else None
        fecha_finalizacion = fecha_finalizacion if fecha_finalizacion else None
        fecha_finalizacion_real = fecha_finalizacion_real if fecha_finalizacion_real else None
        prioridad = prioridad if prioridad else None
        facturar = "" if facturar != 'True' and facturar != 'False' else facturar
        imagensoporte = imagensoporte if imagensoporte else None

        # Crear una instancia de TicketSoporte con los datos del formulario
        nuevo_ticket = TicketSoporte(
            idAgente=agente,
            idSolicitante=solicitante,
            fechaCreacion=fecha_creacion,
            fechaInicio=fecha_inicio,
            fechaFinalizacion=fecha_finalizacion,
            fechaFinalizacionReal=fecha_finalizacion_real,
            comentario=comentario,
            prioridad=prioridad,
            causaerror=observacion,
            idestado=estado,
            facturar=facturar,
            imagenes=imagenes,
            imagensoporte=imagensoporte
        )

        # Guardar el nuevo ticket en la base de datos
        nuevo_ticket.save()

        return JsonResponse({'status': 'success', 'message': 'Ticket creado con éxito'})
    except Solicitante.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Solicitante no encontrado'}, status=400)
    except User.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Usuario (agente) no encontrado'}, status=400)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': f'Error al crear el ticket: {str(e)}'}, status=400)


@require_POST
def crear_solicitante(request):
    fecha_actual = datetime.now()
    # Obtener los datos del formulario
    nombre = request.POST.get('nombreUsuario', '')
    ruc = request.POST.get('rucUsuario', '')
    direccion = request.POST.get('direccionUsuario', '')
    telefono = request.POST.get('telefonoUsuario', '')
    correo = request.POST.get('correoUsuario', '')
    idempresa = request.POST.get('empresaSolicitante', '')
    print('empresa', idempresa)

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

        return JsonResponse({'status': 'success', 'message': 'Usuario creado con éxito'})
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': f'Error al crear el Usuario: {str(e)}'}, status=400)


@csrf_exempt
def editar_ticket_soporte(request):
    if request.method in ('PUT', 'POST'):
        ticket_id = request.POST.get('numeroticketedit')
        print('editar', ticket_id)

        # Obtener los datos del formulario
        id_agente = request.POST.get('agentesolicitadoedit', '')
        id_solicitante = request.POST.get('solicitanteeditar', '')
        fecha_inicio = request.POST.get('fecha_asignacionedit', '')
        fecha_finalizacion = request.POST.get('fecha_estimadoedit', '')
        fecha_finalizacion_real = request.POST.get('fechafinalizacionedit', '')
        comentario = request.POST.get('motivoedit', '')
        prioridad = request.POST.get('prioridadedit', '')
        observacion = request.POST.get('observacionesedit', '')
        id_estado = request.POST.get('estadoeditar', '')
        facturar = request.POST.get('facturaedit', '')
        contenido_chat = request.POST.get('chat', '')
        print('chat', contenido_chat)
        trabajo_realizado = request.POST.get('trabajo_realizado', '')
        imagensoporte_actual = request.POST.get('imagensoporte_actual')
        imagensoporte = imagensoporte_actual if imagensoporte_actual else request.FILES.get('imagensoporte')

        try:
            # Obtener la instancia del solicitante
            solicitante = Solicitante.objects.get(id=id_solicitante)

            # Obtener la instancia del usuario (agente)
            agente = User.objects.get(id=id_agente)

            estado = EstadosTicket.objects.get(id=id_estado)

            # Obtener el ticket existente para editar
            ticket = TicketSoporte.objects.get(id=ticket_id)

            # Verificar y asignar fechas
            fecha_inicio = fecha_inicio if fecha_inicio else None
            fecha_finalizacion = fecha_finalizacion if fecha_finalizacion else None
            fecha_finalizacion_real = fecha_finalizacion_real if fecha_finalizacion_real else None

            # Actualizar los campos del ticket con los nuevos datos del formulario
            ticket.idAgente = agente
            ticket.idSolicitante = solicitante
            ticket.fechaInicio = fecha_inicio
            ticket.fechaFinalizacion = fecha_finalizacion
            ticket.fechaFinalizacionReal = fecha_finalizacion_real
            ticket.comentario = comentario
            ticket.prioridad = prioridad
            ticket.causaerror = observacion
            ticket.idestado = estado
            ticket.facturar = facturar
            ticket.trabajoRealizado = trabajo_realizado
            ticket.chat = contenido_chat
            ticket.imagensoporte = imagensoporte

            # Guardar los cambios en el ticket
            ticket.save()

            return JsonResponse({'status': 'success', 'message': 'Ticket editado con éxito'})
        except Solicitante.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Solicitante no encontrado'}, status=400)
        except User.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Usuario (agente) no encontrado'}, status=400)
        except EstadosTicket.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Estado de ticket no encontrado'}, status=400)
        except TicketSoporte.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Ticket no encontrado'}, status=400)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': f'Error al editar el ticket: {str(e)}'}, status=400)
    else:
        return JsonResponse({'status': 'error', 'message': 'Método no permitido'}, status=405)


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
        fechaEstimada = request.POST.get("fecha_estimado")
        fechaFinalizacion = request.POST.get("fecha_finalizacion")
        textDescripcionRequerimiento = request.POST.get("textDescripcionRequerimiento", "")
        numHorasCompletas = request.POST.get("inputNumHorasCompletas", "")
        estado = EstadosTicket.objects.get(id=id_estado)
        facturar = True

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
                    idAgente=agente
                )
                new_task_main.save()

        if len(array_task_second) > 0:
            consult_main = []
            for descripcionMain in array_descripcion_main:
                consulta_principal = """
                SELECT * FROM soporte_actividadprincipal
                """
                if descripcionMain is not None:
                    consulta_principal += (f" WHERE descripcion = %s AND idTicketDesarrollo_id = %s")

                connection = connections["default"]

                with connection.cursor() as cursor:
                    cursor.execute(consulta_principal, [descripcionMain, id_ticket_actual])
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
                            fechaDesarrollo=fecha_desarrollo
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
    ticket_id = request.GET.get('id', None)
    print(ticket_id)

    # Construir la consulta SQL
    consulta_sql = """
    SELECT * FROM soporte_ticketactualizacion
    """

    # Agregar un filtro por ID si se proporciona el parámetro "id"
    if ticket_id is not None:
        consulta_sql += f" WHERE id = {ticket_id}"

    connection = connections['default']

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
    connection = connections['default']

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
    connection = connections['default']

    # Ejecutar la consulta SQL y obtener los resultados
    with connection.cursor() as cursor:
        cursor.execute(consulta_sql)
        columns = [col[0] for col in cursor.description]
        resultados = [dict(zip(columns, row)) for row in cursor.fetchall()]

    # Devolver la respuesta JSON
    return JsonResponse(resultados, safe=False)


@require_POST
def crear_ticket_actualizacion(request):
    fecha_actual = datetime.now()
    # Obtener los datos del formulario
    id_agente = request.POST.get('agentesolicitado', '')
    id_solicitante = request.POST.get('solicitante', '')
    fecha_creacion = fecha_actual.strftime('%Y-%m-%d %H:%M:%S')
    fecha_inicio = request.POST.get('fecha_asignacion', '')
    fecha_finalizacion = request.POST.get('fecha_estimado', '')
    fecha_finalizacion_real = request.POST.get('fecha_finalizacion', '')
    horasDiariasAsignadas = request.POST.get('horasDiariasAsignadas', '')
    idmoduloActualizar = request.POST.get('modulo', '')
    print('idmoduloActualizar', idmoduloActualizar)
    descripcionGeneral = request.POST.get('descripcionGeneral')
    observaciones = request.POST.get('observaciones', '')
    prioridad = request.POST.get('prioridad', '')
    id_estado = request.POST.get('estado', '')
    facturar = request.POST.get('factura', '')

    try:
        # Obtener la instancia del solicitante
        solicitante = Solicitante.objects.get(id=id_solicitante)

        # Obtener la instancia del usuario (agente)
        agente = User.objects.get(id=id_agente)

        estado = EstadosTicket.objects.get(id=id_estado)

        modulo = ModuloSii4.objects.get(id=idmoduloActualizar)

        # Crear una instancia de TicketSoporte con los datos del formulario
        nuevo_ticket = TicketActualizacion(
            idAgente=agente,
            idSolicitante=solicitante,
            fechaCreacion=fecha_creacion,
            fechaInicio=fecha_inicio,
            fechaFinalizacion=fecha_finalizacion,
            fechaFinalizacionReal=fecha_finalizacion_real,
            horasDiariasAsignadas=horasDiariasAsignadas,
            moduloActualizar=modulo,
            descripcionGeneral=descripcionGeneral,
            observaciones=observaciones,
            prioridad=prioridad,
            idestado=estado,
            facturar=facturar
        )

        print(nuevo_ticket)
        nuevo_ticket.save()

        return JsonResponse({'status': 'success', 'message': 'Ticket creado con éxito'})
    except Solicitante.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Solicitante no encontrado'}, status=400)
    except User.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Usuario (agente) no encontrado'}, status=400)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': f'Error al crear el ticket: {str(e)}'}, status=400)


@require_POST
def crear_empresa(request):
    fecha_actual = datetime.now()
    # Obtener los datos del formulario
    fecha_creacion = fecha_actual.strftime('%Y-%m-%d %H:%M:%S')
    nombreEmpresa = request.POST.get('nombreEmpresa', '')
    direccion = request.POST.get('direccion', '')
    telefono = request.POST.get('telefono', '')
    email = request.POST.get('email', '')
    nueva_empresa = Empresa(

        fechaCreacion=fecha_creacion,
        nombreEmpresa=nombreEmpresa,
        direccion=direccion,
        telefono=telefono,
        email=email,
    )

    print(nueva_empresa)
    nueva_empresa.save()

    return JsonResponse({'status': 'success', 'message': 'Empresa creada con éxito'})


@require_POST
def crear_modulo(request):
    fecha_actual = datetime.now()
    # Obtener los datos del formulario
    modulo = request.POST.get('modulo', '')
    descripcionModulo = request.POST.get('descripcionModulo', '')
    nuevo_modulo = ModuloSii4(

        modulo=modulo,
        descripcionModulo=descripcionModulo,
    )

    print(nuevo_modulo)
    nuevo_modulo.save()

    return JsonResponse({'status': 'success', 'message': 'Modulo creado con éxito'})


def detalles_empresa(request):
    # Obtén el valor de numEmpresa desde la solicitud GET
    num_empresa = request.GET.get('numEmpresa')

    # Construir la consulta SQL con filtrado por numModulo
    consulta_sql = """
        SELECT se.id as NumEmpresa, se.nombreEmpresa, se.direccion, se.telefono, se.email
        FROM soporte_empresa se
        WHERE se.id = %s
    """

    connection = connections['default']

    # Ejecutar la consulta SQL y obtener los resultados
    with connection.cursor() as cursor:
        cursor.execute(consulta_sql, [num_empresa])
        columns = [col[0] for col in cursor.description]
        resultados = [dict(zip(columns, row)) for row in cursor.fetchall()]

    # Devolver la respuesta JSON
    return JsonResponse(resultados, safe=False)


def detalles_modulo(request):
    # Obtén el valor de numEmpresa desde la solicitud GET
    num_modulo = request.GET.get('numModulo')

    # Construir la consulta SQL con filtrado por numEmpresa
    consulta_sql = """
        select sm.id as NumModulo, sm.modulo, sm.descripcionModulo
from soporte_modulosii4 sm
        WHERE sm.id = %s
    """

    connection = connections['default']

    # Ejecutar la consulta SQL y obtener los resultados
    with connection.cursor() as cursor:
        cursor.execute(consulta_sql, [num_modulo])
        columns = [col[0] for col in cursor.description]
        resultados = [dict(zip(columns, row)) for row in cursor.fetchall()]

    # Devolver la respuesta JSON
    return JsonResponse(resultados, safe=False)


def actualizar_empresa(request):
    print('Ingresó a la vista actualizar_empresa')  # Agregado para verificar si se llega a la función
    if request.method == 'POST':
        try:
            # Obtén los datos del formulario
            num_empresa = request.POST.get('numEmpresa')
            nombre_empresa = request.POST.get('nombreEmpresa')
            direccion = request.POST.get('direccion')
            telefono = request.POST.get('telefono')
            email = request.POST.get('email')

            # Construir la consulta SQL de actualización
            consulta_sql = """
                UPDATE soporte_empresa
                SET nombreEmpresa = %s, direccion = %s, telefono = %s, email = %s
                WHERE id = %s
            """

            connection = connections['default']

            # Ejecutar la consulta SQL de actualización
            with connection.cursor() as cursor:
                cursor.execute(consulta_sql, [nombre_empresa, direccion, telefono, email, num_empresa])

            print(f'Empresa actualizada con éxito - NumEmpresa: {num_empresa}')

            return JsonResponse({'success': True})
        except Exception as e:
            print(f'Error al actualizar la empresa - NumEmpresa: {num_empresa}, Error: {e}')
            return JsonResponse({'error': 'Error al actualizar la empresa'})
    else:
        print('Error: Método no permitido')
        return JsonResponse({'error': 'Método no permitido'})


def actualizar_modulo(request):
    print('Ingresó a la vista actualizar_modulo')  # Agregado para verificar si se llega a la función
    if request.method == 'POST':
        try:
            # Obtén los datos del formulario
            num_modulo = request.POST.get('numModulo')
            modulo = request.POST.get('nombreModulo')
            descripcionModulo = request.POST.get('descripcion')

            # Construir la consulta SQL de actualización
            consulta_sql = """
                UPDATE soporte_modulosii4
                SET modulo = %s, descripcionModulo = %s
                WHERE id = %s;
            """

            connection = connections['default']

            # Ejecutar la consulta SQL de actualización
            with connection.cursor() as cursor:
                cursor.execute(consulta_sql, [modulo, descripcionModulo, num_modulo])

            print(f'Modulo actualizado con éxito - NumModulo: {num_modulo}')

            return JsonResponse({'success': True})
        except Exception as e:
            print(f'Error al actualizar el modulo - NumModulo: {num_modulo}, Error: {e}')
            return JsonResponse({'error': 'Error al actualizar el Modulo'})
    else:
        print('Error: Método no permitido')
        return JsonResponse({'error': 'Método no permitido'})


def detalles_actualizacion(request):
    num_ticket = request.GET.get('numTicket')
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
    connection = connections['default']
    with connection.cursor() as cursor:
        cursor.execute(consulta_sql, [num_ticket])
        columns = [col[0] for col in cursor.description]
        resultados = [dict(zip(columns, row)) for row in cursor.fetchall()]
    return JsonResponse(resultados, safe=False)


@csrf_exempt
def editar_ticket_actualizar(request):
    if request.method in ('PUT', 'POST'):
        ticket_id = request.POST.get('numeroticketedit')
        # Obtener los datos del formulario
        id_agente = request.POST.get('agentesolicitadoedit', '')
        id_solicitante = request.POST.get('solicitanteEdit', '')
        horasAsignadas = request.POST.get('horasDiariasAsignadasedit', '')
        descripcion = request.POST.get('descripcionGeneraledit', '')
        prioridad = request.POST.get('prioridadEdit', '')
        observacion = request.POST.get('observacionesedit', '')
        id_estado = request.POST.get('estadoEdit', '')
        id_modulo = request.POST.get('moduloEdit', '')
        facturar = request.POST.get('facturaEdit', '')

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

            return JsonResponse({'status': 'success', 'message': 'Ticket editado con éxito'})
        except Solicitante.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Solicitante no encontrado'}, status=400)
        except User.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Usuario (agente) no encontrado'}, status=400)
        except EstadosTicket.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Estado de ticket no encontrado'}, status=400)
        except TicketSoporte.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Ticket no encontrado'}, status=400)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': f'Error al editar el ticket: {str(e)}'}, status=400)
    else:
        return JsonResponse({'status': 'error', 'message': 'Método no permitido'}, status=405)


@csrf_exempt
def editar_desarrollo(request):
    pass

@csrf_exempt
def tareas_desarrollo_success(request):
    if request.method == 'POST':
        array_id_main_task = request.POST.getlist('arrayIdMainTask[]')
        array_id_seconds_task = request.POST.getlist('arrayIdSecondsTask[]')

        # Realiza las acciones necesarias con los datos, como imprimirlos
        print(f'Tareas Main: {array_id_main_task}, Tareas secundarias: {array_id_seconds_task}')

        # Devuelve una respuesta JSON opcional
        return JsonResponse({'status': 'success','message': 'Datos recibidos correctamente'})
    else:
        return JsonResponse({'error': 'Método no permitido'}, status=405)