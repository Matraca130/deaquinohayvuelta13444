export type QuizQuestionType = 'multiple-choice' | 'write-in' | 'fill-blank';

export interface QuizQuestion {
  id: number;
  type?: QuizQuestionType; // default 'multiple-choice'
  question: string;
  // multiple-choice
  options?: string[];
  correctAnswer?: number;
  // write-in
  correctText?: string; // accepted answer text
  acceptedVariations?: string[]; // alternative accepted answers
  // fill-blank
  blankSentence?: string; // sentence with ___ as placeholder
  blankAnswer?: string; // the word that fills the blank
  // shared
  hint?: string;
  explanation?: string;
}

export interface Model3D {
  id: string;
  name: string;
  description: string;
  available: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  thumbnailUrl: string;
  completed: boolean;
  hasVideo: boolean;
  hasSummary: boolean;
  sectionIndex?: number;
  alsoAppearsIn?: string[];
}

export interface Topic {
  id: string;
  title: string;
  summary: string;
  videoUrl?: string;
  flashcards?: Flashcard[];
  quizzes?: QuizQuestion[];
  model3D?: Model3D;
  lessons?: Lesson[];
}

export interface Section {
  id: string;
  title: string;
  imageUrl?: string;
  topics: Topic[];
}

export interface Semester {
  id: string;
  title: string;
  sections: Section[];
}

export interface Course {
  id: string;
  name: string;
  color: string;
  accentColor: string;
  semesters: Semester[];
}

