# Правила написания кода

## Спецификация

**Все изменения в коде должны отражаться в спецификации** (`spec/`):

- Добавили фичу — обновите requirements.md, ui.md и т.д.
- Реализовали что-то — отметьте в соответствующем spec-файле.
- Удалили или изменили — обновите spec.

## Feature-Sliced Design (FSD)

Проект использует [Feature-Sliced Design](https://feature-sliced.github.io/documentation/ru/) для организации кода. Цель — минимизировать разбросанность, чётко разделить ответственность, упростить навигацию.

### Правило импорта

Модуль может импортировать только из слоёв **строго ниже**. Исключение: `app` и `shared` могут импортировать друг друга.

```
app → pages → widgets → features → entities → shared
```

### Структура src/

```
src/
├── components/          # shadcn UI-компоненты (Button, Input и т.д.)
│   └── ui/              # импорт: @/components/ui/...
├── app/                 # Точка входа, провайдеры, стор
│   ├── providers/
│   ├── store/           # Zustand store
│   └── styles/
├── pages/               # Страницы приложения
│   └── notebook/
│       └── ui/
├── widgets/             # Крупные самодостаточные блоки UI
│   ├── document-sidebar/
│   └── notebook-editor/
├── features/           # Действия пользователя (переиспользуемые)
│   ├── save-document/
│   └── create-document/
├── entities/           # Бизнес-сущности
│   ├── document/
│   └── line/
└── shared/             # Переиспользуемый код без бизнес-логики
    ├── lib/             # Утилиты, хелперы, injectTranslation
    ├── api/             # API-клиент (если есть бэкенд)
    ├── config/          # Конфигурация
    └── i18n/            # Глобальные переводы (cancel, save и т.д.)
```

### Сегменты внутри слайса

| Сегмент | Назначение |
|---------|------------|
| `ui` | Компоненты, отображение |
| `model` | Состояние, бизнес-логика, типы |
| `api` | Запросы к внешним API |
| `lib` | Вспомогательный код слайса |
| `config` | Конфигурация слайса |

### Публичный API

Каждый слайс экспортирует наружу только через `index.ts` (или `index.tsx`). Внутренняя структура — деталь реализации.

```
entities/line/
├── model/
│   ├── types.ts
│   └── evaluate.ts
├── ui/
│   └── LineRow.tsx
└── index.ts          # export { ... } — только то, что нужно снаружи
```

Импорт снаружи: `import { LineRow } from "@/entities/line"`, не `from "@/entities/line/ui/LineRow"`.

---

## Общие правила

### TypeScript

- Строгая типизация, избегать `any`
- Интерфейсы для публичных контрактов
- Типы в `model/` или рядом с использованием

### React

- Функциональные компоненты
- Хуки для переиспользуемой логики
- Компоненты в `ui/`, логика в `model/` или хуках

### Стили и UI

- **Tailwind + shadcn** — основа стилей и компонентов
- Добавление: `npx shadcn@latest add <component>`
- Компоненты в `src/components/ui/` (настроено в `components.json`)
- Импорт: `@/components/ui/button`, `@/components/ui/input` и т.д.
- Без inline-стилей, кроме динамических значений
- Глобальные стили в `app/styles/`

### Именование

- Компоненты: PascalCase
- Файлы компонентов: PascalCase (LineRow.tsx)
- Хуки: camelCase с префиксом `use`
- Утилиты, типы: camelCase / PascalCase по контексту
- Папки: kebab-case (document-sidebar, notebook-editor)

### Biome

- Линтинг и форматирование через Biome
- `npm run check` перед коммитом
- Не отключать правила без явной причины (с комментарием)

### Локализация (react-i18next)

Переводы **колоцированы** со слайсами: каждый слайс (feature, widget, page, entity) содержит свой файл переводов.

**Структура слайса:**

```
features/save-document/
├── ui/
│   └── SaveButton.tsx
├── translations.ts      # { ru: { save: 'Сохранить' }, ... }
├── constants.ts         # export const TRANS_NS = 'save-document'
└── index.ts             # injectTranslation(TRANS_NS, translations); export ...
```

**Инжект в index.ts:**

```ts
import { injectTranslation } from "@/shared/lib/i18n";
import { translations } from "./translations";

export const TRANS_NS = "save-document";

injectTranslation(TRANS_NS, translations);

export { SaveButton } from "./ui/SaveButton";
```

**Использование в компонентах:**

```ts
import { useTranslation } from "react-i18next";
import { TRANS_NS } from "..";

const { t } = useTranslation(TRANS_NS);
return <button>{t("save")}</button>;
```

**Правила:**

- **Глобальный namespace** (`common` или `shared`) — для cancel, save, delete и других общих строк
- **Слайс-специфичный namespace** — для строк, уникальных для фичи/виджета/страницы
- Один слайс — один namespace (TRANS_NS)
- Файл `translations.ts`: `{ ru: Record<string, string>, ... }`
- Не хардкодить текст в компонентах

**Глобальные переводы:** `shared/i18n/` — общие строки (cancel, save, delete и т.д.), используемые в разных слайсах. Отдельный namespace, инжектится при инициализации приложения.

**Общая настройка:** `shared/lib/i18n` — экземпляр i18n, `injectTranslation()`, провайдер в `app/providers`.
