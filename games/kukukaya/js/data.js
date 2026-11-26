export const REALMS = [
  { name: 'Cosmos', emojis: ['🌕', '🔥', '🌊', '⚡', '☄️', '🌌', '🌪️', '☀️'] },
  { name: 'Vegetal', emojis: ['🍄', '🌵', '🌹', '🌿', '🌶️', '🌳', '🌻', '🧄'] },
  { name: 'Animal', emojis: ['🐕', '🦉', '🐍', '🐓', '🐐', '🦋', '🕷️', '🐟'] },
  { name: 'Humano', emojis: ['👁️', '🗡️', '🪞', '👑', '🥁', '🔑', '👞', '🍷'] },
  { name: 'Espiritual', emojis: ['💀', '🔮', '🕯️', '🧿', '🎭', '⏳', '🕸️', '🌙'] }
];

// 7 Cartas da Bruxa FIXAS com SVGs vetoriais exclusivos em estilo xilogravura
export const WITCH_CARDS = [
  {
    id: 'traicao',
    title: 'A Traição',
    word: 'MAS...',
    icon: '🗡️',
    svg: `<svg viewBox="0 0 120 120" class="w-full h-full" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <line x1="16" y1="60" x2="104" y2="60" stroke="#d4af37" stroke-width="2.5" stroke-dasharray="6 5"/>
      <path d="M60 12 L68 58 L60 108 L52 58 Z" fill="rgba(244,236,216,0.16)"/>
      <line x1="60" y1="16" x2="60" y2="102" stroke-width="2"/>
      <path d="M36 44 Q60 52 84 44" stroke="#d4af37" stroke-width="3.5"/>
      <circle cx="60" cy="24" r="5" fill="#d4af37"/>
      <path d="M55 30 L65 30 L63 44 L57 44 Z" fill="currentColor"/>
    </svg>`
  },
  {
    id: 'segredo',
    title: 'O Segredo',
    word: 'PORQUE...',
    icon: '🔑',
    svg: `<svg viewBox="0 0 120 120" class="w-full h-full" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <path d="M60 12 L60 26 M60 94 L60 108 M22 26 L32 36 M98 26 L88 36 M22 94 L32 84 M98 94 L88 84" stroke="#d4af37" stroke-width="2.4"/>
      <path d="M14 60 Q60 22 106 60 Q60 98 14 60 Z" fill="rgba(244,236,216,0.14)"/>
      <circle cx="60" cy="60" r="18" stroke="#d4af37" stroke-width="3"/>
      <circle cx="60" cy="60" r="8" fill="currentColor"/>
      <circle cx="63" cy="57" r="2.5" fill="#4a0c0e" stroke="none"/>
    </svg>`
  },
  {
    id: 'sentenca',
    title: 'A Sentença',
    word: 'PORTANTO...',
    icon: '⚖️',
    svg: `<svg viewBox="0 0 120 120" class="w-full h-full" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <line x1="60" y1="18" x2="60" y2="100" stroke="#d4af37" stroke-width="3.5"/>
      <path d="M38 100 L82 100 L72 90 L48 90 Z" fill="rgba(212,175,55,0.35)" stroke="#d4af37"/>
      <line x1="22" y1="34" x2="98" y2="34" stroke-width="3.5"/>
      <circle cx="60" cy="22" r="5" fill="#d4af37" stroke="none"/>
      <path d="M26 34 L16 66 L36 66 Z" fill="rgba(244,236,216,0.12)"/>
      <path d="M14 66 Q26 78 38 66 Z" fill="currentColor"/>
      <path d="M94 34 L84 66 L104 66 Z" fill="rgba(244,236,216,0.12)"/>
      <path d="M82 66 Q94 78 106 66 Z" fill="currentColor"/>
    </svg>`
  },
  {
    id: 'pacto',
    title: 'O Pacto',
    word: 'A NÃO SER QUE...',
    icon: '🤝',
    svg: `<svg viewBox="0 0 120 120" class="w-full h-full" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <path d="M60 12 C60 12 71 26 71 33 A11 11 0 0 1 49 33 C49 26 60 12 60 12 Z" fill="#d4af37" stroke="#f4ecd8" stroke-width="2"/>
      <path d="M30 48 L90 48 C88 74 74 82 60 82 C46 82 32 74 30 48 Z" fill="rgba(244,236,216,0.15)"/>
      <line x1="60" y1="82" x2="60" y2="102" stroke-width="3.5"/>
      <path d="M40 104 L80 104" stroke="#d4af37" stroke-width="4"/>
      <path d="M44 58 A14 14 0 0 0 76 58" stroke="#d4af37" stroke-width="2"/>
    </svg>`
  },
  {
    id: 'teimosia',
    title: 'A Teimosia',
    word: 'MESMO QUE...',
    icon: '🧱',
    svg: `<svg viewBox="0 0 120 120" class="w-full h-full" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <path d="M34 104 L42 26 L78 26 L86 104 Z" fill="rgba(244,236,216,0.14)"/>
      <path d="M38 26 L38 16 L48 16 L48 22 L56 22 L56 16 L64 16 L64 22 L72 22 L72 16 L82 16 L82 26" stroke="#d4af37" stroke-width="2.8"/>
      <path d="M62 26 L54 48 L66 60 L52 84" stroke="#d4af37" stroke-width="2.8"/>
      <line x1="22" y1="104" x2="98" y2="104" stroke-width="4"/>
    </svg>`
  },
  {
    id: 'espelho',
    title: 'O Espelho',
    word: 'ASSIM COMO...',
    icon: '🪞',
    svg: `<svg viewBox="0 0 120 120" class="w-full h-full" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <ellipse cx="60" cy="52" rx="30" ry="38" fill="rgba(244,236,216,0.12)" stroke="#d4af37" stroke-width="3.5"/>
      <ellipse cx="60" cy="52" rx="22" ry="30" stroke="currentColor" stroke-width="1.8" stroke-dasharray="4 3"/>
      <path d="M60 34 L63 44 L73 47 L63 50 L60 60 L57 50 L47 47 L57 44 Z" fill="#d4af37" stroke="none"/>
      <circle cx="50" cy="64" r="2.5" fill="currentColor" stroke="none"/>
      <circle cx="70" cy="60" r="2" fill="currentColor" stroke="none"/>
      <line x1="60" y1="90" x2="60" y2="108" stroke="#d4af37" stroke-width="4"/>
      <path d="M48 108 L72 108" stroke="#d4af37" stroke-width="3"/>
    </svg>`
  },
  {
    id: 'exagero',
    title: 'O Exagero',
    word: 'TANTO QUE...',
    icon: '🔥',
    svg: `<svg viewBox="0 0 120 120" class="w-full h-full" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <path d="M60 12 C74 34  94 48 92 74 C90 94 76 106 60 106 C44 106 30 94 28 74 C26 52 44 40 50 26 C52 36 56 40 60 12 Z" fill="rgba(244,236,216,0.16)" stroke="#f4ecd8" stroke-width="3"/>
      <path d="M60 44 C70 58 76 68 74 82 C72 92 66 98 60 98 C54 98 48 92 46 82 C44 70 54 60 60 44 Z" fill="rgba(212,175,55,0.45)" stroke="#d4af37" stroke-width="2.5"/>
      <path d="M18 46 L26 50 L36 54 L46 50 L36 46 L26 42 Z" fill="currentColor"/>
      <path d="M94 46 L86 50 L76 54 L66 50 L76 46 L86 42 Z" fill="currentColor"/>
    </svg>`
  }
];

