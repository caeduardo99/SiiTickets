from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login as auth_login
from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout as logout_django
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponseBadRequest, HttpResponse
from django.db import connections
from .models import Solicitante, Empresa
import json


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



    context = {
        'nombre_usuario': nombre_usuario,
        'resultados_solicitantes_data': resultados_solicitantes_data,
        'resultados_agentes_data': resultados_agentes_data
    }
    return render(request, 'soporte.html', context)


@login_required
def desarrollo(request):
    nombre_usuario = request.user.username if request.user.is_authenticated else None
    print('nombre_usuario', nombre_usuario)

    context = {
        'nombre_usuario': nombre_usuario
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

