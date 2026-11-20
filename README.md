# أبجد · Abjad

The companion web app for **Arabic 120 (Arabic I)** at Cuyamaca College, Spring 2027.
Students learn to read and write Arabic the way of the classic primer **القراءة الخلدونية**: every week adds a
few letters, and students read only real words made from letters they already know. They meet each word whole,
take it apart into its letters, and put letters back together into new words.

**Live:** https://qwertxynet.github.io/abjad/

## What's inside

- **Part 1, the letters (Weeks 1–8):** Words → Split → Meet → Trace → Read → Play → Quiz.
  Tracing shows numbered strokes and checks how much of the letter you covered.
- **Part 2, daily life (Weeks 10–16):** Words → Cards → Pattern → Read → Write → Play → Quiz.
  Numbers and age, days, months and seasons, colours and clothes, family, food, daily routine, and the Arab world (a tile map).
- **Week 17:** a review quiz drawn from every week.
- **Quizzes:** 10 questions drawn fresh each try; 8 correct gives a **completion code** tied to the student's name, which they submit in Canvas.
  Weeks unlock in order. On a new device, students paste an earned code (or an unlock code from the teacher) on **My codes**.
- **Teacher pages** (`#/teacher`, password-protected): check codes, make unlock codes, and a **recording studio** for every audio clip.
  A completion code also carries the quiz's seed, the student's ten answers and the attempt number, so **Check a code** rebuilds the
  student's quiz and shows every question with their answer and the right one. Students see the same review after they pass.
  If lesson content changes in a way that changes the quizzes, bump `QUIZ_VERSION` in `src/quiz.js`.

The interface is in English; all Arabic has full tashkeel with an on/off switch. Progress is saved in the browser only.

## Audio

The app plays only the teacher's own recordings. Record them on the studio page, press **Download all**, unzip the
WAV files into `source/audio/`, then run:

```bash
npm run audio
```

This converts them to MP3 in `public/audio/` and updates `manifest.json`; each clip's sound button appears as soon as its file exists.

## Editing content

All lesson content is in **`src/data/weeks.js`** (words, phrases, sentences, patterns, readings) and **`src/data/letters.js`**.
The line drawings are in `src/data/pics.js`.

## Run locally

```bash
npm install
npm run dev
```

It deploys to GitHub Pages on every push to `main` (see `.github/workflows/deploy.yml`).

> The teacher password and the code signatures live in the page's code, so they keep students out casually; they are not real security.