// 8 Selos do Destino para a Carta III (Fundo Pergaminho, Tinta Preta/Sépia Xilogravura)
export const DESTINY_SEALS = [
  {
    id: 'bobo',
    title: 'O Bobo',
    icon: '🤡',
    svg: `<svg viewBox="0 0 120 120" class="w-full h-full" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 52 Q36 16 60 42 Q84 16 98 52 Q78 46 60 56 Q42 46 22 52 Z" fill="rgba(22,18,16,0.12)"/>
      <circle cx="20" cy="54" r="5" fill="currentColor"/>
      <circle cx="100" cy="54" r="5" fill="currentColor"/>
      <circle cx="60" cy="24" r="5" fill="currentColor"/>
      <path d="M60 42 L60 28"/>
      <circle cx="60" cy="76" r="24"/>
      <path d="M48 72 L53 72 M67 72 L72 72" stroke-width="3.5"/>
      <path d="M47 84 Q60 95 73 84" stroke-width="3"/>
    </svg>`
  },
  {
    id: 'caveira',
    title: 'A Caveira',
    icon: '💀',
    svg: `<svg viewBox="0 0 120 120" class="w-full h-full" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M28 56 C28 32 42 18 60 18 C78 18 92 32 92 56 C92 70 84 78 78 82 L78 96 L42 96 L42 82 C36 78 28 70 28 56 Z" fill="rgba(22,18,16,0.08)"/>
      <circle cx="46" cy="56" r="9" fill="currentColor"/>
      <circle cx="74" cy="56" r="9" fill="currentColor"/>
      <path d="M60 66 L55 76 L65 76 Z" fill="currentColor"/>
      <path d="M50 86 L50 96 M60 86 L60 96 M70 86 L70 96"/>
    </svg>`
  },
  {
    id: 'coroa',
    title: 'A Coroa',
    icon: '👑',
    svg: `<svg viewBox="0 0 120 120" class="w-full h-full" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 84 L26 36 L48 58 L60 26 L72 58 L94 36 L102 84 Z" fill="rgba(22,18,16,0.12)"/>
      <rect x="20" y="84" width="80" height="12" rx="3" fill="currentColor"/>
      <circle cx="26" cy="30" r="4" fill="currentColor"/>
      <circle cx="60" cy="20" r="5" fill="currentColor"/>
      <circle cx="94" cy="30" r="4" fill="currentColor"/>
      <circle cx="60" cy="68" r="5"/>
    </svg>`
  },
  {
    id: 'serpente',
    title: 'A Serpente',
    icon: '🐍',
    svg: `<svg viewBox="0 0 120 120" class="w-full h-full" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M60 20 C84 20 88 40 60 50 C32 60 36 80 64 86 C82 90 86 102 60 104"/>
      <ellipse cx="52" cy="22" rx="10" ry="7" fill="currentColor"/>
      <path d="M40 22 L30 18 M40 22 L30 26" stroke-width="2.5"/>
      <circle cx="50" cy="20" r="1.8" fill="#f4ecd8" stroke="none"/>
    </svg>`
  },
  {
    id: 'ouro',
    title: 'O Ouro',
    icon: '💰',
    svg: `<svg viewBox="0 0 120 120" class="w-full h-full" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="60" cy="60" r="38" fill="rgba(22,18,16,0.08)"/>
      <circle cx="60" cy="60" r="30" stroke-dasharray="5 4" stroke-width="2"/>
      <path d="M60 34 L60 86 M70 46 C70 40 50 40 50 48 C50 58 72 58 72 70 C72 78 50 80 48 72" stroke-width="4"/>
    </svg>`
  },
  {
    id: 'amor',
    title: 'A Chama',
    icon: '❤️‍🔥',
    svg: `<svg viewBox="0 0 120 120" class="w-full h-full" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M60 98 C60 98 20 74 20 46 C20 30 34 22 46 28 C53 31 58 38 60 44 C62 38 67 31 74 28 C86 22 100 30 100 46 C100 74 60 98 60 98 Z" fill="rgba(22,18,16,0.12)"/>
      <path d="M60 30 C64 20 70 16 66 10 M54 26 C50 18 54 12 50 10" stroke-width="2.5"/>
      <path d="M46 56 L74 56 M60 44 L60 76" stroke-width="2.2"/>
    </svg>`
  },
  {
    id: 'lua',
    title: 'A Lua',
    icon: '🌙',
    svg: `<svg viewBox="0 0 120 120" class="w-full h-full" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M72 22 A38 38 0 1 0 72 98 A28 28 0 1 1 72 22 Z" fill="rgba(22,18,16,0.14)"/>
      <path d="M78 44 L81 52 L89 55 L81 58 L78 66 L75 58 L67 55 L75 52 Z" fill="currentColor" stroke="none"/>
      <circle cx="88" cy="34" r="3" fill="currentColor" stroke="none"/>
      <circle cx="88" cy="78" r="2.5" fill="currentColor" stroke="none"/>
    </svg>`
  },
  {
    id: 'galo',
    title: 'O Galo',
    icon: '🐓',
    svg: `<svg viewBox="0 0 120 120" class="w-full h-full" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M44 34 C44 22 54 18 58 26 C62 18 72 22 70 32" fill="rgba(22,18,16,0.18)"/>
      <path d="M48 36 C36 42 36 62 46 74 C56 84 78 84 86 68 C94 52 88 38 78 42 C72 44 68 50 62 50 C58 42 56 36 48 36 Z" fill="rgba(22,18,16,0.1)"/>
      <path d="M36 46 L26 50 L36 54" fill="currentColor"/>
      <circle cx="46" cy="46" r="2.5" fill="currentColor" stroke="none"/>
      <path d="M56 82 L52 102 M70 80 L74 102 M44 102 L60 102 M66 102 L82 102"/>
    </svg>`
  }
];

