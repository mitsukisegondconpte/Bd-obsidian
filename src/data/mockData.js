// Données mockées — à remplacer par des appels API quand le backend sera prêt.
// Les visuels (couvertures, bannières, avatars, planches) sont générés
// localement en SVG (voir utils/placeholders.js) pour ne dépendre d'aucune
// image externe — à remplacer par les vrais assets une fois disponibles.

import { avatarPlaceholder, bannerPlaceholder, coverPlaceholder, pagePlaceholder } from '../utils/placeholders'

export const genres = [
  'Action',
  'Romance',
  'Fantastique',
  'Horreur',
  'Drame',
  'Comédie',
  'Tranche de vie',
  'Historique',
]

export const authors = [
  {
    id: 'auth-1',
    name: 'Naïka Joseph',
    handle: '@naikadraws',
    avatar: avatarPlaceholder({ seed: 'auth-1', name: 'Naïka Joseph' }),
    banner: bannerPlaceholder({ seed: 'auth-1-banner', title: 'Naïka Joseph' }),
    bio: "Illustratrice basée à Port-au-Prince. Je raconte des histoires de fantômes et de familles depuis 2019. Café obligatoire avant chaque planche.",
    followers: 18400,
    verified: true,
    seriesIds: ['s1', 's4'],
  },
  {
    id: 'auth-2',
    name: 'Ricardo Dumé',
    handle: '@dume_art',
    avatar: avatarPlaceholder({ seed: 'auth-2', name: 'Ricardo Dumé' }),
    banner: bannerPlaceholder({ seed: 'auth-2-banner', title: 'Ricardo Dumé' }),
    bio: "Auteur-dessinateur. Ancien étudiant en architecture, aujourd'hui je dessine des villes qui n'existent pas.",
    followers: 9200,
    verified: true,
    seriesIds: ['s2'],
  },
  {
    id: 'auth-3',
    name: 'Fabiola R.',
    handle: '@fabiolar',
    avatar: avatarPlaceholder({ seed: 'auth-3', name: 'Fabiola R.' }),
    banner: bannerPlaceholder({ seed: 'auth-3-banner', title: 'Fabiola R.' }),
    bio: 'Deux séries en cours, zéro sommeil. DM ouverts pour collabs.',
    followers: 5100,
    verified: false,
    seriesIds: ['s3', 's5'],
  },
  {
    id: 'auth-4',
    name: 'Jean Metellus Jr.',
    handle: '@jmetellus',
    avatar: avatarPlaceholder({ seed: 'auth-4', name: 'Jean Metellus Jr.' }),
    banner: bannerPlaceholder({ seed: 'auth-4-banner', title: 'Jean Metellus Jr.' }),
    bio: "Passionné d'histoire haïtienne, je transforme nos légendes en BD.",
    followers: 12800,
    verified: true,
    seriesIds: ['s6'],
  },
]

