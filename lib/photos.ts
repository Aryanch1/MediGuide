import type { ImageSourcePropType } from 'react-native';

import type { Explanation, MedicineCategory } from './types';

/**
 * Bundled medicine photography — one soft, mint-styled photo per
 * medicine form. Explanations arrive as AI text with no imagery of
 * their own, so a photo is picked by keyword matching over the medicine
 * name, label text and category. The tablets shot is the fallback.
 */

export const HERO_PHOTO: ImageSourcePropType = require('../assets/meds/hero.jpg');

export const PHOTOS: Record<MedicineCategory, ImageSourcePropType> = {
  tablets: require('../assets/meds/tablets.jpg') as ImageSourcePropType,
  liquid: require('../assets/meds/liquid.jpg') as ImageSourcePropType,
  cream: require('../assets/meds/cream.jpg') as ImageSourcePropType,
  inhaler: require('../assets/meds/inhaler.jpg') as ImageSourcePropType,
  vitamins: require('../assets/meds/vitamins.jpg') as ImageSourcePropType,
  other: require('../assets/meds/tablets.jpg') as ImageSourcePropType,
};

const RULES: { key: MedicineCategory; words: string[] }[] = [
  {
    key: 'inhaler',
    words: ['inhaler', 'salbutamol', 'ventolin', 'albuterol', 'puff', 'budesonide', 'fluticasone'],
  },
  {
    key: 'liquid',
    words: ['syrup', 'suspension', 'drops', 'liquid', 'solution', 'ml', 'elixir', 'eye drop'],
  },
  {
    key: 'cream',
    words: ['cream', 'ointment', 'gel', 'lotion', 'topical', 'apply to skin'],
  },
  {
    key: 'vitamins',
    words: ['vitamin', 'supplement', 'calcium', 'iron tablet', 'zinc', 'omega', 'multivitamin'],
  },
  {
    key: 'tablets',
    words: ['tablet', 'capsule', 'pill', 'mg'],
  },
];

function pickFrom(text: string): MedicineCategory | null {
  const hay = text.toLowerCase();
  for (const rule of RULES) {
    if (rule.words.some((word) => hay.includes(word))) return rule.key;
  }
  return null;
}

/** The bundled photo that best matches an explanation. */
export function getMedicinePhoto(explanation: Explanation): ImageSourcePropType {
  const headline = `${explanation.medicineName} ${explanation.labelText}`;
  return PHOTOS[pickFrom(headline) ?? explanation.category ?? 'other'];
}

/** Category label shown on cards. */
export const CATEGORY_LABELS: Record<MedicineCategory, string> = {
  tablets: 'Tablets & capsules',
  liquid: 'Liquid & drops',
  cream: 'Creams & ointments',
  inhaler: 'Inhalers',
  vitamins: 'Vitamins',
  other: 'Medicine',
};
