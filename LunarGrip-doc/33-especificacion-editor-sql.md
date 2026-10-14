# Especificación del editor SQL

## Problema y objetivo

El textarea no ofrece una experiencia profesional. LunarGrip reutiliza Monaco
existente para T-SQL, con tabs de consulta, nombre, dirty state, líneas,
selección, copiado y espacio para diagnósticos.

## Comportamiento

El editor muestra el contexto de base y mantiene el botón `Ejecutar`
deshabilitado hasta que exista conexión real. `Ctrl/Cmd+Enter` y `F5` quedan
reservados para una fase futura. Las sugerencias futuras se agruparán por
keywords, tablas, columnas, funciones y schemas.

## Accesibilidad y rendimiento

Monaco conserva navegación por teclado y contraste de editor. Los mensajes de
error deben ser legibles y no filtrar secretos. Los modelos se deben liberar al
cerrar tabs y no se guarda contenido localmente sin un patrón seguro existente.

## Criterios y datos

No hay resultados simulados tras pulsar ejecutar: en esta fase se muestra un
estado vacío/demo y el panel `Mensajes` explica la limitación.

## Fase 1A y fuera de alcance

Los contratos IPC permanecen intactos. Quedan fuera driver, ejecución SQL,
autocompletado de schema real, formato y persistencia de consultas.
