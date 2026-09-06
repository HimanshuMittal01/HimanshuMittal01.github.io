---
title: "Optimus: Inside the Build"
summary: "A deep dive into the production planning and scheduling engine I built for pharma manufacturing plants — the components, the constraints, and the domain knowledge behind it."
date: 2026-09-05
---

I spent over a year building production planning and scheduling (PP&DS) software for pharmaceutical manufacturers. It's live across more than twenty plants today.

I'm not going to try to explain *how* I built it — that's 250,000+ lines of code, thirty-plus knowledge-transfer sessions, and hundreds of pages of documentation, and no amount of compression turns that into a readable page. What I can do is walk through the components and the domain knowledge involved, so you can gauge the depth at which we had to see clearly before we could build anything at all.

I started from scratch. For the first couple of weeks I worked with simulated data, because there was nothing else yet. Everything real after that came from visiting factories and sitting with plant teams — operators up through plant managers. The data itself arrived with errors, and cleaning it meant doing manual data entry alongside the plant staff. I'm grateful to every one of them for the time they gave me.

---

## The Basic Idea

Strip away the software and the problem is one sentence: if demand exceeds what a plant can physically produce, you have to sequence its resources to serve the most critical demand and the maximum volume possible. That shortage is where optimization begins.

We turned that into a pipeline:

**Demand → PreScheduling → Scheduling → Optimize → Views**

- **Demand** — what the market is actually asking for.
- **PreScheduling** — which batches are even feasible, given current inventory and BOM.
- **Scheduling** — assign feasible batches to machines, following product recipes.
- **Optimize** — run scheduling over and over, improving against an objective function each pass.
- **Views** — turn the resulting schedule into reports: shift-wise machine allocation, plant utilization, and more.

Five words. Underneath them is everything that follows.

---

## Scheduling, Up Close

The Scheduling step reduces to a task-list algorithm. Every task lives in exactly one of three lists at any moment:

- **ATI** — Available Task IDs (ready to be scheduled)
- **LTI** — Locked Task IDs (blocked on something not yet done)
- **CTI** — Completed Task IDs (already scheduled)

The loop: select a task from ATI, select a resource for it, find the best feasible time on that resource given every active constraint, mark the task complete and move it to CTI, then check whether any task in LTI has just been unblocked and promote it to ATI. Repeat until ATI is empty.

It reads like five lines of pseudocode. The part that isn't obvious from the pseudocode is *which* task gets picked when several are sitting in ATI at once. It isn't first-in-first-out. A batch is scored by how much of it maps to real, high-priority demand versus how much is dead capacity that nothing asked for — weighted so a sliver of critical-tier demand counts for meaningfully more than the same quantity of routine demand, not just a little more. A batch that's mostly critical demand with a bit of waste attached loses to one that's entirely critical, even at the same raw size. That scoring rule, and the threshold inside it that stops a weak signal from a minor demand tier quietly dragging an obviously-critical batch below a marginal one, is the kind of thing you only write after watching the wrong batch win once.

Every constraint below exists to answer one of two questions inside that loop: *which task, which resource, which time.*

The "improve objective" step in the pipeline deserves its own honest mention too, because it's easy to wave at and hard to get right. It isn't one number — it's a weighted sum of named metrics: completion time, waiting time, on-time production, due-date penalty, cross-block movement penalty, and a few demand-priority values. Each of those is normalized against its own theoretical maximum before a planner's weight is ever applied to it. That normalization is the unglamorous line that actually mattered: without it, a planner turning up the weight on "hit critical demand" was invisible against the sheer numeric size of "minimize waiting time," because the two metrics lived on completely different scales. Planners noticed before we did — they'd drag a slider and the schedule wouldn't move. Making a weight mean what a planner thinks it means turned out to be its own multi-week problem, hiding inside a sentence that sounds like a one-line design choice.

---

## The Constraint Surface

This is where most outside descriptions of "scheduling software" understate the problem. None of what follows is a rule bolted on after the fact — each one was already how a plant operated, with no system that could read it before this one.

**Demand & priority.** Demand isn't one number — it arrives bucketed by month (M1, M2, M3…), each with its own priority, and the biggest source of pain isn't the demand itself but *batching* it: deciding how individual demand lines roll up into batches without breaking downstream feasibility.

**Inventory.** Four categories — Raw Material, Packing Material, Semi-Finished Goods, Finished Goods — each with its own lifecycle issues: expiry dates that can invalidate a batch mid-schedule, and stock sitting in quality inspection that exists on paper but isn't usable yet.

**Procurement.** Purchase Requisitions and Purchase Orders don't resolve instantly — material committed on paper is still unavailable until it physically arrives, and the schedule has to respect that lag rather than assume instant supply.

**Phantom items.** Some inputs — water, tape, other near-infinite consumables — are treated as always available, so the solver doesn't waste constraint-checking on things that will never be the bottleneck.

