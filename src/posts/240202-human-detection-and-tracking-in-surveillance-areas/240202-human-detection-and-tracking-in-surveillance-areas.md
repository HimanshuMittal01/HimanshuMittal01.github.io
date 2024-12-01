---
title: "Human Detection and Tracking in Surveillance Areas"
summary: "Developed a human and vehicle detection system using multi-GPU training on DGX V-100."
thumbnail: /assets/thumbnails/belodt-post-bg.png
---

<!-- date: 2024-02-04T16:20:31+05:30
tags: ["computer vision", "object detection", "tracking"] -->

This project "Human Detection in Surveillance Areas" was assigned to [Bennett University](https://www.bennett.edu.in/) by [Bharat Electronics Limited (BEL)](https://en.wikipedia.org/wiki/Bharat_Electronics) and I completed this project under the excellent guidance of [Dr. Vipul Kumar Mishra](https://in.linkedin.com/in/vipul-kumar-mishra-7bb43953) . The task was to detect any human or vehicle activity in restricted areas and surveillance zones at both daytime and night-time using RGB and IR cameras respectively.

I worked closely with deep learning based object detection models to detect human presence. As our final dataset (after many changes and additions) was really huge (around ~42 GB), it was not possible to train on local machines. Our team tried training on Google Cloud Platform (GCP) but for some reason was not able to get any GPU quota and CPU instances were taking lot of time. Then, we actually trained on DGX V-100 supercomputer remotely using multiple GPUs for super fast training speed. We were able to achieve good results on our custom dataset.

## Sample predictions
> *Please note that the below images are not part of the original dataset but are taken from publically available web images ([source](https://unsplash.com/s/photos/soldier)) and then our ML algorithm is run to detect humans/vehicles. Abiding by the terms of NDA, I cannot disclose any information about models, datasets or reports.*

<div style="text-align: center;">
    <div style="display: flex; align-items: center;">
        <figure style="margin:auto;">
            <img src="./soldier prediction image 1.jpg" alt="soldier prediction image 1" eleventy:widths="320" />
        </figure>
        <figure style="margin:auto;">
            <img src="./soldier prediction image 2.jpg" alt="soldier prediction image 2" eleventy:widths="320" />
        </figure>
    </div>
    <div style="display: flex; align-items: center;">
        <figure style="margin:auto;">
            <img src="./soldier prediction image 3.jpg" alt="soldier prediction image 1" eleventy:widths="320" />
        </figure>
        <figure style="margin:auto;">
            <img src="./soldier prediction image 4.jpg" alt="soldier prediction image 2" eleventy:widths="320" />
        </figure>
    </div>
</div>

## AfterMaths
Our team completed this project just in time before the deadline. Here are some learnings from the project:
- We had to change/add the dataset few times to reduce overfitting in the model trained on our custom dataset. Initially it detected person hiding behind the cover with ease but not a person standing in the front, but after modifying dataset it generalized very well on all the images. I realized after the completion of the project that how much the diversity of background and lightning matters in a dataset to work in real world.
- We spent unexpected amounts of time on model development from which I learnt that investing some time to identify right resources beforehand is also a crucial aspect in machine learning projects.

## Conclusion
I really enjoyed working on this project with the team. Special thanks to [Dr. Vipul Kumar Mishra](https://in.linkedin.com/in/vipul-kumar-mishra-7bb43953) for providing this opportunity. Defense systems such as this project can also be applied in other physical security areas like entry points, malls, banks, etc. I would love to get more knowledge about leveraging AI in defense and security, contact me.