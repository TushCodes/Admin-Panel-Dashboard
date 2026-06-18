# API Module

This module is the integration point for external APIs.

Keep external API clients and fetchers here. Fetchers should return raw records to `services/dataAggregator.js`, where external API data is combined with the existing database-backed aggregated list.
