# m4g1t0.github.io

Web personal de [m4g1t0](https://github.com/m4g1t0) con la documentación del montaje **CEO & Herrero**: dos Codex independientes que comparten una carpeta de trabajo, coordinados por Spec Kit.

## Páginas

- [/](https://m4g1t0.github.io/) — portada: qué es el montaje, cómo se reparten los roles y enlaces a las guías.
- [/guia-humana/](https://m4g1t0.github.io/guia-humana/) — guía paso a paso para montarlo tú mismo: instalación mínima, Qwen local en LM Studio, dos Codex con homes separados, Spec Kit, uso diario y diagnóstico.
- [/guia-ia/](https://m4g1t0.github.io/guia-ia/) — encargo autocontenido para una IA, con copia completa y descarga.

## Descargas (`/downloads/`)

- `guia-humana.md` y `guia-ia.md`: las dos guías completas en Markdown.
- `ceo.config.toml` y `herrero.config.toml`: plantillas de configuración con parámetros `{{...}}` que hay que sustituir.
- `ceo-AGENTS.md`, `herrero-AGENTS.md`, `project-AGENTS.md` y `constitution.md`: reglas de roles y constitución portables.
- `speckit/<skill>/SKILL.md`: las cinco skills de Spec Kit adaptadas a esta arquitectura (specify, clarify, plan, tasks, implement).

## Arquitectura documentada

- **CEO**: Codex CLI con GPT (proveedor `openai`). Solo planifica: `$speckit-specify → $speckit-clarify → $speckit-plan → $speckit-tasks`.
- **Herrero**: Codex CLI con Qwen local (proveedor `lmstudio` vía LM Studio). Solo implementa: `$speckit-implement`.
- Mismo checkout, dos `CODEX_HOME` distintos; Spec Kit compartido en la carpeta del proyecto. Sin delegación, workers, `codex exec` ni workflows automáticos.
- Referencia fechada: 2026-09-26 (Codex CLI 0.156.1, LM Studio 0.4.25+1, Spec Kit specify-cli 1.0.11). Es una referencia observada, no un requisito universal.

## Mantenimiento y publicación

- Sitio estático sin dependencias: HTML, CSS y un script de copia opcional (`assets/copy.js`). Todo el contenido esencial está disponible sin JavaScript.
- Mantenimiento manual: se editan los archivos directamente y se publican con el flujo nativo de GitHub Pages (rama `main`, raíz del repositorio). No hay build, package.json ni workflows de construcción.
