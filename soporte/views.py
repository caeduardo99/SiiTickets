from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login as auth_login
from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout as logout_django
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponseBadRequest, HttpResponse
from django.db import connections



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
    return render(request, 'contact.html',context)


@login_required
def soporte(request):
    nombre_usuario = request.user.username if request.user.is_authenticated else None
    print('nombre_usuario', nombre_usuario)

    context = {
        'nombre_usuario': nombre_usuario
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
    return render(request, 'desarrollo_actualizacion.html',context)



def empresas(request):
    # Definir tu consulta SQL
    sql_query = "select * from auth_user;"
    connection = connections['default']
    # Ejecutar la consulta
    with connection.cursor() as cursor:
        cursor.execute(sql_query)
        columns = [col[0] for col in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]

    # Devolver los resultados como JSON
    return JsonResponse(results, safe=False)



