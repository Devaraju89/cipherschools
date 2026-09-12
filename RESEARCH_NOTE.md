# Low-Level Design (LLD) Practice Platform: Research & Product Strategy

## 1. Problem Background & Learner Journey Pain Points

Low-Level Design (LLD) evaluates how an engineer translates high-level functional requirements into concrete, maintainable, extensible object-oriented code. Unlike Data Structures and Algorithms (DSA) where problem constraints usually lead to a single optimal time/space complexity or binary pass/fail test suite, LLD is inherently open-ended:

- **Multiple Valid Solution Paths**: A Parking Lot can be designed using inheritance hierarchies, interface strategy patterns, or event-driven state machines.
- **Ambiguity of Guidance**: Learners build designs (on whiteboards, in text files, or IDEs) but struggle to evaluate whether their entity boundaries, responsibility isolation (SRP), and class relationships are optimal.
- **Feedback Gap**: Existing learning resources (YouTube videos, blog posts) offer static reference solutions without feedback on a learner's specific trade-offs or omissions.
- **Extensibility Blind Spots**: Learners rarely stress-test their designs against evolving business requirements (e.g., adding EV Charging Spots with per-kWh billing to a Parking Lot).

---

## 2. Research of Existing Approaches & Tools

| Tool / Platform | Approach | Key Strengths | Critical Gaps in LLD Practice |
| :--- | :--- | :--- | :--- |
| **LeetCode / HackerRank** | Unit test suite execution on function output. | Instant deterministic pass/fail grading. | Cannot evaluate OOP design principles, class boundaries, or SOLID patterns. |
| **System Design Primers & YouTube Tutorials** | Static solution breakdown (video/text). | High quality reference architectures. | Passive learning. Zero feedback on learner's custom code or diagrams. |
| **Generative AI (Raw ChatGPT/Claude Prompts)** | Free-form prompt feedback. | Flexible reasoning & explanations. | Generic, unstructured feedback; inconsistent rubrics; no attempt history or radar score tracking. |
| **LLD Practice Platform (Our Direction)** | **Hybrid Deterministic AST + LLM Subjective Evaluation Engine** | **Instant, explainable, multi-format feedback & stress-testing** | Focused exclusively on the iterative learner practice loop. |

---

## 3. Key Product Gaps Identified

1. **Lack of Structured Multi-Format Input**: Learners think in different representations (UML Class Diagrams, Code Outlines, JSON Schemas). A platform must accept multiple formats and parse them into a unified domain representation.
2. **Missing Deterministic + Reasoning Hybrid Evaluation**: Pure LLMs hallucinate or give overly lenient praises; pure static analysis misses trade-off context. Combining deterministic AST checks with LLM reasoning bridges objective criteria and architectural nuance.
3. **Absence of Scenario Stress Testing**: Learners do not realize their design is rigid until new requirements are introduced. Interactive stress-testing challenges designs dynamically.

---

## 4. Product Strategy & MVP Focus

Our MVP concentrates on the core **Learner Practice Loop**:
```
[Choose Problem] ➔ [Design in Multi-Format Editor] ➔ [Submit] ➔ [Hybrid Evaluation (AST + LLM)] ➔ [Radar Feedback Dashboard] ➔ [Attempt History & Diff] ➔ [Retry]
```

### Core MVP Pillars:
- **5 Curated Domain Problems**: Parking Lot, Rate Limiter, Splitwise Expense Sharing, Elevator System, Library Management System.
- **Multi-Format Submission Editor**: TypeScript/Java Code Outline, Live Mermaid Class Diagram, JSON Schema, Narrative Text.
- **Explainable Hybrid Evaluator**: 5-Dimensional Radar Score (Abstraction, SOLID, Extensibility, Edge Cases, Trade-offs) + Code Evidence Highlights.
- **Iterative Improvement**: Historical attempt tracking, side-by-side attempt diffing, and "Fork & Retry" capability.
