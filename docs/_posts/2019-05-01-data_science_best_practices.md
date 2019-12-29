---
title: Data Science - Best Practices
tags: Best-Practice
---

Data Science is the art to extract value out of data. I like the [CRISP-DM Process](https://en.wikipedia.org/wiki/Cross-industry_standard_process_for_data_mining) for data science work since it gives a clear structure and guidance for initial value case / prototyping phases. During my lecture at the Technical University of Kaiserslautern I focus heavily in understanding and living each step.

Here, my best practices for each process step

### Business / Problem Understanding

* Ensure the feedback of subject matter experts and key stakeholders at all stages in the process
* Newer do the process alone you will do mistakes, the correct team / expert mixture is key for success
* Use agile methods and never drop the review (quality) & retrospective (learning) stage
* Have always the next steps for automation in mind, never rush too far
* Use and design for re-usable fragments

### Data Understanding/ Preparation

* Always start with data exploration phase
* Do always a visual story telling on data to align and get feedback
* Store and clean data systematically
* Each written code / result has to be reviewed
* Don’t move to fast into modeling, the full problem and data understanding is key for success

### Modeling

* Always start with a trivial model as a reference
* There is no inference without assumptions
* Start with small (statically relevant) data chunks, design for larger chunks
* Base model has to be correct all following steps will be derived from this  

### Evaluation

* Interpretation and understanding the potential gain of a trivial model will lead to the business case
* Always compare each model against a trivial solution
* Understand the outputs by all means
* Start with a hypothesis /assumption in mind and check your result
* Link the mathematical model quality to economic measures

### Deployment

* Start with full walk-through to the example
* Visualizing results is key for convincing
* Always prepare for automation, pure non-reproducible power point means no learning
* Be ready to delivery a result any time (automated / norm reporting at each stage)

Here, in this description the deployment results in a prototype or proof-of-value which does not mean enterprise ready deployment
