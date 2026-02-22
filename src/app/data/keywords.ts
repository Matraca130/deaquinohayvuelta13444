// Base de dados de palavras-chave médicas com sistema de cores de domínio

export type MasteryLevel = 'red' | 'yellow' | 'green';

export interface AIQuestion {
  question: string;
  answer?: string;
}

export interface KeywordData {
  id: string;
  term: string;
  definition: string;
  masteryLevel: MasteryLevel; // default mastery
  aiQuestions: AIQuestion[];
  has3DModel: boolean;
  source: string;
}

export const masteryConfig: Record<MasteryLevel, {
  label: string;
  bgLight: string;
  bgDot: string;
  textColor: string;
  borderColor: string;
  underlineClass: string;
  headerBg: string;
}> = {
  red: {
    label: 'Nao domino',
    bgLight: 'bg-red-50',
    bgDot: 'bg-red-500',
    textColor: 'text-red-600',
    borderColor: 'border-red-200',
    underlineClass: 'decoration-red-400/60',
    headerBg: 'bg-gradient-to-r from-red-50 to-red-100/50',
  },
  yellow: {
    label: 'Parcialmente',
    bgLight: 'bg-amber-50',
    bgDot: 'bg-amber-400',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-200',
    underlineClass: 'decoration-amber-400/60',
    headerBg: 'bg-gradient-to-r from-amber-50 to-amber-100/50',
  },
  green: {
    label: 'Domino',
    bgLight: 'bg-emerald-50',
    bgDot: 'bg-emerald-500',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-200',
    underlineClass: 'decoration-emerald-400/60',
    headerBg: 'bg-gradient-to-r from-emerald-50 to-emerald-100/50',
  },
};

