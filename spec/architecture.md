# Архитектура

## Состояние системы

```
AppState
  documents: Document[]
  activeDocumentId: string
  notebooks: Record<string, Notebook>  // id -> lines
  scope: Record<string, number>
  dependencyGraph
```

```
Document
  id: string
  name: string
  notebookId: string  // или lines хранятся в document
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
