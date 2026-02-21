import * as kv from "./kv_store.tsx";

// ============================================================
// Seed Demo Student Data
// KV keys ALIGNED with kv-schema.tsx from real backend.
// ============================================================
// ⚡ SINGLE SOURCE: Change this ONE constant to rebrand all keys.
//    Must match the APP constant in index.tsx and kv-schema.tsx.
const APP = "axon";

const DEFAULT_STUDENT_ID = "demo-student-001";

// ── KV Key generators (mirrors kv-schema.tsx) ─────────────
const K = {
  studentProfile:   (id: string) => `${APP}:student:profile:${id}`,
  studentStats:     (id: string) => `${APP}:student:stats:${id}`,
  dailyActivity:    (id: string) => `${APP}:student:daily-activity:${id}`,
  courseProgress:    (id: string) => `${APP}:student:course-progress:${id}`,
  session:          (id: string) => `${APP}:session:${id}`,
  flashcardReview:  (id: string) => `${APP}:flashcard-review:${id}`,
  studySummary:     (sid: string, cid: string, tid: string) => `${APP}:study-summary:${sid}:${cid}:${tid}`,
  learningProfile:  (id: string) => `${APP}:learning-profile:${id}`,
};

export async function seedStudentData(studentId?: string) {
  const ID = studentId || DEFAULT_STUDENT_ID;
  console.log(`[seed] Seeding student data (${APP}: keys) for: ${ID}`);

  const keys: string[] = [];
  const values: any[] = [];

  // ── 1. Student Profile ──────────────────────────────────
  keys.push(K.studentProfile(ID));
  values.push({
    id: ID,
    name: "Lucas Mendes",
    email: "lucas.mendes@med.university.br",
    avatarUrl: "",
    university: "Universidade Federal de Medicina",
    course: "Medicina",
    semester: 3,
    enrolledCourseIds: ["anatomy", "histology"],
    createdAt: "2025-02-01T08:00:00Z",
    preferences: {
      theme: "light",
      language: "pt-BR",
      dailyGoalMinutes: 120,
      notificationsEnabled: true,
      spacedRepetitionAlgorithm: "sm2",
    },
  });

  // ── 2. Student Stats ────────────────────────────────────
  keys.push(K.studentStats(ID));
  values.push({
    totalStudyMinutes: 4830,
    totalSessions: 147,
    totalCardsReviewed: 1243,
    totalQuizzesCompleted: 38,
    currentStreak: 12,
    longestStreak: 23,
    averageDailyMinutes: 68,
    lastStudyDate: "2026-02-14T18:30:00Z",
    weeklyActivity: [85, 92, 45, 110, 78, 60, 30],
  });

  // ── 3. Course Progress (single array at one key) ────────
  keys.push(K.courseProgress(ID));
  values.push([
    {
      courseId: "anatomy",
      courseName: "Anatomia",
      masteryPercent: 72,
      lessonsCompleted: 18,
      lessonsTotal: 28,
      flashcardsMastered: 89,
      flashcardsTotal: 134,
      quizAverageScore: 78,
      lastAccessedAt: "2026-02-14T16:00:00Z",
      topicProgress: [
        { topicId: "shoulder", topicTitle: "Ombro e Axila", sectionId: "upper-limb", sectionTitle: "Membro Superior", masteryPercent: 88, flashcardsDue: 2, lastReviewedAt: "2026-02-14T10:00:00Z", nextReviewAt: "2026-02-17T10:00:00Z", reviewCount: 14 },
        { topicId: "arm", topicTitle: "Braco", sectionId: "upper-limb", sectionTitle: "Membro Superior", masteryPercent: 75, flashcardsDue: 3, lastReviewedAt: "2026-02-13T14:00:00Z", nextReviewAt: "2026-02-15T14:00:00Z", reviewCount: 10 },
        { topicId: "forearm", topicTitle: "Antebraco", sectionId: "upper-limb", sectionTitle: "Membro Superior", masteryPercent: 62, flashcardsDue: 5, lastReviewedAt: "2026-02-12T09:00:00Z", nextReviewAt: "2026-02-14T09:00:00Z", reviewCount: 7 },
        { topicId: "elbow", topicTitle: "Cotovelo", sectionId: "upper-limb", sectionTitle: "Membro Superior", masteryPercent: 80, flashcardsDue: 1, lastReviewedAt: "2026-02-14T11:00:00Z", nextReviewAt: "2026-02-18T11:00:00Z", reviewCount: 9 },
        { topicId: "hand", topicTitle: "Mao", sectionId: "upper-limb", sectionTitle: "Membro Superior", masteryPercent: 55, flashcardsDue: 6, lastReviewedAt: "2026-02-11T16:00:00Z", nextReviewAt: "2026-02-14T16:00:00Z", reviewCount: 5 },
        { topicId: "thigh", topicTitle: "Coxa", sectionId: "lower-limb", sectionTitle: "Membro Inferior", masteryPercent: 70, flashcardsDue: 4, lastReviewedAt: "2026-02-13T10:00:00Z", nextReviewAt: "2026-02-16T10:00:00Z", reviewCount: 8 },
        { topicId: "leg", topicTitle: "Perna", sectionId: "lower-limb", sectionTitle: "Membro Inferior", masteryPercent: 68, flashcardsDue: 3, lastReviewedAt: "2026-02-12T15:00:00Z", nextReviewAt: "2026-02-15T15:00:00Z", reviewCount: 6 },
        { topicId: "foot", topicTitle: "Pe", sectionId: "lower-limb", sectionTitle: "Membro Inferior", masteryPercent: 45, flashcardsDue: 5, lastReviewedAt: "2026-02-10T09:00:00Z", nextReviewAt: "2026-02-13T09:00:00Z", reviewCount: 3 },
        { topicId: "heart", topicTitle: "Coracao", sectionId: "thorax", sectionTitle: "Torax", masteryPercent: 82, flashcardsDue: 2, lastReviewedAt: "2026-02-14T14:00:00Z", nextReviewAt: "2026-02-18T14:00:00Z", reviewCount: 11 },
        { topicId: "lungs", topicTitle: "Pulmoes", sectionId: "thorax", sectionTitle: "Torax", masteryPercent: 78, flashcardsDue: 3, lastReviewedAt: "2026-02-13T16:00:00Z", nextReviewAt: "2026-02-16T16:00:00Z", reviewCount: 9 },
      ],
    },
    {
      courseId: "histology",
      courseName: "Histologia",
      masteryPercent: 58,
      lessonsCompleted: 6,
      lessonsTotal: 12,
      flashcardsMastered: 34,
      flashcardsTotal: 62,
      quizAverageScore: 71,
      lastAccessedAt: "2026-02-13T14:00:00Z",
      topicProgress: [
        { topicId: "simple", topicTitle: "Epitelio Simples", sectionId: "epithelial", sectionTitle: "Tecido Epitelial", masteryPercent: 72, flashcardsDue: 2, lastReviewedAt: "2026-02-13T11:00:00Z", nextReviewAt: "2026-02-16T11:00:00Z", reviewCount: 8 },
        { topicId: "stratified", topicTitle: "Epitelio Estratificado", sectionId: "epithelial", sectionTitle: "Tecido Epitelial", masteryPercent: 65, flashcardsDue: 3, lastReviewedAt: "2026-02-12T10:00:00Z", nextReviewAt: "2026-02-15T10:00:00Z", reviewCount: 6 },
        { topicId: "proper", topicTitle: "Conjuntivo Propriamente Dito", sectionId: "connective", sectionTitle: "Tecido Conjuntivo", masteryPercent: 50, flashcardsDue: 5, lastReviewedAt: "2026-02-11T14:00:00Z", nextReviewAt: "2026-02-14T14:00:00Z", reviewCount: 4 },
        { topicId: "adipose", topicTitle: "Tecido Adiposo", sectionId: "connective", sectionTitle: "Tecido Conjuntivo", masteryPercent: 42, flashcardsDue: 4, lastReviewedAt: "2026-02-10T15:00:00Z", nextReviewAt: "2026-02-13T15:00:00Z", reviewCount: 3 },
      ],
    },
  ]);

  // ── 4. Daily Activity (single array at one key) ─────────
  const activityData: any[] = [];
  const today = new Date("2026-02-14");

  for (let i = 0; i < 60; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const isWeekday = d.getDay() >= 1 && d.getDay() <= 5;
    const baseMinutes = isWeekday ? 75 : 40;
    const variance = Math.floor(Math.random() * 60) - 20;
    const studyMinutes = Math.max(0, baseMinutes + variance);
    const dayOff = Math.random() < 0.1;

    activityData.push({
      date: dateStr,
      studyMinutes: dayOff ? 0 : studyMinutes,
      sessionsCount: dayOff ? 0 : Math.ceil(studyMinutes / 30),
      cardsReviewed: dayOff ? 0 : Math.floor(studyMinutes * 0.4),
      retentionPercent: dayOff ? null : Math.floor(65 + Math.random() * 30),
    });
  }

  keys.push(K.dailyActivity(ID));
  values.push(activityData);

  // ── 5. Study Sessions (individual keys with student_id) ──
  const sessions = [
    { id: "session_001", courseId: "anatomy", topicId: "shoulder", type: "flashcards", startedAt: "2026-02-14T10:00:00Z", endedAt: "2026-02-14T10:45:00Z", durationMinutes: 45, cardsReviewed: 25 },
    { id: "session_002", courseId: "anatomy", topicId: "heart", type: "quiz", startedAt: "2026-02-14T14:00:00Z", endedAt: "2026-02-14T14:30:00Z", durationMinutes: 30, quizScore: 85 },
    { id: "session_003", courseId: "histology", topicId: "simple", type: "reading", startedAt: "2026-02-13T11:00:00Z", endedAt: "2026-02-13T12:00:00Z", durationMinutes: 60 },
    { id: "session_004", courseId: "anatomy", topicId: "arm", type: "flashcards", startedAt: "2026-02-13T14:00:00Z", endedAt: "2026-02-13T14:40:00Z", durationMinutes: 40, cardsReviewed: 18 },
    { id: "session_005", courseId: "anatomy", topicId: "forearm", type: "mixed", startedAt: "2026-02-12T09:00:00Z", endedAt: "2026-02-12T10:15:00Z", durationMinutes: 75, cardsReviewed: 12, quizScore: 72 },
    { id: "session_006", courseId: "histology", topicId: "proper", type: "reading", startedAt: "2026-02-11T14:00:00Z", endedAt: "2026-02-11T15:10:00Z", durationMinutes: 70 },
    { id: "session_007", courseId: "anatomy", topicId: "lungs", type: "flashcards", startedAt: "2026-02-13T16:00:00Z", endedAt: "2026-02-13T16:35:00Z", durationMinutes: 35, cardsReviewed: 20 },
    { id: "session_008", courseId: "anatomy", topicId: "thigh", type: "quiz", startedAt: "2026-02-13T10:00:00Z", endedAt: "2026-02-13T10:25:00Z", durationMinutes: 25, quizScore: 90 },
  ];

  for (const s of sessions) {
    keys.push(K.session(s.id));
    values.push({ ...s, student_id: ID, studentId: ID });
  }

  // ── 6. Flashcard Reviews (individual keys with student_id) ──
  const reviewData = [
    // Shoulder
    { cardId: 1, topicId: "shoulder", courseId: "anatomy", ease: 2.6, interval: 7, repetitions: 5, rating: 4, responseTimeMs: 3200, reviewedAt: "2026-02-14T10:00:00Z" },
    { cardId: 2, topicId: "shoulder", courseId: "anatomy", ease: 2.3, interval: 4, repetitions: 3, rating: 3, responseTimeMs: 5100, reviewedAt: "2026-02-14T10:05:00Z" },
    { cardId: 3, topicId: "shoulder", courseId: "anatomy", ease: 2.1, interval: 2, repetitions: 2, rating: 2, responseTimeMs: 7800, reviewedAt: "2026-02-14T10:10:00Z" },
    { cardId: 4, topicId: "shoulder", courseId: "anatomy", ease: 2.8, interval: 14, repetitions: 6, rating: 5, responseTimeMs: 2100, reviewedAt: "2026-02-14T10:15:00Z" },
    { cardId: 5, topicId: "shoulder", courseId: "anatomy", ease: 2.4, interval: 3, repetitions: 3, rating: 3, responseTimeMs: 4500, reviewedAt: "2026-02-14T10:20:00Z" },
    // Arm
    { cardId: 6, topicId: "arm", courseId: "anatomy", ease: 2.7, interval: 10, repetitions: 5, rating: 5, responseTimeMs: 2800, reviewedAt: "2026-02-13T14:00:00Z" },
    { cardId: 7, topicId: "arm", courseId: "anatomy", ease: 2.0, interval: 1, repetitions: 1, rating: 2, responseTimeMs: 8200, reviewedAt: "2026-02-13T14:05:00Z" },
    { cardId: 8, topicId: "arm", courseId: "anatomy", ease: 2.4, interval: 4, repetitions: 3, rating: 3, responseTimeMs: 4100, reviewedAt: "2026-02-13T14:10:00Z" },
    { cardId: 9, topicId: "arm", courseId: "anatomy", ease: 2.5, interval: 6, repetitions: 4, rating: 4, responseTimeMs: 3600, reviewedAt: "2026-02-13T14:15:00Z" },
    // Heart
    { cardId: 10, topicId: "heart", courseId: "anatomy", ease: 2.7, interval: 12, repetitions: 6, rating: 5, responseTimeMs: 2000, reviewedAt: "2026-02-14T14:00:00Z" },
    { cardId: 11, topicId: "heart", courseId: "anatomy", ease: 2.5, interval: 8, repetitions: 4, rating: 4, responseTimeMs: 3400, reviewedAt: "2026-02-14T14:05:00Z" },
    { cardId: 12, topicId: "heart", courseId: "anatomy", ease: 2.3, interval: 3, repetitions: 3, rating: 3, responseTimeMs: 5200, reviewedAt: "2026-02-14T14:10:00Z" },
    { cardId: 13, topicId: "heart", courseId: "anatomy", ease: 2.5, interval: 6, repetitions: 4, rating: 4, responseTimeMs: 3100, reviewedAt: "2026-02-14T14:15:00Z" },
  ];

  for (const r of reviewData) {
    const reviewId = `rev-${ID}-${r.courseId}-${r.topicId}-${r.cardId}`;
    keys.push(K.flashcardReview(reviewId));
    values.push({ ...r, id: reviewId, student_id: ID, studentId: ID });
  }

  // ── 7. Learning Profile ─────────────────────────────────
  keys.push(K.learningProfile(ID));
  values.push({
    student_id: ID,
    total_study_minutes: 4830,
    total_sessions: 147,
    total_cards_reviewed: 1243,
    total_quizzes_completed: 38,
    current_streak: 12,
    longest_streak: 23,
    average_daily_minutes: 68,
    last_study_date: "2026-02-14T18:30:00Z",
    weekly_activity: [85, 92, 45, 110, 78, 60, 30],
    strengths: ["Ombro e Axila", "Coracao", "Cotovelo"],
    weaknesses: ["Pe", "Tecido Adiposo", "Conjuntivo Propriamente Dito"],
  });

  // ── 8. Content (lesson texts) ───────────────────────────
  keys.push(`${APP}:content:anatomy:lesson-shoulder-intro`);
  values.push({
    title: "Introducao ao Ombro e Axila",
    courseId: "anatomy", topicId: "shoulder", type: "lesson",
    content: "A articulacao do ombro (glenoumeral) e a articulacao sinovial mais movel do corpo humano.",
    sections: [
      { subtitle: "Osteologia", text: "Os ossos envolvidos incluem a escapula, clavicula e umero." },
      { subtitle: "Manguito Rotador", text: "O manguito rotador e composto por quatro musculos: Supraespinal, Infraespinal, Redondo menor e Subescapular." },
      { subtitle: "Axila", text: "A axila e um espaco piramidal que contem a arteria e veia axilares, o plexo braquial e linfonodos axilares." },
    ],
    createdAt: "2025-08-15T10:00:00Z",
    updatedAt: "2026-01-20T14:30:00Z",
  });

  keys.push(`${APP}:content:anatomy:lesson-heart-intro`);
  values.push({
    title: "Anatomia do Coracao",
    courseId: "anatomy", topicId: "heart", type: "lesson",
    content: "O coracao e um orgao muscular oco localizado no mediastino medio.",
    sections: [
      { subtitle: "Camaras Cardiacas", text: "O coracao possui 4 camaras: 2 atrios e 2 ventriculos." },
      { subtitle: "Valvas Cardiacas", text: "As valvas atrioventriculares e semilunares garantem o fluxo unidirecional." },
      { subtitle: "Irrigacao Coronariana", text: "O miocardio e irrigado pelas arterias coronarias direita e esquerda." },
    ],
    createdAt: "2025-09-01T08:00:00Z",
    updatedAt: "2026-02-01T11:00:00Z",
  });

  keys.push(`${APP}:content:histology:lesson-epithelial-intro`);
  values.push({
    title: "Tecido Epitelial - Visao Geral",
    courseId: "histology", topicId: "simple", type: "lesson",
    content: "O tecido epitelial reveste superficies externas e internas do corpo.",
    sections: [
      { subtitle: "Classificacao", text: "Os epitelios sao classificados pelo numero de camadas e pela forma das celulas superficiais." },
      { subtitle: "Especializacoes", text: "As celulas epiteliais podem apresentar especializacoes apicais como microvilosidades, cilios e estereocilios." },
    ],
    createdAt: "2025-08-20T09:00:00Z",
    updatedAt: "2026-01-15T16:00:00Z",
  });

  // ── Write all at once ───────────────────────────────────
  await kv.mset(keys, values);
  console.log(`[seed] Done: ${keys.length} keys written with ${APP}: prefix for student ${ID}`);
}