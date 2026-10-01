### Target multi-document OWNER_ADDITION route (Issue #119 owner decision)

The owner selected the following bounded extension for v0.5.1 on 2026-09-26.
It removes the initial route's single-member Authority Set restriction only
through an explicitly versioned, consumer-selected route. It preserves the
single-file scope of Change B and does not authorize a consumer architecture
decision, an existing-rule amendment, or a work-completion claim.

The previous base policy selects the complete required Authority Set and
exactly one affected `self` member by stable ID and path. That member must use
`authority-revision`; its base bytes come from the same recorded base as the
policy and manifest. B may modify only that existing authority file. B cannot
change the policy, manifest, another authority member, implementation, or
workflow, or enable this route for its own review. An enforced route retains
protected-base selection. The separately versioned recorded-base procedural
route in Issue #121 reports its observed policy protection and host enforcement;
that selection does not relax addition eligibility.

Both the ordinary review of B and its separate addition-eligibility review
must receive every required member of that same base-selected Authority Set.
Same-repository members are immutable base snapshots, and external members
remain the exact consumer-selected snapshots under the existing GitHub
materialization and credential boundary. The eligibility request also receives
the affected member's proposed B bytes and exact base-to-B diff, identified as
candidate evidence rather than existing canonical authority. It must check
the proposed addition against unchanged members as well as the affected
member's existing rules. Links, prompt references, repository discovery,
summaries, and a smaller selected subset cannot substitute for required
authority bytes.

Every completed ordinary semantic decision and every completed B eligibility
result must report exactly the complete selected `authorityIds`. Missing,
duplicate, or extra IDs invalidate that review. A missing, inaccessible,
malformed, unverifiable, or oversized member leaves the procedure incomplete
before semantic review; it cannot be omitted, truncated, sampled, or replaced
by a weaker route. A material conflict among loaded authorities with no
adopted precedence or refinement rule remains an unresolved owner decision.
B must still add only the identified missing decision without changing an
existing rule, introducing a contradiction or unrelated unresolved choice,
or asserting completed work. An ordinary `BLOCK` cannot trigger this route.

The new route uses explicit policy, AdditionRecord, eligibility-schema and
report versions distinct from the initial route. Its tag-bound AdditionRecord
and procedure/report bind the repository, exact base and B commits, selected
policy revision and digest, manifest digest, complete selected-set digest,
affected member ID and path, before/after content digests, and exact missing
decision ID. The report also records every member's repository, resolved
commit, path and content digest, the annotated tag object OID and observed
tag-ref mapping. The ordinary review and eligibility result must be bound to
that same selected-set identity. A stale or mismatched base, head, policy,
set, affected member, decision ID or tag invalidates the procedure. These are
same-run bindings; they do not establish that a model read every byte or
create independently reusable acceptance evidence.

For this new route's ordinary and B-specific review, the versioned
`maxFileBytes` runtime ceiling is 262,144 bytes (256 KiB). The other ceilings
remain 65,536 manifest bytes, 32 members, 524,288 total authority bytes and
1,048,576 complete prompt bytes. The consumer must explicitly select all five
effective limits in the previous base policy. A lower selected limit remains
binding, and B cannot raise its own limit. The complete base set and the set
with the affected member replaced by its proposed bytes must each fit the
selected file and total-content limits. The complete eligibility prompt,
including all base authority bytes, proposed bytes, diff, ordinary result,
tag claim, metadata and instructions, must fit `maxPromptBytes`; exceeding it
leaves the review incomplete. This extension does not raise the limits of
the initial distributed-authority or local/manual routes.
