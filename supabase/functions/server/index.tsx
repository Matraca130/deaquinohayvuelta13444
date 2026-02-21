import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { seedStudentData } from "./seed.tsx";
import {
  handleChat,
  handleGenerateFlashcards,
  handleGenerateQuiz,
  handleExplain,
} from "./gemini.tsx";

const app = new Hono();

// Enable logger
app.use("*", logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  })
);

const PREFIX = "/make-server-9e5922ee";

// ══════════════════════════════════════════════════════════════
// KV Key Schema — mirrors kv-schema.tsx from real backend
// ══════════════════════════════════════════════════════════════
// ⚡ SINGLE SOURCE: Change this ONE constant to rebrand all keys.
//    Both backends (real + Figma Make) must use the same value.
//    Current alignment: kv-schema.tsx in real backend also uses "axon".
const APP = "axon";

const K = {
  studentProfile:   (id: string) => `${APP}:student:profile:${id}`,
  studentStats:     (id: string) => `${APP}:student:stats:${id}`,
  dailyActivity:    (id: string) => `${APP}:student:daily-activity:${id}`,
  courseProgress:    (id: string) => `${APP}:student:course-progress:${id}`,
  session:          (id: string) => `${APP}:session:${id}`,
  flashcardReview:  (id: string) => `${APP}:flashcard-review:${id}`,
  studySummary:     (sid: string, cid: string, tid: string) => `${APP}:study-summary:${sid}:${cid}:${tid}`,
  readingState:     (sid: string, sumId: string) => `${APP}:reading-state:${sid}:${sumId}`,
  learningProfile:  (id: string) => `${APP}:learning-profile:${id}`,
  studentKeywords:  (sid: string, cid: string, tid?: string) =>
    tid ? `${APP}:student:keywords:${sid}:${cid}:${tid}` : `${APP}:student:keywords:${sid}:${cid}`,
};

const PFX = {
  sessions:         `${APP}:session:`,
  flashcardReviews: `${APP}:flashcard-review:`,
  studySummaries:   `${APP}:study-summary:`,
};

function uid(): string { return crypto.randomUUID(); }
function ts(): string { return new Date().toISOString(); }

// ============================================================
// Health check
// ============================================================
app.get(`${PREFIX}/health`, (c) => {
  return c.json({
    status: "ok",
    kv_prefix: `${APP}:*`,
    kv_note: "Change const APP to rebrand all KV keys",
    routes: [
      "student/profile", "student/stats", "student/progress",
      "student/sessions", "student/reviews", "student/activity",
      "student/summaries", "student/keywords",
      "ai/chat", "ai/flashcards", "ai/quiz", "ai/explain",
      "seed",
    ],
  });
});

// ============================================================
// STUDENT PROFILE
// Key: axon:student:profile:{id}
// ============================================================

app.get(`${PREFIX}/student/:id/profile`, async (c) => {
  try {
    const id = c.req.param("id");
    const profile = await kv.get(K.studentProfile(id));
    if (!profile) {
      return c.json({ error: `Student profile not found for id: ${id}` }, 404);
    }
    return c.json(profile);
  } catch (err) {
    console.log(`Error fetching student profile: ${err}`);
    return c.json({ error: `Error fetching student profile: ${err}` }, 500);
  }
});

app.put(`${PREFIX}/student/:id/profile`, async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existing = await kv.get(K.studentProfile(id));
    const merged = existing
      ? { ...existing, ...body, id, updated_at: ts() }
      : { ...body, id, updated_at: ts() };
    await kv.set(K.studentProfile(id), merged);
    return c.json(merged);
  } catch (err) {
    console.log(`Error updating student profile: ${err}`);
    return c.json({ error: `Error updating student profile: ${err}` }, 500);
  }
});

// ============================================================
// STUDENT STATS
// Key: axon:student:stats:{id}
// ============================================================

app.get(`${PREFIX}/student/:id/stats`, async (c) => {
  try {
    const id = c.req.param("id");
    const stats = await kv.get(K.studentStats(id));
    if (!stats) {
      return c.json({ error: `Student stats not found for id: ${id}` }, 404);
    }
    return c.json(stats);
  } catch (err) {
    console.log(`Error fetching student stats: ${err}`);
    return c.json({ error: `Error fetching student stats: ${err}` }, 500);
  }
});

