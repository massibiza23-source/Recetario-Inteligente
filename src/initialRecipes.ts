import { Recipe } from './types';

export const INITIAL_RECIPES: Recipe[] = [
  {
    id: 'rec-1',
    title: 'Pasta al Limone con Ajo Confitado y Parmigiano',
    description: 'Receta cremosa y fresca italiana con emulsión de limón, mantequilla dorada y queso Parmigiano-Reggiano curado.',
    sourceUrl: 'https://www.youtube.com/watch?v=3AAdEl33DyM',
    videoUrl: 'https://www.youtube.com/watch?v=3AAdEl33DyM',
    sourcePlatform: 'youtube',
    author: 'Chef Marco Bellini',
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    totalTimeMinutes: 25,
    servings: 4,
    category: 'Almuerzo/Cena',
    difficulty: 'Fácil',
    imageUrl: 'https://img.youtube.com/vi/3AAdEl33DyM/hqdefault.jpg',
    tags: ['Pasta', 'Italiana', 'Rápida', 'Video YouTube'],
    createdAt: new Date().toISOString(),
    ingredients: [
      { id: 'i-1', item: 'Spaghetti o Linguine de trigo duro', amount: 400, unit: 'g', notes: 'calidad bronce' },
      { id: 'i-2', item: 'Limones eureka amarillos', amount: 2, unit: 'unidad', notes: 'ralladura fina y zumo' },
      { id: 'i-3', item: 'Mantequilla sin sal', amount: 60, unit: 'g', notes: 'cortada en cubos fríos' },
      { id: 'i-4', item: 'Queso Parmigiano-Reggiano', amount: 80, unit: 'g', notes: 'rallado muy fino al momento' },
      { id: 'i-5', item: 'Dientes de ajo', amount: 3, unit: 'unidad', notes: 'laminados finamente' },
      { id: 'i-6', item: 'Aceite de oliva virgen extra', amount: 30, unit: 'ml' },
      { id: 'i-7', item: 'Pimienta negra recién molida', amount: 1, unit: 'cda', notes: 'tostada ligeramente' },
      { id: 'i-8', item: 'Sal marina gruesa', amount: 15, unit: 'g', notes: 'para el agua de cocción' }
    ],
    instructions: [
      {
        id: 's-1',
        stepNumber: 1,
        instruction: 'Hervir 3 litros de agua en una olla grande y agregar la sal marina. Cocinar la pasta 2 minutos menos de lo indicado por el fabricante para terminarla en la salsa.',
        tip: 'El agua de cocción con almidón es el secreto de la emulsión perfecta.'
      },
      {
        id: 's-2',
        stepNumber: 2,
        instruction: 'En una sartén grande, dorar el ajo laminado a fuego muy bajo en el aceite de oliva. Agregar la mantequilla en cubos y la ralladura de limón sin dejar que se queme.',
        tip: 'La ralladura solo debe incluir la parte amarilla, la blanca aporta amargor indeseado.'
      },
      {
        id: 's-3',
        stepNumber: 3,
        instruction: 'Transferir la pasta directamente a la sartén junto con un cazo generoso de agua de cocción hirviendo. Remover enérgicamente para formar una crema brillante.',
        tip: 'Mantén el movimiento circular constante para emulsionar grasa y almidón.'
      },
      {
        id: 's-4',
        stepNumber: 4,
        instruction: 'Retirar del fuego, incorporar el zumo de limón y el Parmigiano-Reggiano espolvoreado en lluvia, mezclando sin parar.',
        tip: 'Nunca agregues el queso con el fuego encendido para evitar que se separe o forme grumos.'
      }
    ]
  },
  {
    id: 'rec-2',
    title: 'Tostada Nórdica de Salmón Ahumado y Huevo Poché',
    description: 'Desayuno gourmet con base crujiente de masa madre, crema sedosa de aguacate, láminas de salmón salvaje y huevo poché en su punto.',
    sourceUrl: 'https://www.youtube.com/watch?v=j_i3-h7c-6s',
    videoUrl: 'https://www.youtube.com/watch?v=j_i3-h7c-6s',
    sourcePlatform: 'youtube',
    author: 'Nordic Kitchen Lab',
    prepTimeMinutes: 10,
    cookTimeMinutes: 5,
    totalTimeMinutes: 15,
    servings: 2,
    category: 'Desayuno',
    difficulty: 'Fácil',
    imageUrl: 'https://img.youtube.com/vi/j_i3-h7c-6s/hqdefault.jpg',
    tags: ['Desayuno', 'Saludable', 'Salmón', 'Video YouTube'],
    createdAt: new Date().toISOString(),
    ingredients: [
      { id: 'i-20', item: 'Rebanadas de pan de masa madre', amount: 2, unit: 'unidad', notes: 'grosor de 2 cm' },
      { id: 'i-21', item: 'Aguacate maduro', amount: 1, unit: 'unidad', notes: 'machacado con tenedor' },
      { id: 'i-22', item: 'Salmón ahumado salvaje', amount: 120, unit: 'g' },
      { id: 'i-23', item: 'Huevos de campo', amount: 2, unit: 'unidad', notes: 'muy frescos para pochar' },
      { id: 'i-24', item: 'Eneldo fresco', amount: 5, unit: 'g', notes: 'deshojado' },
      { id: 'i-25', item: 'Semillas de sésamo tostado y copos de chile', amount: 1, unit: 'cda' }
    ],
    instructions: [
      {
        id: 's-21',
        stepNumber: 1,
        instruction: 'Tostar las rebanadas de masa madre en plancha o sartén de hierro con unas gotas de aceite de oliva hasta que queden crujientes por fuera y tiernas por dentro.',
        tip: 'Frotar un diente de ajo crudo sobre el pan tostado caliente aporta un toque rústico sutil.'
      },
      {
        id: 's-22',
        stepNumber: 2,
        instruction: 'Pochar los huevos en agua a 90°C con un chorrito de vinagre durante 3 minutos y transferir a papel absorbente.',
        tip: 'Crear un suave remolino en el agua antes de verter el huevo ayuda a que la clara envuelva la yema.'
      },
      {
        id: 's-23',
        stepNumber: 3,
        instruction: 'Montar sobre el pan la crema de aguacate condimentada, doblar las láminas de salmón ahumado, coronar con el huevo poché, sésamo y ramitas de eneldo.',
        tip: 'Terminar con sal en escamas y pimienta negra recién molida al momento de servir.'
      }
    ]
  },
  {
    id: 'rec-3',
    title: 'Focaccia Genovesa Crujiente al Romero y Aceite de Oliva',
    description: 'Masa fermentada italiana con alveolos profundos, emulsión de salmuera salina, romero fresco y dorado crujiente en horno de piedra.',
    sourceUrl: 'https://www.youtube.com/watch?v=e_t5l3dYV7k',
    videoUrl: 'https://www.youtube.com/watch?v=e_t5l3dYV7k',
    sourcePlatform: 'youtube',
    author: 'Panadería Artesanal',
    prepTimeMinutes: 20,
    cookTimeMinutes: 25,
    totalTimeMinutes: 45,
    servings: 6,
    category: 'Panadería',
    difficulty: 'Media',
    imageUrl: 'https://img.youtube.com/vi/e_t5l3dYV7k/hqdefault.jpg',
    tags: ['Panadería', 'Italiana', 'Masa Madre', 'Video'],
    createdAt: new Date().toISOString(),
    ingredients: [
      { id: 'i-31', item: 'Harina de trigo de fuerza', amount: 500, unit: 'g' },
      { id: 'i-32', item: 'Agua tibia filtrada', amount: 380, unit: 'ml', notes: '76% de hidratación' },
      { id: 'i-33', item: 'Levadura fresca o seca', amount: 5, unit: 'g' },
      { id: 'i-34', item: 'Aceite de oliva virgen extra', amount: 50, unit: 'ml' },
      { id: 'i-35', item: 'Romero fresco en ramas', amount: 15, unit: 'g' },
      { id: 'i-36', item: 'Sal marina en escamas tipo Maldon', amount: 8, unit: 'g' }
    ],
    instructions: [
      {
        id: 's-31',
        stepNumber: 1,
        instruction: 'Mezclar harina, agua y levadura. Realizar pliegues cada 30 minutos durante 2 horas para desarrollar la red de gluten.',
        tip: 'Humedece tus manos con agua para manipular la masa sin que se pegue.'
      },
      {
        id: 's-32',
        stepNumber: 2,
        instruction: 'Verter abundante aceite de oliva en la bandeja y estirar suavemente la masa con las yemas de los dedos creando los clásicos hoyuelos.',
        tip: 'Presiona con firmeza hasta tocar el fondo de la bandeja sin romper la masa.'
      },
      {
        id: 's-33',
        stepNumber: 3,
        instruction: 'Bañar con una salmuera de agua y aceite, esparcir las ramas de romero y la sal en escamas. Hornear a 220°C durante 22 minutos.',
        tip: 'Pinta con más aceite virgen extra justo al sacarla del horno para lograr un brillo inigualable.'
      }
    ]
  }
];