export const SECRET_QUESTIONS = [
  'Vou ficar rico esse ano?',
  'Por que eu ainda estou solteiro?',
  'O que vai acontecer no meu próximo rolê?',
  'Qual é o meu maior defeito oculto?',
  'Devo mandar mensagem para quem estou pensando?',
  'O que meus amigos falam de mim quando eu saio da sala?',
  'Qual vai ser o maior perrengue do meu mês?',
  'Meu chefe realmente gosta de mim?',
  'Vou finalmente conseguir dormir cedo hoje?',
  'O que o universo está escondendo de mim?',
  'Qual vai ser o motivo da minha próxima vergonha pública?',
  'Devo aceitar aquele convite suspeito?',
  'O que aconteceu na minha vida passada?',
  'Quando é que a minha sorte no amor vai virar?',
  'Vou pagar todos os boletos sem chorar?',
  'Qual talento secreto eu ainda não descobri?',
  'Quem nesta sala seria o primeiro a me trair num apocalipse?',
  'Devo mudar de cidade e sumir do mapa?',
  'O que o destino reservou para o meu fim de semana?',
  'Por que tudo dá errado bem na minha vez?',
  'Vou viralizar na internet este ano?',
  'Qual é a verdadeira razão do meu cansaço?'
];

export const BOT_NAMES = ['Dona Zefa', 'Chico Lua', 'Severina', 'Mestre Galo'];
export const BOT_CARD_NAMES = [
  'O Cachorro em Brasa', 'O Olho Cogumelo', 'A Faca na Maré', 'O Espelho da Morte',
  'O Galo da Meia-Noite', 'A Vela do Bode', 'A Coroa de Pimenta', 'O Tambor Fantasma'
];
export const BOT_STARTS = [
  'Essa criatura entrou correndo na sala derrubando o café',
  'Um presságio apareceu no meio da tua janta de terça-feira',
  'Você tentou esconder esse segredo debaixo do colchão',
  'O universo mandou um sinal claro bem na hora do boleto',
  'Uma voz misteriosa sussurrou teu nome no ponto de ônibus',
  'O destino bateu na tua porta usando chinelo trocado'
];
export const BOT_ENDS = [
  'a maré devolveu tudo e ainda levou teu último neurônio.',
  'nem a própria Bruxa teve coragem de provar esse tempero.',
  'você jogue um balde de água fria no vizinho antes da meia-noite.',
  'o espelho rachou de puro desgosto com a tua cara.',
  'todo mundo na sala já sabia disso desde o carnaval passado.',
  'até o Wi-Fi caiu de vergonha alheia na mesma hora.'
];
