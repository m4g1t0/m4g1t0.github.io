# Guía humana: montar CEO y Herrero en tu Mac

Referencia fechada: **2026-09-26**. Esta guía describe un montaje observado en un Mac con Apple M4 Max y 64 GiB de memoria unificada (Codex CLI 0.156.1, LM Studio 0.4.25+1, Spec Kit 1.0.11). Es una referencia, no un requisito mínimo universal: los valores de tu modelo y tu hardware pueden ser distintos.

## Índice

1. [Qué vas a montar](#que-vas-a-montar)
2. [Antes de empezar](#antes-de-empezar)
3. [Instalar solo lo necesario](#instalar-solo-lo-necesario)
4. [Elegir carpeta e identificar Qwen](#elegir-carpeta-e-identificar-qwen)
5. [Servir Qwen](#servir-qwen)
6. [Configurar los dos Codex](#configurar-los-dos-codex)
7. [Preparar Spec Kit una sola vez en la carpeta real](#preparar-spec-kit-una-sola-vez-en-la-carpeta-real)
8. [Abrir CEO y Herrero](#abrir-ceo-y-herrero)
9. [Uso diario](#uso-diario)
10. [Comprobar y resolver fallos](#comprobar-y-resolver-fallos)
11. [Limpiar un montaje anterior](#limpiar-un-montaje-anterior)
12. [Fuentes y referencia fechada](#fuentes-y-referencia-fechada)

## Qué vas a montar

- **CEO**: un Codex CLI con GPT (proveedor `openai`, tu cuenta de ChatGPT). Solo planifica: `$speckit-specify → $speckit-clarify → $speckit-plan → $speckit-tasks`.
- **Herrero**: otro Codex CLI con Qwen local (proveedor `lmstudio`). Solo implementa: `$speckit-implement`.
- **Mismo checkout, dos homes**: ambos procesos usan la misma carpeta de trabajo (`-C`), pero cada uno tiene su propio `CODEX_HOME` con config, AGENTS y autenticación separados.
- **Spec Kit** compartido en la carpeta del proyecto: cinco skills y los artefactos de cada feature (`specs/<feature>/`), con la feature activa en `.specify/feature.json`.
- **LM Studio** como servidor de inferencia del Qwen (loopback, puerto 1234). No es otro agente: solo sirve el modelo.

El usuario cambia de sesión manualmente al terminar cada fase; CEO y Herrero no se invocan entre sí.

## Antes de empezar

- Mac Apple Silicon con Terminal y conocimientos básicos de comandos.
- Espacio en disco y memoria suficientes para el Qwen que elijas. En la referencia observada: un modelo de ~22,8 GB en un M4 Max con 64 GiB. No es una recomendación universal: verifica los requisitos del modelo concreto que vayas a cargar.
- Una cuenta propia de ChatGPT/OpenAI para el CEO (autenticación interactiva; no se copian tokens).
- Un Qwen local con origen verificable: ya descargado en LM Studio o con una procedencia que puedas comprobar. No inventes una URL de descarga del modelo observado; la etiqueta local no identifica por sí sola los pesos.
- No necesitas Hermes, un segundo agente, paquetes MLX independientes ni wrappers: el montaje mínimo es Codex CLI + LM Studio + Spec Kit.

## Instalar solo lo necesario

Reutiliza lo que ya tengas instalado; no reinstales herramientas generales.

1. **Codex CLI** (Homebrew u otra vía oficial). Versión observada: `0.156.1`.

   ```bash
   codex --version
   ```

   Resultado esperado: imprime la versión instalada. Si no existe, instálalo por su vía oficial (por ejemplo `brew install codex` si usas Homebrew).

2. **LM Studio** (app de escritorio, versión observada `0.4.25+1`). Aporta el servidor local y los comandos `lms`.

   ```bash
   lms --version
   ```

3. **Spec Kit** con `uv` y Python 3.11 o superior, fijando la versión observada:

   ```bash
   uv tool install specify-cli==1.0.11
   specify --version
   ```

   Resultado esperado: `specify-cli 1.0.11`. No ejecutes `specify workflow` ni instales extensiones de Git: la arquitectura solo usa las cinco skills.

## Elegir carpeta e identificar Qwen

1. Elige la carpeta compartida donde trabajarán ambos Codex (en adelante `WORKSPACE_DIR`), por ejemplo `$HOME/mi-proyecto`. Debe ser exactamente la misma para los dos procesos.

   ```bash
   mkdir -p "$HOME/mi-proyecto"
   cd "$HOME/mi-proyecto"
   ```

2. Identifica el Qwen disponible en tu LM Studio con su clave persistente:

   ```bash
   lms ls
   ```

   Resultado esperado: una lista de modelos con su identificador. Anota el que vayas a usar (en la referencia observada: `6-bit`). Si el modelo no está en disco y quieres exactamente los pesos del montaje observado, aporta su procedencia verificable; no lo sustituyas silenciosamente.

3. Define tus parámetros (son variables de esta guía, no un formulario):

   | Parámetro | Referencia observada | Qué debes hacer |
   |---|---|---|
   | `WORKSPACE_DIR` | `$HOME/mi-proyecto` | Tu carpeta elegida; la misma para ambos procesos |
   | `CEO_HOME` | `$HOME/.codex` | Distinto de HERRERO_HOME; conserva tu autenticación existente |
   | `HERRERO_HOME` | `$HOME/.codex-qwen` | Sin copiar la autenticación GPT |
   | `GPT_MODEL` | `gpt-6-sol` | Un modelo disponible para tu cuenta; no cambiarlo a escondidas |
   | `QWEN_MODEL_KEY` | la clave que devuelve `lms ls` | Debe existir en disco o tener origen verificable antes de descargarla |
   | `QWEN_MODEL_ID` | `6-bit` | El ID disponible después de cargar el modelo |
   | `QWEN_CONTEXT` | `169728` | No mayor que el contexto real cargado por tu modelo |
   | `COMPACT_LIMIT` | `135000` | Positivo y menor que QWEN_CONTEXT |

## Servir Qwen

1. Abre LM Studio y arranca el servidor en loopback (puerto 1234, sin CORS):

   ```bash
   lms server start
   ```

   Resultado esperado: servidor escuchando en `127.0.0.1:1234`.

2. Carga el modelo con su comando nativo (descargar y cargar son cosas distintas; `lms load` solo carga lo que ya está en disco), fijando contexto y concurrencia con las opciones que su ayuda muestra:

   ```bash
   lms load QWEN_MODEL_KEY --context-length QWEN_CONTEXT --parallel 1
   ```

   Sustituye `QWEN_MODEL_KEY` por la clave de tu modelo. Resultado esperado: el modelo queda cargado y su identificador estable (por ejemplo `6-bit`) disponible para el proveedor.

3. Persiste los defaults por modelo (contexto efectivo y concurrencia 1) para que las recargas conserven la configuración: en la instalación de referencia, `lms` no incluye un subcomando para defaults persistentes; configúralos desde la app de LM Studio (defaults por modelo) y verifica con `lms --help` las opciones que tu versión soporta. La concurrencia de referencia es 1.

## Configurar los dos Codex

1. Crea los dos homes si no existen:

   ```bash
   mkdir -p "$HOME/.codex" "$HOME/.codex-qwen"
   ```

2. Descarga las plantillas y sustituye los `{{PARAMETRO}}` por tus valores:

   - [Plantilla config CEO](/downloads/ceo.config.toml) → `$HOME/.codex/config.toml`
   - [Plantilla config Herrero](/downloads/herrero.config.toml) → `$HOME/.codex-qwen/config.toml`
   - [Reglas del CEO](/downloads/ceo-AGENTS.md) → `$HOME/.codex/AGENTS.md`
   - [Reglas del Herrero](/downloads/herrero-AGENTS.md) → `$HOME/.codex-qwen/AGENTS.md`
   - [Reglas del proyecto](/downloads/project-AGENTS.md) → `WORKSPACE_DIR/AGENTS.md`
   - [Constitución](/downloads/constitution.md) → `WORKSPACE_DIR/.specify/memory/constitution.md` (tras el init de Spec Kit)

   Las plantillas son portables: no contienen rutas, tokens ni datos del Mac de Aaron.

3. Autenticación: el CEO usa tu cuenta propia (la autenticación interactiva de Codex con OpenAI). No copies tokens ni archivos `auth.json` al home del Herrero: el proveedor local no los necesita.

4. Efecto de los permisos: en ambas plantillas, `approval_policy = "never"` y `sandbox_mode = "danger-full-access"` permiten que el Codex ejecute comandos sin pedir confirmación y sin sandbox. Es una decisión explícita del montaje; si prefieres más fricción, cambia esos valores antes de abrir cada sesión.

## Preparar Spec Kit una sola vez en la carpeta real

1. En `WORKSPACE_DIR`, inicializa Spec Kit con la integración Codex:

   ```bash
   specify init --here --integration codex --script sh
   ```

   Si la carpeta ya tiene contenido de Spec Kit, revisa qué hay antes de usar `--force`; no pases por encima un estado que quieras conservar.

2. La instalación crea skills y scripts en `.specify/` y `.agents/skills/`. Conserva solo las cinco skills de esta arquitectura: `speckit-specify`, `speckit-clarify`, `speckit-plan`, `speckit-tasks` y `speckit-implement`. Sustitúyelas por las copias adaptadas de esta web si quieres el mismo contenido:

   - [speckit-specify](/downloads/speckit/speckit-specify/SKILL.md)
   - [speckit-clarify](/downloads/speckit/speckit-clarify/SKILL.md)
   - [speckit-plan](/downloads/speckit/speckit-plan/SKILL.md)
   - [speckit-tasks](/downloads/speckit/speckit-tasks/SKILL.md)
   - [speckit-implement](/downloads/speckit/speckit-implement/SKILL.md)

3. Retira el workflow que la instalación añade (por ejemplo una skill `speckit-workflow` o entradas equivalentes en el manifiesto de Codex): esta arquitectura no usa workflows automáticos. Al retirar archivos, elimina solo sus entradas del manifiesto y conserva los hashes originales de los archivos que permanecen, para que la detección de customizaciones siga funcionando.

4. Conserva los scripts (`.specify/scripts/`), las plantillas, el estado de integración y la constitución. No crees un proyecto de prueba para verificar nada: la carpeta real es el destino.

## Abrir CEO y Herrero

Dos terminales, dos `CODEX_HOME` distintos, el mismo `-C`:

```bash
# CEO (en una terminal)
CODEX_HOME="$HOME/.codex" codex --no-daemon -C "$HOME/mi-proyecto"
```

```bash
# Herrero (en otra terminal)
CODEX_HOME="$HOME/.codex-qwen" codex --no-daemon --oss --local-provider lmstudio --model "$QWEN_MODEL_ID" -C "$HOME/mi-proyecto"
```

Resultado esperado: dos sesiones interactivas de Codex en la misma carpeta. El CEO pide tu autenticación OpenAI si no existe; el Herrero conecta con el servidor LM Studio ya cargado.

## Uso diario

1. Abre CEO y ejecuta, en orden: `$speckit-specify` (con la descripción de la feature), `$speckit-clarify`, `$speckit-plan` y `$speckit-tasks`. Cada orden genera o actualiza sus artefactos en `specs/<feature>/` y la feature activa queda registrada en `.specify/feature.json`.
2. Cuando `tasks` termina, cierra la sesión de CEO (o déjala en segundo plano) y abre Herrero.
3. En Herrero ejecuta `$speckit-implement`. Lee los artefactos, ejecuta las tareas una a una en orden de dependencias, verifica cada una y la marca `[X]` en `tasks.md`.
4. Si una tarea queda bloqueada, Herrero lo comunica; no improvisa ni regenera los artefactos de CEO.
5. Al terminar, vuelves a CEO para la siguiente feature. El cambio de sesión siempre lo haces tú.

## Comprobar y resolver fallos

- **Versión**: `codex --version`, `lms --version`, `specify --version`.
- **Proveedor y flags**: revisa el config efectivo de cada home (modelo, proveedor, `approval_policy`, `sandbox_mode` y las flags `[features]`).
- **Identificación del modelo**: `lms ls` para ver claves; tras cargar, el ID estable que devuelve la instalación.
- **Servidor apagado**: `lms server start` y vuelve a cargar el modelo.
- **Modelo no encontrado**: la clave de `lms load` debe coincidir con una entrada de `lms ls`; si no está en disco, descárgalo primero desde su origen verificable.
- **Contexto distinto**: el contexto efectivo es el que carga tu modelo; ajusta `model_context_window` y `model_auto_compact_token_limit` en consecuencia (compactación por debajo del contexto real).
- **Skill ausente**: comprueba que la carpeta existe en `.agents/skills/` y que su entrada sigue en el manifiesto de Codex.

No lances prompts canarios ni `codex exec` para verificar: la comprobación es de configuración y disponibilidad, no una prueba de calidad del modelo.

## Limpiar un montaje anterior

1. Identifica los componentes del montaje que reemplazas: procesos Codex en ejecución, configs y AGENTS de los homes implicados, skills instaladas y entradas del manifiesto.
2. Respalda la configuración antes de tocar nada (copia los `config.toml` y `AGENTS.md` afectados).
3. Retira solo los componentes identificados: skills extra y sus entradas de manifiesto, registros que la app de escritorio haya añadido (marketplaces/plugins como `openai-primary-runtime`) y flags ajenas.
4. No borres herramientas generales, proyectos ni historiales de sesión. Las caches de la app de escritorio pueden reaparecer: evalúa las flags efectivas y usa las dos CLI para la arquitectura mínima.

## Fuentes y referencia fechada

- [Codex CLI](https://developers.openai.com/codex/cli) y [referencia de configuración](https://developers.openai.com/codex/config-reference).
- [LM Studio: defaults por modelo](https://lmstudio.ai/docs/app/advanced/per-model) y [comando nativo de carga](https://lmstudio.ai/docs/cli/load).
- [Spec Kit: instalación oficial](https://github.com/github/spec-kit/blob/main/docs/installation.md) e [integración Codex](https://github.com/github/spec-kit/blob/main/docs/reference/integrations.md).
- Montaje observado el 2026-09-26: Codex CLI `0.156.1`, LM Studio `0.4.25+1`, Spec Kit `specify-cli 1.0.11`; M4 Max con 64 GiB; Qwen local `Qwen3.8-27B-Uncensored-6bit/6-bit` (ID estable `6-bit`, ~22,8 GB); contexto `169728`, compactación `135000`, concurrencia `1`; servidor en loopback puerto `1234` sin CORS.