export const keywordsDatabase: KeywordData[] = [
  {
    id: 'kw-escapula',
    term: 'escápula',
    definition: 'Osso plano, triangular, localizado na regiao posterolateral do torax, entre a 2a e 7a costelas. Apresenta a cavidade glenoidal (para a articulacao do ombro), o acromio e o processo coracoide como principais marcos anatomicos.',
    masteryLevel: 'green',
    aiQuestions: [
      { question: 'Quais sao as principais faces da escapula?', answer: 'Face costal (anterior, concava) e face posterior (dividida pela espinha em fossas supraespinal e infraespinal).' },
      { question: 'Qual a importancia clinica do processo coracoide?', answer: 'Serve como ponto de insercao para musculos (biceps cabeca curta, coracobraquial) e ligamentos (coracoacromial, coracoclavicular), alem de ser referencia cirurgica.' },
    ],
    has3DModel: true,
    source: 'Moore, Anatomia Orientada para Clinica, 8a ed.',
  },
  {
    id: 'kw-umero',
    term: 'úmero',
    definition: 'Maior osso do membro superior. Sua porcao proximal apresenta a cabeca (hemisferica, articula com a glenoide), o colo anatomico, os tuberculos maior e menor, e o sulco intertubercular por onde passa o tendao do biceps.',
    masteryLevel: 'yellow',
    aiQuestions: [
      { question: 'Qual o angulo de inclinacao da cabeca do umero?', answer: 'Entre 130 e 150 graus com a diafise.' },
      { question: 'O que passa pelo sulco intertubercular?', answer: 'O tendao da cabeca longa do biceps braquial.' },
    ],
    has3DModel: true,
    source: 'Netter, Atlas de Anatomia Humana, 7a ed.',
  },
  {
    id: 'kw-capsula-articular',
    term: 'cápsula articular',
    definition: 'Estrutura fibrosa que envolve completamente a articulação glenoumeral. Notavelmente laxa, o que permite ampla mobilidade mas predispõe à instabilidade. Inserida no labrum glenoidal e no colo anatômico do úmero.',
    masteryLevel: 'red',
    aiQuestions: [
      { question: 'Por que a capsula articular do ombro e tao laxa?', answer: 'Para permitir a grande amplitude de movimento da articulacao glenoumeral, que e a mais movel do corpo humano.' },
      { question: 'Onde se insere a capsula articular do ombro?' },
    ],
    has3DModel: false,
    source: 'Moore, Anatomia Orientada para Clinica, 8a ed.',
  },
  {
    id: 'kw-ligamento',
    term: 'ligamento',
    definition: 'Banda de tecido conjuntivo denso que conecta ossos a ossos, fornecendo estabilidade às articulações. No ombro, os principais são os ligamentos glenoumerais (superior, médio e inferior) e o coracoumeral.',
    masteryLevel: 'yellow',
    aiQuestions: [
      { question: 'Quais sao os ligamentos glenoumerais?', answer: 'Superior, medio e inferior. O ligamento glenoumeral inferior e o principal restritor da luxacao anterior.' },
      { question: 'Qual a diferenca entre ligamento e tendao?', answer: 'Ligamentos conectam osso a osso; tendoes conectam musculo a osso. Ambos sao formados por tecido conjuntivo denso.' },
    ],
    has3DModel: true,
    source: 'Netter, Atlas de Anatomia Humana, 7a ed.',
  },
  {
    id: 'kw-manguito-rotador',
    term: 'manguito rotador',
    definition: 'Conjunto de quatro músculos (supraespinal, infraespinal, redondo menor e subescapular) cujos tendões se fundem à cápsula articular, formando um "manguito" que estabiliza dinamicamente a articulação glenoumeral.',
    masteryLevel: 'red',
    aiQuestions: [
      { question: 'Quais musculos compoem o manguito rotador?', answer: 'Mnemonica SITS: Supraespinal, Infraespinal, Redondo menor (Teres minor) e Subescapular.' },
      { question: 'Qual musculo do manguito e mais frequentemente lesionado?', answer: 'O supraespinal, devido a sua posicao sob o arco coracoacromial e a "zona critica" de hipovascularizacao.' },
      { question: 'Qual a funcao principal do manguito rotador?' },
    ],
    has3DModel: true,
    source: 'Moore, Anatomia Orientada para Clinica, 8a ed.',
  },
  {
    id: 'kw-cartilagem',
    term: 'cartilagem',
    definition: 'Tecido conjuntivo avascular, firme e flexível, que reveste superfícies articulares (cartilagem hialina), absorvendo impactos e reduzindo atrito. Na glenoumeral, a cartilagem hialina cobre a cabeça do úmero e a cavidade glenoidal.',
    masteryLevel: 'green',
    aiQuestions: [
      { question: 'Qual tipo de cartilagem reveste as superficies articulares?', answer: 'Cartilagem hialina.' },
      { question: 'Por que a cartilagem tem baixa capacidade de regeneracao?', answer: 'Por ser avascular — recebe nutricao apenas por difusao do liquido sinovial.' },
    ],
    has3DModel: false,
    source: 'Junqueira, Histologia Basica, 13a ed.',
  },
  {
    id: 'kw-musculo',
    term: 'músculo',
    definition: 'Estrutura contrátil responsável pela produção de movimento, estabilização articular e geração de calor. No ombro, os músculos são divididos em estabilizadores (manguito rotador) e motores primários (deltóide, peitoral maior, latíssimo do dorso).',
    masteryLevel: 'yellow',
    aiQuestions: [
      { question: 'Quais sao os principais musculos motores do ombro?', answer: 'Deltoide (abducao), peitoral maior (aducao/rotacao interna), latissimo do dorso (extensao/aducao).' },
      { question: 'Qual a diferenca entre musculos estabilizadores e motores?' },
    ],
    has3DModel: true,
    source: 'Moore, Anatomia Orientada para Clinica, 8a ed.',
  },
  {
    id: 'kw-osso',
    term: 'osso',
    definition: 'Tecido conjuntivo rígido e mineralizado que forma o esqueleto. Funções: sustentação, proteção de órgãos, reserva de cálcio, produção de células sanguíneas (medula óssea) e ancoragem muscular.',
    masteryLevel: 'green',
    aiQuestions: [
      { question: 'Quais sao as funcoes do tecido osseo?', answer: 'Sustentacao mecanica, protecao de orgaos vitais, reserva mineral (calcio e fosforo), hematopoiese e ancoragem de musculos.' },
      { question: 'Qual a diferenca entre osso cortical e esponjoso?' },
    ],
    has3DModel: true,
    source: 'Junqueira, Histologia Basica, 13a ed.',
  },
  {
    id: 'kw-tendao',
    term: 'tendão',
    definition: 'Estrutura de tecido conjuntivo denso modelado que conecta músculos a ossos, transmitindo a força de contração muscular. No ombro, o tendão da cabeça longa do bíceps é uma referência clínica importante.',
    masteryLevel: 'red',
    aiQuestions: [
      { question: 'Qual a composicao principal dos tendoes?', answer: 'Fibras de colageno tipo I organizadas em feixes paralelos, conferindo alta resistencia a tracao.' },
      { question: 'Por que tendinopatias do ombro sao tao comuns?' },
    ],
    has3DModel: false,
    source: 'Moore, Anatomia Orientada para Clinica, 8a ed.',
  },
  {
    id: 'kw-arteria',
    term: 'artéria',
    definition: 'Vaso sanguíneo que conduz sangue do coração para os tecidos. A região do ombro é irrigada principalmente pela artéria axilar e seus ramos (torácica superior, toracoacromial, subescapular, circunflexas umerais).',
    masteryLevel: 'yellow',
    aiQuestions: [
      { question: 'Quais sao os ramos da arteria axilar?', answer: 'Toracica superior, toracoacromial, toracica lateral, subescapular, circunflexa umeral anterior e posterior.' },
      { question: 'Qual arteria e mais vulneravel em luxacoes do ombro?' },
    ],
    has3DModel: true,
    source: 'Moore, Anatomia Orientada para Clinica, 8a ed.',
  },
  {
    id: 'kw-nervo',
    term: 'nervo',
    definition: 'Estrutura que transmite impulsos elétricos entre o sistema nervoso central e os tecidos periféricos. O plexo braquial (C5-T1) origina os nervos do membro superior, passando pela região axilar.',
    masteryLevel: 'red',
    aiQuestions: [
      { question: 'Qual nervo e mais vulneravel em fraturas do colo cirurgico do umero?', answer: 'O nervo axilar (circunflexo), que contorna o colo cirurgico do umero.' },
      { question: 'O que e o plexo braquial e quais raizes o formam?', answer: 'Rede de nervos formada pelas raizes ventrais de C5-T1. Divide-se em troncos, divisoes, fasciculos e ramos terminais.' },
    ],
    has3DModel: true,
    source: 'Netter, Atlas de Anatomia Humana, 7a ed.',
  },
  {
    id: 'kw-veia',
    term: 'veia',
    definition: 'Vaso sanguíneo que conduz sangue dos tecidos de volta ao coração. No membro superior, o retorno venoso principal é feito pela veia axilar, que acompanha a artéria axilar na fossa axilar.',
    masteryLevel: 'yellow',
    aiQuestions: [
      { question: 'Qual a principal veia da regiao axilar?', answer: 'Veia axilar, formada pela uniao das veias braquiais na margem inferior do redondo maior.' },
      { question: 'Qual a importancia clinica da veia cefalica?' },
    ],
    has3DModel: false,
    source: 'Moore, Anatomia Orientada para Clinica, 8a ed.',
  },
  {
    id: 'kw-tecido',
    term: 'tecido',
    definition: 'Conjunto organizado de células com estrutura e função semelhantes. Os quatro tipos básicos são: epitelial, conjuntivo, muscular e nervoso.',
    masteryLevel: 'green',
    aiQuestions: [
      { question: 'Quais sao os quatro tipos basicos de tecido?', answer: 'Epitelial, conjuntivo, muscular e nervoso.' },
      { question: 'Que tipos de tecido conjuntivo encontramos no ombro?' },
    ],
    has3DModel: false,
    source: 'Junqueira, Histologia Basica, 13a ed.',
  },
  {
    id: 'kw-orgao',
    term: 'órgão',
    definition: 'Estrutura formada por dois ou mais tipos de tecido que trabalham juntos para desempenhar funções específicas. Exemplos no sistema musculoesquelético incluem os músculos (como órgãos) e os ossos.',
    masteryLevel: 'green',
    aiQuestions: [
      { question: 'Qual a diferenca entre orgao e tecido?', answer: 'Tecido e um conjunto de celulas semelhantes; orgao e formado por multiplos tecidos organizados para uma funcao.' },
    ],
    has3DModel: false,
    source: 'Junqueira, Histologia Basica, 13a ed.',
  },
];

// Lookup helpers
export function findKeyword(term: string): KeywordData | undefined {
  const lowerTerm = term.toLowerCase();
  return keywordsDatabase.find(kw => kw.term.toLowerCase() === lowerTerm);
}

export function getAllKeywordTerms(): string[] {
  return keywordsDatabase.map(kw => kw.term);
}