export const series = [
  {
    id: 's1',
    title: 'Lame de Bohio',
    slug: 'lame-de-bohio',
    cover: coverPlaceholder({ seed: 's1', title: 'Lame de Bohio' }),
    banner: bannerPlaceholder({ seed: 's1-banner', title: 'Lame de Bohio' }),
    authorId: 'auth-1',
    genres: ['Fantastique', 'Action'],
    status: 'En cours',
    rating: 4.8,
    subscribers: 24100,
    views: 1_240_000,
    isNew: false,
    isHot: true,
    summary:
      "Après la chute du dernier royaume taïno, une jeune guerrière hérite d'une lame capable de parler aux esprits. Pour venger son village, elle devra traverser un monde où les colons et les zombis ancestraux se disputent la même terre.",
    updateDay: 'Vendredi',
    chapters: [
      { id: 's1c1', number: 1, title: 'La lame qui chuchote', free: true, publishedAt: '2025-11-02', pages: 18, comments: 42, likes: 512 },
      { id: 's1c2', number: 2, title: 'Cendres de Yaguana', free: true, publishedAt: '2025-11-09', pages: 20, comments: 31, likes: 468 },
      { id: 's1c3', number: 3, title: 'Le pacte du morne', free: true, publishedAt: '2025-11-16', pages: 19, comments: 27, likes: 401 },
      { id: 's1c4', number: 4, title: 'Sang et sel', free: false, price: 25, publishedAt: '2025-11-23', pages: 22, comments: 19, likes: 355 },
      { id: 's1c5', number: 5, title: "L'appel des Cemis", free: false, price: 25, publishedAt: '2025-11-30', pages: 21, comments: 8, likes: 210 },
    ],
  },
  {
    id: 's2',
    title: 'Néon Karayib',
    slug: 'neon-karayib',
    cover: coverPlaceholder({ seed: 's2', title: 'Néon Karayib' }),
    banner: bannerPlaceholder({ seed: 's2-banner', title: 'Néon Karayib' }),
    authorId: 'auth-2',
    genres: ['Action', 'Drame'],
    status: 'En cours',
    rating: 4.6,
    subscribers: 15300,
    views: 860_000,
    isNew: false,
    isHot: true,
    summary:
      "2099. Port-au-Prince est devenue une mégapole flottante gouvernée par des cartels de données. Un livreur à moto va découvrir qu'il transporte bien plus que des colis.",
    updateDay: 'Mardi',
    chapters: [
      { id: 's2c1', number: 1, title: 'Livraison 04:12', free: true, publishedAt: '2025-10-14', pages: 24, comments: 88, likes: 902 },
      { id: 's2c2', number: 2, title: 'Le colis qui respire', free: true, publishedAt: '2025-10-21', pages: 23, comments: 71, likes: 845 },
      { id: 's2c3', number: 3, title: 'Zone franche', free: false, price: 20, publishedAt: '2025-10-28', pages: 25, comments: 40, likes: 620 },
    ],
  },
  {
    id: 's3',
    title: 'Doux Vertige',
    slug: 'doux-vertige',
    cover: coverPlaceholder({ seed: 's3', title: 'Doux Vertige' }),
    banner: bannerPlaceholder({ seed: 's3-banner', title: 'Doux Vertige' }),
    authorId: 'auth-3',
    genres: ['Romance', 'Tranche de vie'],
    status: 'En cours',
    rating: 4.9,
    subscribers: 31200,
    views: 2_010_000,
    isNew: false,
    isHot: true,
    summary:
      "Mika revient à Jacmel après dix ans d'absence pour reprendre le café de sa grand-mère. Elle n'imaginait pas y retrouver son premier amour... devenu son nouveau voisin.",
    updateDay: 'Dimanche',
    chapters: [
      { id: 's3c1', number: 1, title: 'Retour à Jacmel', free: true, publishedAt: '2025-09-07', pages: 16, comments: 120, likes: 1400 },
      { id: 's3c2', number: 2, title: 'Le café ferme à 18h', free: true, publishedAt: '2025-09-14', pages: 17, comments: 98, likes: 1210 },
      { id: 's3c3', number: 3, title: 'Un parapluie pour deux', free: true, publishedAt: '2025-09-21', pages: 18, comments: 140, likes: 1590 },
      { id: 's3c4', number: 4, title: 'Vertige', free: false, price: 15, publishedAt: '2025-09-28', pages: 19, comments: 60, likes: 980 },
    ],
  },
  {
    id: 's4',
    title: 'Les Carnets de Manman Dlo',
    slug: 'carnets-manman-dlo',
    cover: coverPlaceholder({ seed: 's4', title: 'Les Carnets de Manman Dlo' }),
    banner: bannerPlaceholder({ seed: 's4-banner', title: 'Les Carnets de Manman Dlo' }),
    authorId: 'auth-1',
    genres: ['Horreur', 'Fantastique'],
    status: 'En pause',
    rating: 4.5,
    subscribers: 8700,
    views: 410_000,
    isNew: true,
    isHot: false,
    summary:
      'Anthologie de contes courts inspirés du folklore haïtien. Chaque chapitre raconte une rencontre différente avec les esprits des rivières et des mornes.',
    updateDay: 'Irrégulier',
    chapters: [
      { id: 's4c1', number: 1, title: "L'appel de la rivière", free: true, publishedAt: '2026-01-05', pages: 12, comments: 15, likes: 205 },
      { id: 's4c2', number: 2, title: 'Le peigne perdu', free: true, publishedAt: '2026-01-12', pages: 14, comments: 9, likes: 168 },
    ],
  },
  {
    id: 's5',
    title: 'Ring Libre',
    slug: 'ring-libre',
    cover: coverPlaceholder({ seed: 's5', title: 'Ring Libre' }),
    banner: bannerPlaceholder({ seed: 's5-banner', title: 'Ring Libre' }),
    authorId: 'auth-3',
    genres: ['Drame', 'Comédie'],
    status: 'En cours',
    rating: 4.3,
    subscribers: 6400,
    views: 190_000,
    isNew: true,
    isHot: false,
    summary:
      "Trois amies d'enfance montent un club de boxe féminin dans leur quartier, contre l'avis de tout le monde — surtout celui de leurs mères.",
    updateDay: 'Mercredi',
    chapters: [
      { id: 's5c1', number: 1, title: 'Le premier crochet', free: true, publishedAt: '2026-02-01', pages: 15, comments: 22, likes: 310 },
      { id: 's5c2', number: 2, title: "Manman pa dako", free: true, publishedAt: '2026-02-08', pages: 16, comments: 18, likes: 275 },
    ],
  },
  {
    id: 's6',
    title: 'Anacaona, Reine de Xaragua',
    slug: 'anacaona-reine-de-xaragua',
    cover: coverPlaceholder({ seed: 's6', title: 'Anacaona, Reine de Xaragua' }),
    banner: bannerPlaceholder({ seed: 's6-banner', title: 'Anacaona, Reine de Xaragua' }),
    authorId: 'auth-4',
    genres: ['Historique', 'Drame'],
    status: 'Terminé',
    rating: 4.9,
    subscribers: 42000,
    views: 3_400_000,
    isNew: false,
    isHot: true,
    summary:
      "L'histoire de la cacique Anacaona, poétesse et stratège, dont le règne a marqué l'un des chapitres les plus importants de l'histoire de l'île.",
    updateDay: 'Terminé',
    chapters: [
      { id: 's6c1', number: 1, title: 'La fille de Yaguana', free: true, publishedAt: '2024-03-01', pages: 20, comments: 210, likes: 3100 },
      { id: 's6c2', number: 2, title: 'Le collier de cotton', free: true, publishedAt: '2024-03-08', pages: 21, comments: 180, likes: 2800 },
      { id: 's6c3', number: 3, title: 'Xaragua', free: false, price: 25, publishedAt: '2024-03-15', pages: 22, comments: 150, likes: 2500 },
    ],
  },
]

