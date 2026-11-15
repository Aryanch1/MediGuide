import type { Explanation, MedicineCategory } from './types';

/**
 * On-device demo library — curated plain-language explanations for
 * common medicines, used when no backend is configured (demo mode) and
 * as the fallback if the live AI endpoint cannot be reached. These are
 * general information only, never a substitute for a doctor's advice.
 * The disclaimer is shown on every explanation screen.
 */

export const DISCLAIMER =
  'Not medical advice — ask your doctor or pharmacist. This is general information only.';

interface DemoEntry {
  names: string[];
  medicineName: string;
  category: MedicineCategory;
  purpose: string;
  howToTake: string;
  warnings: string[];
  schedule: string[];
  dose: string;
}

const DEMO_LIBRARY: DemoEntry[] = [
  {
    names: ['amoxicillin', 'amoxil'],
    medicineName: 'Amoxicillin 500 mg',
    category: 'tablets',
    purpose:
      'An antibiotic. It kills the bacteria that cause infections like ear, chest, throat and urinary infections.',
    howToTake:
      'Take 1 capsule 3 times a day, spaced through the day. Swallow it with a glass of water. You can take it with or without food. Finish the whole course, even if you feel better — stopping early can let the infection come back.',
    warnings: [
      'Tell your doctor if you are allergic to penicillin.',
      'Some people get a rash, nausea or loose stools.',
      'If you get swelling, trouble breathing or a severe rash, get urgent help.',
    ],
    schedule: ['08:00', '14:00', '20:00'],
    dose: '1 capsule',
  },
  {
    names: ['paracetamol', 'acetaminophen', 'tylenol', 'panadol'],
    medicineName: 'Paracetamol 500 mg',
    category: 'tablets',
    purpose:
      'A painkiller that also lowers fever. It helps with headaches, muscle pain, toothache and colds.',
    howToTake:
      'Take 1–2 tablets every 4–6 hours when you need it, with water. Do not take more than 8 tablets in 24 hours, and check other medicines you take — many cold remedies already contain paracetamol.',
    warnings: [
      'Taking too much can seriously damage your liver.',
      'Avoid alcohol while you are taking it regularly.',
      'If pain or fever lasts more than 3 days, talk to a pharmacist or doctor.',
    ],
    schedule: ['08:00', '14:00', '20:00'],
    dose: '1–2 tablets',
  },
  {
    names: ['metformin', 'glucophage'],
    medicineName: 'Metformin 500 mg',
    category: 'tablets',
    purpose:
      'It helps control blood sugar in type 2 diabetes by helping your body use insulin better and making less sugar in the liver.',
    howToTake:
      'Take 1 tablet 2 times a day with meals — morning and evening. Swallow it whole with water. Taking it with food helps avoid stomach upset.',
    warnings: [
      'It can cause nausea or loose stools at first; this usually settles.',
      'Tell your doctor before any scan with contrast dye or surgery.',
      'Do not drink a lot of alcohol while taking it.',
    ],
    schedule: ['08:00', '20:00'],
    dose: '1 tablet',
  },
  {
    names: ['atorvastatin', 'lipitor'],
    medicineName: 'Atorvastatin 10 mg',
    category: 'tablets',
    purpose:
      'It lowers "bad" cholesterol in the blood, which helps prevent heart attacks and strokes.',
    howToTake:
      'Take 1 tablet once a day at the same time each day. You can take it with or without food. Keep taking it even if you feel fine — it works quietly over time.',
    warnings: [
      'Tell your doctor about any unexplained muscle pain or weakness.',
      'Avoid large amounts of grapefruit juice.',
      'Tell your doctor about every other medicine you take.',
    ],
    schedule: ['21:00'],
    dose: '1 tablet',
  },
  {
    names: ['salbutamol', 'ventolin', 'albuterol'],
    medicineName: 'Salbutamol inhaler 100 mcg',
    category: 'inhaler',
    purpose:
      'A reliever inhaler. It opens the airways quickly when you are wheezing, short of breath or coughing from asthma.',
    howToTake:
      'Take 1–2 puffs when you need it. Shake the inhaler, breathe out, put it in your mouth, press once as you breathe in slowly, then hold your breath for about 10 seconds. Wait 30 seconds between puffs.',
    warnings: [
      'It is for quick relief, not for daily prevention.',
      'If you need it more than 3 times a week, tell your doctor — your asthma may not be controlled.',
      'A fast heartbeat or shaky hands after a puff usually settles quickly.',
    ],
    schedule: ['08:00'],
    dose: '1–2 puffs',
  },
  {
    names: ['cetirizine', 'zyrtec'],
    medicineName: 'Cetirizine 10 mg',
    category: 'tablets',
    purpose:
      'An antihistamine. It calms allergy symptoms like sneezing, a runny nose, itchy eyes and hives.',
    howToTake:
      'Take 1 tablet once a day, at the same time each day. You can take it with or without food.',
    warnings: [
      'It can make some people drowsy — be careful driving until you know how it affects you.',
      'Avoid alcohol while taking it.',
      'Tell your doctor if you have kidney problems.',
    ],
    schedule: ['08:00'],
    dose: '1 tablet',
  },
  {
    names: ['omeprazole', 'prilosec', 'losec'],
    medicineName: 'Omeprazole 20 mg',
    category: 'tablets',
    purpose:
      'It lowers the amount of acid your stomach makes. It helps with heartburn, acid reflux and stomach ulcers.',
    howToTake:
      'Take 1 capsule once a day, in the morning, 30 minutes before breakfast. Swallow it whole — do not crush or chew it.',
    warnings: [
      'It can take a few days to feel the full effect.',
      'Tell your doctor if you have black stools, vomit blood, or trouble swallowing.',
      'Long-term use needs a doctor review.',
    ],
    schedule: ['07:30'],
    dose: '1 capsule',
  },
  {
    names: ['vitamin d', 'cholecalciferol', 'colecalciferol'],
    medicineName: 'Vitamin D3 1000 IU',
    category: 'vitamins',
    purpose:
      'A vitamin supplement. It helps your body absorb calcium, keeping bones and teeth strong.',
    howToTake:
      'Take 1 tablet once a day with your largest meal. Vitamin D is absorbed better with food.',
    warnings: [
      'Do not take more than the label says unless a doctor tells you to.',
      'Tell your doctor about other supplements you take.',
    ],
    schedule: ['08:00'],
    dose: '1 tablet',
  },
];

