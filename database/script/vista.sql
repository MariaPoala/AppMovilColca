create view v_documento
as
select 
doc.id,
to_char(doc.fecha_creacion, 'DD/MM/YYYY') as fecha_creacion,
to_char(doc.fecha_edicion, 'DD/MM/YYYY') as fecha_edicion,
doc.numero_documento,
doc.observacion,
to_char(doc.fecha_documento, 'DD/MM/YYYY') as fecha_documento,
doc.url_archivo,
doc.es_anulado,
to_char(doc.fecha_anulacion, 'DD/MM/YYYY') as fecha_anulacion,
doc.motivo_anulacion,
doc.id_empleado, empleado.nombre as empleado_nombre,
doc.id_empresa,empresa.razon_social as empresa_razon_social,
doc.id_persona,persona.nombre as persona_nombre,
doc.id_tipo_documento,tipo.nombre as tipo_documento_nombre
from documento as doc
inner join tipo_documento as tipo on doc.id_tipo_documento=tipo.id
inner join empleado as empleado on doc.id_empleado=empleado.id
inner join empresa as empresa on doc.id_empresa=empresa.id
inner join persona as persona on doc.id_persona=persona.id


-- solicitud

create view v_solicitud
as
select 
sol.id,
to_char(sol.fecha_creacion, 'DD/MM/YYYY') as fecha_creacion,
to_char(sol.fecha_edicion, 'DD/MM/YYYY') as fecha_edicion,
sol.asunto,
sol.numero_documento,
to_char(sol.fecha_inicio, 'DD/MM/YYYY') as fecha_inicio,
to_char(sol.fecha_plazo, 'DD/MM/YYYY') as fecha_plazo,
sol.motivo,
sol.estado,
sol.url_archivo_solicitud,
sol.tipo_entidad,
sol.id_tipo_documento,tipo.nombre as tipo_documento_nombre, tipo.costo as i_total, tipo.forma_entrega as forma_entrega,
sol.id_documento,doc.numero_documento as nombre_documento, doc.url_archivo as archivo,
sol.id_empleado, empleado.nombre as empleado_nombre,
area.nombre as nombre_area,
-- sol.id_empresa, empresa.razon_social as razon_social
sol.id_persona,persona.nombre as persona_nombre

from solicitud as sol
inner join tipo_documento as tipo on sol.id_tipo_documento=tipo.id
inner join documento as doc on sol.id_documento=doc.id
inner join empleado as empleado on sol.id_empleado=empleado.id  
inner join area as area on empleado.id_area=area.id
-- inner join empresa as empresa on sol.id_empresa=empresa.id
inner join persona as persona on sol.id_persona=persona.id



create view v_empleado
as
select id,nombre||' '||apellido as nombre_apellido,id_area,email
from empleado

create view v_persona
as
select id,nombre||' '||apellido as nombre_apellido
from persona

create view v_distrito
as
select 
dis.id,
an.id_distrito,an.nombre as nombre
from distrito as dis
inner join anexo as an on dis.id=an.id_distrito

create view v_persona
as
SELECT CONCAT(nombre, ' ' , apellido) as nombre_apellido FROM persona;