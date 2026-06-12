### TESTING FOLDER

This folder contains reusable testing assets for the JavaScript dashboard foundation.

- `test_prisma_connection.js` verifies Prisma Client connection helper behavior with an injectable fake client so tests do not require live database credentials.
- Run `npm test` to execute every Node.js test case in this folder.
- `dummy_consignments.js` defines `DUMMY_CONSIGNMENTS`, the canonical 100-record test dataset matching the Prisma `Consignment` model fields.
