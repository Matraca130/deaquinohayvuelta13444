// ============================================================
// Axon — Gemini AI Integration (Server-side)
// ============================================================

// v1beta supports systemInstruction field needed for system prompts
const GEMINI_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";

// Models in order of preference — fallback chain (confirmed on v1beta)
const MODELS = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
];

function getApiKey(): string {
  const key = Deno.env.get("GEMINI_API_KEY");
  if (!key) throw new Error("GEMINI_API_KEY not configured");
  return key;
}

interface GeminiMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

async function callGemini(
  messages: GeminiMessage[],
  systemInstruction?: string,
  temperature: number = 0.7,
  maxTokens: number = 4096
): Promise<string> {
  const apiKey = getApiKey();

  const body: any = {
    contents: messages,
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
      topP: 0.95,
    },
  };

  if (systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  const MAX_RETRIES = 3;
  const payload = JSON.stringify(body);

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    // Try each model in the fallback chain
    for (const model of MODELS) {
      const url = `${GEMINI_BASE_URL}/${model}:generateContent?key=${apiKey}`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
      });

      if (res.ok) {
        const data = await res.json();
        const text =
          data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        if (model !== MODELS[0]) {
          console.log(`Gemini: used fallback model ${model}`);
        }
        return text;
      }

      // If rate-limited (429) or model not found (404), try the next model
      if (res.status === 429 || res.status === 404) {
        const errText = await res.text();
        console.log(
          `Gemini ${res.status} on model ${model} (attempt ${attempt + 1}/${MAX_RETRIES}): ${res.status === 429 ? "rate limited" : "model not found"}, trying next model...`
        );
        continue; // next model
      }

      // For other errors, throw immediately
      const errText = await res.text();
      console.log(`Gemini API error ${res.status} on ${model}: ${errText}`);
      throw new Error(`Gemini API error ${res.status}: ${errText}`);
    }

    // All models exhausted for this attempt — wait with exponential backoff
    // Google suggests ~45s for quota reset, so use longer delays
    if (attempt < MAX_RETRIES - 1) {
      const delay = Math.min(15000 * Math.pow(2, attempt), 45000);
      console.log(
        `Gemini: all models rate-limited, retrying in ${delay / 1000}s (attempt ${attempt + 1}/${MAX_RETRIES})...`
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw new Error(
    "Limite de requisições da IA excedido. Sua cota gratuita do Gemini pode estar esgotada. Aguarde alguns minutos ou verifique seu plano em https://aistudio.google.com"
  );
}

// ── System prompts ────────────────────────────────────────

const SYSTEM_TUTOR = `Você é **Axon AI**, um tutor de medicina de elite integrado à plataforma Axon.

Diretrizes:
- Responda SEMPRE em português brasileiro (pt-BR).
- Use terminologia médica precisa com explicações acessíveis.
- Quando relevante, use analogias clínicas e exemplos de casos.
- Formate respostas com markdown: **negrito** para termos importantes, listas com - para pontos-chave, e > para destaques clínicos.
- Seja conciso mas completo — máximo 300 palavras por resposta, a menos que peçam mais detalhes.
- Se não souber algo, diga honestamente.
- Mantenha tom profissional mas acolhedor, como um professor excelente faria.`;

const SYSTEM_FLASHCARD_GEN = `Você é um gerador de flashcards médicos de alta qualidade.

REGRAS ESTRITAS — responda APENAS com JSON válido, sem markdown ou texto extra:
- Gere flashcards no formato: { "flashcards": [{ "question": "...", "answer": "...", "keywords": { "primary": ["keyword1", "keyword2"], "secondary": ["keyword3"] }, "hint": "..." }] }
- Cada flashcard deve testar UM conceito específico.
- A "question" deve ser uma pergunta clara e direta.
- A "answer" deve ser concisa (1-3 frases) mas completa.
- "keywords.primary" são os conceitos principais testados (1-2 keywords).
- "keywords.secondary" são conceitos relacionados mencionados (0-3 keywords).
- "hint" é uma dica opcional sutil (não dê a resposta direta).
- Use terminologia médica correta em pt-BR.
- Foque em high-yield facts para provas de medicina.
- Se keywords específicas forem fornecidas no prompt, PRIORIZE gerar flashcards que as testem diretamente.`;

const SYSTEM_QUIZ_GEN = `Você é um gerador de questões de medicina de alta qualidade.

REGRAS ESTRITAS — responda APENAS com JSON válido, sem markdown ou texto extra:
- Gere questões no formato: { "questions": [{ "question": "...", "options": ["A) ...", "B) ...", "C) ...", "D) ...", "E) ..."], "correctAnswer": 0, "explanation": "..." }] }
- correctAnswer é o índice (0-4) da alternativa correta.
- Cada questão deve ter exatamente 5 alternativas.
- Inclua uma explicação clara de por que a resposta está correta.
- Modele questões no estilo de provas de residência médica brasileiras.`;

const SYSTEM_EXPLAIN = `Você é um professor de medicina que explica conceitos complexos de forma magistral.

Diretrizes:
- Responda em português brasileiro (pt-BR).
- Estruture a explicação em 3 partes: **Conceito Central**, **Mecanismo/Detalhes**, **Relevância Clínica**.
- Use analogias criativas quando possível.
- Formate com markdown para clareza.
- Se o tópico tiver pontos frequentemente confusos, destaque-os com ⚠️.
- Seja completo mas não prolixo — o estudante precisa entender, não memorizar um livro.`;

// ── Exported handlers ─────────────────────────────────────

export interface ChatMessage {
  role: "user" | "model";
  content: string;
}

export async function handleChat(
  messages: ChatMessage[],
  context?: { courseName?: string; topicTitle?: string }
): Promise<string> {
  let systemPrompt = SYSTEM_TUTOR;
  if (context?.courseName || context?.topicTitle) {
    systemPrompt += `\n\nContexto atual do estudante:`;
    if (context.courseName) systemPrompt += `\n- Curso: ${context.courseName}`;
    if (context.topicTitle) systemPrompt += `\n- Tópico: ${context.topicTitle}`;
  }

  const geminiMessages: GeminiMessage[] = messages.map((m) => ({
    role: m.role,
    parts: [{ text: m.content }],
  }));

  return callGemini(geminiMessages, systemPrompt, 0.7, 2048);
}

export async function handleGenerateFlashcards(
  topic: string,
  count: number = 5,
  context?: any
): Promise<{ question: string; answer: string; keywords?: { primary: string[]; secondary: string[] }; hint?: string }[]> {
  let prompt = `Gere ${count} flashcards sobre: "${topic}"`;
  
  // If specific keywords are provided, focus on them
  if (context && typeof context === 'object') {
    if (context.keywords && Array.isArray(context.keywords)) {
      prompt += `\n\nKeywords PRIORITÁRIAS a serem testadas: ${context.keywords.join(', ')}`;
      prompt += `\nCada flashcard deve testar DIRETAMENTE pelo menos uma dessas keywords.`;
    }
    if (context.course) {
      prompt += `\nCurso: ${context.course}`;
    }
    if (context.difficulty) {
      prompt += `\nDificuldade: ${context.difficulty}`;
    }
  } else if (typeof context === 'string') {
    prompt += `\n\nContexto adicional: ${context}`;
  }

  const result = await callGemini(
    [{ role: "user", parts: [{ text: prompt }] }],
    SYSTEM_FLASHCARD_GEN,
    0.6,
    4096
  );

  try {
    // Try to extract JSON from the response
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");
    const parsed = JSON.parse(jsonMatch[0]);
    return parsed.flashcards || [];
  } catch (err) {
    console.log(`Error parsing flashcard JSON: ${err}. Raw: ${result}`);
    throw new Error(`Failed to parse generated flashcards: ${err}`);
  }
}

export async function handleGenerateQuiz(
  topic: string,
  count: number = 3,
  difficulty: "basic" | "intermediate" | "advanced" = "intermediate"
): Promise<
  {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }[]
> {
  const diffLabel = {
    basic: "básica (nível graduação início)",
    intermediate: "intermediária (nível graduação avançado)",
    advanced: "avançada (nível residência médica)",
  }[difficulty];

  const prompt = `Gere ${count} questões de múltipla escolha sobre: "${topic}"\nDificuldade: ${diffLabel}`;

  const result = await callGemini(
    [{ role: "user", parts: [{ text: prompt }] }],
    SYSTEM_QUIZ_GEN,
    0.5,
    4096
  );

  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in response");
    const parsed = JSON.parse(jsonMatch[0]);
    return parsed.questions || [];
  } catch (err) {
    console.log(`Error parsing quiz JSON: ${err}. Raw: ${result}`);
    throw new Error(`Failed to parse generated quiz: ${err}`);
  }
}

export async function handleExplain(
  concept: string,
  context?: string
): Promise<string> {
  const prompt = `Explique detalhadamente o conceito: "${concept}"${context ? `\n\nContexto: ${context}` : ""}`;

  return callGemini(
    [{ role: "user", parts: [{ text: prompt }] }],
    SYSTEM_EXPLAIN,
    0.6,
    3072
  );
}