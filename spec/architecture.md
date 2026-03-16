# Архитектура

## Состояние системы

- **Zustand** — стейт-менеджер для приложения

```
NotebookStore (zustand)
  documents: Document[]
  activeDocumentId: string | null
  content: Record<string, string>   // docId -> raw text (строки через \n)
  sortOrder: Record<string, number>
  initialized: boolean
```

```
Document
  id: string
  name: string
  isDirty: boolean
```

---

## События системы

| Событие | Описание |
|---------|----------|
| `LINE_UPDATED` | Строка изменена |
| `LINE_ADDED` | Строка добавлена |
| `LINE_REMOVED` | Строка удалена |
| `DOCUMENT_LOADED` | Документ загружен |
| `DOCUMENT_CREATED` | Документ создан |
| `DOCUMENT_DELETED` | Документ удалён |
| `DOCUMENT_RENAMED` | Документ переименован |
| `DOCUMENT_SWITCHED` | Переключение на другой документ |

Каждое событие может инициировать пересчёт (для событий строк).

---

## API вычислительного движка

### Интерфейс

```ts
evaluateNotebook(lines: Line[]): EvaluatedLine[]
```

### EvaluatedLine

```ts
interface EvaluatedLine {
  id: string
  input: string
  result: number | null
  error: string | null
}
```
