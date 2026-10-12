# Архитектура

Код организован по Feature-Sliced Design: [docs/coding-standards.md](../docs/coding-standards.md).

## Слайсы

| Слой | Слайс | Что внутри |
|------|-------|------------|
| pages | `notebook` | Раскладка десктоп / телефон, горячие клавиши, баннер примера, подсказки пустой заметки, строка символов |
| widgets | `app-header` | Шапка десктопа, шапки экранов телефона, шторка меню заметки |
| widgets | `note-editor` | CodeMirror: подсветка, плашки результатов и ошибок, подсказки, автодополнение |
| widgets | `note-palette` | Палитра Ctrl K и список заметок на телефоне |
| widgets | `settings-dialog` | Настройки |
| widgets | `help-panel` | Шпаргалка |
| features | `precision-picker` | Точность: поповер и варианты |
| features | `note-actions` | Дублировать, скопировать с результатами, поделиться, удалить с отменой |
| entities | `line` | Движок вычислений, форматирование результата, каталог функций и единиц |
| entities | `note` | Стор заметок, заголовок и превью, статус сохранения |
| entities | `settings` | Стор настроек, точность заметки |
| shared | `api/storage` | IndexedDB |
| shared | `lib` | Форматирование чисел и дат, тема, i18n, мост к редактору |
| shared | `ui` | Логотип, сегментированный переключатель |

## Состояние (Zustand)

```
useNotesStore
  notes: Note[]                 // сначала недавно изменённые
  activeNoteId: string | null
  dirtyIds: string[]            // изменены, ещё не записаны
  saveStatus: "saved" | "dirty" | "saving" | "error"
  autosave: boolean             // синхронизируется с настройками
  deleted: Note | null          // для «Отменить»
  initialized: boolean

Note
  id, name, content, createdAt, updatedAt
  precision: "auto" | number | null
  example: boolean
```

```
useSettingsStore (persist → localStorage "calqnotes-settings")
  numberFormat: NumberFormat
  theme: "system" | "light" | "dark"
  font: "geist" | "system" | "mono"
  fontSize: 14 | 15 | 16 | 18
  editor: { lineNumbers, autosave, highlightVariable, autocomplete, wrap }
  welcomeDismissed: boolean
```

Эффекты настроек (тема, шрифт редактора в CSS-переменных, автосохранение) применяются в `app/providers`.

## Поток данных

1. Ввод в CodeMirror → `updateListener` → `setContent` в сторе → заметка помечается изменённой → через 1 с `saveNow` пишет в IndexedDB.
2. Вычисления живут внутри редактора: `StateField` пересчитывает `evaluateNotebook` при каждом изменении текста, декорации строятся из результата и настроек (`calqConfig`, передаётся через `Compartment`).
3. Смена заметки → новое `EditorState` (своя история отмены).
4. Шпаргалка, подсказки пустой заметки и строка символов вставляют текст через `shared/lib/editor-bridge`.

## API вычислительного движка

```ts
evaluateNotebook(lines: Line[]): EvaluatedLine[]

interface EvaluatedLine {
  id: string
  input: string
  kind: "empty" | "comment" | "expression"
  result: { value: number; unit: string | null } | null
  error: LineError | null
  assigns: string | null      // имя, которое задаёт строка
  uses: string[]              // переменные и last, которые использует строка
  inputOnly: boolean          // строка только задаёт число
}

interface LineError {
  code: "undefinedVariable" | "unknownUnit" | "missingParen" | "incomplete"
      | "unitMismatch" | "divisionByZero" | "notANumber" | "unsupported" | "invalid"
  name: string | null         // неизвестное имя как написано
  suggestion: string | null   // ближайшее известное имя
  from: number | null         // позиция name в input
  to: number | null
  raw: string                 // сообщение math.js
}
```

Форматирование отделено от движка: `formatNumber(value, NumberFormat)` в `shared/lib/format-number` и `formatLineResult(result, format)` в `entities/line`.

## Тесты

Vitest (`npm test`): движок на выражениях из макетов и форматтер чисел.
