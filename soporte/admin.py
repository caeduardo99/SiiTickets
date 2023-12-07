from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User

from .models import Empresa, Rol, TicketActualizacion, TicketDesarrollo, TicketSoporte, ActividadPrincipal, ActividadSecundaria, Solicitante, EstadosTicket

# Eliminar la clase ExtendedUserAdmin, ya que ahora estamos usando la UserAdmin predeterminada
# Personalizar la visualización de User en el admin si es necesario

# Registrar los modelos en el admin
admin.site.register(Empresa)
admin.site.register(Rol)
admin.site.register(TicketActualizacion)
admin.site.register(TicketDesarrollo)
admin.site.register(TicketSoporte)
admin.site.register(ActividadPrincipal)
admin.site.register(ActividadSecundaria)
admin.site.register(Solicitante)
admin.site.register(EstadosTicket)

# Personalizar la visualización de User en el admin si es necesario
admin.site.unregister(User)  # Desregistrar la UserAdmin predeterminada para evitar conflictos

class CustomUserAdmin(UserAdmin):
    # Agregar aquí cualquier personalización adicional que necesites
    pass

admin.site.register(User, CustomUserAdmin)  # Registrar la UserAdmin personalizada
