<h3>While I made this initially in 2023 to practice for my Visa Interview, it can be utilized in different scenarios.</h3>

- Want to quiz yourself on any topic? Do so.
- Want to do a funny AI question and answer series? Why not?
- Want to implant a material in your memory? Just hear it here, over and over again.

This web interview platform saves your questions for later, captures video and text data, and provides a satisfactory user experience.
Also, the web interface is straightforward, replacing traditional modals, providing drag and drop support, utilizing toggles, and supporting keyboard only input.

<h3>I used the following Browser APIs to build this project.</h3>

- **SpeechSynthesis API:** Text-to-speech, providing different voices depending on your browser and internet connection.
- **MediaStream API:** 'Storing' video and audio tracks.
- **Audio API:** Syncing microphone and speaker audio, essentially inventing a way to store browser's speechSynthesis.speak output.
- **MediaRecorder API:** Recording media streams.

<h3>Furthermore, I also included the following features using a Django backend and the Gemini API.</h3>

- Generate questions: 
- Rewrite: Rewrite provided questions in different ways.
- Resay: Understand interview questions better by making the AI say it differently.
- Save as text: Use speech to text to convert spoken answers to text and map them to questions.
- Share: Generate a link to an interesting set of questions you compiled.
