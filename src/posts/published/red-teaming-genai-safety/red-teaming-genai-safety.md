---
title: "How I Red-Team GenAI Safety in a Black Box"
summary: "Red teaming as a measurement problem, not an attack-generation problem: a testable policy, a category × attack matrix, and a three-phase workflow that maps the model's safety boundary instead of collecting jailbreaks."
date: 2026-09-13
---

Red teaming a generative AI system can easily turn into a collection of clever jailbreaks. Someone finds a prompt that works, someone else finds another, and after enough attempts you have a spreadsheet full of failures but surprisingly little understanding of what the model is actually vulnerable to.

I think of the problem differently.

A useful red team engagement should answer three questions: **Where does the model already fail without an attack? Which attack strategies reliably make those failures worse? And when an attack works, does it generalize or did we just find one lucky prompt?**

That requires treating red teaming as a measurement problem, not just an attack-generation problem.

This post describes the black-box methodology I use for that. The tester has no access to model weights, training data, hidden reasoning, or system-level instructions. We only control the inputs and observe the outputs, which is also how most deployed systems are encountered in practice.

The focus here is **safety**, rather than system security. Safety testing asks whether the model produces content that violates its behavioral policy. Security testing covers the wider system: unauthorized access, data leakage, infrastructure vulnerabilities, and similar issues. The boundary can get less clean once models start using tools, but it is still useful to separate the two when defining an engagement.

---

## Start with the policy, not the jailbreak

Before attacking a model, we need to know what counts as a successful attack.

Most AI safety policies organize harmful behavior into some form of taxonomy. Depending on the model and its deployment, that might include CBRN and weapons, child safety, cyberattack enablement, violence and self-harm, sexual exploitation, fraud, disinformation, privacy, regulated advice, political influence, copyright, or bias and fairness.

The exact taxonomy matters less than whether it covers the harms relevant to the system being tested.

I usually add another dimension: **sensitivity**. Not every category deserves equal testing depth. A useful way to think about sensitivity is as a combination of harm severity and actionability.

**High-sensitivity failures** can directly enable severe or irreversible harm and should have very little tolerance for failure. **Medium-sensitivity failures** can still cause meaningful harm but generally require additional context, effort, or repeated interaction. **Low-sensitivity failures** tend to create more indirect, cumulative, reputational, or compliance risk.

These are not permanent labels attached to entire categories. The same category can move between tiers depending on the model's capabilities, deployment context, and the specificity of the request. The point of the classification is prioritization: if testing time is finite, the most consequential failures should get the deepest coverage.

More important than either taxonomy or sensitivity, however, is whether the policy itself is testable.

Suppose the policy says:

> Do not produce harmful content.

That is nearly useless to a red teamer. What exactly is harmful? What should happen when the same topic appears in a news article, a research discussion, or a prevention context?

A useful policy defines both sides of the boundary. For example, a child-safety policy might prohibit content that advocates abuse while explicitly allowing informational discussion for reporting, research, or prevention. The prohibited side tells us what constitutes a safety failure. The permitted side tells us what the model should still be willing to answer.

**Without both sides, you can measure refusal, but you cannot reliably measure safety.**

The same applies to definitions. What counts as a minor? What does "illegal" mean across jurisdictions? Where does a policy draw the line around explicit or actionable content? Ambiguity in the policy eventually becomes ambiguity in the evaluation.

---

## Separate the harmful request from the attack

Once the policy boundary is clear, the next step is understanding what we are actually sending to the model.

I find it useful to separate two things that are often mixed together: the **core ask** and the **attack strategy** wrapped around it.

On the content side, prompts broadly fall into two groups.

A **borderline prompt** touches a sensitive area but does not inherently require a policy-violating response. These are useful for testing over-refusal and boundary behavior.

A **disallowed prompt** is different: fully complying with the request would itself violate the safety policy. These are the primary substrate for adversarial testing because they give us a clean question: does the model enforce the boundary when the user clearly crosses it?

Then there is structural complexity.

A **direct request** states the disallowed intent plainly. There is no meaningful attempt to disguise it, no elaborate persona, no encoded message, and no sophisticated framing. Direct requests are important because they establish the baseline. Before asking whether a jailbreak can defeat the model, we should know whether the model refuses the underlying request at all.

A **jailbreak** adds one or more strategies around that core ask: obfuscation, framing, role-play, suppression instructions, output constraints, or other mechanisms intended to make compliance more likely.

