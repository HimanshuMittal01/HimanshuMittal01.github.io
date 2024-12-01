---
title: "Custom Tensorrt Plugin"
summary: "Built a custom TensorRT plugin, boosting LeNet-5 performance 3x."
thumbnail: "/assets/thumbnails/tensorrt-post-bg.jpg"
---

<!-- date: 2024-02-04T19:55:44+05:30 tags: ["deep learning", "optimization"]-->

[NVIDIA TensorRT](https://developer.nvidia.com/tensorrt) is an SDK for high-performance deep learning inference. It includes a deep learning inference optimizer and runtime that delivers low latency and high throughput for deep learning inference applications. This work "Custom TensorRT Plugin" was completed as a project under TensorRT bootcamp organized by NVIDIA in our college. The task was to code a custom native TensorRT plugins, use them and document results.

There were very few articles on TensorRT in Dec 2019, so we had to read tons of documentation (I read [this](https://docs.nvidia.com/deeplearning/tensorrt/developer-guide/index.html) about 15 times) and the fact that it is not completely open-sourced made it even harder. Me and my teammate (team of 2) only had ~45 days to complete the task from which half of the days were wasted due to some communication errors from the management. Actually we were in misconception that we can use tensorflow integrated tensorRT (TRT) and change the computational graph using tensorflow 1.x versions. We actually ended up optimizing inference of ResNet-50 model using integrated plugins.

After one doubt session with NVIDIA developers, we got clarity and decided to optimize [Swish activation function](https://medium.com/@neuralnets/swish-activation-function-by-google-53e1ea86f820). We wrote our plugin in C++ understanding data types written in NVIDIA libraries and then using [graphsurgeon](https://docs.nvidia.com/deeplearning/tensorrt/api/python_api/graphsurgeon/graphsurgeon.html) library, we used our plugin by mapping ReLU activation nodes to our custom plugin for replacement. Actually, TensorRT will fuse 4 nodes together and it will be performed as one node operation, hence achieving little speedup. We tested this in deep learning architecture [LeNet5](https://www.analyticsvidhya.com/blog/2021/03/the-architecture-of-lenet-5/) in which it achieved 3x performance.