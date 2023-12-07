from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import User
from django.db import models

class EstadosTicket(models.Model):
    id = models.AutoField(primary_key=True)
    descripcion = models.CharField(max_length=30)


class Empresa(models.Model):
    id = models.AutoField(primary_key=True)
    nombreEmpresa = models.CharField(max_length=255)
    fechaCreacion = models.DateTimeField(auto_now_add=True)
    direccion = models.CharField(max_length=255)
    telefono = models.CharField(max_length=255)
    email = models.CharField(max_length=255)

class Rol(models.Model):
    id = models.AutoField(primary_key=True)
    descripcion = models.CharField(max_length=255)

class TicketActualizacion(models.Model):
    id = models.AutoField(primary_key=True)
    idAgente = models.ForeignKey('auth.User', on_delete=models.CASCADE)
    idEmpresa = models.ForeignKey(Empresa, on_delete=models.CASCADE)
    fechaCreacion = models.DateTimeField()
    fechaInicio = models.DateTimeField()
    fechaFinalizacion = models.DateTimeField()
    fechaFinalizacionReal = models.DateTimeField()
    horasDiariasAsignadas = models.DecimalField(max_digits=5, decimal_places=2)
    moduloActualizar = models.CharField(max_length=255)
    descripcionGeneral = models.CharField(max_length=255)
    observaciones = models.CharField(max_length=255)
    prioridad = models.CharField(max_length=100)
    idestado = models.ForeignKey(EstadosTicket, on_delete=models.CASCADE, related_name='ticket_actualizacion_estado')  # Cambio aquí
    facturar = models.BooleanField()

# Modelo TicketDesarrollo
class TicketDesarrollo(models.Model):
    id = models.AutoField(primary_key=True)
    idAgente = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='ticket_desarrollo_agente')
    idSolicitante = models.ForeignKey('auth.User', on_delete=models.CASCADE, related_name='ticket_desarrollo_solicitante')
    nombreProyecto = models.CharField(max_length=255)
    fechaCreacion = models.DateTimeField()
    fechaInicio = models.DateTimeField()
    fechaFinalizacion = models.DateTimeField()
    fechaFinalizacionReal = models.DateTimeField()
    descripcionActividadPrincipal = models.ForeignKey('ActividadPrincipal', on_delete=models.CASCADE)
    idActividadSecundaria = models.ForeignKey('ActividadSecundaria', on_delete=models.CASCADE)
    idestado = models.ForeignKey(EstadosTicket, on_delete=models.CASCADE, related_name='ticket_desarollo_estado')  # Cambio aquí
    facturar = models.BooleanField()

class Solicitante(models.Model):
    id = models.AutoField(primary_key=True)
    nombreApellido = models.CharField(max_length=255)
    telefonoSolicitante = models.CharField(max_length=255)
    idEmpresa = models.ForeignKey(Empresa, on_delete=models.CASCADE)

# Modelo TicketSoporte
class TicketSoporte(models.Model):
    id = models.AutoField(primary_key=True)
    idAgente = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ticket_soporte_agente')
    idSolicitante = models.ForeignKey(Solicitante, on_delete=models.CASCADE, related_name='ticket_soporte_solicitante')
    fechaCreacion = models.DateTimeField()
    fechaInicio = models.DateTimeField()
    fechaFinalizacion = models.DateTimeField()
    fechaFinalizacionReal = models.DateTimeField()
    comentario = models.CharField(max_length=255)
    prioridad = models.CharField(max_length=100)
    observacion = models.CharField(max_length=255)
    idestado = models.ForeignKey(EstadosTicket, on_delete=models.CASCADE,related_name='ticket_soporte_estado')  # Cambio aquí
    facturar = models.BooleanField()

class ActividadPrincipal(models.Model):
    id = models.AutoField(primary_key=True)
    descripcion = models.CharField(max_length=255)
    fechaCreacion = models.DateTimeField(auto_now_add=True)
    fechaInicio = models.DateTimeField(auto_now_add=True)
    fechaFinalizacion = models.DateTimeField(auto_now_add=True)
    fechaFinalizacionReal = models.DateTimeField(auto_now_add=True)
    idTicketDesarrollo = models.ForeignKey(TicketDesarrollo, on_delete=models.CASCADE)
    idTicketSecundario = models.ForeignKey('ActividadSecundaria', on_delete=models.CASCADE)

class ActividadSecundaria(models.Model):
    id = models.AutoField(primary_key=True)
    descripcion = models.CharField(max_length=255)
    fechaCreacion = models.DateTimeField(auto_now_add=True)
    fechaInicio = models.DateTimeField(auto_now_add=True)
    fechaFinalizacion = models.DateTimeField(auto_now_add=True)
    fechaFinalizacionReal = models.DateTimeField(auto_now_add=True)
    idActividadPrincipal = models.ForeignKey(ActividadPrincipal, on_delete=models.CASCADE)