/** Three ready-made label texts on the Home screen — one tap to try. */
export const SAMPLE_LABELS: { title: string; label: string }[] = [
  {
    title: 'Amoxicillin 500 mg',
    label:
      'Amoxicillin 500 mg capsules. Take one capsule three times daily. Complete the course. Store below 25°C.',
  },
  {
    title: 'Paracetamol 500 mg',
    label:
      'Paracetamol 500 mg tablets. Take 1–2 tablets every 4–6 hours as needed. Do not exceed 8 tablets in 24 hours. Do not take with other paracetamol products.',
  },
  {
    title: 'Salbutamol inhaler',
    label:
      'Salbutamol 100 micrograms inhaler. Take 1–2 puffs as needed for wheezing or shortness of breath. Shake well before use.',
  },
];

function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

function parseTimesPerDay(labelText: string): string[] {
  const hay = labelText.toLowerCase();
  if (/four times|4 times|qid|q\.i\.d/.test(hay)) return ['08:00', '12:00', '16:00', '20:00'];
  if (/three times|3 times|tid|t\.i\.d|thrice/.test(hay)) return ['08:00', '14:00', '20:00'];
  if (/twice|two times|2 times|bid|b\.i\.d/.test(hay)) return ['08:00', '20:00'];
  if (/every 4|every four|4-6 hours|every 6|every six/.test(hay)) return ['08:00', '14:00', '20:00'];
  if (/once daily|once a day|daily|od\b|every day/.test(hay)) return ['08:00'];
  if (/as needed|when needed|prn/.test(hay)) return ['08:00'];
  return ['08:00'];
}

function parseDose(labelText: string): string {
  const m = labelText.match(/(\d+(?:–|-)\d+|\d+)\s*(tablet|tablets|capsule|capsules|puff|puffs|ml|drop|drops|spray)/i);
  if (m) return `${m[1]} ${m[2].toLowerCase()}`;
  return 'As directed';
}

function guessName(labelText: string): string {
  const first = labelText.split(/[.\n]/)[0].trim();
  if (first.length > 4 && first.length < 80) return first;
  return 'Your medicine';
}

/** Find a curated demo explanation for a label, or build a generic one. */
export function demoExplanation(labelText: string): Explanation {
  const hay = labelText.toLowerCase();
  const entry = DEMO_LIBRARY.find((e) => e.names.some((n) => hay.includes(n)));
  const at = Date.now();
  if (entry) {
    return {
      id: `demo-${slug(entry.medicineName)}-${at}`,
      medicineName: entry.medicineName,
      labelText,
      category: entry.category,
      purpose: entry.purpose,
      howToTake: entry.howToTake,
      warnings: entry.warnings,
      schedule: entry.schedule,
      dose: entry.dose,
      source: 'demo',
      at,
    };
  }
  const schedule = parseTimesPerDay(labelText);
  const timesWord = schedule.length === 1 ? 'once a day' : `${schedule.length} times a day`;
  return {
    id: `demo-${slug(guessName(labelText))}-${at}`,
    medicineName: guessName(labelText),
    labelText,
    category: 'other',
    purpose:
      'This looks like a medicine label. The exact purpose is not in the built-in library, so check the box or ask your pharmacist what this medicine is for.',
    howToTake: `The label says to take it ${timesWord}. Follow the times below, take it exactly as the label says, and do not take extra doses to catch up if you miss one — ask your pharmacist what to do.`,
    warnings: [
      'Read the whole label and the leaflet inside the box.',
      'Tell your doctor or pharmacist about every other medicine you take.',
      'If you notice a new rash, swelling or trouble breathing, get urgent help.',
    ],
    schedule,
    dose: parseDose(labelText),
    source: 'demo',
    at,
  };
}
