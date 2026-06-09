### TESTING FOLDER

This folder contains reusable testing assets for the dashboard.

#### Consignment dummy data

- `dummy_consignments.py` defines `DUMMY_CONSIGNMENTS`, the canonical 100-record test dataset that matches the `model.consignment.Consignment` ORM fields.
- Use `get_dummy_consignments()` when a test needs plain dictionaries.
- Use `get_dummy_consignment_models()` when a test needs SQLAlchemy `Consignment` objects without writing to the database.
- Use `feed_dummy_consignments(session)` to insert/update the dummy consignments through an existing SQLAlchemy session.
- Run `python test/dummy_consignments.py` to feed the canonical dataset directly into the configured project database. Set `DATABASE_URL` or `SUPABASE_DB_URL` first.