app.put(`${PREFIX}/student/:id/stats`, async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const existing = await kv.get(K.studentStats(id));
    const merged = existing ? { ...existing, ...body } : body;
    await kv.set(K.studentStats(id), merged);
    return c.json(merged);
  } catch (err) {
    console.log(`Error updating student stats: ${err}`);
    return c.json({ error: `Error updating student stats: ${err}` }, 500);
  }
});

// ============================================================
// COURSE PROGRESS
// Key: axon:student:course-progress:{id}  (single array, like real backend)
// ============================================================

app.get(`${PREFIX}/student/:id/progress`, async (c) => {
  try {
    const id = c.req.param("id");
    const progress = await kv.get(K.courseProgress(id));
    return c.json(progress || []);
  } catch (err) {
    console.log(`Error fetching course progress: ${err}`);
    return c.json({ error: `Error fetching course progress: ${err}` }, 500);
  }
});

app.get(`${PREFIX}/student/:id/progress/:courseId`, async (c) => {
  try {
    const { id, courseId } = c.req.param();
    const all: any[] = (await kv.get(K.courseProgress(id))) || [];
    const found = all.find((p: any) => p.courseId === courseId);
    if (!found) {
      return c.json({ error: `Progress not found for student ${id}, course ${courseId}` }, 404);
    }
    return c.json(found);
  } catch (err) {
    console.log(`Error fetching course progress: ${err}`);
    return c.json({ error: `Error fetching course progress: ${err}` }, 500);
  }
});

app.put(`${PREFIX}/student/:id/progress/:courseId`, async (c) => {
  try {
    const { id, courseId } = c.req.param();
    const body = await c.req.json();
    const all: any[] = (await kv.get(K.courseProgress(id))) || [];
    const idx = all.findIndex((p: any) => p.courseId === courseId);
    const entry = { ...body, courseId };
    if (idx >= 0) {
      all[idx] = { ...all[idx], ...entry };
    } else {
      all.push(entry);
    }
    await kv.set(K.courseProgress(id), all);
    return c.json(idx >= 0 ? all[idx] : entry);
  } catch (err) {
    console.log(`Error updating course progress: ${err}`);
    return c.json({ error: `Error updating course progress: ${err}` }, 500);
  }
});

// ============================================================
// STUDY SESSIONS
// Key: axon:session:{sessionId}  (with student_id field inside)
// ============================================================

app.post(`${PREFIX}/student/:id/sessions`, async (c) => {
  try {
    const studentId = c.req.param("id");
    const body = await c.req.json();
    const sessionId = body.id || uid();
    const session = {
      ...body,
      id: sessionId,
      student_id: studentId,
      studentId: studentId,
      started_at: body.startedAt || body.started_at || ts(),
      ended_at: body.endedAt || body.ended_at || ts(),
    };
    await kv.set(K.session(sessionId), session);

    // Also update daily activity array
    const today = new Date().toISOString().slice(0, 10);
    const activity: any[] = (await kv.get(K.dailyActivity(studentId))) || [];
    let dayEntry = activity.find((a: any) => a.date === today);
    if (!dayEntry) {
      dayEntry = { date: today, studyMinutes: 0, sessionsCount: 0, cardsReviewed: 0 };
      activity.push(dayEntry);
    }
    dayEntry.studyMinutes += body.durationMinutes || 0;
    dayEntry.sessionsCount += 1;
    dayEntry.cardsReviewed += body.cardsReviewed || 0;
    await kv.set(K.dailyActivity(studentId), activity);

    return c.json(session, 201);
  } catch (err) {
    console.log(`Error creating study session: ${err}`);
    return c.json({ error: `Error creating study session: ${err}` }, 500);
  }
});

app.get(`${PREFIX}/student/:id/sessions`, async (c) => {
  try {
    const studentId = c.req.param("id");
    const all = await kv.getByPrefix(PFX.sessions);
    const filtered = all.filter(
      (s: any) => s.student_id === studentId || s.studentId === studentId
    );
    filtered.sort(
      (a: any, b: any) =>
        new Date(b.startedAt || b.started_at || 0).getTime() -
        new Date(a.startedAt || a.started_at || 0).getTime()
    );
    return c.json(filtered);
  } catch (err) {
    console.log(`Error fetching study sessions: ${err}`);
    return c.json({ error: `Error fetching study sessions: ${err}` }, 500);
  }
});

