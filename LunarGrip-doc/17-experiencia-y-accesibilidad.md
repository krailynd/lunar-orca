# Experiencia y accesibilidad

## Principio de superficie profesional

La interfaz debe privilegiar contexto y reversibilidad. Cada panel debe
responder: **dónde estoy**, **qué estoy viendo**, **contra qué entorno**, **qué
puede ocurrir** y **cómo vuelvo atrás**.

## Layout recomendado

```text
Conexiones / Object Explorer | Editor, resultados, plan o diagrama | Inspector
                              | estado, mensajes y auditoría
```

El panel derecho cambia según la selección: propiedades, permisos, dependencias,
riesgo, documentación o propuesta. No se debe abrir una segunda aplicación para
entender un objeto.

## Estados imprescindibles

| Estado | Debe mostrar |
|---|---|
| Sin conexión | Qué contexto falta y cómo conectarlo |
| Introspección | objeto actual, progreso y cancelación |
| Parcial | qué se recibió y qué no |
| Obsoleto | edad del snapshot y acción para refrescar |
| Permiso insuficiente | operación afectada y permiso requerido |
| Error | mensaje humano, código técnico y siguiente acción segura |
| Producción | señal visual persistente, no solo un color pequeño |
| Propuesta | SQL, alcance, riesgo, reversa y expiración |

## Teclado y lectores de pantalla

- Todo control debe tener nombre accesible, foco visible y orden lógico.
- El árbol debe poder expandirse, buscarse y navegarse sin ratón.
- El editor debe permitir ejecutar selección, statement actual y archivo con
  atajos configurables.
- El grid debe anunciar encabezado, fila, columna, null y estado de edición.
- Los colores de entorno deben tener texto/icono además del color.
- Los atajos deben respetar plataforma: `Cmd` en macOS y `Ctrl` en Linux/Windows.
- Las operaciones destructivas no deben depender de un gesto difícil de
  descubrir ni de una confirmación solo visual.

## Principios de interacción

1. Lectura rápida primero; detalle bajo demanda.
2. Nunca ocultar el contexto de conexión.
3. Deshacer/cancelar visible durante operaciones largas.
4. Preview antes de mutar.
5. Una acción por intención; no mezclar refresh con ejecución.
6. Errores accionables, no solo toasts.
7. Mantener la selección y el estado al cambiar de panel.

## Criterios UX de primera versión

- Una persona nueva identifica producción en menos de unos segundos.
- Abrir una tabla permite llegar a DDL, datos, relaciones y dependencias sin
  perder el contexto.
- Cancelar una consulta deja claro si fue cancelada o si terminó antes.
- Cerrar un preview no produce cambios.
- La misma tarea es operable con teclado.
