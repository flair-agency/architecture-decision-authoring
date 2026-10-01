# Synthetic Proposal: informational age in the weekly queue

> **Status:** Proposed — synthetic workflow fixture only; not a real policy.
> **Owner:** Unknown in the fixture. The synthetic outcome evidence below is
> fabricated only to exercise finalization mechanics.

## Decision question and scope

Should the synthetic weekly queue display item age without using it to rank or
escalate items?

The scope is presentation in the synthetic weekly queue. It does not change
source records or item status.

## Source-grounded boundary

The synthetic source packet requests visible age but does not choose ranking or
escalation. Status remains human-assigned, the report must not change status or
close an item, and `created_on` may be missing or unreadable. See
`source/synthetic-source.md`, sections “Request”, “Existing boundary”, and
“Field notes”.

## Proposed decision

For the synthetic weekly queue, display elapsed age as an informational field
when `created_on` is readable; show “unknown” when it is missing or unreadable.
Do not use age to rank or escalate items, change status, or close an item. This
rule applies only to this synthetic workflow fixture.

## Adoption record

Pending. The decision owner and any real owner action are unknown. This
proposal is not authorization.
