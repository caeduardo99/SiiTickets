from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import User
from django.db import models

class EstadosTicket(models.Model):
    id = models.AutoField(primary_key=True)
    descripcion = models.CharField(max_length=30)

class ModuloSii4(models.Model):
    id = models.AutoField(primary_key=True)
    modulo = models.CharField(max_length=255)
    descripcionModulo = models.CharField(max_length=255)

class Empresa(models.Model):
    id = models.AutoField(primary_key=True)
    nombreEmpresa = models.CharField(max_length=255)
    fechaCreacion = models.DateTimeField()
    direccion = models.CharField(max_length=255)
    telefono = models.CharField(max_length=255)
    email = models.CharField(max_length=255)

class Rol(models.Model):
    id = models.AutoField(primary_key=True)
    descripcion = models.CharField(max_length=255)


class Solicitante(models.Model):
    id = models.AutoField(primary_key=True)
    ruc = models.CharField(max_length=13)
    nombreApellido = models.CharField(max_length=255)
    telefonoSolicitante = models.CharField(max_length=255)
    direccion = models.CharField(max_length=255)
    correo = models.CharField(max_length=100)
    idEmpresa = models.ForeignKey(Empresa, on_delete=models.CASCADE)

class TicketActualizacion(models.Model):
    id = models.AutoField(primary_key=True)
    idAgente = models.ForeignKey('auth.User', on_delete=models.CASCADE)
    idSolicitante = models.ForeignKey(Solicitante, on_delete=models.CASCADE, related_name='ticket_actualizacion_solicitante')
    fechaCreacion = models.DateTimeField()
    fechaInicio = models.DateTimeField()
    fechaFinalizacion = models.DateTimeField()
    fechaFinalizacionReal = models.DateTimeField()
    horasDiariasAsignadas = models.DecimalField(max_digits=5, decimal_places=2)
    moduloActualizar = models.ForeignKey(ModuloSii4, on_delete=models.CASCADE, related_name='ticket_actualizacion_modulo')
    descripcionGeneral = models.CharField(max_length=255)
    observaciones = models.CharField(max_length=255)
    prioridad = models.CharField(max_length=100)
    idestado = models.ForeignKey(EstadosTicket, on_delete=models.CASCADE, related_name='ticket_actualizacion_estado')  # Cambio aquí
    facturar = models.BooleanField()

# Modelo TicketDesarrollo
class TicketDesarrollo(models.Model):
    id = models.AutoField(primary_key=True)
    tituloProyecto = models.CharField(max_length=255)
    descripcionActividadGeneral = models.CharField(max_length=500)
    idAgente = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ticket_desarrollo_agente')
    idSolicitante = models.ForeignKey(Solicitante, on_delete=models.CASCADE, related_name='ticket_desarrollo_solicitante')
    fechaCreacion = models.DateTimeField()
    fechaAsignacion = models.DateTimeField(blank=True, null=True)
    fechaFinalizacion = models.DateTimeField(blank=True, null=True)
    fechaFinalizacionEstimada = models.DateTimeField(blank=True, null=True)
    idestado = models.ForeignKey(EstadosTicket, on_delete=models.CASCADE, related_name='ticket_desarollo_estado')  # Cambio aquí
    facturar = models.BooleanField()
    horasCompletasProyecto = models.IntegerField()


# Modelo TicketSoporte
class TicketSoporte(models.Model):
    id = models.AutoField(primary_key=True)
    idAgente = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ticket_soporte_agente')
    idSolicitante = models.ForeignKey(Solicitante, on_delete=models.CASCADE, related_name='ticket_soporte_solicitante')
    fechaCreacion = models.DateTimeField()
    fechaInicio = models.DateTimeField(null=True, blank=True)
    fechaFinalizacion = models.DateTimeField(null=True, blank=True)
    fechaFinalizacionReal = models.DateTimeField(null=True, blank=True)
    comentario = models.CharField(max_length=255)
    prioridad = models.CharField(null=True, blank=True, max_length=255)
    causaerror = models.CharField(max_length=255)
    idestado = models.ForeignKey(EstadosTicket, on_delete=models.CASCADE,
                                 related_name='ticket_soporte_estado')  # Cambio aquí
    facturar = models.BooleanField(null=True, blank=True)
    chat = models.CharField(max_length=255, blank=True, null=True)
    trabajoRealizado = models.TextField(null=True, blank=True)  # Campo para describir el trabajo realizado
    imagenes = models.ImageField(upload_to='ticket_images/', null=True, blank=True)
    imagensoporte = models.ImageField(upload_to='ticket_images_soporte/', null=True, blank=True)


class ActividadPrincipal(models.Model):
    id = models.AutoField(primary_key=True)
    descripcion = models.CharField(max_length=255)
    idTicketDesarrollo = models.ForeignKey(TicketDesarrollo, on_delete=models.CASCADE)
    horasDiariasAsignadas = models.IntegerField()
    idestado = models.ForeignKey(EstadosTicket, on_delete=models.CASCADE, related_name='ticket_principal_estado')
    idAgente = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ticket_principal_agente')
    

class ActividadSecundaria(models.Model):
    id = models.AutoField(primary_key=True)
    descripcion = models.CharField(max_length=255)
    idActividadPrincipal = models.ForeignKey(ActividadPrincipal, on_delete=models.CASCADE)
    horasDiariasAsignadas = models.IntegerField()
    idestado = models.ForeignKey(EstadosTicket, on_delete=models.CASCADE, related_name='ticket_secundaria_estado')
    fechaDesarrollo = models.DateTimeField(blank=True, null=True)