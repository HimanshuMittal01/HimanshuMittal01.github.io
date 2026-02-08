---
title: "A Mental Map of AI Safety"
summary: "Key concepts from Google DeepMind's 1.5-hour course on AGI Safety"
thumbnail: "/assets/thumbnails/AI-brain-with-shield-and-connections.png"
date: 2026-02-08
---

I completed Google Deepmind's AGI Safety course delivered as [Youtube Playlist](https://www.youtube.com/playlist?list=PLw9kjlF6lD5UqaZvMTbhJB8sV-yuXu5eW)  (~1.5 hours watch time), and I wanted to share some of the key insights I've gained. What I really loved about this course was its clear bifurcation of concerns and research work being done in AI safety. It was incredibly helpful for building a mental map of the different problems we're facing.

---

# The Alignment Problem

The course presented this beautifully through a framework of three specifications:
1. **Ideal specification**: The wishes of the designer
2. **Design specification**: The specification we use to build the AI system
3. **Revealed specification**: The specification that best describes the system's behaviour

## Specification Failures

When the ideal specification and design specification diverge, we get specification failures. The most common form is **specification gaming**: an AI system finds loopholes in how we've defined its goals. Imagine optimizing an AI to maximize user engagement on a platform. It might learn to show increasingly divisive content because controversy keeps people scrolling, even though that's clearly not what we wanted.

Addressing specification gaming requires overcoming several challenges: (1) faithfully capturing human intent, (2) avoiding mistaken implicit assumptions about the environment, and (3) preventing systems from tampering with their reward signals.

## Generalization Failures

When the design specification and revealed specification don't match, we encounter generalization failures:

**Goal misgeneralization** typically appears under distribution shift: the system learns a proxy goal that works during training but fails when the environment changes. The system may be highly capable yet pursue the wrong objective.

It's worth noting the distinction between **misspecification** and **underspecification**. Even if there's no reward misspecification (i.e., the reward function correctly captures what we want), underspecification can still enable goal misgeneralization. When the training environment doesn't provide enough information to uniquely identify the intended goal, the system may learn any of several goals that happen to perform well during training.

A fascinating example comes from the [CoinRun environment](https://arxiv.org/abs/2105.14111), where researchers analyzed how the actor and critic components of the PPO algorithm both fail to generalize out-of-distribution (OOD) and fail in different ways. The critic learned a proxy like "move toward the wall", while the actor learned an even weaker proxy: "move right", instead of the intended behavior "move toward the coin". This shows how agents can pursue a non-robust proxy of a non-robust proxy while still performing well in training.

**Capability misgeneralization** refers to when a model's abilities don't transfer as expected across different contexts, potentially leading to unpredictable failures in novel situations. This isn't a central focus in AI alignment research because there are already thousands of engineers working on improving AI capabilities and these failures would be less of an issue.

## The Scary Part: Instrumental Subgoals

What connects these problems is the concept of **instrumental subgoals**—intermediate objectives that an AI might pursue in service of its main goal.
instrumental subgoals like self-preservation, gaining more control and power, becoming more capable, preventing anyone from changing its goals, and hiding its intentions while appearing helpful are all common among humans. So it's entirely possible that AI systems could develop these same instrumental subgoals. That's genuinely scary.

---

# The Technical Approach

One of the most interesting insights I learned is that **in theory, amplified oversight and robust monitoring and training can achieve informed oversight**. But doing costly amplified oversight evaluations for billions or trillions of actions at scale is practically impossible. Current approaches may break down in practice, which is why we need security as a second layer of defense.

## Amplified Oversight: Evaluating Single Outputs

Amplified oversight answers a specific question: How do we oversee a single AI output? For a **single output**, the goal is to **provide feedback** as close as possible to that of a human with complete understanding of the reasons the AI produced the output.

It was interesting to know that the current approaches typically **use the model itself** to help improve the human's understanding. The **debate** approach particularly intrigued me: you have two AI systems argue opposing sides of a question to a human judge. If one AI is wrong, overconfident, or inaccurate, the other is incentivized to point that out to the human judge.

## Robust Monitoring and Training: Being Strategic About Resources

The course emphasized a hierarchical approach to monitoring:
- Use cheap heuristics to monitor inputs, outputs, and actions most of the time
- Deploy more powerful (and expensive) evaluations only when consequences are unclear and stakes are high

On the training side, the key insight is to be strategic about what data we use. Rather than just filtering existing data, we should actively synthesize inputs that are likely to be informative and might expose dangerous failure modes, thereby increasing the diversity of the training data.

## Security and Control: The Second Layer of Defense

Even with good oversight and training, we need additional safeguards. The course presented this as a two-pronged approach:

**Incrimination** strategies look for signs that something might be wrong: honeypots to detect misaligned behavior, offline monitoring to catch problems before deployment, and thorough incident investigation when issues arise.

**Harm prevention** strategies make it harder for problems to cause damage: containment measures to limit what AI systems can access, online monitoring that can block problematic actions in real-time, and rollback capabilities to fallback to safe changes.

## Safer Design Patterns

One practical takeaway was thinking about safety-capability tradeoffs in system design. These principles stood out:

- Keep **humans in the loop** (HITL) for critical decisions
- Separate **planning agents from execution agents**, training them differently and ensuring planning agents generate human-readable plans that can be reviewed

These design choices might make systems slightly less autonomous or efficient, but they create crucial checkpoints where problems can be caught. What I especially loved was recognizing that keeping humans in the loop is a **safety-first decision, not a business decision**. It's about prioritizing the right values from the start.

---

## The Governance Perspective

Technical solutions alone aren't enough. **They will not work without robust governance frameworks.**

## Beyond Accident Risks

One important insight from the course: while the technical approaches focus primarily on **accident risks** (AI systems doing something different from what we designed them to do), governance must take a broader view. There are actually three categories of AI risks:

- **Accident risk**: Mistakes, learned heuristics, and deliberate planning.
- **Misuse risk**: Malicious or reckless use of AI for harm - manipulation, disinformation, weapons development, surveillance, and cyber attacks.
- **Structural risk**: Unintended bad outcomes even from aligned AI systems - privacy violations, disparate outcomes, extreme inequality, environmental impacts, geopolitical tensions, nuclear instability, loss of human autonomy, and human rights violations

This framework helped me understand why governance is so critical. Even if we perfectly solve the technical alignment problem, we'd still face misuse and structural risks that require policy, regulation, and international coordination.

## Dangerous Capabilities

The course outlined specific bottleneck capabilities for catastrophic threats:

- **CBRN knowledge**: Understanding how to create chemical, biological, radiological, or nuclear weapons
- **Persuasion, manipulation and deception**: Advanced ability to manipulate human decision-making
- **Cybersecurity capabilities**: Skills that could be used for large-scale cyberattacks
- **Autonomy**: Ability to operate independently for extended periods - earning money and self-preserve
- **Autonomous ML R&D**: Capability to improve itself or create new AI systems without human involvement

---

## Resources

From the course materials:

- [Examples of Specification Gaming](https://tinyurl.com/specification-gaming)
- [Examples of Goal Misgeneralization](https://tinyurl.com/goal-misgeneralisation)
