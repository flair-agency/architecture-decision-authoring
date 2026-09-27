# Existing decision CC-ADR-014

*Synthetic decision-record snapshot; fictional and adopted only within this case.*

- **Status:** Adopted by the fictional Cedar Cart product owner on 2025-11-03.
- **Decision:** Keep checkout and inventory reservation in the same PostgreSQL transaction; keep the web application as one deployable unit through the first catalog release.
- **Scope:** Checkout writes and the first catalog release. The record does not specify a search index or query boundary.
- **Review condition:** Revisit the single-unit deployment boundary if measured order writes exceed 20 per second for at least 10 consecutive minutes, or if the owner separately requests review.
- **Exceptions:** None recorded.
- **Authorization source:** This synthetic record is the only supplied evidence of the existing decision; no independent owner record is included.
