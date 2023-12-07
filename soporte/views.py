from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login as auth_login
from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout as logout_django
from django.shortcuts import render
from django.db import connections
import json
from django.views.decorators.http import require_POST
from django.http import JsonResponse
from .models import TicketSoporte
from django.contrib.auth.models import User
from .models import Solicitante, EstadosTicket
from datetime import datetime


def login_user(request):
    # Verificar si el usuario ya está autenticado
    if request.user.is_authenticated:
        return redirect('contact')

    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)

        if user is not None:
            auth_login(request, user)
            # Redirige a la página 'contact' después del inicio de sesión
            return redirect('contact')
        else:
            message = "Usuario o clave incorrectos!"

        context = {
            'message': message,
        }
        return render(request, 'login.html', context)
    else:
        return render(request, 'login.html')


@login_required
def signout(request):
    """
    Vista para el cierre de sesión.
    """
    logout_django(request)
    return redirect('/')


@login_required
def contact(request):
    nombre_usuario = request.user.username if request.user.is_authenticated else None
    print('nombre_usuario', nombre_usuario)

    context = {
        'nombre_usuario': nombre_usuario
    }
    return render(request, 'contact.html', context)


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
    print('nombre_usuario', nombre_usuario)

    resultados_solicitantes = solicitantesjson(request)

    resultados_solicitantes_data = json.loads(resultados_solicitantes.content)
    resultados_agentes = agentesjson(request)

    resultados_agentes_data = json.loads(resultados_agentes.content)

    context = {
        'nombre_usuario': nombre_usuario,
        'resultados_solicitantes_data': resultados_solicitantes_data,
        'resultados_agentes_data': resultados_agentes_data
    }
    return render(request, 'desarrollo.html', context)


@login_required
def desarrolloact(request):
    nombre_usuario = request.user.username if request.user.is_authenticated else None
    print('nombre_usuario', nombre_usuario)

    context = {
        'nombre_usuario': nombre_usuario
    }
    return render(request, 'desarrollo_actualizacion.html', context)


########## BACKEND ##################


def solicitantesjson(request):
    # Construir la consulta SQL
    consulta_sql = """
      SELECT ss.id,ss.nombreApellido,se.nombreEmpresa 
FROM soporte_solicitante ss
INNER JOIN soporte_empresa se ON se.id = ss.idEmpresa_id;
    """
    connection = connections['default']

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
    connection = connections['default']

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
    connection = connections['default']

    # Ejecutar la consulta SQL y obtener los resultados
    with connection.cursor() as cursor:
        cursor.execute(consulta_sql)
        columns = [col[0] for col in cursor.description]
        resultados = [dict(zip(columns, row)) for row in cursor.fetchall()]

    # Devolver la respuesta JSON
    return JsonResponse(resultados, safe=False)


def ticketsoportescreados(request):
    # Construir la consulta SQL
    consulta_sql = """
    SELECT st.id as NumTicket, st.comentario as Motivo, ss.nombreapellido as Solicitante,
st.prioridad as Prioridad, ses.descripcion as Estado,se.nombreEmpresa as NombreEmpresa
FROM soporte_ticketsoporte st
left JOIN soporte_solicitante ss ON ss.id = st.idSolicitante_id
LEFT JOIN soporte_empresa se on se.id = ss.idEmpresa_id
left join soporte_estadosticket ses on ses.id = st.idestado_id

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
