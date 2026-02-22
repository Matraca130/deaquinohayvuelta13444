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
//   Curso > Semestre > Secao > Topico > Resumo(s) > EDITOR CANVAS
//
//   EDITOR (CANVAS):
//   - Documento FLUIDO con PAGINAS (estilo Word Page Layout)
//   - ContentEditable nativo (WYSIWYG sin dependencias externas)
//   - Se guarda como content_markdown (HTML) en el backend
//   - Keywords son marcas en el texto vinculadas a la tabla keywords
//   - Status: draft > published (flujo de publicacion)
//   - UN TOPICO puede tener MULTIPLES RESUMOS
//
//   IDIOMA DE LA UI: PT-BR
//   ACCENT COLOR: purple (para area del profesor)
//
//
// ══════════════════════════════════════════════════════════════
// 2. ARQUITECTURA DE ARCHIVOS
// ══════════════════════════════════════════════════════════════
//
//   components/roles/pages/professor/
//   +- ProfessorCurriculumPage.tsx
//   +- curriculum/
//   |  +- CurriculumTree.tsx
//   |  +- SummaryCanvasEditor.tsx
//   |  +- EditorToolbar.tsx
//
//   NOTA: Todos los archivos del profesor son PARALLEL-SAFE.
//   No tocan la tripleta del estudiante ni ningun otro modulo.
//
//
// ══════════════════════════════════════════════════════════════
// 3. API ENDPOINTS USADOS (ya existen en platformApi.ts)
// ══════════════════════════════════════════════════════════════
//
//   TREE: getCourses, getSemesters, getSections, getTopics, getTopicSummaries
//   CRUD: create/update/delete for each entity
//   SUMMARY: createSummary, updateSummary, deleteSummary
//   KEYWORDS: getKeywords, createKeyword, updateKeyword, deleteKeyword
//
//
// ══════════════════════════════════════════════════════════════
// FIN DEL SPEC
// ══════════════════════════════════════════════════════════════

export {};
