# 紫 Murasaki — Learn Japanese

Murasaki ("purple") is a progressive, immersive web app for learning **Hiragana**, **Katakana** and **Kanji**.
Each mode has three levels (Beginner → Intermediate → Expert) with instant visual feedback: a soft violet
glow for correct answers, a plum shake for mistakes, and an explanation every time.

| Layer    | Stack                                                       |
| -------- | ----------------------------------------------------------- |
| Backend  | Node.js 22, Express 5                                       |
| Database | PostgreSQL via Sequelize 6 (ARRAY + JSONB columns)          |
| Frontend | React 19, React Router 7, Vite 8, Tailwind CSS 4            |
| Shared   | `@murasaki/shared` — romaji matching, kana helpers, constants |

---

## Quick start

Requirements: **Node.js 22.12+** and **PostgreSQL 14+** (or Docker).

```bash
cd murasaki
npm install                      # installs server, client and shared workspaces
docker compose up -d db          # or point DATABASE_URL at your own Postgres
cp server/.env.example server/.env
npm run seed                     # load the content matrix (also happens automatically on first start)
npm run dev                      # API on :3001, React app on :5173
```

Open <http://localhost:5173>.

### Production

```bash
npm run build    # builds the React app into client/dist
npm start        # Express serves the API *and* the built app on :3001
```

Set `DATABASE_URL` (and `DATABASE_SSL=true` for most hosted Postgres providers).

### Scripts (run from `murasaki/`)

| Command                      | What it does                                             |
| ---------------------------- | -------------------------------------------------------- |
| `npm run dev`                | API with `node --watch` + Vite dev server                |
| `npm run seed`               | Replace all items with the seed data (progress is kept)  |
| `npm run seed -- --reset`    | Drop and recreate every table, including users           |
| `npm run build` / `npm start`| Production build / serve                                |
| `npm test`                   | Shared unit tests + server tests (needs Postgres, see below) |

### Troubleshooting

**The page loads but every link shows "Something went wrong".** The React app is up but the API can't serve
data. Look at the terminal running `npm run dev`:

- `[db] Cannot connect to PostgreSQL …`: the database isn't running. Start it with `docker compose up -d db`
  (Docker Desktop must be open), or use a PostgreSQL you already have (see below). The API keeps retrying,
  so the app starts working by itself as soon as the database is up.
- `[api] Port … is already in use`: another program has the API's port. Set a different `PORT` in
  `server/.env` (the dev server picks it up automatically). On a Mac, don't use 5000: AirPlay Receiver
  listens there, and requests to it come back as "403 Forbidden".
- `[vite] http proxy error … ECONNREFUSED`: the API process isn't running. Scroll up for the `[api]` error.

**Using PostgreSQL without Docker.** Install PostgreSQL 14+ and run these as the `postgres` superuser
(`psql -U postgres`) to match the default `DATABASE_URL`:

```sql
CREATE USER murasaki WITH PASSWORD 'murasaki';
CREATE DATABASE murasaki OWNER murasaki;
```

Or point `DATABASE_URL` in `server/.env` at any database you already have.

`GET /api/health` reports whether the database is connected, and why not if it isn't.

---

## Project structure

```
murasaki/
├── package.json            npm workspaces + top-level scripts
├── docker-compose.yml      local PostgreSQL
├── shared/                 code used by both server and client
│   ├── constants.js        modes, levels, completion threshold
│   ├── romaji.js           Hepburn/Kunrei-tolerant romaji matching
│   └── kana.js             mora splitting (きゃ stays one tile), helpers
├── server/
│   ├── server.js           connect → auto-seed → listen
│   ├── app.js              Express app (routes, errors, serves client/dist)
│   ├── config/             env loading + Sequelize connection
│   ├── models/             Item, User
│   ├── seed/
│   │   ├── seed.js         seeding script (CLI + seedIfEmpty)
│   │   └── data/           kana.js, kanji.js — the content matrix
│   ├── services/           quizBuilder.js (questions), tasks.js (lesson copy), random.js
│   ├── controllers/        lessonController.js, progressController.js
│   ├── routes/             /api/lessons, /api/progress
│   └── tests/              seed integrity, quiz-builder properties, API (supertest)
└── client/
    ├── index.html          fonts: Inter, Klee One (textbook-style kana), Noto Sans JP
    └── src/
        ├── index.css       Tailwind theme — the purple/white design tokens
        ├── pages/          Dashboard, LevelSelect, Quiz, Study, Progress
        ├── components/     Layout, NameDialog, ui, quiz/* (answer widgets, timer, feedback, results)
        ├── context/        UserContext (nickname + saved progress)
        └── lib/            api client, speech synthesis, storage, useAsync
```

---

## Content matrix

The seed creates **440 items**.

| Mode     | Beginner                        | Intermediate                                                    | Expert                                                   |
| -------- | ------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------- |
| Hiragana | 46 gojūon → romaji              | 20 dakuten, 5 handakuten, 33 yōon, 25 words built from tiles (ねこ, でんしゃ…) | 28 timed look-alike drills (ね/れ/わ, ぬ/め…) + 16 typing words |
| Katakana | 46 gojūon → romaji              | 20 dakuten, 5 handakuten, 33 yōon, 24 words built from tiles (サクラ, コーヒー…) | 30 timed look-alike drills (シ/ツ, ヌ/ス…) + 15 typing words  |
| Kanji    | 34 JLPT N5: numbers 一–十, elements 火水木金土, 日月人 and more — meaning & reading | 22 N4/N3 kanji (時前後東西, 食飲新古…) read in context (on'yomi vs kun'yomi) + 14 jukugo (先生, 学生…) | 24 N2/N1 words (経済, 複雑, 把握…) in fill-in-the-blank sentences, no furigana |

