---
title: "Spark Deploy Modes"
difficulty: "Medium"
tags: ["spark", "deployment", "cluster"]
question: "What is the key difference between cluster and client deploy modes in Spark?"
multi_select: false
answers:
  - id: a
    text: "In cluster mode the Driver runs on a worker node, in client mode it runs on the submitting machine"
    correct: true
    explanation: "In cluster mode, the cluster manager launches the Driver on one of the worker nodes, making it independent of the submitting machine. In client mode, the Driver runs on the machine that submitted the application, which must stay connected for the job's duration."
  - id: b
    text: "Cluster mode uses all available nodes while client mode uses only a single node"
    correct: false
    explanation: "Both modes distribute Executor tasks across all available worker nodes. The only difference is where the Driver process runs, not how many nodes are used for computation."
  - id: c
    text: "Cluster mode requires YARN while client mode works with any cluster manager"
    correct: false
    explanation: "Both deploy modes are supported by YARN, Mesos, Kubernetes, and Spark Standalone. The deploy mode is independent of the cluster manager choice."
  - id: d
    text: "Cluster mode is for production workloads only, client mode is for development only"
    correct: false
    explanation: "While client mode is convenient for development (seeing Driver output locally), both modes can be used in production. Client mode is common for interactive tools like notebooks, while cluster mode is typical for scheduled batch jobs."
explanation: "Understanding deploy modes helps explain operational concerns like log access, network requirements, and failure handling. In interviews, this question often leads to discussions about why the Driver being on the submitting machine can be problematic for long-running production jobs."
---

Deploy mode choice affects application reliability, debugging workflow, and network architecture requirements in production Spark environments.
