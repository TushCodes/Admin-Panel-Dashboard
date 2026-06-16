-- Refactor documents into standalone uploaded document references.
DROP TABLE IF EXISTS "documents";

CREATE TABLE "documents" (
  "id" SERIAL PRIMARY KEY,
  "document_upload" TEXT NOT NULL
);
