// ============================================================
// ============================================================
//
//   AXON — SPEC: AREA DEL PROFESOR — EDITOR DE RESUMOS
//
//   Este archivo NO se renderiza en el frontend.
//   Es el documento de contexto/spec para mantener decisiones
//   de diseno entre sesiones de implementacion.
//
//   Ultima actualizacion: 2026-02-21
//
// ============================================================
// ============================================================
//
//
// ══════════════════════════════════════════════════════════════
// 1. DECISIONES CONFIRMADAS CON EL USUARIO
// ══════════════════════════════════════════════════════════════
//
//   NAVEGACION DEL PROFESOR:
//   ┌──────────────────────────────────────────────────────────┐
//   │ Curso (ej: Medicina)                                     │
//   │  └─ Semestre (ej: 1o Semestre)                          │
//   │      └─ Secao (ej: Anatomia do Membro Superior)         │
//   │          └─ Topico (ej: Ombro e Axila)                  │
//   │              └─ Resumo(s) — puede haber MAS DE UNO      │
//   │                  └─ ABRE EL EDITOR CANVAS               │
//   └──────────────────────────────────────────────────────────┘
//   La jerarquia ya existe en Supabase (Course → Semester →
//   Section → Topic → Summary). El profesor navega por ese
//   arbol y al llegar al topico crea/edita resumos.
//
//   EDITOR (CANVAS):
//   - Documento FLUIDO con PAGINAS (estilo Word Page Layout)
//   - El profesor ve el resumo tal cual lo vera el estudiante
//   - Puede escribir texto libre con formatos (negrita, etc.)
//   - Puede ARRASTRAR imagenes al documento (drag & drop)
//   - Puede MARCAR KEYWORDS en el texto (seleccionar → marcar)
//   - Tiene TOOLBAR del editor arriba
//   - Tiene opcion de insertar "quiz points" cada ~2 parrafos
//   - Status: draft → published (flujo de publicacion)
//   - UN TOPICO puede tener MULTIPLES RESUMOS
//
//   TECNOLOGIA:
//   - ContentEditable nativo (WYSIWYG sin dependencias externas)
//     (TipTap no se resolvio en el entorno Figma Make, por lo que
//     usamos contentEditable + document.execCommand para formateo)
//   - Se guarda como content_markdown (HTML) en el backend
//   - Imagenes se arrastran al canvas (drag & drop desde escritorio)
//   - Keywords son marcas en el texto vinculadas a la tabla keywords
//
//   IDIOMA DE LA UI: PT-BR (consistente con area del estudiante)
//   ACCENT COLOR: purple (para area del profesor)
//
//
// ══════════════════════════════════════════════════════════════
// 2. ARQUITECTURA DE ARCHIVOS
// ══════════════════════════════════════════════════════════════
//
//   components/roles/pages/professor/
//   ├─ ProfessorCurriculumPage.tsx     ← pagina principal (tree + editor)
//   ├─ curriculum/
//   │  ├─ CurriculumTree.tsx           ← arbol colapsable con CRUD
//   │  ├─ SummaryCanvasEditor.tsx      ← editor TipTap canvas con paginas
//   │  └─ EditorToolbar.tsx            ← barra de herramientas del editor
//   └─ (otros archivos de sesiones futuras)
//
//   NOTA: Todos los archivos del profesor son PARALLEL-SAFE.
//   No tocan la tripleta del estudiante ni ningun otro modulo.
//
//
// ══════════════════════════════════════════════════════════════
// 3. API ENDPOINTS USADOS (ya existen en platformApi.ts)
// ══════════════════════════════════════════════════════════════
//
//   TREE NAVIGATION (read):
//   - getCourses(institutionId)        → Course[]
//   - getSemesters(courseId)            → Semester[]
//   - getSections(semesterId)          → Section[]
//   - getTopics(sectionId)             → Topic[]
//   - getTopicSummaries(topicId)       → Summary[]
//
//   TREE CRUD:
//   - createCourse / updateCourse / deleteCourse
//   - createSemester / updateSemester / deleteSemester
//   - createSection / updateSection / deleteSection
//   - createTopic / updateTopic / deleteTopic
//
//   SUMMARY CRUD:
//   - createSummary(topicId, { content_markdown, title, status })
//   - updateSummary(summaryId, { content_markdown, title, status })
//   - deleteSummary(summaryId)
//
//   KEYWORDS:
//   - getKeywords(institutionId)
//   - createKeyword({ institution_id, term, definition, priority })
//   - updateKeyword / deleteKeyword
//
//   FLASHCARDS (futuro):
//   - getFlashcardsBySummary(summaryId)
//   - createFlashcard / updateFlashcard / deleteFlashcard
//
//
// ══════════════════════════════════════════════════════════════
// 4. TIPOS RELEVANTES (de types/platform.ts)
// ══════════════════════════════════════════════════════════════
//
//   Summary {
//     id: UUID
//     topic_id: UUID
//     institution_id?: UUID
//     course_id?: UUID
//     title?: string | null
//     content_markdown: string     ← el contenido principal
//     status: 'draft' | 'published' | 'rejected'
//     created_by?: string
//     version?: number
//     created_at: ISODate
//     updated_at: ISODate
//   }
//
//   Keyword {
//     id: UUID
//     institution_id: UUID
//     term: string
//     definition: string | null
//     priority: number
//     status?: string
//     source?: string
//   }
//
//
// ══════════════════════════════════════════════════════════════
// 5. SESIONES DE IMPLEMENTACION
// ══════════════════════════════════════════════════════════════
//
//   SESION 1 (actual):
//   - ProfessorCurriculumPage con arbol de navegacion
//   - Editor canvas basico con contentEditable (texto, imagenes, paginas)
//   - Toolbar con formatos basicos (headings, bold, italic, underline,
//     strikethrough, highlight, lists, blockquote, hr, images)
//   - CRUD en el arbol (crear/renombrar/eliminar nodos)
//   - Guardar/cargar resumos del backend
//   - Auto-save (5s debounce despues de cada cambio)
//   - Word count / char count en status bar
//   - Zoom y fullscreen en el editor
//   - Drag & drop de imagenes al canvas
//   - Marcar keywords en el texto (seleccionar texto → toast → marcar)
//   - Toast notifications (sonner) en RoleShell
//   - Confirmacion al navegar con cambios no guardados
//   - Ctrl+S para guardar
//   - Split panel (tree | welcome) con PanelGroup
//
//   SESION 2 (proxima):
//   - Marcar keywords dentro del texto
//   - Panel lateral de keywords del resumo
//   - Asociar keywords a la tabla de keywords del backend
//   - Preview mode (como lo vera el estudiante)
//
//   SESION 3 (siguiente):
//   - Flashcards asociados al resumo
//   - Quiz insertion points (cada ~2 parrafos)
//   - Generacion IA de keywords (placeholder para integracion)
//
//   SESION 4 (final):
//   - Flujo de publicacion (draft → published)
//   - Preview completo (replica exacta del student view)
//   - Historial de versiones
//   - Polish y ajustes finales
//
//
// ══════════════════════════════════════════════════════════════
// 6. RELACION CON EL AREA DEL ESTUDIANTE
// ══════════════════════════════════════════════════════════════
//
//   El estudiante ve el resumo en SummarySessionNew.tsx usando:
//   - studyContent.ts (hoy hardcoded, futuro: del backend)
//   - keywords.ts (hoy hardcoded, futuro: del backend)
//   - sectionImages.ts (hoy hardcoded, futuro: del backend)
//
//   Cuando el profesor publique un resumo:
//   1. content_markdown se guarda en Summary (backend)
//   2. Keywords se crean/vinculan en la tabla keywords
//   3. El student view lee del backend en vez de data estatica
//
//   Esta migracion (static → backend) es una tarea separada.
//   Por ahora el editor del profesor funciona contra la API real
//   y el student view sigue usando data estatica.
//
//
// ══════════════════════════════════════════════════════════════
// FIN DEL SPEC
// ══════════════════════════════════════════════════════════════

export {};