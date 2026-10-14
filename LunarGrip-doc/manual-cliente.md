# Manual del cliente — LunarGrip

## Estado actual

LunarGrip tiene una UI integrada en Lunar Orca para explorar la experiencia de
trabajo con bases de datos junto al proyecto y sus agentes. En esta etapa es
una demostración: el motor real de conexión a bases de datos todavía no está
implementado.

El esquema, las filas de resultados y la ejecución que muestra la UI son
mock/demo. No representan una conexión real ni deben usarse para tomar
decisiones operativas.

## Flujo esperado

1. Elegir un contexto de conexión.
2. Confirmar servidor, base y entorno.
3. Explorar objetos y relaciones.
4. Consultar o pedir una explicación.
5. Revisar el preview y el riesgo.
6. Confirmar solo si la acción es intencional.
7. Consultar el resultado y su evidencia.

## Roles y permisos conceptuales

| Rol | Puede | No puede por defecto |
|---|---|---|
| Explorador | Leer metadatos y generar explicaciones. | Mutar datos o esquema. |
| Operador | Ejecutar lecturas aprobadas. | Ejecutar mutaciones sin confirmación. |
| Aprobador | Confirmar acciones sensibles. | Ocultar alcance o evidencia. |
| Agente | Proponer y explicar. | Autorizarse o recibir secretos. |

## FAQ

**¿LunarGrip ya está disponible?**
La UI de demostración está disponible, pero todavía no existe el motor de
conexión real a bases de datos.

**¿El agente puede borrar o cambiar datos?**
La visión establece que no puede hacerlo por sí solo.

**¿Qué pasa si se cae la conexión?**
Debe informarse como no verificable, nunca como éxito.

## Glosario

Usar `12-glosario.md` para términos de negocio y producto.
