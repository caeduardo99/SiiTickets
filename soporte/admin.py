from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import ExtendedUser, Empresa, Rol, TicketActualizacion, TicketDesarrollo, TicketSoporte, ActividadPrincipal, ActividadSecundaria

# Personalizar la visualización de ExtendedUser en el admin
class ExtendedUserAdmin(UserAdmin):
    add_fieldsets = UserAdmin.add_fieldsets + (
        (
            'Información Adicional',
            {
                'fields': (
                    'direccion',
                    'telefono1',
                    'telefono2',
                    'email',
                    'idEmpresa',
                    'idRol',
                ),
            },
        ),
    )

# Registrar los modelos en el admin
admin.site.register(ExtendedUser, ExtendedUserAdmin)
admin.site.register(Empresa)
admin.site.register(Rol)
admin.site.register(TicketActualizacion)
admin.site.register(TicketDesarrollo)
admin.site.register(TicketSoporte)
admin.site.register(ActividadPrincipal)
admin.site.register(ActividadSecundaria)
