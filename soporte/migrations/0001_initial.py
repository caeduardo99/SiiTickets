# Generated by Django 3.2.23 on 2023-12-27 20:51

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='ActividadPrincipal',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('descripcion', models.CharField(max_length=255)),
                ('horasDiariasAsignadas', models.IntegerField()),
                ('idAgente', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ticket_principal_agente', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Empresa',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('nombreEmpresa', models.CharField(max_length=255)),
                ('fechaCreacion', models.DateTimeField()),
                ('direccion', models.CharField(max_length=255)),
                ('telefono', models.CharField(max_length=255)),
                ('email', models.CharField(max_length=255)),
            ],
        ),
        migrations.CreateModel(
            name='EstadosTicket',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('descripcion', models.CharField(max_length=30)),
            ],
        ),
        migrations.CreateModel(
            name='ModuloSii4',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('modulo', models.CharField(max_length=255)),
                ('descripcionModulo', models.CharField(max_length=255)),
            ],
        ),
        migrations.CreateModel(
            name='Rol',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('descripcion', models.CharField(max_length=255)),
            ],
        ),
        migrations.CreateModel(
            name='Solicitante',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('ruc', models.CharField(max_length=13)),
                ('nombreApellido', models.CharField(max_length=255)),
                ('telefonoSolicitante', models.CharField(max_length=255)),
                ('direccion', models.CharField(max_length=255)),
                ('correo', models.CharField(max_length=100)),
                ('idEmpresa', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='soporte.empresa')),
            ],
        ),
        migrations.CreateModel(
            name='TicketSoporte',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('fechaCreacion', models.DateTimeField()),
                ('fechaInicio', models.DateTimeField(blank=True, null=True)),
                ('fechaFinalizacion', models.DateTimeField(blank=True, null=True)),
                ('fechaFinalizacionReal', models.DateTimeField(blank=True, null=True)),
                ('comentario', models.CharField(max_length=255)),
                ('prioridad', models.CharField(blank=True, max_length=255, null=True)),
                ('causaerror', models.CharField(max_length=255)),
                ('facturar', models.BooleanField(blank=True, null=True)),
                ('chat', models.CharField(blank=True, max_length=255, null=True)),
                ('trabajoRealizado', models.TextField(blank=True, null=True)),
                ('imagenes', models.ImageField(blank=True, null=True, upload_to='ticket_images/')),
                ('imagensoporte', models.ImageField(blank=True, null=True, upload_to='ticket_images_soporte/')),
                ('idAgente', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ticket_soporte_agente', to=settings.AUTH_USER_MODEL)),
                ('idSolicitante', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ticket_soporte_solicitante', to='soporte.solicitante')),
                ('idestado', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ticket_soporte_estado', to='soporte.estadosticket')),
            ],
        ),
        migrations.CreateModel(
            name='TicketDesarrollo',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('tituloProyecto', models.CharField(max_length=255)),
                ('descripcionActividadGeneral', models.CharField(max_length=500)),
                ('fechaCreacion', models.DateTimeField()),
                ('fechaAsignacion', models.DateTimeField(blank=True, null=True)),
                ('fechaFinalizacion', models.DateTimeField(blank=True, null=True)),
                ('fechaFinalizacionEstimada', models.DateTimeField(blank=True, null=True)),
                ('facturar', models.BooleanField()),
                ('horasCompletasProyecto', models.IntegerField()),
                ('idAgente', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ticket_desarrollo_agente', to=settings.AUTH_USER_MODEL)),
                ('idSolicitante', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ticket_desarrollo_solicitante', to='soporte.solicitante')),
                ('idestado', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ticket_desarollo_estado', to='soporte.estadosticket')),
            ],
        ),
        migrations.CreateModel(
            name='TicketActualizacion',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('fechaCreacion', models.DateTimeField()),
                ('fechaInicio', models.DateTimeField()),
                ('fechaFinalizacion', models.DateTimeField()),
                ('fechaFinalizacionReal', models.DateTimeField()),
                ('horasDiariasAsignadas', models.DecimalField(decimal_places=2, max_digits=5)),
                ('descripcionGeneral', models.CharField(max_length=255)),
                ('observaciones', models.CharField(max_length=255)),
                ('prioridad', models.CharField(max_length=100)),
                ('facturar', models.BooleanField()),
                ('idAgente', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('idSolicitante', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ticket_actualizacion_solicitante', to='soporte.solicitante')),
                ('idestado', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ticket_actualizacion_estado', to='soporte.estadosticket')),
                ('moduloActualizar', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ticket_actualizacion_modulo', to='soporte.modulosii4')),
            ],
        ),
        migrations.CreateModel(
            name='ActividadSecundaria',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('descripcion', models.CharField(max_length=255)),
                ('horasDiariasAsignadas', models.IntegerField()),
                ('fechaDesarrollo', models.DateTimeField(blank=True, null=True)),
                ('idActividadPrincipal', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='soporte.actividadprincipal')),
                ('idestado', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ticket_secundaria_estado', to='soporte.estadosticket')),
            ],
        ),
        migrations.AddField(
            model_name='actividadprincipal',
            name='idTicketDesarrollo',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='soporte.ticketdesarrollo'),
        ),
        migrations.AddField(
            model_name='actividadprincipal',
            name='idestado',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ticket_principal_estado', to='soporte.estadosticket'),
        ),
    ]