### Question types

| Level        | Kana                                                                 | Kanji                                                        |
| ------------ | -------------------------------------------------------------------- | ------------------------------------------------------------ |
| Beginner     | Character → romaji (multiple choice)                                 | Kanji → meaning, kanji → reading (alternating)               |
| Intermediate | Voiced/combined sounds → romaji (the un-voiced partner is always a distractor), plus **word building** from kana tiles | "How is 食 read in 食べる?" with on/kun options, plus jukugo readings whose distractors use the wrong reading type |
| Expert       | **Timed** look-alike drills in both directions (6 s), plus **typing** longer words (timer scales with length) | Sentence with a blank; options are homophones and look-alike compounds, each explained after answering |

Typed answers accept Hepburn and Kunrei spellings (`shi`/`si`, `tsu`/`tu`, `ja`/`zya`), macrons
(`tōkyō`) and `m`/`n` before b/p. Long vowels and double consonants still have to be right.

---

## API

### `GET /api/lessons/:alphabet/:level`

`alphabet`: `hiragana` | `katakana` | `kanji` · `level`: `beginner` | `intermediate` | `expert` (case-insensitive)

| Query   | Default | Notes                                              |
| ------- | ------- | -------------------------------------------------- |
| `count` | 10      | Questions to generate (max 50). `0` = items only.  |
| `seed`  | random  | Integer; makes the generated quiz reproducible.    |

```jsonc
{
  "alphabet": "kanji",
  "level": "intermediate",
  "mode": { "name": "Kanji", "native": "漢字", "glyph": "漢", ... },
  "task": { "title": "On'yomi vs Kun'yomi", "description": "...", "jlpt": "N4 / N3", ... },
  "itemCount": 36,
  "items": [ { "id": 1, "type": "Kanji", "level": "Intermediate", "character": "時", "romaji": "ji",
               "meaning": "time; hour", "onyomi": ["ji"], "kunyomi": ["toki"], "examples": [...] } ],
  "questions": [
    {
      "id": "1:reading-in-context:食べる",
      "kind": "choice",                       // choice | input | build
      "format": "reading-in-context",
      "instruction": "How is 食 read in this word?",
      "prompt": { "text": "食べる", "lang": "ja", "size": "lg", "caption": "to eat", "highlight": [0, 1] },
      "choices": [ { "value": "ta(beru)", "label": "ta(beru)", "sublabel": "Kun'yomi", "lang": "en" }, ... ],
      "answer": "ta(beru)",
      "answerDisplay": "ta(beru) (Kun'yomi)",
      "feedback": { "explanation": "In 食べる (taberu, ...) 食 takes its kun'yomi ...", "speak": "食べる" },
      "source": { "itemId": 9, "character": "食", "romaji": "shoku", "meaning": "eat; food" }
    }
  ]
}
```

Timed questions include `timeLimit` (seconds); build questions include `tiles`; expert sentences include a
`hint` (the English translation).

### `GET /api/lessons`

Catalogue for the dashboard: every mode with its levels, task copy and item counts.

### `POST /api/progress`

```json
{ "username": "hana", "alphabet": "hiragana", "level": "beginner",
  "correct": 9, "total": 10, "durationMs": 42000, "missed": ["ぬ"] }
```

Creates the learner on first save (201, then 200). Usernames are case-insensitive nicknames (no password).
Each mode/level keeps `attempts`, `bestAccuracy`, `lastAccuracy`, `totalCorrect`, `totalAnswered`,
`bestTimeMs`, `recentMissed`, and `completed` (true once a session scores **80%+**). Saves lock the row,
so parallel saves are never lost.

### `GET /api/progress/:username` · `DELETE /api/progress/:username`

Read or erase a learner's progress (404 if none saved yet).

### `GET /api/health`

`{ "status": "ok", "database": "connected" }`

---

## Design system

Purple and white only, defined as Tailwind theme tokens in `client/src/index.css`:

| Token          | Value     | Use                                      |
| -------------- | --------- | ---------------------------------------- |
| `murasaki-800` | `#4B0082` | Deep violet — primary buttons, accents   |
| `lavender`     | `#E6E6FA` | Page background, secondary surfaces      |
| `white`        | `#FFFFFF` | Cards and text areas                     |
| `plum-500`     | `#B0247E` | Red-violet, reserved for wrong answers   |

Large characters use **Klee One**, a textbook-style font that shows stroke shapes the way learners write them.
The layout is mobile-first; keyboard shortcuts (1–4 to answer, Enter to continue, Backspace to undo a tile)
make desktop practice fast. "Listen" buttons use the device's Japanese speech voice when one is installed.

---

## Tests

```bash
npm test
```

- **shared** — romaji normalisation and mora splitting.
- **server/tests/seedData.test.js** — content integrity (46 gojūon per script, every look-alike exists,
  every kanji example contains its kanji and uses one of its listed readings, one blank per sentence…).
- **server/tests/quizBuilder.test.js** — builds 200 random quizzes for every mode/level and checks every
  question is answerable, has unique choices that don't sound alike, and has its tiles available.
- **server/tests/api.test.js** — the HTTP API against a real database, including concurrent progress saves.
  Uses `TEST_DATABASE_URL` (default `postgres://murasaki:murasaki@localhost:5432/murasaki_test`) and is
  skipped if that database can't be reached. **It wipes that database**, so never point it at real data.