// Pages de lecture : gabarits générés localement (voir pagePlaceholder),
// en attendant le vrai contenu de l'auteur.
export function getChapterPages(chapterId, count) {
  return Array.from({ length: count }, (_, i) => ({
    id: `${chapterId}-p${i + 1}`,
    url: pagePlaceholder({ seed: chapterId, page: i + 1, total: count }),
  }))
}

export const comments = {
  s1c1: [
    { id: 'c1', user: 'ti_rara', avatar: avatarPlaceholder({ seed: 'ti_rara', name: 'TR' }), text: "Le trait sur la dernière planche m'a tué, quelle ambiance 🔥", likes: 34, time: 'il y a 2h' },
    { id: 'c2', user: 'josie.k', avatar: avatarPlaceholder({ seed: 'josie.k', name: 'JK' }), text: 'Enfin une BD qui parle de nous. Abonnée direct.', likes: 21, time: 'il y a 5h' },
    { id: 'c3', user: 'marc_o', avatar: avatarPlaceholder({ seed: 'marc_o', name: 'MO' }), text: 'Le prochain chapitre sort quand exactement ?', likes: 4, time: 'il y a 1j' },
  ],
}

export function findSeriesBySlug(slug) {
  return series.find((s) => s.slug === slug)
}

export function findSeriesById(id) {
  return series.find((s) => s.id === id)
}

export function findAuthorById(id) {
  return authors.find((a) => a.id === id)
}

export function findChapter(seriesId, chapterId) {
  const s = findSeriesById(seriesId)
  return s?.chapters.find((c) => c.id === chapterId)
}

export const currentUser = {
  id: 'me',
  name: 'Toi',
  avatar: avatarPlaceholder({ seed: 'me', name: 'Toi' }),
}
