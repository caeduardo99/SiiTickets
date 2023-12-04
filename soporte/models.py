from django.db import models

class Usuario(models.Model):
    id_plataforma = models.AutoField(primary_key=True)
    nombre_plataforma = models.CharField(max_length=255)
    usuario_anydesk = models.CharField(max_length=255)
    password_anydesk = models.CharField(max_length=255)
    instancia_sql = models.CharField(max_length=255)
    usuario_sql = models.CharField(max_length=255)
    contraseña_sql = models.CharField(max_length=255)
    host_remoto = models.CharField(max_length=255)
    usuario_remoto = models.CharField(max_length=255)
    password_remoto = models.CharField(max_length=255)
    nombre_red_radmin = models.CharField(max_length=255)
    password_radmin = models.CharField(max_length=255)
    url_radmin = models.CharField(max_length=255)
    usuario_equipo = models.CharField(max_length=255)
    contrasena_equipo = models.CharField(max_length=255)

    def __str__(self):
        return self.nombre_plataforma