# 000 — adopt a framework for capturing architecture decisions

**Date:** 2026-08-14

**Status:** Implemented


### Context

This repo already has a handful of real decisions worth capturing -- standalone repo vs. subdirectory, preserving behavior exactly during extraction, preserving git history, how publishing works -- that were made and discussed but only live in `PLAN.md`'s "Decisions made" section and in chat history. `PLAN.md` is a working/status document, not a durable record; it's the wrong place for this.

This project is developed with the assistance of AI coding assistants, which don't carry context between sessions the way a human maintainer does. Recent research on this specifically: contextual ADR history measurably improves an LLM's decision-generation quality over no context at all, and a small recency window of the last 3-5 records gets most of the benefit without much extra cost (see the arXiv paper linked below). ADRs are also being described as a form of durable memory for agents in a way they were never quite needed to be for humans -- a human forgets and can be reminded; an agent starting a fresh session never knew in the first place.

The risk runs the other way too: a stale or outdated ADR can be worse than no ADR at all, since an agent has no independent way to sense that a written decision no longer reflects reality and may follow it literally, producing confidently-wrong output built on an obsolete premise. That's a real argument for keeping this format minimal and low-friction (below) rather than heavyweight -- a document nobody bothers to update is exactly this failure mode waiting to happen.

#### Links

* ["Architecture Decision Records: Templates and Operational Patterns for Teams That Actually Maintain Them"](https://hidekazu-konishi.com/entry/architecture_decision_records_templates_and_operations.html)
* ["ADRs for Coding Agents: Architectural Context, Optimized"](https://www.actual.ai/blog/agent-optimized-adrs) -- on restructuring ADRs for an agent reader rather than a human one
* ["Context Matters: Evaluating Context Strategies for Automated ADR Generation Using LLMs"](https://arxiv.org/html/2604.03826v2) -- the empirical result on recency-windowed ADR context improving generation quality
* ["Architecture Decision Records for AI Agent Codebases"](https://websiteinit.com/blog/architecture-decision-records-for-ai-agent-codebases/) -- on the stale-ADR-is-worse-than-no-ADR risk


### Decision

Keep track of important decisions and the context around them, in easily-readable Markdown files, collected in `./docs/architecture-decisions/`.

Format, kept deliberately minimal given the staleness risk above:

* a **numbering scheme**
* a **Date** (not necessarily matching the order of the numbering scheme, if decisions were made in the past but are getting documented later -- true of every ADR in this repo so far, all backfilled from `PLAN.md` and chat history after the fact)
* a **Status**
* a **Context** section
* a **Decision** section

More sections may be added in the future.

One more rule, directly motivated by the staleness risk above: **once an ADR's `Status` is `Implemented` and the file has been committed, don't edit its Context or Decision text.** If the decision changes, write a new ADR and change the old one's `Status` to `Superseded by 00X`. An ADR that can be quietly rewritten after the fact isn't a reliable record of what was actually known and decided at the time -- for a human re-reading it later or an agent consulting it in a future session, an edited-in-place "historical" decision is indistinguishable from an accurate one, which is exactly the failure mode described above.

This doesn't apply to drafting: revising an ADR before its first commit, while the decision it describes is still being made, is normal iteration, not an amendment to settled history. (This file is a case in point -- it went through several revisions before ever being committed.)