export const courses: Course[] = [
  {
    id: 'anatomy',
    name: 'Anatomia',
    color: 'bg-rose-400',
    accentColor: 'text-rose-400',
    semesters: [
      {
        id: 'sem1',
        title: '1º Semestre',
        sections: [
          {
            id: 'upper-limb',
            title: 'Membro Superior',
            imageUrl: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmF0b215JTIwdXBwZXIlMjBsaW1ifGVufDF8fHx8MTY5OTY1NTYyMXww&ixlib=rb-4.1.0&q=80&w=1080',
            topics: [
              { 
                id: 'shoulder', 
                title: 'Ombro e Axila', 
                summary: 'A articulação do ombro é uma das mais móveis do corpo humano, formada pela cabeça do úmero e a cavidade glenoidal da escápula.',
                videoUrl: '#',
                flashcards: [
                  { id: 1, question: 'Quais ossos formam a articulação do ombro?', answer: 'Úmero e escápula (cavidade glenoidal)', mastery: 4, image: 'https://images.unsplash.com/photo-1715111641804-f8af88e93b01?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaG91bGRlciUyMGFuYXRvbXklMjBib25lcyUyMG11c2NsZXN8ZW58MXx8fHwxNzcwNTExOTA1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
                  { id: 2, question: 'Qual é o principal músculo abdutor do ombro?', answer: 'Músculo deltoide (auxiliado pelo supraespinal)', mastery: 3 },
                  { id: 3, question: 'Quais músculos formam o manguito rotador?', answer: 'Supraespinal, Infraespinal, Redondo menor e Subescapular (SITS)', mastery: 2 },
                  { id: 4, question: 'Qual nervo pode ser lesado em fraturas do colo cirúrgico do úmero?', answer: 'Nervo axilar', mastery: 5 },
                  { id: 5, question: 'O que é a axila?', answer: 'Espaço piramidal entre o braço e a parede torácica, com importantes estruturas neurovasculares', mastery: 3 },
                ],
                quizzes: [
                  { 
                    id: 1, 
                    question: 'Qual músculo NÃO faz parte do manguito rotador?', 
                    options: ['Supraespinal', 'Infraespinal', 'Deltoide', 'Subescapular'],
                    correctAnswer: 2,
                    explanation: 'O deltoide é o principal abdutor do ombro, mas não faz parte do manguito rotador. O manguito é formado por SITS: Supraespinal, Infraespinal, Redondo menor e Subescapular.'
                  },
                  { 
                    id: 2, 
                    question: 'A artéria axilar é continuação de qual artéria?', 
                    options: ['Artéria subclávia', 'Artéria braquial', 'Artéria carótida', 'Artéria torácica'],
                    correctAnswer: 0,
                    explanation: 'A artéria subclávia passa a ser chamada de artéria axilar após cruzar a primeira costela.'
                  },
                  {
                    id: 3,
                    type: 'write-in',
                    question: 'Cite os quatro músculos que formam o manguito rotador (use a sigla mnemônica).',
                    correctText: 'SITS',
                    acceptedVariations: ['Supraespinal, Infraespinal, Redondo menor, Subescapular', 'supraespinal infraespinal redondo menor subescapular'],
                    hint: 'A sigla é formada pelas iniciais em inglês: S___, I___, T___, S___.',
                    explanation: 'SITS: Supraespinal (Supraspinatus), Infraespinal (Infraspinatus), Redondo menor (Teres minor) e Subescapular (Subscapularis). Esses quatro músculos estabilizam dinamicamente a articulação glenoumeral.'
                  },
                  {
                    id: 4,
                    type: 'fill-blank',
                    question: 'Complete a frase sobre a inervação do ombro.',
                    blankSentence: 'O nervo ___ pode ser lesado em fraturas do colo cirúrgico do úmero, comprometendo a abdução do braço.',
                    blankAnswer: 'axilar',
                    hint: 'Este nervo inerva o músculo deltoide e o redondo menor.',
                    explanation: 'O nervo axilar (C5-C6) circunda o colo cirúrgico do úmero e é vulnerável a fraturas nessa região. Sua lesão causa paralisia do deltoide.'
                  },
                  {
                    id: 5,
                    type: 'write-in',
                    question: 'Qual é o nome da articulação formada entre a cabeça do úmero e a cavidade glenoidal da escápula?',
                    correctText: 'glenoumeral',
                    acceptedVariations: ['articulação glenoumeral', 'glenohumeral', 'articulação glenohumeral'],
                    hint: 'O nome combina "gleno" (cavidade) + "umeral" (úmero).',
                    explanation: 'A articulação glenoumeral é uma articulação sinovial do tipo esferoide (bola e soquete), sendo a mais móvel do corpo humano.'
                  },
                  {
                    id: 6,
                    type: 'fill-blank',
                    question: 'Complete sobre a axila.',
                    blankSentence: 'A axila é um espaço ___ entre o braço e a parede torácica, contendo artéria axilar, plexo braquial e linfonodos.',
                    blankAnswer: 'piramidal',
                    hint: 'Refere-se a uma forma geométrica tridimensional com base e ápice.',
                    explanation: 'A axila tem formato piramidal com 4 paredes, uma base e um ápice (canal cervicoaxilar).'
                  },
                ],
                model3D: {
                  id: 'shoulder-joint-3d',
                  name: 'Articulação do Ombro',
                  description: 'Modelo 3D interativo mostrando os ossos, músculos e ligamentos da articulação glenoumeral',
                  available: true
                }
              },
              { 
                id: 'arm', 
                title: 'Braço', 
                summary: 'O braço contém o úmero e compartimentos musculares anterior (flexores) e posterior (extensores), além de importantes estruturas neurovasculares.',
                videoUrl: '#',
                flashcards: [
                  { id: 1, question: 'Qual a principal artéria do braço?', answer: 'Artéria braquial', mastery: 5 },
                  { id: 2, question: 'Qual nervo inerva o compartimento anterior do braço?', answer: 'Nervo musculocutâneo', mastery: 2 },
                  { id: 3, question: 'Quais músculos formam o compartimento anterior do braço?', answer: 'Bíceps braquial, braquial e coracobraquial', mastery: 3 },
                  { id: 4, question: 'Qual nervo passa no sulco do nervo radial?', answer: 'Nervo radial', mastery: 4 },
                ],
                quizzes: [
                  { 
                    id: 1, 
                    question: 'Qual músculo é inervado pelo nervo radial?', 
                    options: ['Bíceps braquial', 'Braquial', 'Tríceps braquial', 'Coracobraquial'],
                    correctAnswer: 2,
                    explanation: 'O tríceps braquial é o único extensor do braço e é inervado pelo nervo radial.'
                  },
                ],
                model3D: {
                  id: 'arm-muscles-3d',
                  name: 'Músculos do Braço',
                  description: 'Visualização dos compartimentos anterior e posterior do braço',
                  available: true
                }
              },
              { 
                id: 'forearm', 
                title: 'Antebraço', 
                summary: 'O antebraço é composto pelo rádio e ulna, com músculos organizados em compartimentos anterior (flexores e pronadores) e posterior (extensores e supinadores).',
                videoUrl: '#',
                flashcards: [
                  { id: 1, question: 'Quais ossos formam o antebraço?', answer: 'Rádio (lateral) e Ulna (medial)', mastery: 5 },
                  { id: 2, question: 'Qual nervo inerva a maior parte dos flexores do antebraço?', answer: 'Nervo mediano', mastery: 3 },
                  { id: 3, question: 'Qual músculo faz pronação do antebraço?', answer: 'Pronador redondo e pronador quadrado', mastery: 2 },
                  { id: 4, question: 'Onde passa o nervo ulnar no antebraço?', answer: 'No túnel cubital (sulco do nervo ulnar no cotovelo)', mastery: 4 },
                ],
                quizzes: [
                  { 
                    id: 1, 
                    question: 'Qual estrutura NÃO passa pela fossa cubital?', 
                    options: ['Tendão do bíceps', 'Artéria braquial', 'Nervo mediano', 'Nervo ulnar'],
                    correctAnswer: 3,
                    explanation: 'O nervo ulnar passa posteriormente ao epicôndilo medial, não pela fossa cubital.'
                  },
                ],
                model3D: {
                  id: 'forearm-bones-3d',
                  name: 'Ossos do Antebraço',
                  description: 'Rádio e ulna com suas articulações',
                  available: true
                }
              },
              {
                id: 'elbow',
                title: 'Cotovelo',
                summary: 'A articulação do cotovelo é uma articulação sinovial do tipo gínglimo que conecta o braço ao antebraço, permitindo flexão e extensão.',
                videoUrl: '#',
                flashcards: [
                  { id: 1, question: 'Quais ossos formam a articulação do cotovelo?', answer: 'Úmero, rádio e ulna', mastery: 4 },
                  { id: 2, question: 'Qual tipo de articulação é o cotovelo?', answer: 'Articulação sinovial do tipo gínglimo (dobradiça)', mastery: 3 },
                  { id: 3, question: 'Qual nervo passa posterior ao epicôndilo medial?', answer: 'Nervo ulnar', mastery: 5 },
                ],
                quizzes: [
                  {
                    id: 1,
                    question: 'Qual movimento principal ocorre na articulação do cotovelo?',
                    options: ['Rotação', 'Flexão e extensão', 'Abdução e adução', 'Circundução'],
                    correctAnswer: 1,
                    explanation: 'O cotovelo é uma articulação gínglimo que permite principalmente flexão e extensão do antebraço.'
                  },
                ],
                model3D: {
                  id: 'elbow-joint-3d',
                  name: 'Articulação do Cotovelo',
                  description: 'Modelo 3D da articulação do cotovelo com ligamentos',
                  available: true
                }
              },
              { 
                id: 'hand', 
                title: 'Mão', 
                summary: 'A mão possui ossos do carpo (8), metacarpos (5) e falanges (14), com musculatura intrínseca complexa para movimentos finos.',
                videoUrl: '#',
                flashcards: [
                  { id: 1, question: 'Quantos ossos do carpo existem?', answer: '8 ossos do carpo organizados em duas fileiras', mastery: 4 },
                  { id: 2, question: 'Qual nervo inerva os músculos da eminência tenar?', answer: 'Nervo mediano (exceto adutor do polegar)', mastery: 3 },
                  { id: 3, question: 'Qual é a função dos músculos interósseos?', answer: 'Abdução (dorsais) e adução (palmares) dos dedos', mastery: 2 },
                  { id: 4, question: 'O que é o túnel do carpo?', answer: 'Passagem osteofibrosa por onde passam os tendões flexores e o nervo mediano', mastery: 5 },
                ],
                quizzes: [
                  { 
                    id: 1, 
                    question: 'Qual nervo é afetado na síndrome do túnel do carpo?', 
                    options: ['Nervo radial', 'Nervo mediano', 'Nervo ulnar', 'Nervo musculocutâneo'],
                    correctAnswer: 1,
                    explanation: 'A compressão do nervo mediano no túnel do carpo causa a síndrome do túnel do carpo.'
                  },
                ],
                model3D: {
                  id: 'hand-bones-3d',
                  name: 'Esqueleto da Mão',
                  description: 'Ossos do carpo, metacarpos e falanges',
                  available: true
                }
              },
            ]
          },
          {
            id: 'lower-limb',
            title: 'Membro Inferior',
            imageUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsZWdzJTIwYW5hdG9teXxlbnwxfHx8fDE2OTk2NTU2NTV8MA&ixlib=rb-4.1.0&q=80&w=1080',
            topics: [
              { 
                id: 'thigh', 
                title: 'Coxa', 
                summary: 'A coxa contém o fêmur e grandes grupos musculares organizados em compartimentos anterior, medial e posterior.',
                videoUrl: '#',
                flashcards: [
                  { id: 1, question: 'Qual é o osso da coxa?', answer: 'Fêmur (osso mais longo e forte do corpo)', mastery: 5 },
                  { id: 2, question: 'Quais músculos formam o quadríceps femoral?', answer: 'Reto femoral, vasto lateral, vasto medial e vasto intermédio', mastery: 3 },
                  { id: 3, question: 'Qual nervo inerva o compartimento anterior da coxa?', answer: 'Nervo femoral', mastery: 4 },
                  { id: 4, question: 'Qual é a função dos músculos adutores?', answer: 'Adução da coxa (aproximar a perna da linha média)', mastery: 2 },
                ],
                quizzes: [
                  { 
                    id: 1, 
                    question: 'Qual músculo NÃO faz parte do quadríceps femoral?', 
                    options: ['Reto femoral', 'Vasto lateral', 'Sartório', 'Vasto medial'],
                    correctAnswer: 2,
                    explanation: 'O sartório é um músculo da coxa, mas não faz parte do quadríceps. É o músculo mais longo do corpo.'
                  },
                ],
                model3D: {
                  id: 'thigh-muscles-3d',
                  name: 'Músculos da Coxa',
                  description: 'Compartimentos anterior, medial e posterior',
                  available: true
                }
              },
              { 
                id: 'leg', 
                title: 'Perna', 
                summary: 'A perna é formada pela tíbia e fíbula, com compartimentos anterior, lateral e posterior.',
                videoUrl: '#',
                flashcards: [
                  { id: 1, question: 'Quais ossos formam a perna?', answer: 'Tíbia (medial, suporta peso) e Fíbula (lateral)', mastery: 5 },
                  { id: 2, question: 'Qual músculo forma o tendão calcâneo?', answer: 'Tríceps sural (gastrocnêmio e sóleo)', mastery: 4 },
                  { id: 3, question: 'Qual nervo inerva o compartimento anterior da perna?', answer: 'Nervo fibular profundo', mastery: 2 },
                ],
                quizzes: [
                  { 
                    id: 1, 
                    question: 'Qual é a principal função do compartimento posterior da perna?', 
                    options: ['Dorsiflexão', 'Flexão plantar', 'Eversão', 'Inversão'],
                    correctAnswer: 1,
                    explanation: 'O compartimento posterior da perna contém os flexores plantares, como o gastrocnêmio e o sóleo.'
                  },
                ],
                model3D: {
                  id: 'leg-bones-3d',
                  name: 'Ossos da Perna',
                  description: 'Tíbia e fíbula com articulações',
                  available: true
                }
              },
              { 
                id: 'foot', 
                title: 'Pé', 
                summary: 'O pé suporta o peso e auxilia na locomoção, com arcos longitudinal e transversal importantes para absorção de impacto.',
                videoUrl: '#',
                flashcards: [
                  { id: 1, question: 'Quantos ossos do tarso existem?', answer: '7 ossos do tarso (calcâneo, tálus, navicular, cuboide e 3 cuneiformes)', mastery: 3 },
                  { id: 2, question: 'Qual osso do tarso se articula com a tíbia?', answer: 'Tálus', mastery: 4 },
                  { id: 3, question: 'Qual é o maior osso do pé?', answer: 'Calcâneo', mastery: 5 },
                ],
                quizzes: [
                  { 
                    id: 1, 
                    question: 'Qual nervo é responsável pela sensibilidade da planta do pé?', 
                    options: ['Nervo fibular superficial', 'Nervo tibial', 'Nervo sural', 'Nervo safeno'],
                    correctAnswer: 1,
                    explanation: 'O nervo tibial divide-se em nervos plantares medial e lateral que inervam a planta do pé.'
                  },
                ],
                model3D: {
                  id: 'foot-bones-3d',
                  name: 'Esqueleto do Pé',
                  description: 'Ossos do tarso, metatarsos e falanges',
                  available: true
                }
              },
            ]
          }
        ]
      },
      {
        id: 'sem2',
        title: '2º Semestre',
        sections: [
          {
            id: 'thorax',
            title: 'Tórax',
            imageUrl: 'https://images.unsplash.com/photo-1530210124550-912dc1381cb8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVzdCUyMHkrayUyMGFuYXRvbXl8ZW58MXx8fHwxNjk5NjU1NzA2fDA&ixlib=rb-4.1.0&q=80&w=1080',
            topics: [
              { 
                id: 'heart', 
                title: 'Coração', 
                summary: 'O coração bombeia sangue para todo o corpo através da circulação sistêmica e pulmonar.',
                videoUrl: '#',
                flashcards: [
                  { id: 1, question: 'Quantas câmaras tem o coração?', answer: '4 câmaras: 2 átrios e 2 ventrículos', mastery: 5, image: 'https://images.unsplash.com/photo-1650562373852-04c5682ec2e7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxodW1hbiUyMGhlYXJ0JTIwYW5hdG9teSUyMG1lZGljYWx8ZW58MXx8fHwxNzcwNTAwMDM0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral' },
                  { id: 2, question: 'O que caracteriza a sístole ventricular?', answer: 'Contração dos ventrículos e ejeção de sangue para as grandes artérias', mastery: 4 },
                  { id: 3, question: 'Qual valva separa o átrio esquerdo do ventrículo esquerdo?', answer: 'Valva mitral (bicúspide)', mastery: 3 },
                  { id: 4, question: 'Qual artéria irriga o músculo cardíaco?', answer: 'Artérias coronárias (direita e esquerda)', mastery: 4 },
                ],
                quizzes: [
                  { 
                    id: 1, 
                    question: 'Qual câmara do coração possui a parede mais espessa?', 
                    options: ['Átrio direito', 'Átrio esquerdo', 'Ventrículo direito', 'Ventrículo esquerdo'],
                    correctAnswer: 3,
                    explanation: 'O ventrículo esquerdo possui a parede mais espessa pois precisa gerar pressão suficiente para bombear sangue para todo o corpo.'
                  },
                ],
                model3D: {
                  id: 'heart-3d',
                  name: 'Coração Anatômico',
                  description: 'Câmaras, valvas e grandes vasos',
                  available: true
                }
              },
              { 
                id: 'lungs', 
                title: 'Pulmões', 
                summary: 'Os pulmões são responsáveis pelas trocas gasosas (hematose) através dos alvéolos.',
                videoUrl: '#',
                flashcards: [
                  { id: 1, question: 'Quantos lobos tem o pulmão direito?', answer: '3 lobos: superior, médio e inferior', mastery: 5 },
                  { id: 2, question: 'Quantos lobos tem o pulmão esquerdo?', answer: '2 lobos: superior e inferior', mastery: 5 },
                  { id: 3, question: 'Qual a função dos alvéolos pulmonares?', answer: 'Realizar as trocas gasosas (hematose) entre o ar e o sangue', mastery: 4 },
                  { id: 4, question: 'O que é a pleura?', answer: 'Membrana serosa que reveste os pulmões (visceral) e a cavidade torácica (parietal)', mastery: 3 },
                ],
                quizzes: [
                  { 
                    id: 1, 
                    question: 'Por que o pulmão esquerdo é menor que o direito?', 
                    options: ['Presença do fígado', 'Presença do coração', 'Presença do estômago', 'Presença do baço'],
                    correctAnswer: 1,
                    explanation: 'O pulmão esquerdo é menor para acomodar o coração, que está ligeiramente desviado para a esquerda.'
                  },
                ],
                model3D: {
                  id: 'lungs-3d',
                  name: 'Pulmões e Árvore Brônquica',
                  description: 'Lobos pulmonares e segmentação broncopulmonar',
                  available: true
                }
              },
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'histology',
    name: 'Histologia',
    color: 'bg-indigo-500',
    accentColor: 'text-indigo-500',
    semesters: [
      {
        id: 'sem1',
        title: 'Tecidos Básicos',
        sections: [
          {
            id: 'epithelial',
            title: 'Tecido Epitelial',
            imageUrl: 'https://images.unsplash.com/photo-1716833322987-bfef9f913822?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaXN0b2xvZ3klMjBlcGl0aGVsaWFsJTIwdGlzc3VlJTIwY2VsbHN8ZW58MXx8fHwxNzY5MTI4Mzc4fDA&ixlib=rb-4.1.0&q=80&w=1080',
            topics: [
              { 
                id: 'simple', 
                title: 'Epitélio Simples', 
                summary: 'Camada única de células com funções de absorção, secreção e filtração.',
                videoUrl: '#',
                flashcards: [
                  { id: 1, question: 'O que caracteriza o epitélio simples?', answer: 'Uma única camada de células apoiadas na lâmina basal', mastery: 5 },
                  { id: 2, question: 'Onde é encontrado o epitélio simples pavimentoso?', answer: 'Alvéolos pulmonares, endotélio vascular e mesotélio', mastery: 3 },
                  { id: 3, question: 'Qual é a função do epitélio simples cúbico?', answer: 'Secreção e absorção (ex: túbulos renais)', mastery: 4 },
                ],
                quizzes: [
                  { 
                    id: 1, 
                    question: 'Qual tipo de epitélio simples reveste os intestinos?', 
                    options: ['Pavimentoso', 'Cúbico', 'Colunar', 'Pseudoestratificado'],
                    correctAnswer: 2,
                    explanation: 'O epitélio simples colunar com microvilosidades reveste o intestino para aumentar a absorção.'
                  },
                ],
                model3D: {
                  id: 'simple-epithelium-3d',
                  name: 'Epitélio Simples',
                  description: 'Visualização 3D dos diferentes tipos de epitélio simples',
                  available: false
                }
              },
              { 
                id: 'stratified', 
                title: 'Epitélio Estratificado', 
                summary: 'Múltiplas camadas de células com função primária de proteção contra agressões mecânicas.',
                videoUrl: '#',
                flashcards: [
                  { id: 1, question: 'O que caracteriza o epitélio estratificado?', answer: 'Múltiplas camadas de células sobrepostas', mastery: 5 },
                  { id: 2, question: 'Onde é encontrado o epitélio estratificado pavimentoso queratinizado?', answer: 'Pele (epiderme)', mastery: 5 },
                  { id: 3, question: 'Qual é a função principal do epitélio estratificado?', answer: 'Proteção contra agressões mecânicas e químicas', mastery: 4 },
                ],
                quizzes: [
                  { 
                    id: 1, 
                    question: 'Qual estrutura possui epitélio estratificado pavimentoso não-queratinizado?', 
                    options: ['Pele', 'Esôfago', 'Intestino', 'Traqueia'],
                    correctAnswer: 1,
                    explanation: 'O esôfago é revestido por epitélio estratificado pavimentoso não-queratinizado para proteção contra abrasão alimentar.'
                  },
                ],
                model3D: {
                  id: 'stratified-epithelium-3d',
                  name: 'Epitélio Estratificado',
                  description: 'Camadas celulares em 3D',
                  available: false
                }
              },
            ]
          },
          {
            id: 'connective',
            title: 'Tecido Conjuntivo',
            imageUrl: 'https://images.unsplash.com/photo-1588665306984-d5c6f62224aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaXN0b2xvZ3klMjBjb25uZWN0aXZlJTIwdGlzc3VlJTIwbWljcm9zY29wZXxlbnwxfHx8fDE3NjkxMjgzNzN8MA&ixlib=rb-4.1.0&q=80&w=1080',
            topics: [
              {
                id: 'proper',
                title: 'Conjuntivo Propriamente Dito',
                summary: 'O tecido mais abundante, preenchendo espaços e sustentando epitélios.',
                videoUrl: '#',
                flashcards: [
                  { id: 1, question: 'Quais são os dois tipos de tecido conjuntivo propriamente dito?', answer: 'Frouxo (areolar) e denso (modelado e não modelado)', mastery: 3 },
                  { id: 2, question: 'Qual é a célula mais abundante do tecido conjuntivo?', answer: 'Fibroblasto — responsável pela síntese de fibras e substância fundamental', mastery: 4 },
                  { id: 3, question: 'Quais são os três tipos de fibras do conjuntivo?', answer: 'Colágenas (resistência), elásticas (elasticidade) e reticulares (sustentação)', mastery: 2 },
                  { id: 4, question: 'O que é a substância fundamental amorfa?', answer: 'Gel hidratado de glicosaminoglicanos e proteoglicanos que preenche espaços entre células e fibras', mastery: 3 },
                ],
                quizzes: []
              },
              {
                id: 'adipose',
                title: 'Tecido Adiposo',
                summary: 'Especializado no armazenamento de energia e isolamento térmico.',
                videoUrl: '#',
                flashcards: [
                  { id: 1, question: 'Quais são os dois tipos de tecido adiposo?', answer: 'Unilocular (branco) e multilocular (marrom/pardo)', mastery: 4 },
                  { id: 2, question: 'Qual a principal função do tecido adiposo branco?', answer: 'Armazenamento de energia na forma de triglicerídeos, isolamento térmico e proteção mecânica', mastery: 5 },
                  { id: 3, question: 'Por que o tecido adiposo marrom é pardo?', answer: 'Grande quantidade de mitocôndrias com citocromo (rico em ferro), produzindo calor por termogênese', mastery: 2 },
                  { id: 4, question: 'Qual hormônio é produzido pelo tecido adiposo?', answer: 'Leptina — sinaliza saciedade ao hipotálamo', mastery: 3 },
                ],
                quizzes: []
              },
              {
                id: 'cartilage',
                title: 'Tecido Cartilaginoso',
                summary: 'Tecido rígido mas flexível, sem vasos sanguíneos.',
                videoUrl: '#',
                flashcards: [
                  { id: 1, question: 'Quais são os três tipos de cartilagem?', answer: 'Hialina, elástica e fibrocartilagem', mastery: 4 },
                  { id: 2, question: 'Onde encontramos cartilagem hialina?', answer: 'Traqueia, brônquios, nariz, costelas e superfícies articulares', mastery: 3 },
                  { id: 3, question: 'Por que a cartilagem se regenera lentamente?', answer: 'É avascular — nutrição ocorre por difusão a partir do pericôndrio', mastery: 2 },
                  { id: 4, question: 'Como se chamam as células maduras da cartilagem?', answer: 'Condrócitos — alojados em lacunas na matriz cartilaginosa', mastery: 5 },
                ],
                quizzes: []
              },
              {
                id: 'bone',
                title: 'Tecido Ósseo',
                summary: 'Matriz calcificada que forma o esqueleto e protege órgãos vitais.',
                videoUrl: '#',
                flashcards: [
                  { id: 1, question: 'Quais são os dois tipos de tecido ósseo?', answer: 'Compacto (cortical) e esponjoso (trabecular)', mastery: 4 },
                  { id: 2, question: 'O que é o sistema de Havers (ósteon)?', answer: 'Unidade estrutural do osso compacto: canal central com lamelas concêntricas ao redor', mastery: 2 },
                  { id: 3, question: 'Qual a função dos osteoclastos?', answer: 'Reabsorção óssea — células multinucleadas que degradam a matriz mineralizada', mastery: 3 },
                  { id: 4, question: 'O que é o periósteo?', answer: 'Membrana conjuntiva que reveste a superfície externa do osso, essencial para crescimento e reparo', mastery: 5 },
                ],
                quizzes: []
              }
            ]
          },
          {
            id: 'muscle',
            title: 'Tecido Muscular',
            imageUrl: 'https://images.unsplash.com/photo-1647083701139-3930542304cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaXN0b2xvZ3klMjBtdXNjbGUlMjB0aXNzdWUlMjBtaWNyb3Njb3BlfGVufDF8fHx8MTc2OTEyODM3M3ww&ixlib=rb-4.1.0&q=80&w=1080',
            topics: [
              {
                id: 'skeletal',
                title: 'Muscular Estriado Esquelético',
                summary: 'Músculos voluntários ligados aos ossos responsáveis pelo movimento.',
                videoUrl: '#',
                flashcards: [
                  { id: 1, question: 'Qual a característica histológica marcante do músculo esquelético?', answer: 'Fibras multinucleadas com estriações transversais (bandas A e I)', mastery: 4 },
                  { id: 2, question: 'O que é o sarcômero?', answer: 'Unidade contrátil do músculo estriado, delimitada por duas linhas Z', mastery: 3 },
                  { id: 3, question: 'Qual proteína forma os filamentos grossos?', answer: 'Miosina', mastery: 5 },
                  { id: 4, question: 'Qual a função do retículo sarcoplasmático?', answer: 'Armazenar e liberar cálcio (Ca²⁺) para a contração muscular', mastery: 2 },
                ],
                quizzes: []
              },
              {
                id: 'cardiac',
                title: 'Muscular Estriado Cardíaco',
                summary: 'Músculo involuntário do coração com discos intercalares.',
                videoUrl: '#',
                flashcards: [
                  { id: 1, question: 'O que são discos intercalares?', answer: 'Junções especializadas entre cardiomiócitos com desmossomos e junções comunicantes (gap junctions)', mastery: 3 },
                  { id: 2, question: 'Quantos núcleos tem o cardiomiócito?', answer: 'Um ou dois núcleos centrais (diferente do esquelético que é multinucleado periférico)', mastery: 4 },
                  { id: 3, question: 'Qual a função das junções gap no músculo cardíaco?', answer: 'Permitir a propagação rápida do impulso elétrico entre as células (sincício funcional)', mastery: 2 },
                  { id: 4, question: 'O músculo cardíaco é voluntário ou involuntário?', answer: 'Involuntário — controlado pelo sistema nervoso autônomo e sistema de condução próprio', mastery: 5 },
                ],
                quizzes: []
              },
              {
                id: 'smooth',
                title: 'Muscular Liso',
                summary: 'Músculo involuntário das vísceras e vasos sanguíneos.',
                videoUrl: '#',
                flashcards: [
                  { id: 1, question: 'Onde encontramos músculo liso?', answer: 'Parede de vísceras (intestino, bexiga, útero), vasos sanguíneos e vias aéreas', mastery: 5 },
                  { id: 2, question: 'Por que o músculo liso não apresenta estriações?', answer: 'Os filamentos de actina e miosina não estão organizados em sarcômeros regulares', mastery: 3 },
                  { id: 3, question: 'Como é o núcleo da célula muscular lisa?', answer: 'Único, central e fusiforme (formato de charuto)', mastery: 4 },
                  { id: 4, question: 'Qual a velocidade de contração do músculo liso comparado ao esquelético?', answer: 'Mais lenta, porém sustentada por longos períodos (contração tônica)', mastery: 2 },
                ],
                quizzes: []
              }
            ]
          },
          {
            id: 'nervous',
            title: 'Tecido Nervoso',
            imageUrl: 'https://images.unsplash.com/photo-1716833322990-acbeae5cc3eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaXN0b2xvZ3klMjBuZXJ2b3VzJTIwbmV1cm9uJTIwbWljcm9zY29wZXxlbnwxfHx8fDE3NjkxMjgzNzh8MA&ixlib=rb-4.1.0&q=80&w=1080',
            topics: [
              {
                id: 'neurons',
                title: 'Neurônios',
                summary: 'Unidades funcionais responsáveis pela transmissão de impulsos nervosos.',
                videoUrl: '#',
                flashcards: [
                  { id: 1, question: 'Quais são as três partes principais de um neurônio?', answer: 'Corpo celular (soma), dendritos (recebem sinais) e axônio (transmite sinais)', mastery: 5 },
                  { id: 2, question: 'O que é a bainha de mielina?', answer: 'Camada lipídica que envolve o axônio, aumentando a velocidade de condução do impulso nervoso', mastery: 3 },
                  { id: 3, question: 'O que são os nódulos de Ranvier?', answer: 'Intervalos entre as células de Schwann onde ocorre a condução saltatória do impulso', mastery: 2 },
                  { id: 4, question: 'Quais são os tipos de neurônios por número de prolongamentos?', answer: 'Unipolar, bipolar, pseudounipolar e multipolar', mastery: 4 },
                ],
                quizzes: []
              },
              {
                id: 'glia',
                title: 'Células da Glia',
                summary: 'Células de suporte, nutrição e proteção do sistema nervoso.',
                videoUrl: '#',
                flashcards: [
                  { id: 1, question: 'Qual célula da glia forma a mielina no SNC?', answer: 'Oligodendrócito', mastery: 4 },
                  { id: 2, question: 'Qual célula da glia forma a mielina no SNP?', answer: 'Célula de Schwann', mastery: 5 },
                  { id: 3, question: 'Qual a função dos astrócitos?', answer: 'Sustentação, nutrição, regulação do microambiente neuronal e formação da barreira hematoencefálica', mastery: 2 },
                  { id: 4, question: 'Qual célula da glia atua como macrófago no SNC?', answer: 'Micróglia — defesa imunológica, fagocitando restos celulares e patógenos', mastery: 3 },
                ],
                quizzes: []
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'biology',
    name: 'Biologia',
    color: 'bg-green-500',
    accentColor: 'text-green-500',
    semesters: [
      {
        id: 'sem1',
        title: 'Biologia Celular',
        sections: [
          {
            id: 'cell',
            title: 'Célula',
            imageUrl: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVsbCUyMGJpb2xvZ3l8ZW58MXx8fHwxNjk5NjU1ODMyfDA&ixlib=rb-4.1.0&q=80&w=1080',
            topics: [
              { 
                id: 'organelles', 
                title: 'Organelas', 
                summary: 'Estruturas funcionais da célula responsáveis por processos vitais como produção de energia, síntese de proteínas e digestão celular.',
                videoUrl: '#',
                flashcards: [
                  { id: 1, question: 'Qual organela produz ATP?', answer: 'Mitocôndria', mastery: 5 },
                  { id: 2, question: 'Qual é a função do retículo endoplasmático rugoso?', answer: 'Síntese de proteínas (possui ribossomos aderidos)', mastery: 4 },
                  { id: 3, question: 'Qual organela realiza a digestão intracelular?', answer: 'Lisossomo', mastery: 4 },
                  { id: 4, question: 'Qual estrutura celular armazena água e íons?', answer: 'Vacúolo (grande em células vegetais)', mastery: 3 },
                ],
                quizzes: [
                  { 
                    id: 1, 
                    question: 'Qual organela é conhecida como a "usina da célula"?', 
                    options: ['Núcleo', 'Mitocôndria', 'Lisossomo', 'Complexo de Golgi'],
                    correctAnswer: 1,
                    explanation: 'A mitocôndria é responsável pela produção de ATP através da respiração celular aeróbica.'
                  },
                ],
                model3D: {
                  id: 'cell-organelles-3d',
                  name: 'Célula e Organelas',
                  description: 'Modelo interativo de célula eucarionte',
                  available: true
                }
              },
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'microbiology',
    name: 'Microbiologia',
    color: 'bg-cyan-500',
    accentColor: 'text-cyan-500',
    semesters: [
      {
        id: 'sem1',
        title: 'Bacteriologia',
        sections: [
          {
            id: 'bacteria',
            title: 'Bactérias',
            imageUrl: 'https://images.unsplash.com/photo-1584036561566-b45238f2e26f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWN0ZXJpYXxlbnwxfHx8fDE2OTk2NTU4NTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
            topics: [
              { 
                id: 'gram', 
                title: 'Gram Positivas vs Negativas', 
                summary: 'Classificação baseada na estrutura da parede celular bacteriana, fundamental para identificação e tratamento.',
                videoUrl: '#',
                flashcards: [
                  { id: 1, question: 'O que diferencia bactérias Gram+ de Gram-?', answer: 'Espessura da camada de peptideoglicano na parede celular', mastery: 4 },
                  { id: 2, question: 'Qual cor ficam as bactérias Gram+ após coloração?', answer: 'Roxo/azul (retém o cristal violeta)', mastery: 5 },
                  { id: 3, question: 'Qual estrutura está presente apenas em Gram-?', answer: 'Membrana externa com lipopolissacarídeos (LPS)', mastery: 3 },
                  { id: 4, question: 'Cite um exemplo de bactéria Gram+', answer: 'Staphylococcus aureus, Streptococcus pyogenes', mastery: 4 },
                ],
                quizzes: [
                  { 
                    id: 1, 
                    question: 'Por que bactérias Gram-negativas são geralmente mais resistentes a antibióticos?', 
                    options: ['Têm parede mais grossa', 'Têm membrana externa', 'Não têm parede celular', 'Têm cápsula'],
                    correctAnswer: 1,
                    explanation: 'A membrana externa das Gram-negativas atua como barreira adicional, dificultando a penetração de antibióticos.'
                  },
                ],
                model3D: {
                  id: 'bacteria-cell-wall-3d',
                  name: 'Parede Celular Bacteriana',
                  description: 'Comparação entre Gram+ e Gram-',
                  available: true
                }
              },
            ]
          }
        ]
      }
    ]
  }
];