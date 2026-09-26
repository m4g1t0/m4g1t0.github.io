# Arquitectura de trabajo

Coloca este archivo en la raíz del proyecto compartido (`{{WORKSPACE_DIR}}/AGENTS.md`).

- CEO = Codex con GPT: `$speckit-specify` → `$speckit-clarify` → `$speckit-plan` → `$speckit-tasks`.
- Herrero = Codex con Qwen local: `$speckit-implement`, leyendo los mismos artefactos y ejecutando directamente las tareas.
- Ambos trabajan en esta carpeta y en el mismo checkout. La feature activa se comparte mediante `.specify/feature.json`; sus artefactos viven en `specs/<feature>/`.
- El usuario cambia de una sesión a otra al terminar cada fase. CEO y Herrero no se invocan entre sí.
- No se permite delegación, subagentes, workers, `codex exec`, Hermes, OpenCode, ECC, wrappers, orquestadores ni workflows automáticos. CEO investiga dentro de su propia sesión; Herrero implementa dentro de la suya.
- Herrero ejecuta las tareas secuencialmente, verifica y marca cada tarea completada en el mismo `tasks.md`. Si falta un artefacto o una tarea está bloqueada, informa al usuario.
