@echo off
setlocal

REM ====== НАСТРОЙКИ ======
REM Вставь сюда свой ключ OmniRoute sk-3e80064a1b81a335-439fd2-b132aa2d
set "ANTHROPIC_AUTH_TOKEN = sk-3e80064a1b81a335-4fd9a1-1b64f49f"

REM Вставь сюда Anthropic-compatible endpoint OmniRoute
REM Пример: https://api.omniroute.ai
set "ANTHROPIC_BASE_URL=http://localhost:20128/v1"

REM Опционально: если gateway не любит experimental betas
set "CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS=1"

REM Опционально: модель, если твой gateway требует явное имя
set "ANTHROPIC_MODEL=kr/claude-haiku-4.5"

echo Starting Claude Code via OmniRoute...
claude

endlocal