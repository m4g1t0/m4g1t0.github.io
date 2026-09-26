# Constitución de trabajo CEO y Herrero

Coloca este archivo en `{{WORKSPACE_DIR}}/.specify/memory/constitution.md` (Spec Kit lo crea al inicializar; sustitúyelo por este contenido).

## Principios

### I. Dos sesiones independientes
CEO es Codex con GPT. Herrero es Codex con Qwen local. Ambos trabajan sobre la misma carpeta y el mismo checkout. El usuario realiza el cambio de sesión.

### II. Flujo único
CEO ejecuta `specify → clarify → plan → tasks`. Herrero lee los mismos artefactos y ejecuta `implement` directamente. No se añaden fases obligatorias.

### III. Ejecución directa
Cada Codex realiza su trabajo en su propia sesión. No se usan subagentes, workers, `codex exec`, Hermes, OpenCode, ECC, wrappers, orquestadores ni workflows automáticos. LM Studio sirve exclusivamente el modelo Qwen local.

### IV. Artefactos compartidos
La feature activa se registra en `.specify/feature.json`. `spec.md`, `plan.md`, `tasks.md` y los artefactos de diseño viven en `specs/<feature>/`. Herrero sigue estos documentos sin regenerarlos ni sustituir decisiones de CEO.

### V. Verificación de tareas
Herrero ejecuta las tareas en orden de dependencias y una cada vez. Marca `[X]` tras verificar cada tarea. Los marcadores `[P]` no implican delegación. Si no puede continuar, comunica la tarea y el motivo al usuario.

## Gobernanza

Esta arquitectura solo se cambia por petición explícita del usuario. Se instala únicamente lo necesario para el proyecto solicitado. No se crean proyectos de prueba ni canarios para verificar la configuración de este Mac.

**Version**: 1.0.0 | **Ratified**: 2026-09-26 | **Last Amended**: 2026-09-26