// ============================================================
// FLASHCARD REVIEWS
// Key: axon:flashcard-review:{reviewId}  (with student_id field inside)
// ============================================================

app.post(`${PREFIX}/student/:id/reviews`, async (c) => {
  try {
    const studentId = c.req.param("id");
    const body = await c.req.json();
    const reviews = body.reviews || [body];
    const keys: string[] = [];
    const values: any[] = [];
    for (const review of reviews) {
      const reviewId = review.id || uid();
      keys.push(K.flashcardReview(reviewId));
      values.push({ ...review, id: reviewId, student_id: studentId, studentId });
    }
    await kv.mset(keys, values);
    return c.json({ saved: keys.length }, 201);
  } catch (err) {
    console.log(`Error saving flashcard reviews: ${err}`);
    return c.json({ error: `Error saving flashcard reviews: ${err}` }, 500);
  }
});

app.get(`${PREFIX}/student/:id/reviews`, async (c) => {
  try {
    const studentId = c.req.param("id");
    const all = await kv.getByPrefix(PFX.flashcardReviews);
    const filtered = all.filter(
      (r: any) => r.student_id === studentId || r.studentId === studentId
    );
    return c.json(filtered);
  } catch (err) {
    console.log(`Error fetching reviews: ${err}`);
    return c.json({ error: `Error fetching reviews: ${err}` }, 500);
  }
});

app.get(`${PREFIX}/student/:id/reviews/:courseId`, async (c) => {
  try {
    const { id: studentId, courseId } = c.req.param();
    const all = await kv.getByPrefix(PFX.flashcardReviews);
    const filtered = all.filter(
      (r: any) =>
        (r.student_id === studentId || r.studentId === studentId) &&
        (r.courseId === courseId || r.course_id === courseId)
    );
    return c.json(filtered);
  } catch (err) {
    console.log(`Error fetching course reviews: ${err}`);
    return c.json({ error: `Error fetching course reviews: ${err}` }, 500);
  }
});

// ============================================================
// DAILY ACTIVITY
// Key: axon:student:daily-activity:{id}  (single array, like real backend)
// ============================================================

