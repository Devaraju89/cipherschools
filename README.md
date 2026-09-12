# Low-Level Design (LLD) Practice Platform 🚀

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://temporary-agile-cobalt-8hwuiuc.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/Devaraju89/cipherschools)

> **Live Deployment URL**: [https://temporary-agile-cobalt-8hwuiuc.vercel.app](https://temporary-agile-cobalt-8hwuiuc.vercel.app)

A focused practice platform built for software engineers to practice Low-Level Object-Oriented Design (LLD), submit multi-format solution artifacts, receive deterministic & LLM-assisted explainable feedback, and track design evolution over iterative attempts.

---

## 🌟 Key Features

1. **5 Curated LLD Practice Problems**:
   - Parking Lot System (Dynamic pricing, spot allocation strategies, entry/exit gates)
   - Distributed Rate Limiter (Token bucket, sliding window log, storage abstraction)
   - Splitwise Expense Sharing (Equal, exact, percentage splits, balance simplification)
   - Multi-Elevator Control System (Dispatcher strategy, door state machines)
   - Library Management System (Inventory, checkout policy, fine strategy)

2. **Interactive Multi-Format Submission Editor**:
   - **TypeScript/Java Code Outline**: Syntax-highlighted OOP declarations.
   - **Live Mermaid Class Diagram**: Instant visual rendering of UML class nodes and relationships.
   - **JSON Schema**: Machine-readable entity and relationship specifications.
   - **Narrative Text**: Conceptual architectural explanations.

3. **Hybrid Evaluation Engine (AST + LLM)**:
   - **AST Deterministic Evaluator**: Verifies required domain entities, interface abstractions, SOLID pattern heuristics, and flags God Classes (>7 methods).
   - **LLM Subjective Evaluator**: Evaluates SRP boundaries, trade-off depth, extensibility, and actionable remediation steps.
   - **Zero-Config Resilient Fallback**: Runs a built-in offline intelligent reasoning engine if no OpenAI API key is configured.

4. **5-Dimensional Radar Feedback Scorecard**:
   - Visual score breakdown across **Abstraction**, **SOLID Principles**, **Extensibility**, **Edge Cases**, and **Trade-offs**.
   - Code evidence highlights and actionable refactoring suggestions.

5. **Attempt History & Visual Diff Viewer**:
   - Persisted attempt history per problem.
   - Side-by-side attempt diffing to track design evolution.
   - "Fork & Retry" action to pre-fill past submissions for fast iteration.

6. **Stress Test Scenario Simulator**:
   - Test design resilience against future requirement changes (e.g. EV Charging Spots with per-kWh billing).

---

## 📂 Deliverables Index

| Deliverable | Path | Description |
| :--- | :--- | :--- |
| **Research Note** | [`RESEARCH_NOTE.md`](./RESEARCH_NOTE.md) | Learner problem analysis, existing tools comparison, gaps, and product strategy. |
| **Design Note** | [`DESIGN_NOTE.md`](./DESIGN_NOTE.md) | Domain architecture, class/interface specifications, evaluation pipeline, trade-offs. |
| **AI Usage** | [`AI_USAGE.md`](./AI_USAGE.md) | 4 key AI-assisted architectural decisions, accepted/rejected suggestions, and rationale. |
| **Working Prototype** | [`src/`](./src) | React + TypeScript + Vite + Tailwind CSS prototype app. |
| **Automated Tests** | [`src/tests/`](./src/tests) | Vitest test suite for formats, AST evaluator, and evaluation orchestrator. |

---

## 🛠️ How to Run

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 3. Run Automated Tests
```bash
npm test
```

---

## 🏗️ Architecture Overview

```
src/
├── data/               # Problems dataset & Stress test scenarios
│   ├── problems.ts
│   └── stressTests.ts
├── domain/             # Core Domain Model (Clean OOP Architecture)
│   ├── types.ts        # Problem, Attempt, Feedback, Rubric type definitions
│   ├── evaluator.ts    # IEvaluator and ISubmissionFormat interfaces
│   ├── formats/        # CodeOutline, Mermaid, JSON, and Text format parsers
│   └── evaluators/     # ASTDeterministicEvaluator, HybridLlmEvaluator, EvaluationOrchestrator
├── components/         # React UI Components
│   ├── Navbar.tsx
│   ├── ProblemDetail.tsx
│   ├── Editor/         # MultiFormatEditor & Live MermaidViewer
│   ├── Feedback/       # FeedbackDashboard & SVG RadarChart
│   ├── History/        # AttemptHistoryDrawer & AttemptDiffViewer
│   └── ApiKeyModal.tsx
├── tests/              # Vitest Unit & Integration Test Suite
│   └── domain/
└── App.tsx             # Main Application Container
```

---

## 🧪 Testing Verification Results

Running `npm test` executes all unit tests:
- `formats.test.ts`: Verifies parsing of TypeScript/Java outlines, Mermaid classDiagrams, and JSON schemas.
- `evaluator.test.ts`: Verifies deterministic concept extraction, interface checking, god class detection, and hybrid orchestrator score normalization.
