---
name: calqnotes-development
description: Разработка Calqnotes по спецификациям. Использовать при реализации фич, рефакторинге или когда пользователь просит разработать/реализовать что-то в проекте calqnotes.
---

# Разработка Calqnotes

## Перед началом

1. **Прочитать релевантные спецификации** в `spec/`:
   - spec/solution-overview.md — целевое решение
   - spec/requirements.md — MVP и TODO
   - spec/domain.md — выражения, вычисления
   - spec/ui.md — UI и клавиатура
   - spec/documents.md — документы, хранение
   - spec/research-calque.md — что взять из Calque

2. **Проверить правила кода** в docs/coding-standards.md:
   - FSD: app → pages → widgets → features → entities → shared
   - Публичный API через index.ts
   - Локализация: переводы внутри слайса, injectTranslation, useTranslation

## Workflow

1. Определить, в какой слой/слайс помещается код
2. Создать структуру по FSD (ui, model, api и т.д.)
3. Реализовать, сверяясь со спецификацией
4. Добавить переводы в слайс (translations.ts, TRANS_NS)
5. Запустить `npm run check` перед завершением

## Стек

- shadcn + Tailwind — UI. Компоненты в `src/components/`, импорт: `@/components/ui/...`

## Ключевые решения (из spec)

- math.js для вычислений
- IndexedDB для хранения
- Полный пересчёт при изменении (MVP)
- Сохранение по кнопке
- react-i18next, колоцированные переводы