app.get(`${PREFIX}/student/:id/activity`, async (c) => {
  try {
    const id = c.req.param("id");
    const activity: any[] = (await kv.get(K.dailyActivity(id))) || [];
    activity.sort(
      (a: any, b: any) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    return c.json(activity);
  } catch (err) {
    console.log(`Error fetching daily activity: ${err}`);
    return c.json({ error: `Error fetching daily activity: ${err}` }, 500);
  }
});

// ============================================================
// CONTENT STORAGE (lesson texts, notes, etc.)
// Key: ${APP}:content:{courseId}:{key}
// ============================================================

app.put(`${PREFIX}/content/:courseId/:key`, async (c) => {
  try {
    const { courseId, key } = c.req.param();
    const body = await c.req.json();
    await kv.set(`${APP}:content:${courseId}:${key}`, body);
    return c.json({ ok: true });
  } catch (err) {
    console.log(`Error storing content: ${err}`);
    return c.json({ error: `Error storing content: ${err}` }, 500);
  }
});

app.get(`${PREFIX}/content/:courseId/:key`, async (c) => {
  try {
    const { courseId, key } = c.req.param();
    const content = await kv.get(`${APP}:content:${courseId}:${key}`);
    if (!content) {
      return c.json({ error: `Content not found: ${courseId}/${key}` }, 404);
    }
    return c.json(content);
  } catch (err) {
    console.log(`Error fetching content: ${err}`);
    return c.json({ error: `Error fetching content: ${err}` }, 500);
  }
});

app.get(`${PREFIX}/content/:courseId`, async (c) => {
  try {
    const courseId = c.req.param("courseId");
    const items = await kv.getByPrefix(`${APP}:content:${courseId}:`);
    return c.json(items);
  } catch (err) {
    console.log(`Error fetching course content: ${err}`);
    return c.json({ error: `Error fetching course content: ${err}` }, 500);
  }
});

// ============================================================
// STUDY SUMMARIES (Resumos)
// Key: axon:study-summary:{studentId}:{courseId}:{topicId}
// ============================================================

app.get(`${PREFIX}/student/:id/summaries`, async (c) => {
  try {
    const id = c.req.param("id");
    const summaries = await kv.getByPrefix(`${PFX.studySummaries}${id}:`);
    summaries.sort(
      (a: any, b: any) =>
        new Date(b.updatedAt || b.updated_at || 0).getTime() -
        new Date(a.updatedAt || a.updated_at || 0).getTime()
    );
    return c.json(summaries);
  } catch (err) {
    console.log(`Error fetching summaries: ${err}`);
    return c.json({ error: `Error fetching summaries: ${err}` }, 500);
  }
});

app.get(`${PREFIX}/student/:id/summaries/:courseId`, async (c) => {
  try {
    const { id, courseId } = c.req.param();
    const summaries = await kv.getByPrefix(`${PFX.studySummaries}${id}:${courseId}:`);
    summaries.sort(
      (a: any, b: any) =>
        new Date(b.updatedAt || b.updated_at || 0).getTime() -
        new Date(a.updatedAt || a.updated_at || 0).getTime()
    );
    return c.json(summaries);
  } catch (err) {
    console.log(`Error fetching course summaries: ${err}`);
    return c.json({ error: `Error fetching course summaries: ${err}` }, 500);
  }
});

app.get(`${PREFIX}/student/:id/summaries/:courseId/:topicId`, async (c) => {
  try {
    const { id, courseId, topicId } = c.req.param();
    const summary = await kv.get(K.studySummary(id, courseId, topicId));
    if (!summary) {
      return c.json(
        { error: `Summary not found for student ${id}, course ${courseId}, topic ${topicId}` },
        404
      );
    }
    return c.json(summary);
  } catch (err) {
    console.log(`Error fetching summary: ${err}`);
    return c.json({ error: `Error fetching summary: ${err}` }, 500);
  }
});

app.put(`${PREFIX}/student/:id/summaries/:courseId/:topicId`, async (c) => {
  try {
    const { id, courseId, topicId } = c.req.param();
    const body = await c.req.json();
    const key = K.studySummary(id, courseId, topicId);
    const existing = await kv.get(key);
    const now = ts();

    const summary = existing
      ? { ...existing, ...body, studentId: id, student_id: id, courseId, topicId, updatedAt: now, updated_at: now }
      : {
          ...body,
          id: `summary_${courseId}_${topicId}`,
          studentId: id,
          student_id: id,
          courseId,
          topicId,
          createdAt: now,
          created_at: now,
          updatedAt: now,
          updated_at: now,
          editTimeMinutes: body.editTimeMinutes || 0,
          tags: body.tags || [],
          bookmarked: body.bookmarked || false,
          annotations: body.annotations || [],
        };

    await kv.set(key, summary);
    return c.json(summary);
  } catch (err) {
    console.log(`Error saving summary: ${err}`);
    return c.json({ error: `Error saving summary: ${err}` }, 500);
  }
});

app.delete(`${PREFIX}/student/:id/summaries/:courseId/:topicId`, async (c) => {
  try {
    const { id, courseId, topicId } = c.req.param();
    await kv.del(K.studySummary(id, courseId, topicId));
    return c.json({ ok: true });
  } catch (err) {
    console.log(`Error deleting summary: ${err}`);
    return c.json({ error: `Error deleting summary: ${err}` }, 500);
  }
});

// ============================================================
// KEYWORDS (Spaced Repetition V2)
// Key: axon:student:keywords:{id}:{courseId}[:{topicId}]
// ============================================================

app.get(`${PREFIX}/student/:id/keywords/:courseId`, async (c) => {
  try {
    const { id, courseId } = c.req.param();
    const keywords = await kv.get(K.studentKeywords(id, courseId));
    if (!keywords) {
      return c.json({ keywords: {}, lastUpdated: ts() });
    }
    return c.json(keywords);
  } catch (err) {
    console.log(`Error fetching course keywords: ${err}`);
    return c.json({ error: `Error fetching course keywords: ${err}` }, 500);
  }
});

app.get(`${PREFIX}/student/:id/keywords/:courseId/:topicId`, async (c) => {
  try {
    const { id, courseId, topicId } = c.req.param();
    const keywords = await kv.get(K.studentKeywords(id, courseId, topicId));
    if (!keywords) {
      return c.json({ courseId, topicId, keywords: {}, lastUpdated: ts() });
    }
    return c.json(keywords);
  } catch (err) {
    console.log(`Error fetching topic keywords: ${err}`);
    return c.json({ error: `Error fetching topic keywords: ${err}` }, 500);
  }
});

app.put(`${PREFIX}/student/:id/keywords/:courseId/:topicId`, async (c) => {
  try {
    const { id, courseId, topicId } = c.req.param();
    const body = await c.req.json();
    const data = { courseId, topicId, keywords: body.keywords || {}, lastUpdated: ts() };
    await kv.set(K.studentKeywords(id, courseId, topicId), data);
    return c.json(data);
  } catch (err) {
    console.log(`Error saving topic keywords: ${err}`);
    return c.json({ error: `Error saving topic keywords: ${err}` }, 500);
  }
});

app.put(`${PREFIX}/student/:id/keywords/:courseId`, async (c) => {
  try {
    const { id, courseId } = c.req.param();
    const body = await c.req.json();
    const data = { courseId, keywords: body.keywords || {}, lastUpdated: ts() };
    await kv.set(K.studentKeywords(id, courseId), data);
    return c.json(data);
  } catch (err) {
    console.log(`Error saving course keywords: ${err}`);
    return c.json({ error: `Error saving course keywords: ${err}` }, 500);
  }
});

// ============================================================
// SEED — Populate demo data (uses aligned keys)
// ============================================================

app.post(`${PREFIX}/seed`, async (c) => {
  try {
    const studentId = c.req.query("studentId") || undefined;
    await seedStudentData(studentId);
    const id = studentId || "demo-student-001";
    return c.json({ ok: true, message: `Student data seeded successfully for ${id}` });
  } catch (err) {
    console.log(`Error seeding data: ${err}`);
    return c.json({ error: `Error seeding data: ${err}` }, 500);
  }
});

// ============================================================
// GEMINI — AI Integration
// ============================================================

app.post(`${PREFIX}/ai/chat`, async (c) => {
  try {
    const { messages, context } = await c.req.json();
    if (!messages || !Array.isArray(messages)) {
      return c.json({ error: "messages array is required" }, 400);
    }
    const reply = await handleChat(messages, context);
    return c.json({ reply });
  } catch (err) {
    console.log(`Error in AI chat: ${err}`);
    return c.json({ error: `AI chat error: ${err}` }, 500);
  }
});

app.post(`${PREFIX}/ai/flashcards`, async (c) => {
  try {
    const { topic, count, context } = await c.req.json();
    if (!topic) {
      return c.json({ error: "topic is required" }, 400);
    }
    const flashcards = await handleGenerateFlashcards(topic, count || 5, context);
    return c.json({ flashcards });
  } catch (err) {
    console.log(`Error generating flashcards: ${err}`);
    return c.json({ error: `Flashcard generation error: ${err}` }, 500);
  }
});

app.post(`${PREFIX}/ai/quiz`, async (c) => {
  try {
    const { topic, count, difficulty } = await c.req.json();
    if (!topic) {
      return c.json({ error: "topic is required" }, 400);
    }
    const questions = await handleGenerateQuiz(topic, count || 3, difficulty || "intermediate");
    return c.json({ questions });
  } catch (err) {
    console.log(`Error generating quiz: ${err}`);
    return c.json({ error: `Quiz generation error: ${err}` }, 500);
  }
});

app.post(`${PREFIX}/ai/explain`, async (c) => {
  try {
    const { concept, context } = await c.req.json();
    if (!concept) {
      return c.json({ error: "concept is required" }, 400);
    }
    const explanation = await handleExplain(concept, context);
    return c.json({ explanation });
  } catch (err) {
    console.log(`Error explaining concept: ${err}`);
    return c.json({ error: `Explain error: ${err}` }, 500);
  }
});

Deno.serve(app.fetch);