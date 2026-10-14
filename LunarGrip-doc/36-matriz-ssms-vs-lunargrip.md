# Matriz SSMS vs LunarGrip

| Capacidad conceptual | SSMS | LunarGrip en esta fase | Estado |
|---|---|---|---|
| Conectar servidor | Diálogo de conexión | Formulario local honesto | Demo, sin driver |
| Object Explorer | Árbol jerárquico | Servidor/base/schema/objetos | Demo |
| Editor T-SQL | Editor con ejecución | Monaco, ejecución deshabilitada | Parcial |
| Resultados | Filas y mensajes reales | Estado vacío/demo | No ejecuta SQL |
| ERD | Diagrama con relaciones | Snapshot determinista y etiquetado | Demo |
| Backup/restore | Operaciones del servidor | Generación de T-SQL | Sin ejecución |
| Credenciales | Gestionadas por el entorno | No se persisten | Fase 1A |

## Problema, accesibilidad y rendimiento

La comparación evita prometer paridad con SSMS. Las capacidades futuras deben
conservar teclado, focus, contraste, mensajes explícitos y límites de memoria.

## Criterios de aceptación

Toda capacidad no implementada se presenta como pendiente; ninguna acción
destructiva se simula como exitosa. Las referencias visuales solo aportan
estructura y comportamiento, nunca datos, nombres o servidores.

## Relación con Fase 1A y fuera de alcance

La matriz se apoya en los contratos IPC seguros existentes. Driver, ejecución
SQL, persistencia, conexiones externas y edición del esquema quedan fuera.
