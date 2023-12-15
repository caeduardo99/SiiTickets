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
    path('logout/', views.signout, name='logout'),

    path('solicitantesjson/', views.solicitantesjson, name='solicitantesjson'),
    path('agentesjson/', views.agentesjson, name='agentesjson'),
    path('estadosjson/', views.estadosjson, name='estadosjson'),

    path('ticketsoportescreados/', views.ticketsoportescreados, name='ticketsoportescreados'),
    path('ticketsoportescreadosid/', views.ticketsoportescreadosid, name='ticketsoportescreadosid'),
    path('crear_ticket_soporte/', views.crear_ticket_soporte, name='crear_ticket_soporte'),
    path('editar_ticket_soporte/', views.editar_ticket_soporte, name='editar_ticket_soporte'),


    path('ticketDesarrolloCreados/', views.ticketDesarrolloCreados, name='ticketDesarrolloCreados'),
    path('crear_ticket_desarrollo/', views.crear_ticket_desarrollo, name='crear_ticket_desarrollo'),
    path('ticketDesarrollo/<int:ticket_id>/', views.detalleTicketDesarrollo, name='detalleTicketDesarrollo'),

]
