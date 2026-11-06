// End-to-end API tests against a real PostgreSQL database.
//
// Uses TEST_DATABASE_URL (default: the local murasaki_test database). The
// database is wiped and re-seeded. If it can't be reached the tests are skipped.
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';

process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? 'postgres://murasaki:murasaki@localhost:5432/murasaki_test';
process.env.DB_LOGGING = 'false';

const { sequelize, connectDB, dbState, disconnectDB } = await import('../config/db.js');
await import('../models/index.js');
const { seedItems } = await import('../seed/seed.js');
const { createApp } = await import('../app.js');
const { default: request } = await import('supertest');

let reachable = true;
try {
  await connectDB({ retries: 1 });
} catch (error) {
  reachable = false;
  console.warn(`[api.test] skipping: test database unreachable (${error.message})`);
}

describe('Murasaki API', { skip: !reachable }, () => {
  let app;

  before(async () => {
    await sequelize.sync({ force: true });
    await seedItems({ logger: {} });
    app = createApp({ serveClient: false });
  });

  after(async () => {
    await disconnectDB();
  });

  test('GET /api/health', async () => {
    const res = await request(app).get('/api/health').expect(200);
    assert.equal(res.body.database, 'connected');
  });

  test('GET /api/lessons lists every mode and level with counts', async () => {
    const res = await request(app).get('/api/lessons').expect(200);
    assert.deepEqual(res.body.modes.map((m) => m.slug), ['hiragana', 'katakana', 'kanji']);
    for (const mode of res.body.modes) {
      assert.deepEqual(mode.levels.map((l) => l.slug), ['beginner', 'intermediate', 'expert']);
      for (const level of mode.levels) {
        assert.ok(level.itemCount > 0, `${mode.slug}/${level.slug}`);
        assert.ok(level.title);
      }
    }
    assert.equal(res.body.modes[0].levels[0].itemCount, 46);
  });

  test('GET /api/lessons/:alphabet/:level returns items and questions', async () => {
    const res = await request(app).get('/api/lessons/hiragana/beginner?count=5&seed=1').expect(200);
    assert.equal(res.body.alphabet, 'hiragana');
    assert.equal(res.body.level, 'beginner');
    assert.equal(res.body.items.length, 46);
    assert.equal(res.body.items[0].character, 'あ');
    assert.equal(res.body.questions.length, 5);
    assert.ok(res.body.task.title);
    assert.equal(res.body.items[0].createdAt, undefined, 'timestamps are not exposed');
  });

  test('alphabet and level are case-insensitive', async () => {
    const res = await request(app).get('/api/lessons/Kanji/EXPERT?count=3').expect(200);
    assert.equal(res.body.questions.length, 3);
    assert.equal(res.body.questions[0].format, 'sentence-blank');
  });

  test('a seed makes the quiz reproducible', async () => {
    const a = await request(app).get('/api/lessons/kanji/intermediate?seed=9');
    const b = await request(app).get('/api/lessons/kanji/intermediate?seed=9');
    assert.deepEqual(a.body.questions, b.body.questions);
  });

  test('invalid parameters are rejected with 400', async () => {
    await request(app).get('/api/lessons/latin/beginner').expect(400);
    await request(app).get('/api/lessons/kanji/master').expect(400);
    await request(app).get('/api/lessons/kanji/expert?count=-1').expect(400);
    await request(app).get('/api/lessons/kanji/expert?seed=abc').expect(400);
  });

  test('while the database is unavailable the API explains what to do', async () => {
    dbState.ready = false;
    try {
      const res = await request(app).get('/api/lessons/hiragana/beginner').expect(503);
      assert.equal(res.body.code, 'DB_UNAVAILABLE');
      assert.match(res.body.error, /docker compose up -d db/);
      const health = await request(app).get('/api/health').expect(503);
      assert.equal(health.body.database, 'unreachable');
    } finally {
      dbState.ready = true;
    }
  });

  test('unknown API routes return JSON 404', async () => {
    const res = await request(app).get('/api/nothing-here').expect(404);
    assert.match(res.body.error, /No API route/);
  });

  test('POST /api/progress creates a learner and tracks best accuracy', async () => {
    const first = await request(app)
      .post('/api/progress')
      .send({ username: 'Sakura', alphabet: 'katakana', level: 'expert', correct: 9, total: 10, durationMs: 30000, missed: ['シ'] })
      .expect(201);
    assert.equal(first.body.username, 'sakura');
    const entry = first.body.progress['katakana:expert'];
    assert.equal(entry.attempts, 1);
    assert.equal(entry.bestAccuracy, 90);
    assert.equal(entry.completed, true);
    assert.deepEqual(entry.recentMissed, ['シ']);

    const second = await request(app)
      .post('/api/progress')
      .send({ username: 'sakura', alphabet: 'katakana', level: 'expert', correct: 4, total: 10 })
      .expect(200);
    const updated = second.body.progress['katakana:expert'];
    assert.equal(updated.attempts, 2);
    assert.equal(updated.bestAccuracy, 90, 'best accuracy is kept');
    assert.equal(updated.lastAccuracy, 40);
    assert.equal(updated.completed, true, 'completion is never lost');
    assert.equal(updated.totalAnswered, 20);

    const fetched = await request(app).get('/api/progress/SAKURA').expect(200);
    assert.equal(fetched.body.progress['katakana:expert'].attempts, 2);
  });

  test('concurrent saves are not lost', async () => {
    const body = { username: 'parallel', alphabet: 'kanji', level: 'beginner', correct: 1, total: 2 };
    await Promise.all(Array.from({ length: 5 }, () => request(app).post('/api/progress').send(body)));
    const res = await request(app).get('/api/progress/parallel').expect(200);
    assert.equal(res.body.progress['kanji:beginner'].attempts, 5);
  });

  test('POST /api/progress validates its body', async () => {
    const valid = { username: 'kenji', alphabet: 'kanji', level: 'beginner', correct: 1, total: 2 };
    await request(app).post('/api/progress').send({ ...valid, username: 'x' }).expect(400);
    await request(app).post('/api/progress').send({ ...valid, alphabet: 'latin' }).expect(400);
    await request(app).post('/api/progress').send({ ...valid, level: 'master' }).expect(400);
    await request(app).post('/api/progress').send({ ...valid, correct: 3 }).expect(400);
    await request(app).post('/api/progress').send({ ...valid, total: 0 }).expect(400);
    const bad = await request(app)
      .post('/api/progress')
      .set('content-type', 'application/json')
      .send('{nope')
      .expect(400);
    assert.equal(bad.body.error, 'Request body is not valid JSON.');
  });

  test('GET and DELETE /api/progress/:username', async () => {
    await request(app).get('/api/progress/ghost').expect(404);
    await request(app)
      .post('/api/progress')
      .send({ username: 'temp-user', alphabet: 'hiragana', level: 'beginner', correct: 1, total: 1 })
      .expect(201);
    await request(app).delete('/api/progress/temp-user').expect(204);
    await request(app).get('/api/progress/temp-user').expect(404);
  });
});
