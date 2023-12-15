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
def desarrolloact(request):
    nombre_usuario = request.user.username if request.user.is_authenticated else None
    print("nombre_usuario", nombre_usuario)

    context = {"nombre_usuario": nombre_usuario}
    return render(request, "desarrollo_actualizacion.html", context)


########## BACKEND ##################


def solicitantesjson(request):
    # Construir la consulta SQL
    consulta_sql = """
      SELECT ss.id,ss.nombreApellido,se.nombreEmpresa 
FROM soporte_solicitante ss
INNER JOIN soporte_empresa se ON se.id = ss.idEmpresa_id;
    """
    connection = connections["default"]

    # Ejecutar la consulta SQL y obtener los resultados
    with connection.cursor() as cursor:
        cursor.execute(consulta_sql)
        columns = [col[0] for col in cursor.description]
        resultados = [dict(zip(columns, row)) for row in cursor.fetchall()]

    # Devolver la respuesta JSON
    return JsonResponse(resultados, safe=False)


def agentesjson(request):
    # Construir la consulta SQL
    consulta_sql = """
    SELECT id, first_name || ' ' || last_name AS full_name FROM auth_user;
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


def ticketsoportescreados(request):
    nombre_usuario = request.user.username if request.user.is_authenticated else None
    # Construir la consulta SQL
    consulta_sql = """
         SELECT st.id as NumTicket , st.comentario as Motivo, ss.nombreapellido as Solicitante,
      st.prioridad as Prioridad, ses.descripcion as Estado,se.nombreEmpresa as NombreEmpresa
      FROM soporte_ticketsoporte st
      LEFT JOIN soporte_solicitante ss ON ss.id = st.idSolicitante_id
      LEFT JOIN soporte_empresa se ON se.id = ss.idEmpresa_id
      LEFT JOIN soporte_estadosticket ses ON ses.id = st.idestado_id
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
    SELECT * FROM soporte_ticketsoporte
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


def ticketDesarrolloCreados(request):
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
    """
    connection = connections["default"]

    # Ejecutar la consulta SQL y obtener los resultados
    with connection.cursor() as cursor:
        cursor.execute(consulta_sql)
        columns = [col[0] for col in cursor.description]
        resultados = [dict(zip(columns, row)) for row in cursor.fetchall()]

    # Devolver la respuesta JSON
    return JsonResponse(resultados, safe=False)


def detalleTicketDesarrollo(request, ticket_id):
    consulta_sql = """
    SELECT st.id as NumTicket, ss.id as idCliente, ss.nombreApellido as Cliente, au.id as idAgente, au.first_name as Agente,
    se.nombreEmpresa as Empresa, st.tituloProyecto, st.idestado_id as idEstado, ses.descripcion as EstadoProyecto, 
    st.descripcionActividadGeneral, st.horasCompletasProyecto as HorasTotales,
    st.fechaCreacion, st.fechaAsignacion, st.fechaFinalizacionEstimada, st.fechaFinalizacion 
    FROM soporte_ticketdesarrollo st 
    LEFT JOIN soporte_solicitante ss ON ss.id = st.idSolicitante_id
    LEFT JOIN soporte_empresa se on se.id = ss.idEmpresa_id
    LEFT JOIN soporte_estadosticket ses on ses.id = st.idestado_id
    LEFT JOIN auth_user au on au.id = st.idAgente_id
    WHERE st.id = %s
    """

    connection = connections["default"]

    # Ejecutar la consulta SQL y obtener los resultados
    with connection.cursor() as cursor:
        cursor.execute(consulta_sql, [ticket_id])
        columns = [col[0] for col in cursor.description]
        resultados = [dict(zip(columns, row)) for row in cursor.fetchall()]

    # Devolver la respuesta JSON
    return JsonResponse(resultados[0], safe=False)


@require_POST
def crear_ticket_soporte(request):
    fecha_actual = datetime.now()
    # Obtener los datos del formulario
    id_agente = request.POST.get('agentesolicitado', '')
    id_solicitante = request.POST.get('solicitante', '')
    fecha_creacion = fecha_actual.strftime('%Y-%m-%d %H:%M:%S')
    fecha_inicio = request.POST.get('fecha_asignacion', '')
    fecha_finalizacion = request.POST.get('fecha_estimado', '')
    fecha_finalizacion_real = request.POST.get('fecha_finalizacion', '')
    comentario = request.POST.get('motivo', '')
    prioridad = request.POST.get('prioridad', '')
    print('prioridad', prioridad)
    observacion = request.POST.get('observaciones', '')
    id_estado = request.POST.get('estado', '')
    print('id_estado', id_estado)
    facturar = request.POST.get('factura', '')

    try:
        # Obtener la instancia del solicitante
        solicitante = Solicitante.objects.get(id=id_solicitante)

        # Obtener la instancia del usuario (agente)
        agente = User.objects.get(id=id_agente)

        estado = EstadosTicket.objects.get(id=id_estado)

        # Verificar y asignar fechas
        fecha_inicio = fecha_inicio if fecha_inicio else None
        fecha_finalizacion = fecha_finalizacion if fecha_finalizacion else None
        fecha_finalizacion_real = fecha_finalizacion_real if fecha_finalizacion_real else None

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
            observacion=observacion,
            idestado=estado,
            facturar=facturar
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
            ticket.observacion = observacion
            ticket.idestado = estado
            ticket.facturar = facturar
            ticket.chat = contenido_chat

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
        fechaAsignacion = request.POST.get("fecha_ticket_asignacion")
        textDescripcionRequerimiento = request.POST.get(
            "textDescripcionRequerimiento", ""
        )
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
                    id_estado_principal = 3

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
                    task_main_obj = ActividadPrincipal.objects.get(id=id_objeto)

                    if descripcion_objeto == descripcion_secundaria:
                        new_task_second = ActividadSecundaria(
                            descripcion=descripcion_adicional,
                            idActividadPrincipal=task_main_obj,
                            horasDiariasAsignadas=horas_secundarias,
                            idestado=EstadosTicket.objects.get(id=id_estado_principal),
                        )
                        new_task_second.save()

        return JsonResponse({"status": "success", "message": "Ticket creado con éxito"})
    except Exception as e:
        return JsonResponse(
            {"status": "error", "message": f"Error al crear el ticket: {str(e)}"},
            status=400,
        )
