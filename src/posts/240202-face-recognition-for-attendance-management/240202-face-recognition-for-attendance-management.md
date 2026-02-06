---
title: "Face Recognition for Attendance Management"
summary: "Built face recognition systems with python backend, ending in a production-ready API."
thumbnail: "/assets/thumbnails/facerek-post-bg.png"
archived: true
---

<!-- date: 2024-02-04T19:34:14+05:30
tags: ["computer vision", "face recognition"] -->

Face recognition is quickly establishing itself as a standard for many companies to manage attendace, analyze behaviour and predict patterns. I have messed around with applied face recognition in three ways - web application in Flask, fixing API in Django, and full secured API in FastAPI. It sounds weird but at the same time funny that I worked on the same thing in three major python web frameworks and also three different face recognition libraries. Each time I upgraded my understanding of the overall process, and finally deployed API (in fastapi) for one of the clients. Below sections describe my experience with face recognition in more detail.

## FaceRek: Web application in Flask
Here is the [github link](https://github.com/HimanshuMittal01/Week5-Project) of the project. This was the first capstone project under the course [MMML](https://www.machinelearningcourse.io/courses/make-money) by Siraj Raval where I teamed up randomly with Sanjeev Gupta. Eventually, Siraj had some plagiarism issues due to which this course was not properly delivered, but that's a story for another day.
Anyways, it was quite a fun and challenging project because I had very little experience with Flask before, no practical experience in databases and Sanjeev was senior to me and had non-tech background which made this work even more interesting. Even after all these challenges, we managed to submit the project which includes login-signup, user database, face verification, and payment gateway integration using stripe. We used [OpenCV](https://docs.opencv.org/3.4/da/d60/tutorial_face_main.html) for encoding and verifying the faces. Here are some snapshots of the final web app:

<div style="text-align: center;">
    <figure>
        <img src="./facerek snap 1.png" alt="facerek screenshot 1" eleventy:widths="600" />
        <figcaption>Fig.1 - Process flow.</figcaption>
    </figure>
    <figure>
        <img src="./facerek snap 2.png" alt="facerek screenshot 2" eleventy:widths="600" />
        <figcaption>Fig.2 - Homepage.</figcaption>
    </figure>
    <figure>
        <img src="./facerek snap 3.png" alt="facerek screenshot 3" eleventy:widths="600" />
        <figcaption>Fig.3 - Demo screen.</figcaption>
    </figure>
</div>

This was the period where I gradually started learning about software engineering aspects of machine learning project as well, and this project was the start of my full stack data scientist journey.

## Face Recognition API in Django
2 years later, I got opportunity to fix some bugs in Face Recognition Django API for 30Days Technologies Pvt. Ltd. It was using awesome [face_recognition](https://github.com/ageitgey/face_recognition) library by Adam Gietgey. The problem was that the image orientation and face alignment was not correct, thus giving inconsistent results and additionally the server was getting filled up on each request. First I learnt about Django models for MySql and rest_framework, as it was completely new to me and then I solved all issues with the API. But then the database requirements changed, so I offered to create new secure API from scratch with custom in-app database. And then comes the FastAPI..

## Finally, FastAPI Face Recognition !!
I wanted to code this project in FastAPI because one I love this framework, second easy to handle concurrent operations and third the automatic swagger docs. I successfully built this project using one of my favourite libraries i.e [deepface](https://github.com/serengil/deepface) by Serengil for face recognition, and now this piece of work is being used in their products like [EZHRM](https://www.ezhrm.in/). Key features:
- JWT Token Authentication
- Option to change models
- Stored representations for low latency time while comparing
- No overhead of adding relational ot noSQL database as it is managed in-app itself

## Conclusion
These face recognition projects came to me from nowhere and helped me practically learn about APIs and databases which are used by other backend engines like PHP and NodeJS. Also, got hands-on experience with libraries like openCV, face-recognition and deepface. I would love to get more knowledge about handling scale issues in low budget, contact me.