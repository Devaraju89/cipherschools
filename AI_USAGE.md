# AI Usage Log & Engineering Decisions

This document outlines 4 key AI-assisted engineering and architectural decisions made during the design and implementation of the **LLD Practice Platform**.

---

## 1. Decision: Hybrid AST Deterministic + LLM Evaluation Pipeline

- **What AI Suggested**: Use OpenAI GPT-4o with Structured Outputs as the sole evaluator for all submission analysis.
- **What We Accepted**: Kept the LLM for subjective trade-offs, SRP compliance, and actionable remediation steps.
- **What We Rejected / Modified**: Rejected relying solely on an LLM. Pure LLM evaluation is non-deterministic, introduces latency, and can miss exact class/interface presence.
- **Why**: We introduced a dual-layer `EvaluationOrchestrator` combining a fast, synchronous `ASTDeterministicEvaluator` (40% weight) with an `LLMEvaluator` (60% weight). This ensures deterministic pass/fail checks for required entities while retaining deep reasoning for open-ended design trade-offs.

---

## 2. Decision: Resilient Offline Built-in Heuristic Reasoner Fallback

- **What AI Suggested**: Require a mandatory OpenAI API key from the user before allowing evaluation, showing an error modal if unconfigured.
- **What We Accepted**: Provided an optional OpenAI API key input modal in the navigation bar.
- **What We Rejected / Modified**: Rejected blocking users without API keys.
- **Why**: Evaluators and learners testing the prototype may not have an active OpenAI API key configured. We implemented an offline intelligent heuristic engine inside `HybridLlmEvaluator` that computes criterion scores, strengths, gaps, and next steps out-of-the-box, ensuring zero setup friction.

---

## 3. Decision: Multi-Format Submission Architecture

- **What AI Suggested**: Restrict learner input strictly to Java/TypeScript code editor blocks.
- **What We Accepted**: Built a syntax-highlighted code editor for code outlines.
- **What We Rejected / Modified**: Expanded input formats to support **Live Mermaid Class Diagrams**, **JSON Schemas**, and **Narrative Text**.
- **Why**: Software engineers design LLD in various representations (UML diagrams vs code interfaces vs structured schemas). Implementing the `ISubmissionFormat` abstraction layer allows any format to be parsed into a unified `ParsedSubmission` AST model.

---

## 4. Decision: 5-Dimensional Radar Score Visualization & Stress Testing

- **What AI Suggested**: Display evaluation output as a plain bulleted text list.
- **What We Accepted**: Bulleted list for detailed feedback items and code snippets.
- **What We Rejected / Modified**: Built an interactive SVG **Radar Chart** across 5 core dimensions (Abstraction, SOLID, Extensibility, Edge Cases, Trade-offs) and added an interactive **Stress Test Simulator**.
- **Why**: Visual radar charts give learners an instant mental model of their design strengths and weaknesses. The stress test simulator encourages learners to test their design against real-world requirement evolution (e.g. adding EV Charging Spots to a Parking Lot).
