# Flujos profesionales de uso

## Flujo A — Primera conexión segura

1. La persona crea un perfil y elige entorno: desarrollo, pruebas o producción.
2. LunarGrip muestra host, puerto, motor, base, identidad y color de riesgo.
3. Se prueba conectividad, TLS, versión y permisos sin leer datos de negocio.
4. Se seleccionan schemas y nivel de introspección.
5. Se guarda solo la referencia al secreto, nunca el secreto.
6. Se crea el primer snapshot con hash, capacidades y timestamp.

**Éxito:** la persona sabe exactamente dónde está conectada y qué se inspeccionó.

## Flujo B — Entender una tabla desconocida

1. Buscar tabla por nombre, comentario o columna.
2. Abrir resumen: columnas, claves, índices, filas aproximadas y comentarios.
3. Ver dependencias entrantes y salientes.
4. Abrir vecindario del diagrama.
5. Navegar al DDL, usos y consultas guardadas.
6. Pedir a LunarMind una explicación citando objetos concretos.

**Éxito:** la explicación distingue hecho, inferencia y relación virtual.

## Flujo C — Consultar sin congelar ni filtrar datos

1. Abrir consola con conexión visible.
2. Escribir SQL con completion y diagnóstico.
3. Ejecutar selección con límite y timeout.
4. Ver progreso, filas recibidas, duración y warnings.
5. Cancelar y comprobar estado final.
6. Exportar solo después de elegir columnas, formato y política de sensibilidad.

**Éxito:** cancelación real, resultado parcial claramente marcado y sin falsa
afirmación de completitud.

## Flujo D — Investigar lentitud

1. Seleccionar consulta del historial o Activity Monitor.
2. Ver resumen, duración, filas, errores y plan.
3. Comparar plan actual con una ejecución anterior.
4. Revisar índices, estadísticas, waits y cardinalidad.
5. Pedir una explicación de posibles causas.
6. Generar propuesta de índice o cambio con impacto, reversa y evidencia.
7. Probar en no producción antes de aplicar.

**Éxito:** LunarMind no afirma que un índice mejora sin medir o explicar la
incertidumbre.

## Flujo E — Comparar entornos y detectar drift

1. Capturar snapshot de desarrollo y pruebas.
2. Normalizar nombres y ordenar objetos de forma estable.
3. Mostrar objetos añadidos, eliminados y modificados.
4. Clasificar cambio: compatible, potencialmente destructivo o incompatible.
5. Generar script ordenado y rollback cuando sea posible.
6. Revisar permisos, dependencias y ventana de mantenimiento.

**Éxito:** el diff no confunde cambios de layout con cambios de esquema.

## Flujo F — Cambiar una tabla desde el diagrama

1. Activar modo de propuesta, no modo de ejecución.
2. Añadir columna o relación visual.
3. Mostrar SQL, precondiciones, lock/riesgo y reversa.
4. Validar contra snapshot y reglas del entorno.
5. Guardar propuesta en el proyecto.
6. Ejecutar solo con confirmación explícita y permiso válido.

**Éxito:** cerrar la vista sin confirmar no cambia nada.

## Flujo G — Trabajo de agente

1. PI crea tarea y asigna contexto.
2. LunarGrip entrega un snapshot acotado y marcado como dato.
3. El agente devuelve intención, SQL, objetos usados, riesgo y confirmación.
4. Un revisor valida contra requisitos y permisos.
5. La UI presenta preview.
6. La persona acepta, rechaza o solicita corrección.
7. El resultado vuelve a la tarea con evidencia y correlación.

**Éxito:** el agente no recibe secretos, no decide permisos y no puede saltarse
la confirmación desde texto.

