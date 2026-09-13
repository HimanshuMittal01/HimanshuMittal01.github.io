---
title: "Building Optimus: What It Takes to Schedule a Pharmaceutical Plant"
summary: "What a scheduler has to know about a factory before it can schedule anything — and why I would build the next one around the planner instead of above them."
date: 2026-09-05
---

At Ripik AI, I spent roughly a year building the core scheduling engine of a production planning and scheduling system for Sun Pharma. Versions of the system now run in more than twenty plants.

When I started, I thought I was building an optimization algorithm. I eventually realized I was trying to encode how a factory thinks. A planner does not solve a neat formulation every morning. They know that one machine is under maintenance, another needs a change part currently bolted to a different machine, some material is in inventory but still under quality inspection, and a particular batch cannot sit too long between two operations. Some of this is in SAP, some in spreadsheets, and a surprising amount exists only in people's heads. Before we could schedule anything, we had to understand all of it.

---

## The problem looked simple at first

At the top level, production planning sounds simple. There is demand, the plant has finite capacity, and you want to produce as much of the important demand as possible, on time. Our pipeline looked like this:

**Demand → Pre-scheduling → Scheduling → Optimization → Views**

Demand is what the business wants. Pre-scheduling works out which batches can actually be produced given available material. Scheduling assigns those batches to machines and places their operations on a timeline. Optimization searches for better schedules. Views turn the result into something planners can use.

That fits in a paragraph. Turning it into a system took around 250,000 lines of code. For the first couple of weeks I worked with simulated data. That was enough to build the skeleton of the scheduler, but not enough to understand the problem. The first few months revolved around one plant. As we expanded, I started visiting factories and spending time with the people running them, from operators to plant managers.

Every new plant had some rule that made complete sense once somebody explained it. A machine could be free but still unable to run the next product because the required change part was attached to another machine. A room could become unavailable during a changeover even with idle machines inside it. Some operations could pause over a weekend and resume Monday; others had strict limits on how long they could wait. You find these things out by sitting with planners and asking, again and again, why a particular batch cannot run in a particular place. A lot of the real learning happened when the software and the plant disagreed. Usually the plant was right.

---

## Which task, which resource, what time?

At the centre of Optimus was a simple loop. Every scheduling task belonged to one of three groups: ATI, available tasks that could be scheduled now; LTI, locked tasks waiting for something else to happen; and CTI, completed tasks already placed on the schedule.

The scheduler picked a task from ATI, determined which resources could perform it, found the best feasible time while respecting the active constraints, scheduled it, and moved it to CTI. That might unlock a task in LTI. Repeat until nothing remained available.

In pseudocode it is five lines. The difficulty is inside the words _pick_, _feasible_, and _best_. If five batches are available, which goes first? If three machines can make one of them, which machine? If a machine has an empty slot tomorrow morning, can the batch actually run there once you account for material, preceding operations, cleaning, changeovers, holidays, maintenance, and physical equipment? Almost all the domain knowledge we collected eventually went into answering three questions: **which task, which resource, what time?**

That domain knowledge became substantial. Demand arrived in monthly buckets, each with its own priority, but the difficult part was not reading demand. It was converting demand lines into physically valid batches, because plants cannot manufacture arbitrary quantities.

Inventory introduced another layer. Stock could expire. It could exist on paper while still being unavailable because it was under quality inspection. Purchase orders represented material that might arrive later but could not yet be consumed by the schedule. The difference between _exists in the system_ and _can actually be used now_ mattered constantly.

Recipes added the temporal structure. Operations could be sequential or parallel, each with setup time, runtime and waiting requirements. Some could pause across non-working periods and resume later; others had stricter timing constraints. A mistake here did not just produce a wrong number. It could make an entire downstream schedule impossible.

Then there were changeovers, campaigns and cleaning. Running two batches of the same product was different from switching products entirely, and product changes could sometimes lock an entire room rather than just one machine. Machines also had campaign limits: after a certain number of batches or days, a full cleaning became mandatory.

One of my favourite constraints was change parts, because it captured the gap between software and physical reality very clearly. Certain products required specific physical parts to run on certain machines, and plants owned a limited number of them. On the screen the machine is free. In the factory it still cannot run, because the missing resource is a piece of metal currently attached to another machine.

There were many more rules. The list below is mostly for the reader who has personally lost a week to one of them; everyone else can skip it and keep the point.

