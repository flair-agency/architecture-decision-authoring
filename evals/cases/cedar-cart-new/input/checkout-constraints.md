# Checkout and search constraints — Cedar Cart

*Synthetic source snapshot; fictional facts created for this evaluation.*

- Checkout reserves inventory in the PostgreSQL transaction that commits the order.
- Checkout must check current stock at purchase time; stale catalog search results must not be used as the checkout stock authority.
- The product owner says catalog search results may be up to 15 minutes behind catalog edits. This freshness statement applies to search display only.
- No source specifies a synchronization design, index update delay within that limit, service budget, operational staffing requirement, or consistency policy for search.
- No owner decision about a separate index or search service is recorded in the supplied packet.
