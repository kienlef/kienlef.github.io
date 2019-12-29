---
title: Challenges in B2B machine learning / AI
tags: B2B
---

Applying and designing machine learning / AI models in a B2B context is often a challenging task. Methods and algorithms used within the context of B2C applications are often not suitable.

The two significant differences are:

* you have to deal with fewer data points, and
* the processes have often more human touch points.

Here some remarks on how to tackle this challenge towards machine learning and AI within B2B processes.

Machine Learning Challenge:

Within existing B2B processes, we often obtain data points, on which you should not try to learn a machine learning kernel.

The problem arises in the fact that existing (as-is) processes are often not designed for machine learning or automation. Instead many processes come with too many exceptions and intervention possibilities and are linked to outdated IT systems.

Whenever possible, you should train your machine learning models towards to-be processes, not on as-is status. The goal is to push the boundaries of B2B towards new and better processes.

 Some guiding principles:

* It is a path from analytics to machine learning and stronger linked to business / digital transformation. Applying machine learning comes most often with changes in the underlying processes and IT infrastructure.

* Data in B2B business processes are often limited, at least when comparing to B2C. Data augmentation techniques (simulation, re-sampling, digital twin techniques) is mandatory to design machine learning B2B models, especially when the future process is not yet stable

* Feature construction techniques is often a must-have due to important domain know-how inclusion. Proper feature construction methods often lead to insights for simpler analytical models solving the business problem with less maintenance burden.

Artificial intelligence Challenge:

AI is defined here as cognitive AI and is also different within the context of B2B processes. Only one example here, not discussing the broad field of vision recognition.

When designing a chatbot, e.g. for ERP interaction, you cannot train on a general corpus. You have to embed domain-specific terminology while collecting a significant number of training samples can only be done with the support of domain experts.

 The challenge I see currently is the lack of good tool support and integration ideas towards enterprise systems. Most tools are focusing on B2C flows which are useful to handle the massive amount of customer calls but not specific B2B processes with less data points. Most of the designs require semi-supervised support with immediate feedback of the user and with guidance or re-labelling of experts. These techniques are sometimes called an expert or (hybrid) crowd-sourcing interface with goal to assist the active learning. Active learning techniques are not yet present in current ERP systems.

However, I see vast potential in linking core ERP data and B2B processes to cognitive interfaces.
