# Sync Documents to Knowledge Base

Sync documents from S3/DynamoDB to a Lyzr Knowledge Base.

## Arguments
- `app`: App name (e.g., compliance-qa)
- `kb_id`: Target Knowledge Base ID
- `filter`: (optional) Category or entity filter

## Instructions

1. Check for existing sync script in `apps/{app}/scripts/sync-documents.ts`
2. If not exists, create based on compliance-qa template

## Template

```typescript
import { getDocumentsIndex, getDocumentContent } from "@tasco/db/s3";
import { syncDocumentToRAG } from "@tasco/rag";

async function syncDocuments(kbId: string, apiKey: string, filter?: string) {
  const documents = await getDocumentsIndex();

  // Filter documents if needed
  const filtered = filter
    ? documents.filter(d => d.category === filter || d.entityId === filter)
    : documents;

  console.log(`Syncing ${filtered.length} documents to KB ${kbId}`);

  for (const doc of filtered) {
    const content = await getDocumentContent(doc.filename);

    await syncDocumentToRAG(
      { kbId, apiKey },
      {
        id: doc.id,
        name: doc.name,
        filename: doc.filename,
        content,
        category: doc.category,
        entityId: doc.entityId,
      }
    );

    console.log(`  Synced: ${doc.name}`);
  }
}
```

## Usage

```bash
# From app directory
bun run sync-documents

# Or with filter
FILTER=_LEGAL bun run sync-documents
```

## Notes

- Documents with `category: "_LEGAL"` are legal framework docs
- Documents with specific `entityId` are entity-specific
- Use `entityId: "_LEGAL"` for global legal documents