**Material substitution.** When a vendor changes but the item itself doesn't, existing inventory should still be usable — but the substitution logic differs by material class. RM-to-RM or PM-to-PM transfer is comparatively simple; INTM-to-INTM (intermediate-to-intermediate) transfer is harder, because both the BOM and the inventory ledger have to stay consistent through the swap.

**Bill of materials.** BOMs are multi-level, not flat. Unit handling, count factor, and pack size all have to transform correctly as you move up and down the BOM tree — a pack-size change at one level has to propagate without silently breaking a quantity somewhere else.

**Recipes & operations.** Recipes can be sequential or parallel. Each operation carries its own minimum wait time, runtime, and setup time. Packing can happen on any number of machines, but intermediate product always moves in its fixed batch size regardless of which machine picks it up. Some operations are *splittable* — a task that runs Friday can legitimately resume Monday, and the schedule has to represent that gap without treating it as two unrelated tasks.

**Underprocess INTM POs.** Intermediate product that's mid-process, already committed to a purchase order, has to be tracked as neither "available" nor "not existing" — it's a third state the scheduler has to carry.

**Changeovers.** Two flavors: changeover between batches of the *same* product, and changeover between batches of *different* products — the latter usually costing more time and sometimes requiring the room, not just the machine, to be locked.

**Change parts.** Running a given finished good on a given machine may require a specific physical part, and plants only own a limited number of them — so even if a machine is free, it may not be able to run a given product without the right part being free too.

**Plant map.** Machines exist inside rooms, and constraints exist at both levels: which machines sit in which room, only one machine active per slot, and — critically — a full room going unavailable during a changeover, not just the one machine inside it.

**Calendars.** Plants have holidays where nothing runs. Machines have their own independent availability calendars for planned maintenance or repair, layered on top of the plant calendar.

**Plant types.** Not all plants are the same animal: NOSD, OSD, API, and BFI plants each carry a different constraint profile, so the same engine has to flex per plant type rather than assume one physics fits all.

---

## What Came Out of It

Once the schedule exists, it becomes the source for a family of views: MRP, Commit, Machine view, Product view, batch-wise view, plant utilization graphs, and others.

The most demanding of these is the **waterfall chart** — the answer to "why wasn't this demand met?" Underneath it, every product's shortfall resolves to one of a small set of real reason codes, computed by walking its demand against feasible inventory: *No demand* — nothing was asked for. *Demand fulfilled* — feasible quantity matches the ask. *Under commit* — feasible falls short, because of a material shortage, a missing recipe, or no spare capacity. *Over commit* — a batching rule rounded a small ask up past it. That last one looks like a bug the first time a planner sees it. It isn't — it's a batch-size floor doing exactly what it's supposed to do, and the reason code is what turns "why does this number look wrong" into a five-second answer instead of a support ticket.

None of the results were guessed. Aggregate, across the plants live at the time, each measured against that site's own manual-planning baseline: a 7% gain in production efficiency, a 2% reduction in production cost, over $2M in enterprise deployments, across ten-plus manufacturing sites. They came from a hundred small constraints, finally written down, checked, and solved every month — instead of estimated once a quarter.

---

## Where the Abstraction Broke

Some things resisted clean constraint modeling no matter how carefully we tried:

- **Portable machines** — equipment that isn't fixed to one room, breaking the assumption that a machine's location is static.
- **Manpower** — operators are a resource too, but a much messier one than a machine: skills, shifts, and fatigue don't reduce to a calendar the way machine availability does.
- **Max hold time** — some intermediates degrade if they sit too long between operations, which turns "schedule this eventually" into "schedule this within a shrinking window."
- **Autoclave** — batch sterilization steps with their own timing physics that don't map cleanly onto the rest of the recipe model.

These aren't failures of effort — they're the honest edge of where a discrete scheduling model stops matching a continuous, physical, human plant floor.

And even within the constraints we could model, the system would still occasionally produce a schedule nobody could explain. So it carries a trace flag: switch it on, and every placement decision — which batch, which machine, what time, and every later push that moved it — writes one row to a log, filterable by batch ID after the fact. It's off by default, because tracing every decision at full plant scale isn't free, but it's a single environment variable away from turning "why is this batch running at 3 a.m. on a Sunday" from a half-day manual dig into a filtered spreadsheet.

---

## What I'd Build Differently

Two things, now that I've lived inside these constraints long enough to see past the version we shipped.

**The algorithms.** The objective function above is a linear score, and I now think the true objective is discontinuous in ways a linear score can't represent — a batch running one hour late might not matter at all, and the same batch six hours late might blow a client commitment entirely. I'd reach past it, toward real metaheuristics layered over the same core, now that I actually know the shape of the constraint space rather than discovering it plant by plant.

**The product.** This is the bigger one. My real insight from a year on the floor is that *co-editing* is the right model, not autonomous perfection. Instead of chasing a 100%-correct schedule and handing it down, the better product gives planners a 90%-followable rough estimate and pairs it with an easy daily-tracking interface — replacing monthly adherence reviews with something planners actually update and trust every day. A slightly-wrong plan a planner keeps current beats a perfect plan nobody touches after the first exception.

---

*See clearly. Build accordingly.*
