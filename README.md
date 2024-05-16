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

I aim to build a Django backend and incorporate the Gemini API in the coming days.
<h3>Furthermore, I intend to include the following features.</h3>

- Rewrite: Maybe an input/output feels better when written in a certain way.
- Resay: Understand interview questions better by telling the AI to say it differently.
- Save as text: A video might be too much, converting it to a tabular for would be crucial in some circumstances.
- Generate questions: Instead of having users add questions manually, I would like them to provide some text or a topic from which I can generate questions.
- PDF/Image parsing: Why copy and paste when you can just upload a document.
