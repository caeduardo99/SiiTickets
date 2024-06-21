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
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.login_user, name='login'),
    path('view_control_panel', views.view_control_panel, name='view_control_panel'),
    path('contacto', views.contact, name='contact'),
    path('soporte', views.soporte, name='soporte'),
    path('desarrollo', views.desarrollo, name='desarrollo'),
    path('desarrolloact', views.desarrolloact, name='desarrolloact'),
    path('empresas', views.empresas, name='empresas'),
    path('modulos', views.modulos, name='modulos'),
    path('usuariosSolicitantes', views.usuariosSolicitantes, name='usuariosSolicitantes'),
    path('usuariosEmpresas', views.usuariosEmpresas, name='usuariosEmpresas'),
    path('reportes', views.views_reports, name='views_reports'),
    path('logout/', views.signout, name='logout'),
    path('solicitantesjson/', views.solicitantesjson, name='solicitantesjson'),
    path('agentesjson/', views.agentesjson, name='agentesjson'),
    path('estadosjson/', views.estadosjson, name='estadosjson'),
    path('modulojson/', views.modulojson, name='modulojson'),
    path('empresasjson/', views.empresasjson, name='empresasjson'),
    path('clienteconsultajson/', views.clienteconsultajson, name='clienteconsultajson'),
    path('modulojson/', views.modulojson, name='modulojson'),
    path('ticketsoportescreados/', views.ticketsoportescreados, name='ticketsoportescreados'),
    path('ticketsoportescreadosid/<int:ticket_id>/', views.ticketsoportescreadosid, name='ticketsoportescreadosid'),
    path('ticketsoportescreadosid_new_page/<int:ticket_id>/', views.ticketsoportescreadosid_new_page, name='ticketsoportescreadosid_new_page'),
    path('crear_ticket_soporte/', views.crear_ticket_soporte, name='crear_ticket_soporte'),
    path('editar_ticket_soporte/<int:ticket_id>/', views.editar_ticket_soporte, name='editar_ticket_soporte'),
    path('ticketsActualizacionCreados/', views.ticketsActualizacionCreados, name='ticketsActualizacionCreados'),
    path('crear_ticket_actualizacion/', views.crear_ticket_actualizacion, name='crear_ticket_actualizacion'),
    path('detalles_actualizacion/', views.detalles_actualizacion, name='detalles_actualizacion'),
    path('editar_ticket_actualizar/', views.editar_ticket_actualizar, name='editar_ticket_actualizar'),
    path('ticketactualizacioncreadosid/', views.ticketactualizacioncreadosid, name='ticketactualizacioncreadosid'),
    path('generateReport/', views.generateReport, name='generateReport'),
    path('info_panel_contro/', views.info_panel_contro, name='info_panel_contro'),
    path('enviar_credenciales/', views.enviar_credenciales, name='enviar_correo'),
    path('send_manual/', views.send_manual, name='send_manual'),
    path('ticketDesarrolloCreados/', views.ticketDesarrolloCreados, name='ticketDesarrolloCreados'),
    path('crear_ticket_desarrollo/', views.crear_ticket_desarrollo, name='crear_ticket_desarrollo'),
    path('crear_ticket_soporte_agente/', views.crear_ticket_soporte_agente, name='crear_ticket_soporte_agente'),
    path('detalleTicketDesarrollo/<int:ticket_id>/', views.detalleTicketDesarrollo, name='detalleTicketDesarrollo'),
    path('getInfoReportSoport/<int:id_ticket>', views.getInfoReportSoport, name='getInfoReportSoport'),
    path('update_file_extra/<int:id_ticket>', views.update_file_extra, name='update_file_extra'),
    path('detalleTicketActualizacion/<int:ticket_id>/', views.detalleTicketActualizacion, name='detalleTicketActualizacion'),
    path('getInfoReport/<int:id_ticket>/', views.getInfoReport, name='getInfoReport'),
    path('getInfoActualizacionReport/<int:id_ticket>/', views.getInfoActualizacionReport, name='getInfoActualizacionReport'),
    path('finalizar_proyecto/<int:id_ticket>', views.finalizar_proyecto, name='finalizar_proyecto'),
    path('finish_ticket_update/<int:id_ticket>', views.finish_ticket_update, name='finish_ticket_update'),
    path('infoAgenteSolicitado/<int:id_agente>/', views.infoAgenteSolicitado, name='infoAgenteSolicitado'),
    path('asgin_admin_project/<int:id_agente>/<int:id_ticket>/', views.asgin_admin_project, name='asgin_admin_project'),
    path('asgin_agent_actualizacion/<int:id_agente>/<int:id_ticket>/', views.asgin_agent_actualizacion, name='asgin_agent_actualizacion'),
    path('asign_admin_ticket_support/<int:id_agente>/<int:id_ticket>/', views.asign_admin_ticket_support, name='asign_admin_ticket_support'),
    path('agregar_tareas/<int:id_ticket>', views.agregar_tareas, name='agregar_tareas'),
    path('eliminar_tarea/<int:id_ticket>', views.eliminar_tarea, name='eliminar_tarea'),
    path('editar_tareas_soporte/', views.editar_tareas_soporte, name='editar_tareas_soporte'),
    path('finalizar_tareas_soporte/', views.finalizar_tareas_soporte, name='finalizar_tareas_soporte'),
    path('cerrar_ticket/<int:id_ticket>',views.cerrar_ticket, name='cerrar_ticket'),
    path('regresar_estado_proceso/<int:id_ticket>',views.regresar_estado_proceso, name='regresar_estado_proceso'),
    path('actualizar_solicitante/', views.actualizar_solicitante, name='actualizar_solicitante'),
    path('getNumberInfo/<int:id_agente>', views.getNumberInfo, name='getNumberInfo'),
    path('empresascreados/', views.empresascreados, name='empresascreados'),
    path('moduloscreados/', views.moduloscreados, name='moduloscreados'),
    path('crear_empresa/', views.crear_empresa, name='crear_empresa'),
    path('crear_modulo/', views.crear_modulo, name='crear_modulo'),
    path('create_acces_empresa/', views.create_acces_empresa, name='create_acces_empresa'),
    path('crear_usuario_empresa/', views.crear_usuario_empresa, name='crear_usuario_empresa'),
    path('detalles_empresa/', views.detalles_empresa, name='detalles_empresa'),
    path('detalles_modulo/', views.detalles_modulo, name='detalles_modulo'),
    path('actualizar_empresa/', views.actualizar_empresa, name='actualizar_empresa'),
    path('actualizar_modulo/', views.actualizar_modulo, name='actualizar_modulo'),
    path('addImgAlter/<int:id_ticket>', views.addImgAlter, name='addImgAlter'),
    path('editar_desarrollo/', views.editar_desarrollo, name='editar_desarrollo'),
    path('crear_solicitante/', views.crear_solicitante, name='crear_solicitante'),
    path('tareas_desarrollo_success/', views.tareas_desarrollo_success, name='tareas_desarrollo_success'),
    path('tareas_actualizacion_success/', views.tareas_actualizacion_success, name='tareas_actualizacion_success'),
    path('solicitantescreados/', views.solicitantescreados, name='solicitantescreados'),
    path('null_ticket/<int:id_ticket>', views.null_ticket, name='null_ticket'),
    path('consultatareas_view/', views.consultatareas_view, name='consultatareas_view'),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
