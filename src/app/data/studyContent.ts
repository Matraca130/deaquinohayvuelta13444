// Conteúdo médico detalhado para os resumos de estudo

export interface StudyContentSection {
  title: string;
  content: string;
}

export interface StudyContent {
  topicId: string;
  sections: StudyContentSection[];
}

export const studyContents: StudyContent[] = [
  {
    topicId: 'shoulder',
    sections: [
      {
        title: 'Introdução',
        content: `A articulação do ombro, também conhecida como articulação glenoumeral, representa uma das estruturas mais complexas e móveis do corpo humano. Esta articulação sinovial do tipo esferoide é formada pela cabeça do úmero e pela cavidade glenoidal da escápula, permitindo uma amplitude de movimento excepcional em múltiplos planos.

A estabilidade desta articulação é garantida por um conjunto integrado de estruturas passivas e ativas. As estruturas passivas incluem a cápsula articular, os ligamentos glenoumerais (superior, médio e inferior), o ligamento coracoumeral e o complexo labral. As estruturas ativas são representadas pelos músculos do manguito rotador e pela musculatura periarticular.

A região axilar, intimamente relacionada à articulação do ombro, constitui um espaço piramidal de crucial importância clínica. Limitada superiormente pelo ápice formado pela clavícula, primeira costela e borda superior da escápula, a axila serve como via de passagem para importantes estruturas neurovasculares que suprem o membro superior.`
      },
      {
        title: 'Anatomia Óssea',
        content: `A escápula é um osso plano triangular localizado na região posterolateral do tórax, estendendo-se da segunda à sétima costela. Suas principais características anatômicas incluem:

**Faces e Bordas:**
- Face costal: côncava, relaciona-se com a parede torácica
- Face posterior: dividida pela espinha da escápula em fossas supraespinal e infraespinal
- Borda medial (vertebral): paralela à coluna vertebral
- Borda lateral (axilar): mais espessa, contém a cavidade glenoidal
- Borda superior: fino, apresenta a incisura da escápula

**Processos:**
- Acrômio: prolongamento lateral da espinha, articula-se com a clavícula
- Processo coracoide: projeção anterior em forma de gancho, importante ponto de inserção muscular
- Cavidade glenoidal: superfície articular rasa e piriforme, articula-se com a cabeça do úmero

O úmero proximal apresenta características fundamentais para a articulação:

**Cabeça do Úmero:**
- Superfície hemisférica lisa coberta por cartilagem hialina
- Orientada medial, superior e posteriormente
- Representa aproximadamente um terço de esfera
- Ângulo de inclinação de 130-150° com a diáfise
- Ângulo de retroversão de 20-30°

**Colo Anatômico:**
- Sulco que separa a cabeça das tuberosidades
- Inserção da cápsula articular

**Tubérculo Maior (Troquiter):**
- Localização lateral
- Três facetas para inserção do supraespinal, infraespinal e redondo menor
- Palpável sob o acrômio

**Tubérculo Menor (Troquin):**
- Localização anterior
- Inserção do músculo subescapular
- Separado do tubérculo maior pelo sulco intertubercular

**Sulco Intertubercular (Goteira Bicipital):**
- Contém o tendão da cabeça longa do bíceps
- Importante referência anatômica para cirurgias`
      },
      {
        title: 'Cápsula e Ligamentos',
        content: `A cápsula articular do ombro é notavelmente laxa, característica que permite a ampla mobilidade articular mas que também predispõe à instabilidade. Esta estrutura fibrosa fina envolve completamente a articulação, inserindo-se:

**Inserção Escapular:**
- Labrum glenoidal (aumenta a profundidade da cavidade em 50%)
- Base do processo coracoide
- Margem da cavidade glenoidal

**Inserção Umeral:**
- Colo anatômico (exceto inferomedialmente)
- Estende-se até a diáfise na região inferior

**Reforços Capsulares - Ligamentos Glenoumerais:**

O **ligamento glenoumeral superior** origina-se na porção superior do labrum e tubérculo glenoidal, inserindo-se superiormente ao tubérculo menor. Limita a translação inferior quando o braço está em adução.

O **ligamento glenoumeral médio**, presente em 70% dos indivíduos, estende-se da borda anterior do labrum até o tubérculo menor, abaixo da inserção do subescapular. Restringe a rotação lateral com o braço em 45° de abdução.

O **ligamento glenoumeral inferior** é o mais importante para a estabilidade anterior do ombro. Composto por uma banda anterior, uma banda posterior e uma porção axilar (bolsa de Broca), forma um complexo em "hamaca" que suporta a cabeça do úmero quando o braço está abduzido e rodado lateralmente.

**Ligamento Coracoumeral:**
- Origem: borda lateral do processo coracoide
- Inserção: tubérculos maior e menor
- Função: limita a rotação lateral e translação inferior em adução
- Forma o teto da articulação junto com a cápsula

**Ligamento Coracoacromial:**
- Origem: borda lateral do acrômio
- Inserção: processo coracoide
- Forma o arco coracoacromial
- Previne luxação superior da cabeça do úmero
- Importante na síndrome do impacto

**Intervalo Rotador:**
Área triangular entre os tendões do subescapular e supraespinal, preenchida pela cápsula, ligamento coracoumeral e porção longa do bíceps. Importante estrutura de estabilização anterior e inferior.`
      },
      {
        title: 'Manguito Rotador',
        content: `O manguito rotador representa um conjunto integrado de quatro músculos e seus tendões que envolvem e estabilizam dinamicamente a articulação glenoumeral. A configuração anatômica destes músculos permite tanto a estabilização quanto a mobilização da articulação em múltiplos planos.

**Músculo Supraespinal:**

*Origem:* Fossa supraespinal da escápula (dois terços mediais)
*Inserção:* Faceta superior do tubérculo maior do úmero
*Inervação:* Nervo supraescapular (C5-C6)
*Vascularização:* Artéria supraescapular e circunflexa escapular

*Ação:* Iniciação da abdução do braço (primeiros 15-30°), estabilização da cabeça do úmero na cavidade glenoidal, compressão articular. O tendão do supraespinal passa por uma zona crítica de hipovascularização (zona crítica de Codman) aproximadamente 1cm medial à sua inserção, área propensa a degeneração e rupturas.

**Músculo Infraespinal:**

*Origem:* Fossa infraespinal (dois terços mediais)
*Inserção:* Faceta média do tubérculo maior
*Inervação:* Nervo supraescapular (C5-C6)
*Vascularização:* Artéria supraescapular e circunflexa escapular

*Ação:* Rotação lateral do braço, estabilização posterior, depressão da cabeça do úmero durante a elevação. É o principal rotador lateral do ombro e frequentemente afetado em lesões do manguito.

**Músculo Redondo Menor:**

*Origem:* Dois terços superiores da borda lateral da escápula (face posterior)
*Inserção:* Faceta inferior do tubérculo maior
*Inervação:* Nervo axilar (C5-C6)
*Vascularização:* Artéria circunflexa escapular

*Ação:* Rotação lateral (sinergista do infraespinal), adução fraca, estabilização inferior. Sua inervação distinta pelo nervo axilar é clinicamente relevante em lesões deste nervo.

**Músculo Subescapular:**

*Origem:* Fossa subescapular (face costal da escápula)
*Inserção:* Tubérculo menor do úmero
*Inervação:* Nervos subescapulares superior e inferior (C5-C6-C7)
*Vascularização:* Artérias subescapular e circunflexa anterior do úmero

*Ação:* Rotação medial potente, adução, estabilização anterior crucial. É o músculo mais forte do manguito rotador e o principal estabilizador anterior da articulação. Lesões isoladas são raras, mas quando presentes, frequentemente associam-se a instabilidade anterior.

**Biomecânica do Manguito:**

O manguito rotador funciona como um sinergista fundamental do músculo deltoide durante a abdução do braço. Enquanto o deltoide gera força de elevação, o manguito comprime a cabeça do úmero contra a cavidade glenoidal, criando um fulcro estável e prevenindo migração superior da cabeça. Esta ação de "force couple" é essencial para a função normal do ombro.

Na abdução, o supraespinal e o deltoide trabalham em conjunto, enquanto o infraespinal, redondo menor e subescapular rotam a cabeça do úmero para permitir que o tubérculo maior passe sob o arco coracoacromial, evitando impacto.`
      },
      {
        title: 'Anatomia da Axila',
        content: `A axila constitui um espaço piramidal crucial localizado entre a parede torácica e o membro superior. Sua compreensão anatômica é fundamental para procedimentos cirúrgicos, dissecções linfonodais e entendimento das vias de propagação de processos infecciosos e neoplásicos.

**Limites Anatômicos:**

*Ápice (entrada):* Formado pela convergência da borda lateral da primeira costela, borda superior da escápula e face posterior da clavícula. Através deste espaço passam os vasos axilares, plexo braquial e vasos linfáticos.

*Base (assoalho):* Constituída pela pele e fáscia axilar, estendendo-se da quarta costela ao assoalho da axila propriamente dito.

*Parede Anterior:* Formada pelos músculos peitoral maior e menor, e pela fáscia clavipeitoral. A fáscia clavipeitoral divide-se em duas lâminas ao nível do peitoral menor, envolvendo este músculo.

*Parede Posterior:* Composta superiormente pelo músculo subescapular, ao meio pelos músculos redondo maior e grande dorsal, e lateralmente pela cabeça longa do tríceps. O nervo axilar e a artéria circunflexa posterior do úmero emergem através do espaço quadrangular.

*Parede Medial:* Formada pela parede torácica (primeira à quarta costelas) revestida pelo músculo serrátil anterior. O nervo torácico longo (de Bell) desce sobre a superfície lateral do serrátil anterior.

*Parede Lateral:* Estreita, formada pelo sulco intertubercular do úmero, contendo os tendões dos músculos bíceps braquial (cabeça curta) e coracobraquial.

**Conteúdo Axilar:**

O conteúdo da axila está envolto por tecido conjuntivo frouxo, que permite mobilidade mas também serve como via de disseminação de processos patológicos.

*Artéria Axilar:* Continuação da artéria subclávia após cruzar a primeira costela, estende-se até a borda inferior do músculo redondo maior, onde se torna artéria braquial. Dividida em três porções pelo músculo peitoral menor:
- Primeira porção (medial ao peitoral menor): origina a artéria torácica superior
- Segunda porção (posterior ao peitoral menor): origina as artérias toracoacromial e torácica lateral
- Terceira porção (lateral ao peitoral menor): origina as artérias subescapular e circunflexas anterior e posterior do úmero

*Veia Axilar:* Formada pela confluência das veias braquiais e basílica ao nível da borda inferior do redondo maior. Localiza-se medial à artéria axilar e recebe tributárias correspondentes aos ramos arteriais.

*Plexo Braquial:* Rede nervosa complexa formada pelos ramos anteriores de C5, C6, C7, C8 e T1. Na axila, organiza-se em três fascículos (lateral, medial e posterior) ao redor da artéria axilar:
- Fascículo lateral: origina o nervo musculocutâneo e a raiz lateral do nervo mediano
- Fascículo medial: origina o nervo ulnar, nervo cutâneo medial do braço, nervo cutâneo medial do antebraço e raiz medial do nervo mediano
- Fascículo posterior: origina os nervos axilar e radial

*Linfonodos Axilares:* Sistema de drenagem linfática crucial, dividido em cinco grupos:
- Peitoral (anterior): ao longo da artéria torácica lateral
- Subscapular (posterior): ao longo da artéria subescapular
- Umeral (lateral): ao longo da veia axilar
- Central: na base da axila, em tecido adiposo
- Apical: no ápice, profundos à fáscia clavipeitoral

A drenagem linfática da mama é predominantemente para os linfonodos axilares (75%), tornando sua avaliação crítica no estadiamento e tratamento do câncer de mama.`
      },
      {
        title: 'Vascularização e Inervação',
        content: `**Suprimento Arterial:**

A vascularização do ombro deriva predominantemente da artéria axilar através de uma complexa rede anastomótica que garante irrigação colateral robusta.

*Artéria Subescapular:* Maior ramo da artéria axilar, origina-se na terceira porção. Divide-se em:
- Artéria circunflexa escapular: passa pelo espaço triangular, supre músculos redondo maior e menor
- Artéria toracodorsal: desce com o nervo toracodorsal, supre grande dorsal

*Artéria Circunflexa Anterior do Úmero:* Menor que a posterior, passa anteriormente ao colo cirúrgico do úmero. Anastomosa-se com a artéria circunflexa posterior formando um anel vascular ao redor do colo cirúrgico.

*Artéria Circunflexa Posterior do Úmero:* Passa pelo espaço quadrangular junto com o nervo axilar. Irriga a articulação glenoumeral, músculos redondo menor e deltoide. Ramos ascendentes contribuem para a irrigação da cabeça do úmero.

*Artéria Supraescapular:* Geralmente origina-se do tronco tireocervical. Passa sobre o ligamento transverso superior da escápula (enquanto o nervo supraescapular passa abaixo - "artéria sobre a ponte, nervo sob a ponte"). Supre os músculos supraespinal e infraespinal.

**Zonas de Vascularização do Manguito Rotador:**

A vascularização do manguito rotador apresenta áreas de particular vulnerabilidade:
- Zona crítica: área hipovascular no tendão do supraespinal, aproximadamente 1cm da inserção
- Zona de anastomose: junção dos suprimentos ósseo (úmero) e muscular
- Estas zonas são mais suscetíveis a degeneração e ruptura tendínea

**Drenagem Venosa:**

O sistema venoso acompanha as artérias correspondentes, formando veias comitantes que drenam para a veia axilar. A veia cefálica ascende pelo sulco deltopeitoral e penetra a fáscia clavipeitoral para drenar na veia axilar.

**Inervação:**

*Nervo Axilar (Circunflexo):*
- Origem: Fascículo posterior do plexo braquial (C5-C6)
- Trajeto: Passa pelo espaço quadrangular junto com a artéria circunflexa posterior
- Distribuição motora: Deltoide e redondo menor
- Distribuição sensitiva: Pele sobre o deltoide (nervo cutâneo lateral superior do braço)
- Importância clínica: Vulnerável em luxações glenoumerais anteriores, fraturas do colo cirúrgico do úmero e cirurgias do ombro

*Nervo Supraescapular:*
- Origem: Tronco superior do plexo braquial (C5-C6)
- Trajeto: Passa pela incisura da escápula sob o ligamento transverso superior, depois contorna o colo da escápula pela incisura espinoglenoidal
- Distribuição: Supraespinal e infraespinal (motor), articulação glenoumeral e acromioclavicular (sensitivo)
- Importância clínica: Compressão na incisura escapular causa dor profunda no ombro e fraqueza na rotação lateral

*Nervo Dorsal da Escápula:*
- Origem: Raiz C5 (diretamente)
- Distribuição: Músculos romboides e levantador da escápula
- Função: Retração e elevação escapular

*Nervo Torácico Longo (de Bell):*
- Origem: Raízes C5, C6, C7
- Trajeto: Desce sobre a face lateral do serrátil anterior
- Distribuição: Músculo serrátil anterior
- Importância clínica: Lesão causa escápula alada, comprometendo elevação do braço acima de 90°

*Nervo Toracodorsal:*
- Origem: Fascículo posterior (C6-C8)
- Distribuição: Músculo grande dorsal
- Importância clínica: Preservação é importante em reconstruções com retalho de grande dorsal`
      },
      {
        title: 'Correlações Clínicas',
        content: `**Luxação Glenoumeral:**

A luxação anterior representa 95% de todas as luxações do ombro, ocorrendo tipicamente quando o braço está abduzido e rodado lateralmente. O mecanismo envolve ruptura ou avulsão da cápsula anterior e do labrum anteroinferior (lesão de Bankart).

*Sinais clínicos:*
- Perda do contorno normal do ombro (sinal da dragona)
- Protrusão do acrômio
- Cabeça do úmero palpável anteriormente
- Limitação de movimentos
- Possível lesão do nervo axilar (20% dos casos)

*Complicações:*
- Lesão de Bankart: avulsão do labrum anteroinferior
- Lesão de Hill-Sachs: impactação da cabeça posterolateral do úmero
- Instabilidade recorrente (principalmente em jovens)
- Lesão neurovascular (nervo axilar, artéria axilar)

**Síndrome do Impacto:**

Condição caracterizada pela compressão das estruturas do espaço subacromial (tendão do supraespinal, bursa subacromial) durante a elevação do braço. Classificada em três estágios por Neer:

*Estágio I:* Edema e hemorragia (reversível, <25 anos)
*Estágio II:* Fibrose e tendinite (parcialmente reversível, 25-40 anos)
*Estágio III:* Ruptura do manguito rotador (irreversível, >40 anos)

*Fatores contribuintes:*
- Anatomia acromial (tipo II e III de Bigliani)
- Osteófitos acromioclaviculares
- Espessamento da bursa
- Instabilidade glenoumeral
- Discinesia escapular

**Ruptura do Manguito Rotador:**

Lesão comum, cuja prevalência aumenta com a idade. Pode ser traumática (aguda) ou degenerativa (crônica).

*Fatores de risco:*
- Idade avançada (>60 anos: 30% de prevalência)
- Síndrome do impacto crônico
- Hipovascularização da zona crítica
- Movimentos repetitivos overhead
- Tabagismo

*Apresentação clínica:*
- Dor noturna
- Fraqueza na elevação e rotação lateral
- Arco doloroso (60-120° de abdução)
- Sinal do braço caído (drop arm test)
- Atrofia muscular (casos crônicos)

*Rupturas completas:* Comprometimento de toda a espessura do tendão
*Rupturas parciais:* Articular (mais comum), bursal ou intratendinosa

**Capsulite Adesiva (Ombro Congelado):**

Condição caracterizada por restrição progressiva e dolorosa da amplitude de movimento glenoumeral, secundária a inflamação e fibrose capsular.

*Fases:*
1. Fase dolorosa (0-3 meses): dor intensa, início da restrição
2. Fase de congelamento (3-9 meses): rigidez progressiva, dor reduzindo
3. Fase de descongelamento (9-15 meses): recuperação gradual

*Fatores associados:*
- Diabetes mellitus (10-36% de prevalência)
- Doença tireoidiana
- Imobilização prolongada
- Trauma

**Tendinite Calcária:**

Depósito de cristais de hidroxiapatita de cálcio no tendão do manguito rotador (principalmente supraespinal).

*Fases (Uhthoff):*
1. Pré-calcificação: metaplasia fibrocartilaginosa
2. Calcificação: depósito formativo → depósito reabsortivo
3. Pós-calcificação: reparação tecidual

A fase reabsortiva é tipicamente a mais dolorosa, podendo causar dor aguda e intensa.

**Lesões do Labrum:**

*Lesão SLAP (Superior Labrum Anterior to Posterior):*
Ruptura do labrum superior, incluindo a inserção do tendão do bíceps. Comum em atletas de arremesso.

*Classificação de Snyder:*
- Tipo I: Degeneração labral sem destacamento
- Tipo II: Destacamento do labrum superior e âncora do bíceps
- Tipo III: Lesão em alça de balde sem comprometer o bíceps
- Tipo IV: Lesão em alça de balde estendendo-se ao tendão do bíceps

**Fratura do Úmero Proximal:**

Comumente classificadas pelo sistema de Neer, baseado em quatro segmentos anatômicos:
1. Cabeça do úmero
2. Tubérculo maior
3. Tubérculo menor
4. Diáfise

*Classificação:*
- Uma parte: não desviada (<1cm de deslocamento, <45° de angulação)
- Duas partes: deslocamento de um fragmento
- Três partes: deslocamento de dois fragmentos
- Quatro partes: deslocamento de todos os fragmentos

*Complicações:*
- Necrose avascular da cabeça (principalmente em fraturas de 4 partes)
- Lesão do nervo axilar
- Rigidez articular
- Consolidação viciosa`
      }
    ]
  },
  {
    topicId: 'arm',
    sections: [
      {
        title: 'Introdução',
        content: `O braço, ou região braquial, constitui o segmento do membro superior localizado entre a articulação do ombro superiormente e a articulação do cotovelo inferiormente. Esta região contém o úmero como estrutura óssea central, circundado por dois compartimentos musculares distintos separados pelos septos intermusculares medial e lateral: o compartimento anterior (flexor) e o compartimento posterior (extensor).

A organização anatômica do braço reflete o princípio fundamental de compartimentalização presente em todo o membro superior, onde cada compartimento possui seu próprio suprimento neurovascular, função específica e envoltura fascial. Esta compartimentalização tem importantes implicações clínicas, particularmente em situações como síndrome compartimental, planejamento cirúrgico e compreensão de padrões de lesão nervosa.`
      },
      {
        title: 'Anatomia Óssea - O Úmero',
        content: `O úmero é o osso mais longo e volumoso do membro superior, estendendo-se do ombro ao cotovelo. Sua estrutura pode ser dividida em três porções principais: extremidade proximal, corpo (diáfise) e extremidade distal.

**Corpo do Úmero:**

A diáfise umeral apresenta secção transversal cilíndrica em sua porção superior, tornando-se progressivamente triangular em direção distal. Três faces podem ser identificadas:

*Face Anterolateral:* Lisa em sua maior parte, apresenta superiormente uma proeminência rugosa - a tuberosidade deltoide - local de inserção do músculo deltoide. Logo abaixo desta tuberosidade, identifica-se o sulco do nervo radial, depressão oblíqua que percorre a face posterior do osso em direção anterolateral.

*Face Anteromedial:* Menos definida, apresenta inserções musculares do coracobraquial superiormente e do braquial inferiormente.

*Face Posterior:* Marcada pelo sulco do nervo radial, estrutura de grande relevância clínica. Este sulco dirige-se obliquamente de superomedial para inferolateral, dividindo a face posterior em porções superior e inferior. O nervo radial e a artéria braquial profunda cursam neste sulco, tornando-os vulneráveis em fraturas da diáfise umeral.

**Extremidade Distal:**

A porção distal do úmero apresenta morfologia complexa, essencial para a articulação do cotovelo:

*Epitróclea (Epicôndilo Medial):* Proeminência óssea medial, palpável subcutaneamente. Serve como origem dos músculos flexores-pronadores do antebraço. Posteriormente, apresenta o sulco do nervo ulnar, onde este nervo é particularmente susceptível a traumatismos.

*Epicôndilo Lateral:* Menor que a epitróclea, dá origem aos músculos extensores-supinadores do antebraço.

*Tróclea:* Superfície articular medial em forma de carretel, articula-se com a incisura troclear da ulna. Apresenta forma de polia com cristas e sulcos, permitindo movimento de dobradiça.

*Capítulo:* Superfície articular lateral hemisférica, articula-se com a cabeça do rádio. Localiza-se anteriormente, sendo visível apenas em vista anterior.

*Fossa Coronoide:* Depressão anterior superior à tróclea, acomoda o processo coronoide da ulna durante a flexão.

*Fossa Radial:* Depressão anterior superior ao capítulo, recebe a margem anterior da cabeça do rádio durante a flexão máxima.

*Fossa Olecraniana:* Grande depressão posterior, acomoda o olécrano durante a extensão completa do cotovelo.

O conhecimento detalhado destas estruturas é fundamental para a interpretação radiográfica e compreensão de lesões do cotovelo.`
      },
      {
        title: 'Compartimento Anterior do Braço',
        content: `O compartimento anterior do braço contém três músculos flexores do cotovelo, todos inervados pelo nervo musculocutâneo. Este compartimento é delimitado anteriormente pela pele e fáscia braquial, posteriormente pelo septo intermuscular medial e lateral, e medialmente pelo úmero.

**Músculo Bíceps Braquial:**

Músculo superficial proeminente com duas origens distintas:

*Cabeça Longa:*
- Origem: Tubérculo supraglenoidal da escápula
- Trajeto: Passa pelo sulco intertubercular do úmero, envolta por bainha sinovial
- Relação anatômica: Intra-articular (dentro da cápsula glenoumeral) mas extrasinovial

*Cabeça Curta:*
- Origem: Ápice do processo coracoide
- Trajeto: Medial à cabeça longa

*Inserção:* Ambas as cabeças convergem e inserem-se através de um tendão comum na tuberosidade do rádio. A aponeurose bicipital (lacertus fibrosus) estende-se medialmente do tendão, fundindo-se com a fáscia profunda do antebraço.

*Inervação:* Nervo musculocutâneo (C5-C6)
*Vascularização:* Artéria braquial

*Ações:*
- Flexão potente do cotovelo (principalmente com antebraço supinado)
- Supinação potente do antebraço (principalmente com cotovelo flexionado)
- Flexão fraca do ombro (cabeça longa)
- Estabilização da cabeça do úmero (cabeça longa)

**Músculo Braquial:**

Localizado profundamente ao bíceps, é o principal flexor puro do cotovelo.

*Origem:* Metade distal da face anterior do úmero e septos intermusculares adjacentes
*Inserção:* Tuberosidade da ulna e face anterior do processo coronoide
*Inervação:* Primariamente pelo nervo musculocutâneo (C5-C6); porção lateral pode receber ramos do nervo radial
*Vascularização:* Artéria braquial e artéria recorrente radial

*Ação:* Flexão do cotovelo em todas as posições do antebraço (pronação, posição neutra ou supinação)

*Importância clínica:* Por ser flexor puro não influenciado pela posição do antebraço, o braquial é crucial na flexão contra resistência quando o bíceps está em desvantagem mecânica (pronação).

**Músculo Coracobraquial:**

Músculo pequeno e estreito localizado na porção superomedial do braço.

*Origem:* Ápice do processo coracoide (juntamente com a cabeça curta do bíceps)
*Inserção:* Face anteromedial do úmero (terço médio)
*Inervação:* Nervo musculocutâneo (C5-C6-C7), que tipicamente perfura este músculo
*Vascularização:* Artéria braquial

*Ações:*
- Flexão do ombro
- Adução do ombro
- Auxiliar na estabilização da cabeça do úmero

**Nervo Musculocutâneo:**

Este nervo origina-se do fascículo lateral do plexo braquial (C5-C6-C7) e apresenta trajeto característico:

*Trajeto:*
1. Emerge lateralmente ao músculo peitoral menor
2. Perfura o músculo coracobraquial (tipicamente 3-8cm abaixo do processo coracoide)
3. Desce entre o bíceps e o braquial
4. Emerge lateral ao tendão do bíceps como nervo cutâneo lateral do antebraço

*Distribuição motora:*
- Coracobraquial
- Bíceps braquial
- Braquial (parcialmente)

*Distribuição sensitiva:*
- Continua como nervo cutâneo lateral do antebraço
- Inerva pele da face lateral do antebraço até o punho

*Importância clínica:* Lesões isoladas são raras, mas podem ocorrer em traumas diretos ou procedimentos cirúrgicos no ombro. Resultam em fraqueza acentuada da flexão do cotovelo e supinação, além de hipoestesia na face lateral do antebraço.`
      },
      {
        title: 'Compartimento Posterior do Braço',
        content: `O compartimento posterior contém um único músculo - o tríceps braquial - responsável pela extensão do cotovelo. Este compartimento é inervado exclusivamente pelo nervo radial.

**Músculo Tríceps Braquial:**

Grande músculo que ocupa toda a face posterior do braço, constituído por três cabeças:

*Cabeça Longa:*
- Origem: Tubérculo infraglenoidal da escápula
- Característica: Única cabeça que cruza a articulação do ombro
- Posição: Medial e superficial

*Cabeça Lateral:*
- Origem: Face posterior do úmero (superior e lateral ao sulco do nervo radial)
- Posição: Face lateral do braço
- Característica: Mais volumosa e visível das três cabeças

*Cabeça Medial:*
- Origem: Face posterior do úmero (inferior ao sulco do nervo radial), septos intermusculares medial e lateral
- Posição: Profunda às outras duas cabeças
- Característica: Origem mais extensa

*Inserção:* As três cabeças convergem formando um tendão comum plano que se insere na face superior e posterior do olécrano da ulna. Fibras profundas inserem-se na cápsula articular do cotovelo.

*Inervação:* Nervo radial (C6-C7-C8)
- Cabeça medial: ramo do nervo radial
- Cabeças longa e lateral: ramo do nervo axilar antes de perfurar o músculo

*Vascularização:* 
- Artéria braquial profunda (principal)
- Ramos das artérias ulnar superior e interóssea recorrente

*Ações:*
- Extensão do cotovelo (todas as cabeças)
- Extensão e adução do ombro (cabeça longa)
- Estabilização da articulação do cotovelo

**Músculo Ancôneo:**

Pequeno músculo triangular considerado continuação distal do tríceps.

*Origem:* Face posterior do epicôndilo lateral do úmero
*Inserção:* Face lateral do olécrano e porção proximal da face posterior da ulna
*Inervação:* Nervo radial (C7-C8)
*Ação:* Assistência na extensão do cotovelo, estabilização articular, abdução da ulna durante pronação

**Nervo Radial:**

Maior ramo terminal do plexo braquial, originando-se do fascículo posterior (C5-C6-C7-C8-T1). Seu trajeto pelo braço apresenta grande relevância clínica:

*Trajeto no Braço:*
1. Desce anterior ao tendão do subescapular e músculo redondo maior
2. Entra no compartimento posterior junto com a artéria braquial profunda
3. Passa obliquamente no sulco do nervo radial, em íntimo contato com o úmero
4. Perfura o septo intermuscular lateral aproximadamente 10cm proximal ao epicôndilo lateral
5. Passa anteriormente ao epicôndilo lateral entre o braquial e braquiorradial
6. Divide-se em ramos superficial (sensitivo) e profundo (motor) anterior à articulação radiocapitular

*Ramos no Braço:*

Ramos musculares:
- Cabeça longa do tríceps
- Cabeça lateral do tríceps
- Cabeça medial do tríceps
- Ancôneo

Ramos cutâneos:
- Nervo cutâneo posterior do braço
- Nervo cutâneo posterior do antebraço

*Importância Clínica:*

O nervo radial é o nervo mais frequentemente lesado em fraturas do úmero, particularmente:
- Fraturas do terço médio da diáfise umeral (zona do sulco espiral)
- Fraturas do úmero distal
- Compressão prolongada (síndrome de Saturday night palsy)

Lesões resultam em:
- "Mão caída" (wrist drop): incapacidade de extensão do punho e dedos
- Perda da extensão do cotovelo (se lesão proximal)
- Hipoestesia no dorso da mão (primeiro espaço interósseo)`
      },
      {
        title: 'Vascularização do Braço',
        content: `**Artéria Braquial:**

Principal artéria do braço, continuação da artéria axilar após a margem inferior do músculo redondo maior.

*Trajeto:*
- Inicia-se na margem inferior do redondo maior
- Desce medialmente ao úmero no compartimento anterior
- Coberta apenas por pele e fáscia na fossa cubital
- Termina ao nível do colo do rádio, dividindo-se em artérias radial e ulnar

*Relações Anatômicas:*

Proximal:
- Medialmente: nervo mediano e ulnar, veia basílica
- Lateralmente: nervo mediano (cruza anteriormente), tendão do bíceps
- Posteriormente: cabeça longa do tríceps

Médio:
- Anteriormente: pele, fáscia, nervo mediano (cruza de lateral para medial)
- Medialmente: nervo ulnar (até o septo intermuscular medial)
- Posteriormente: cabeça medial do tríceps, depois braquial

Distal (fossa cubital):
- Coberta apenas pela fáscia e aponeurose bicipital
- Medialmente ao tendão do bíceps
- Nervo mediano medialmente

*Ramos Principais:*

**Artéria Braquial Profunda (Profunda Brachii):**
- Maior ramo, origina-se proximalmente
- Acompanha o nervo radial no sulco espiral
- Divide-se em ramos:
  * Artéria colateral radial: desce com o nervo radial
  * Artéria colateral média: desce posteriormente ao úmero

**Artéria Ulnar Superior:**
- Origina-se próximo ao meio do braço
- Acompanha o nervo ulnar
- Anastomosa-se com artérias recorrentes ulnares

**Artéria Ulnar Inferior:**
- Origina-se logo acima da fossa cubital
- Passa anteriormente ao epicôndilo medial
- Anastomosa-se com artérias recorrentes ulnares

**Artérias Colaterais Ulnares:**
- Superior e inferior
- Participam da rede anastomótica do cotovelo

*Rede Colateral do Cotovelo:*

Importante rede anastomótica ao redor do cotovelo, permitindo circulação colateral se houver obstrução da artéria braquial:

Anterior:
- Artérias recorrentes radial e ulnar anterior
- Artéria colateral radial

Posterior:
- Artéria interóssea recorrente
- Artéria ulnar superior
- Ramos da artéria braquial profunda

**Drenagem Venosa:**

*Veias Profundas:*
- Veias braquiais (duas): acompanham a artéria braquial como veias comitantes
- Drenam para a veia axilar

*Veias Superficiais:*

**Veia Cefálica:**
- Ascende lateralmente no braço
- Cursa no sulco deltopeitoral
- Penetra a fáscia clavipeitoral
- Drena na veia axilar

**Veia Basílica:**
- Ascende medialmente no braço
- Perfura a fáscia braquial no terço médio
- Une-se às veias braquiais formando a veia axilar

**Veia Mediana Cubital:**
- Conexão entre cefálica e basílica na fossa cubital
- Local preferencial para punção venosa

*Importância Clínica:*

A aferição da pressão arterial é realizada na artéria braquial ao nível da fossa cubital, onde a artéria é superficial e facilmente compressível contra o úmero. A pulsação da artéria braquial pode ser palpada medialmente ao tendão do bíceps.`
      }
    ]
  },
  // Adicionar mais tópicos conforme necessário
];

export function getStudyContent(topicId: string): StudyContent | undefined {
  return studyContents.find(content => content.topicId === topicId);
}