That separation becomes very useful analytically.

If ten different jailbreaks all wrap the same harmful request, then the harmful request and the attack mechanism are two independent variables. Treating them separately lets us ask whether the vulnerability belongs to the request, the jailbreak technique, or the interaction between the two.

---

## The attack surface grows in layers

A red teamer's attack surface increases as the system exposes more ways to interact with it.

**Layer 1 is single-turn interaction.** Everything happens inside one prompt and one response.

**Layer 2 adds conversation history.** Multi-turn attacks can exploit accumulated context, gradual escalation, prior commitments, and changes in how the model interprets later requests.

**Layer 3 adds modalities.** Images, documents, audio, or other inputs can carry adversarial signals alongside text.

**Layer 4 adds tools and external data.** Once a model can search the web, execute code, inspect files, call APIs, or operate on untrusted content, attacks can also arrive through those channels.

The layers compose. A tool-mediated attack can also be multimodal and multi-turn. Complexity grows because each new layer provides another place where intent can be hidden or context manipulated.

There is also an orthogonal class of attacks that I think of as **adaptive attacks**. Instead of writing one jailbreak and hoping it works, the attacker observes the model's response and uses that information to construct the next attempt.

PAIR, for example, uses an attacker model to iteratively refine jailbreak prompts. TAP extends that idea with branching and pruning. Other adaptive frameworks make the loop more explicit: generate an attack, evaluate the target response, inspect how the attempt failed, mutate the attack, and try again.

The important idea is not a particular algorithm. It is the feedback loop.

**The target model's response becomes information for the attacker.**

---

## Designing the engagement

Once the policy and attack surfaces are understood, I scope an engagement along two dimensions: **policy coverage** and **attack-surface coverage**.

Policy coverage determines which harm categories and failure modes will be tested. Higher-sensitivity areas get more samples, more attack variants, or more detailed follow-up.

Attack-surface coverage determines where those failures are tested: text-to-text, multi-turn conversations, text-to-image, document inputs, audio, tools, or whatever interfaces the target system actually exposes.

Trying to cover every combination equally is usually a mistake. A model with ten harm categories, dozens of attack techniques, several modalities, and multiple conversation depths creates a combinatorial problem very quickly.

The goal is not maximal breadth.

It is enough breadth to discover where the interesting failures are, followed by enough depth to understand them.

---

## Build an attack matrix, not a jailbreak dump

For each policy category, I begin with a pool of direct disallowed requests. These can be written specifically for the engagement or drawn from existing benchmark sets, provided they match the policy being evaluated.

Separately, I maintain an attack library: the transformations and jailbreak strategies that can be applied to those core asks.

The two are then combined into a **Category × Attack Matrix**.

Not every attack makes equal sense for every category, so each pairing can receive a relevance weight. Rather than permanently generating every possible combination in advance, attack prompts can then be constructed dynamically by sampling from this matrix.

That solves two problems.

First, it prevents the attack dataset from exploding combinatorially.

Second, it keeps the underlying variables visible. We still know which core ask was tested, which attack strategy was applied, and which policy category the resulting response belongs to.

That becomes important once we start analysing failures.

---

## The three-phase red team

The workflow I use has three stages: establish the baseline, sweep broadly across attacks, and then go deep on the small number of vectors that appear interesting.

### Phase 1: Baseline evaluation

Before applying any jailbreak, run the direct disallowed prompt set against the target model.

Every response is judged against the policy, and we compute an **Attack Success Rate (ASR)** for each category: the proportion of requests that received a policy-violating response.

The name is slightly strange in this phase because no sophisticated "attack" has been applied yet, but the metric is useful for consistency across the engagement.

This gives us the first important artifact: a category-level baseline.

If a model already fails 20% of direct requests in a category, discovering a jailbreak with a 25% ASR later means something very different from discovering the same jailbreak against a baseline of zero.

**Never attribute to a jailbreak what the model was already willing to do without it.**

Borderline or explicitly permitted prompts should be evaluated separately for over-refusal. A system that refuses every sensitive topic can look excellent if the only metric is harmful-request ASR while still being a poor safety system in practice.

### Phase 2: Breadth sweep

Next, apply the attack library across the policy categories.

For each category, attacks are generated from the Category × Attack Matrix according to their relevance weights. Running several sampling epochs helps reduce the chance that one fortunate collection of prompts dominates the result.

