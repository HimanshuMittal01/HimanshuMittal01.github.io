---
title: "Three Questions From Building an AI Hardware Startup"
summary: "Is the market ready, and what are we building while we wait? Do we replace the workflow or earn our way into it? And what is the AI actually claiming?"
date: 2026-09-13
---

In 2025 I co-founded Faradworks with my college roommate from seven years earlier. He was CEO; I was the technical co-founder. We were building AI for hardware design. We started with PCB generation, widened the idea into something we called a Circuit Engine, then narrowed it again to verification. None of those moves felt like a mistake at the time. Each one made sense given what we knew. These are three questions I learned to ask earlier, and more bluntly.

## Is the market ready, and what are we building while we wait?

Sometimes the product is fine and the world around it is not. The data you need does not exist yet. Customers have not changed how they work. Some other piece has to arrive first.

"Too early" is the usual diagnosis, and it is not very useful. What I should have asked is: what exactly are we waiting for, how long could it take, and can we last that long?

That last part turned out to be the real defensibility question. If the market takes two years longer than you thought, what did you build in those two years that someone else cannot?

I think of it as three kinds of assets.

- **Information**: proprietary data, domain evidence you have accumulated.
- **Knowledge**: your algorithms, your IP, the things your team knows how to do.
- **Relationships**: customers, distribution, trust.

A small company cannot compound all three with equal intensity. One of them usually has to be the main bet.

This got sharper for us when we looked at companies pouring money into electronic-component data. On the surface they were solving a search problem. But a good component database is also the foundation for everything after it, including verification. We needed that foundation too. Without it, we were building clever logic around a small hand-curated library, and no amount of model quality fixes that.

So the question I would ask now is what becomes harder to copy every month we stay alive. Capital helps, but capital itself is not the advantage. It gives you more time to build one.

## Do we replace the workflow, or earn our way into it?

Owning the whole workflow is tempting, but the more of it you take on, the more of it you are likely to model incorrectly. Real workflows are full of habits, exceptions, and workarounds nobody mentions in an interview. You find them by sitting next to the person doing the work.

Which creates a bind. To build the workflow properly you need to be inside it. But nobody lets you inside for a small improvement. They already have tools and habits, and switching costs them.

One way out is an upgrade so large that switching is worth it. Abstraction can sometimes do that.

Our attempt was reusable circuit blocks. Instead of placing components one by one, you worked with higher-level modules and the system wired them together. It did remove complexity. But in demos, engineers wanted to see the placement and the routing, and they wanted to change it. PCB layout is a matter of art as much as science. Give ten engineers the same requirements and you get ten valid boards. Our abstraction made the interface simpler, but the small block library also made the space of things you could build smaller. If people keep dropping below your abstraction layer to get normal work done, then the abstraction is not finished.

> **Good abstraction compresses complexity without collapsing possibility.**

There is a harder version of this. If the abstraction only produces a handful of outcomes, maybe the customer does not need a tool. They can send you the requirements and get a board back. A tool only matters when people need room to explore.

If you cannot make the jump big enough, the other route is one strong feature. Something that works next to the tools they already use, is worth the hassle of being incomplete, and teaches you the rest of the workflow as you go.

For us that feature was verification. Generation creates the problem naturally: once a system produces a design, people ask whether it is right. That looked like the logical place to start.

It was harder than it looked. Verification was sporadic, not something teams used every day, which made the economics harder. And the product was asking for a kind of trust we had not thought through.

## What is the AI claiming?

The trust burden changes dramatically depending on what the AI is actually claiming to do.

The smallest claim is the copilot. It does not ask the user to hand over the final judgment. It sits next to the engineer as something to think with: explain this part of the schematic, what does this rule actually mean, what happens if I change this. Many EDA tools are adding copilots or chat interfaces, and that is not an accident. The claim is small and the value is real.

The next level is automated generation. The system produces something: a schematic, a placement, a block of routing. That output can be wrong too. The difference is that its wrongness has a price you can lower. If the engineer can see what was generated and change it cheaply, a bad output costs minutes instead of a redo. Editing is not a convenience feature here. It is the mechanism that makes imperfect generation worth using. You bring the cost of error down until the benefit clearly beats it, and then the product works even though the model is not perfect.

Automated verification is a different thing. The output is not an artifact. It is a claim: this design is correct. You can edit a generated artifact until it works. You cannot edit a claim into being trustworthy. If the verifier can hallucinate, miss something, or misread the design, the engineer has to verify the verifier. And once that happens, much of the value can disappear, because checking the checker may cost nearly as much as doing the check.

Put it from the customer's side. Your team spent a year on a design. Verification normally takes months. Now a startup says its AI checked it in a day. Why would you believe it? And if you have to look anyway, what did you buy?

**Does the benefit the AI creates outweigh the cost of it being wrong?**

It is not an equation. You cannot put clean numbers on either side. But it changes how you think about the product you are building. Written down this looks obvious. It looked obvious to me too. It only became real when we were the ones asking an engineer to trust the report.
