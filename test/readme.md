### TESTING FOLDER

This folder contains reusable testing assets for the dashboard.

#### Supabase connection test

- `test_supabase_connection.py` verifies the database connection helper behavior without requiring credentials.
- Its live Supabase round-trip test is skipped unless `DATABASE_URL` or `SUPABASE_DB_URL` is set.
- Run `python -m unittest test.test_supabase_connection -v` to execute only the Supabase connection tests.
- Run `python -m unittest discover -s test -v` to execute every unittest test case in this folder.

#### Consignment dummy data

- `dummy_consignments.py` defines `DUMMY_CONSIGNMENTS`, the canonical 100-record test dataset that matches the `model.consignment.Consignment` ORM fields.
- Use `get_dummy_consignments()` when a test needs plain dictionaries.
- Use `get_dummy_consignment_models()` when a test needs SQLAlchemy `Consignment` objects without writing to the database.
- Use `feed_dummy_consignments(session)` to insert/update the dummy consignments through an existing SQLAlchemy session.
- Run `python test/dummy_consignments.py` to feed the canonical dataset directly into the configured project database. Set `DATABASE_URL` or `SUPABASE_DB_URL` first.