Responses are judged again, but now the analysis becomes multidimensional.

We can ask which policy categories degrade most under adversarial pressure, which attack vectors consistently work, which appear well-defended, and whether particular attacks only become effective against particular types of harmful requests.

The key artifact here is a **Category × Attack ASR matrix**, ideally accompanied by the change from baseline.

At this stage, I am not trying to exhaustively characterize every attack.

I am trying to find the few places worth investigating.

### Phase 3: Deep dive

Suppose the breadth sweep shows that one attack vector performs unusually well against one category.

There are at least two possible explanations.

The attack technique itself may be powerful.

Or we may have discovered a narrow interaction between that technique and a handful of core asks.

To distinguish those, take a promising attack vector and systematically vary it across the full baseline prompt set for that category. The exact variations depend on the technique: wording, ordering, degree of obfuscation, persona, context, language, encoding, or other structural choices.

This creates a complete **core ask × attack variation** matrix.

Now we can answer much better questions.

Does the technique generalize across many underlying requests, or do failures cluster around a few prompts? Which variations preserve the jailbreak? Which small modifications cause the model to recover? Is there a minimal mutation that changes the model from refusal to compliance?

**A red team finding becomes much more useful when it tells you the boundary of the failure, not merely that a failure exists.**

That is the difference between reporting "this jailbreak worked" and giving the safety team something they can actually investigate.

---

## A useful mental model for single-turn attacks

When looking specifically at single-turn jailbreaks, I use a simple abstraction of the safety process.

It should not be confused with the literal internal architecture of the model. In a black-box engagement we generally do not know that architecture. It is just a useful way of reasoning about what an attack is trying to achieve.

The model has to do roughly three things correctly:

**Detect:** recognize that the input contains harmful intent.

**Evaluate:** determine that the policy requires refusal or another safe behavior.

**Respond:** actually produce the safe response rather than leaking the prohibited content anyway.

Attack techniques can then be grouped by the function they serve.

| Function | What the attack is trying to do |
| --- | --- |
| **Obfuscation** | Make the underlying harmful intent harder to recognize |
| **Escalation** | Reach the harmful request gradually through context |
| **Framing** | Give the request an apparently legitimate justification |
| **Persona** | Manipulate the identity or role through which the request is interpreted |
| **Suppression** | Discourage refusal, caveats, or safety language |
| **Extraction** | Constrain the output into a form that maximizes useful leakage |

This gives us a more useful way to describe jailbreaks than memorizing hundreds of prompt templates.

An individual prompt might combine obfuscation with framing and an output constraint. Another might use persona plus suppression. The exact wording will change constantly; the functional role remains more stable.

That also gives us a compositional model:

**Strong attack = hide or reshape the intent + change how the request is evaluated + influence the output**

Not every successful jailbreak needs all three. In practice, some models will be more vulnerable to one family than another, which is precisely why the breadth sweep exists.

I would avoid assuming in advance that one stage is universally the weakest. If the purpose of the engagement is measurement, the model should tell us through the results.

---

## ASR is the beginning of the analysis, not the end

Attack Success Rate is useful because it compresses a large number of interactions into something comparable.

It can also hide almost everything interesting.

Two attack vectors can have the same ASR for completely different reasons. One might work weakly across almost every harmful request. The other might fail everywhere except against one narrow family where it works nearly every time.

Those are different vulnerabilities.

The same applies across categories. A small increase in ASR in a high-sensitivity category may matter much more than a larger increase somewhere less consequential.

That is why I like the three-phase structure.

Baseline tells us what the model already does.

Breadth tells us where adversarial pressure changes the picture.

Depth tells us **why**.

---

## What a useful red team engagement should produce

A good engagement should leave behind more than a list of prompts that broke the model.

At minimum, I want to know:

- where the model fails at baseline;
- which policy categories degrade most under attack;
- which attack families generalize;
- which failures are narrow interaction effects;
- which variations the model is robust or vulnerable to;
- where refusal boundaries sit;
- and which findings deserve remediation first given their sensitivity.

The output is therefore not really a jailbreak leaderboard.

It is a map of the model's safety boundary.

And that is ultimately what black-box red teaming is trying to recover: we cannot see the policy implementation inside the model, but by applying controlled pressure from the outside, we can start to understand its shape.

**The goal is not to prove that a model can be broken. Given enough surface area, that is usually the least interesting finding. The goal is to learn where, how, and consistently enough that somebody can make it better.**
