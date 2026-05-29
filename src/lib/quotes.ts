export interface Quote {
  text: string;
  author: string;
}

export const quotesMap = {
  STAFF: [
    { text: "Organized care creates better healing.", author: "Cosmediq Care Principles" },
    { text: "Every patient interaction matters.", author: "Clinical Care Philosophy" },
    { text: "Efficiency is a form of patient compassion.", author: "Modern Health Systems" },
    { text: "A welcoming smile is the first step of therapy.", author: "Patient Wellness Guidelines" }
  ],
  DOCTOR: [
    { text: "Compassion and precision change lives.", author: "Clinical Excellence Board" },
    { text: "Every consultation is an opportunity to help.", author: "Hippocratic Care Creed" },
    { text: "Medicine is science guided by empathy.", author: "Medical Journal of Care" },
    { text: "Listening carefully is often the most powerful treatment.", author: "Modern Medicine Guidelines" }
  ],
  PATIENT: [
    { text: "Healing is a journey, not a race.", author: "Wellness Wisdom" },
    { text: "Small progress is still progress.", author: "Therapy Insights" },
    { text: "Your health is your most precious asset.", author: "Integrative Health Journal" },
    { text: "Rest is not idleness, but the soil of recovery.", author: "Clinical Rejuvenation Guides" }
  ],
  GENERAL: [
    { text: "True healthcare begins with active listening and ends with human connection.", author: "Cosmediq Founders" },
    { text: "Advanced medical technology is only as good as the empathy behind it.", author: "Modern Healthcare Review" },
    { text: "Designing elegant workflows to empower clinical healing.", author: "Cosmediq Principles" }
  ]
};
export type QuoteRole = 'STAFF' | 'DOCTOR' | 'PATIENT' | 'GENERAL';