- Demand arriving in monthly buckets such as M1, M2 and M3, each with its own priority, with batch sizes, downstream recipes and capacity all deciding how those lines could be grouped before scheduling even began.
- Multi-level BOMs, where units, count factors and pack sizes had to stay consistent as quantities propagated down the hierarchy.
- Raw materials, packing materials, intermediates and finished goods, each behaving differently.
- Purchase requisitions, which are one step less real than purchase orders.
- Phantom materials, which could effectively be treated as always available.
- Material substitutions.
- Under-process intermediate orders.
- Room-level plant maps.
- Machine and plant calendars.
- Vendor-specific material behaviour.
- Plant-specific exceptions, which kept accumulating as we scaled.

None of them sounds especially dramatic on its own. **Together, they are the plant.**

---

## A valid schedule was only half the product

Once the scheduler could generate a valid plan, we wrapped an optimization loop around it: run scheduling many times, score each result against objectives the planner could tune, such as on-time production, waiting time, due dates and demand priority, and keep the better schedules. For a typical plant-month of roughly a thousand batches, a full run took around fifteen to twenty minutes.

The other half was making the schedule usable. One of the main outputs was a waterfall commit view answering a simple question: **why wasn't this demand produced?** A product could have no demand, fully fulfilled demand, or be under-committed because of a material shortage, a missing recipe, or insufficient capacity. It could also appear over-committed.

That last case confused people initially. If the remaining demand is smaller than the minimum batch size, the plant cannot manufacture a fraction of a batch. It has to make the whole batch, so production exceeds demand. Nothing is wrong; the batching rule is doing its job. But unless the system explains that, the number simply looks broken.

The schedule also fed a shift-level, machine-wise plan for every batch in the month, along with Gantt views, batch-wise and product-wise schedules, MRP, and plant-utilization views showing where capacity was sitting idle and where the bottlenecks were.

We also compared the generated plan against what actually happened in the plant. Completed batches were logged with their actual execution times, which let us calculate weekly and monthly adherence to the plan. That gave us a useful signal, but it was retrospective. By the time a gap appeared in a weekly or monthly adherence report, the schedule and reality may already have been diverging for days.

---

## Some problems became projects of their own

Even after all of that, several constraints were deep enough that a good implementation could have been a project by itself. Portable machines broke the assumption that equipment always belonged to one room. Manpower introduced people as another constrained resource, except people have skills and shifts rather than simple availability calendars. Maximum hold times meant an intermediate product could not wait indefinitely between operations. Autoclaves added another shared resource with their own batching and timing behaviour.

Then there was QC scheduling. The quality lab was another resource almost every product eventually depended on, but it behaved very differently from a production machine. Tests had to be scheduled, results gated whether a batch could move forward, and the whole flow interacted with the production schedule. From far away, it looked structurally similar to another shared-resource problem. Once we got into it, almost everything was different. That alone took a couple of months.

We also designed things we did not get to fully build, including inter-plant flow, where one plant's output becomes another plant's input, and explicit modelling of yield loss. **There is a large difference between a schedule that runs and a plant that runs.**

---

## What I would build differently

Every plant asked some version of the same question: **what happens when a machine breaks down?** Our answer was regeneration. Update the state of the plant and re-run the remaining schedule. It worked, and it was practical, but it also exposed the deeper assumption underneath the product.

We initially pushed plants to adhere closely to the generated plan. The model was roughly: planners provide the inputs, Optimus calculates the schedule, and the plant follows it. The more time I spent on the floor, the less I believed that was the right product model. There were too many things the planner knew that we did not. Some could eventually become constraints; some probably never would. So when a planner changed the schedule after Optimus generated it, I stopped seeing that purely as non-adherence. **Sometimes the planner was fixing our model.**

If I built Optimus again, I would stop treating production planning as input data → optimizer → final plan and instead make the planner part of the loop. Generate a strong initial schedule, put it in front of them, let them move things, capture why they moved them, recalculate around their changes, and freeze portions of the schedule only when the plant is actually ready to commit. Then give planners a lightweight daily interface where they can keep the plan aligned with what is happening on the floor.

**Co-editing, not command-and-control.** A slightly imperfect plan that a planner keeps current is more useful than a mathematically better plan that becomes obsolete after the first exception.

Our adherence reports were useful, but weekly or monthly feedback was too slow for a system changing every day. A daily loop owned by the planner would have caught those divergences much earlier.
