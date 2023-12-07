# Generated by Django 3.2.23 on 2023-12-07 15:36

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
                ('fechaCreacion', models.DateTimeField(auto_now_add=True)),
                ('fechaInicio', models.DateTimeField(auto_now_add=True)),
                ('fechaFinalizacion', models.DateTimeField(auto_now_add=True)),
                ('fechaFinalizacionReal', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='ActividadSecundaria',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('descripcion', models.CharField(max_length=255)),
                ('fechaCreacion', models.DateTimeField(auto_now_add=True)),
                ('fechaInicio', models.DateTimeField(auto_now_add=True)),
                ('fechaFinalizacion', models.DateTimeField(auto_now_add=True)),
                ('fechaFinalizacionReal', models.DateTimeField(auto_now_add=True)),
                ('idActividadPrincipal', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='soporte.actividadprincipal')),
            ],
        ),
        migrations.CreateModel(
            name='Empresa',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('nombreEmpresa', models.CharField(max_length=255)),
                ('fechaCreacion', models.DateTimeField(auto_now_add=True)),
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
                ('nombreApellido', models.CharField(max_length=255)),
                ('telefonoSolicitante', models.CharField(max_length=255)),
                ('idEmpresa', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='soporte.empresa')),
            ],
        ),
        migrations.CreateModel(
            name='TicketSoporte',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('fechaCreacion', models.DateTimeField()),
                ('fechaInicio', models.DateTimeField()),
                ('fechaFinalizacion', models.DateTimeField()),
                ('fechaFinalizacionReal', models.DateTimeField()),
                ('comentario', models.CharField(max_length=255)),
                ('prioridad', models.CharField(max_length=100)),
                ('observacion', models.CharField(max_length=255)),
                ('facturar', models.BooleanField()),
                ('idAgente', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ticket_soporte_agente', to=settings.AUTH_USER_MODEL)),
                ('idSolicitante', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ticket_soporte_solicitante', to='soporte.solicitante')),
                ('idestado', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ticket_soporte_estado', to='soporte.estadosticket')),
            ],
        ),
        migrations.CreateModel(
            name='TicketDesarrollo',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('nombreProyecto', models.CharField(max_length=255)),
                ('fechaCreacion', models.DateTimeField()),
                ('fechaInicio', models.DateTimeField()),
                ('fechaFinalizacion', models.DateTimeField()),
                ('fechaFinalizacionReal', models.DateTimeField()),
                ('facturar', models.BooleanField()),
                ('descripcionActividadPrincipal', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='soporte.actividadprincipal')),
                ('idActividadSecundaria', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='soporte.actividadsecundaria')),
                ('idAgente', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ticket_desarrollo_agente', to=settings.AUTH_USER_MODEL)),
                ('idSolicitante', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ticket_desarrollo_solicitante', to=settings.AUTH_USER_MODEL)),
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
                ('moduloActualizar', models.CharField(max_length=255)),
                ('descripcionGeneral', models.CharField(max_length=255)),
                ('observaciones', models.CharField(max_length=255)),
                ('prioridad', models.CharField(max_length=100)),
                ('facturar', models.BooleanField()),
                ('idAgente', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('idEmpresa', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='soporte.empresa')),
                ('idestado', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ticket_actualizacion_estado', to='soporte.estadosticket')),
            ],
        ),
        migrations.AddField(
            model_name='actividadprincipal',
            name='idTicketDesarrollo',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='soporte.ticketdesarrollo'),
        ),
        migrations.AddField(
            model_name='actividadprincipal',
            name='idTicketSecundario',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='soporte.actividadsecundaria'),
        ),
    ]
