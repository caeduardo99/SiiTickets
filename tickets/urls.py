"""tickets URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from soporte import views
from django.conf import settings

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.login_user, name='login'),
    path('contacto', views.contact, name='contact'),
    path('soporte', views.soporte, name='soporte'),
    path('desarrollo', views.desarrollo, name='desarrollo'),
    path('desarrolloact', views.desarrolloact, name='desarrolloact'),
    path('empresas', views.empresas, name='empresas'),
    path('modulos', views.modulos, name='modulos'),
    path('logout/', views.signout, name='logout'),

    path('solicitantesjson/', views.solicitantesjson, name='solicitantesjson'),
    path('agentesjson/', views.agentesjson, name='agentesjson'),
    path('estadosjson/', views.estadosjson, name='estadosjson'),
    path('modulojson/', views.modulojson, name='modulojson'),
    path('empresasjson/', views.empresasjson, name='empresasjson'),
    path('modulojson/', views.modulojson, name='modulojson'),

    path('ticketsoportescreados/', views.ticketsoportescreados, name='ticketsoportescreados'),
    path('ticketsoportescreadosid/', views.ticketsoportescreadosid, name='ticketsoportescreadosid'),
    path('crear_ticket_soporte/', views.crear_ticket_soporte, name='crear_ticket_soporte'),
    path('editar_ticket_soporte/', views.editar_ticket_soporte, name='editar_ticket_soporte'),

    path('ticketactualizacioncreados/', views.ticketactualizacioncreados, name='ticketactualizacioncreados'),
    path('crear_ticket_actualizacion/', views.crear_ticket_actualizacion, name='crear_ticket_actualizacion'),
    path('detalles_actualizacion/', views.detalles_actualizacion, name='detalles_actualizacion'),
    path('editar_ticket_actualizar/', views.editar_ticket_actualizar, name='editar_ticket_actualizar'),
    path('ticketactualizacioncreadosid/', views.ticketactualizacioncreadosid, name='ticketactualizacioncreadosid'),

    path('ticketDesarrolloCreados/', views.ticketDesarrolloCreados, name='ticketDesarrolloCreados'),
    path('crear_ticket_desarrollo/', views.crear_ticket_desarrollo, name='crear_ticket_desarrollo'),
    path('ticketDesarrollo/<int:ticket_id>/', views.detalleTicketDesarrollo, name='detalleTicketDesarrollo'),

    path('empresascreados/', views.empresascreados, name='empresascreados'),
    path('moduloscreados/', views.moduloscreados, name='moduloscreados'),
    path('crear_empresa/', views.crear_empresa, name='crear_empresa'),
    path('crear_modulo/', views.crear_modulo, name='crear_modulo'),
    path('detalles_empresa/', views.detalles_empresa, name='detalles_empresa'),
    path('detalles_modulo/', views.detalles_modulo, name='detalles_modulo'),
    path('actualizar_empresa/', views.actualizar_empresa, name='actualizar_empresa'),
    path('actualizar_modulo/', views.actualizar_modulo, name='actualizar_modulo'),

]
