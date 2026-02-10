---
title: "Spark Whole-Stage Code Generation"
difficulty: "Hard"
tags: ["spark", "tungsten", "code-generation"]
question: "What does whole-stage code generation (Tungsten) do in Spark?"
multi_select: false
answers:
  - id: a
    text: "Fuses multiple operators into a single optimized function, eliminating virtual function calls and intermediate data materialization"
    correct: true
    explanation: "Whole-stage code generation collapses an entire stage of operators (filter, project, aggregate) into a single Java function. This eliminates the overhead of virtual dispatch between operators, removes intermediate row materialization, and enables CPU-friendly tight loops. It can improve performance by 10x for CPU-bound queries."
  - id: b
    text: "Generates GPU-optimized code for hardware-accelerated data processing"
    correct: false
    explanation: "Spark's whole-stage code generation targets the JVM, generating Java bytecode. It does not generate GPU code. GPU acceleration in Spark requires separate projects like NVIDIA RAPIDS."
  - id: c
    text: "Bypasses the JVM entirely by generating native machine code for critical paths"
    correct: false
    explanation: "Whole-stage codegen generates Java source code that is compiled to JVM bytecode by Janino, a lightweight Java compiler. It does not bypass the JVM. The JIT compiler may later optimize the bytecode to native code, but that is standard JVM behavior."
  - id: d
    text: "Creates custom serialization formats to reduce memory usage for cached data"
    correct: false
    explanation: "Custom serialization using UnsafeRow is a separate Tungsten feature focused on memory layout. While both are part of Project Tungsten, whole-stage code generation specifically addresses CPU efficiency through operator fusion, not memory format."
explanation: "Whole-stage code generation is one of Spark's most sophisticated optimizations. In interviews, being able to explain how it eliminates interpreter overhead (virtual calls, intermediate rows) and why it appears as a WholeStageCodegen node in physical plans demonstrates deep understanding of Spark's execution engine."
---

Whole-stage code generation is a key reason modern Spark approaches the performance of hand-written code and is an important concept for understanding Spark physical plans.
