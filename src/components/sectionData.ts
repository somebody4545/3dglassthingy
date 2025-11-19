import type { SectionInfo, PanelPageConfig } from './types';

export const sectionData: SectionInfo[] = [
  {
    index: 0,
    title: 'Start',
    description: 'Return to the starting overview.',
    image: '/section-media/images/section-0.png',
  },
  {
    index: 1,
    title: 'Section 1',
    description: 'Description for section 1.',
    image: '/section-media/images/section-1.png',
  },
  {
    index: 2,
    title: 'Section 2',
    description: 'Description for section 2.',
    image: '/section-media/images/section-2.png',
  },
  {
    index: 3,
    title: 'Section 3',
    description: 'Description for section 3.',
    image: '/section-media/images/section-3.png',
  },
  {
    index: 4,
    title: 'Section 4',
    description: 'Description for section 4.',
    image: '/section-media/images/section-4.png',
  },
  {
    index: 5,
    title: 'Section 5',
    description: 'Description for section 5.',
    image: '/section-media/images/section-5.png',
  },
  {
    index: 6,
    title: 'Section 6',
    description: 'Description for section 6.',
    image: '/section-media/images/section-6.png',
  },
  {
    index: 7,
    title: 'Section 7',
    description: 'Description for section 7.',
    image: '/section-media/images/section-7.png',
  },
  {
    index: 8,
    title: 'Section 8',
    description: 'Description for section 8.',
    image: '/section-media/images/section-8.png',
  },
  {
    index: 9,
    title: 'Section 9',
    description: 'Description for section 9.',
    image: '/section-media/images/section-9.png',
  },
  {
    index: 10,
    title: 'Section 10',
    description: 'Description for section 10.',
    image: '/section-media/images/section-10.png',
  }
];

export function getSectionInfo(index: number): SectionInfo | undefined {
  return sectionData.find(s => s.index === index);
}

// Page configurations: varied counts, ordering, and spacing
// Rich per-page metadata referencing reusable section indices
export const panelPages: PanelPageConfig[] = [
  {
    id: 'overview',
    label: 'Main',
    description: 'High-level introduction panels.',
    spacingMultiplier: 1.2,
    sections: [
  { index: 0, title: 'Start', description: 'Return to the starting overview.', image: '/section-media/images/section-0.png' },
  { index: 1, title: 'Section 1', description: 'Description for section 1.', image: '/section-media/images/section-1.png'},
  { index: 2, title: 'Section 2', description: 'Description for section 2.', image: '/section-media/images/section-2.png' },
  { index: 3, title: 'Section 3', description: 'Description for section 3.', image: '/section-media/images/section-3.png' },
    ]
  },
    {
    id: 'full-ten',
    label: 'AAAAAAAAAAAAAAAAAAAAAA',
    description: 'Page showing ten content sections (1-10) without the Start panel.',
    spacingMultiplier: 1,
    sections: [
      { index: 1, title: 'Section 1', description: 'Description for section 1.', image: '/section-media/images/section-1.png' },
      { index: 2, title: 'Section 2', description: 'Description for section 2.', image: '/section-media/images/section-2.png' },
      { index: 3, title: 'Section 3', description: 'Description for section 3.', image: '/section-media/images/section-3.png' },
      { index: 4, title: 'Section 4', description: 'Description for section 4.', image: '/section-media/images/section-4.png' },
      { index: 5, title: 'Section 5', description: 'Description for section 5.', image: '/section-media/images/section-5.png' },
      { index: 6, title: 'Section 6', description: 'Description for section 6.', image: '/section-media/images/section-6.png' },
      { index: 7, title: 'Section 7', description: 'Description for section 7.', image: '/section-media/images/section-7.png' },
      { index: 8, title: 'Section 8', description: 'Description for section 8.', image: '/section-media/images/section-8.png' },
      { index: 9, title: 'Section 9', description: 'Description for section 9.', image: '/section-media/images/section-9.png' },
      { index: 10, title: 'Section 10', description: 'Description for section 10.', image: '/section-media/images/section-10.png' },
    ]
  },
  {
    id: 'mid-cluster',
    label: 'Projects',
    description: 'Core middle sections grouped together.',
    spacingMultiplier: 1,
    sections: [
  { index: 4, title: 'Section 4', description: 'Description for section 4.', image: '/section-media/images/section-4.png' },
  { index: 5, title: 'Section 5', description: 'Description for section 5.', image: '/section-media/images/section-5.png' },
  { index: 6, title: 'Section 6', description: 'Description for section 6.', image: '/section-media/images/section-6.png' },
  { index: 7, title: 'Section 7', description: 'Description for section 7.', image: '/section-media/images/section-7.png' },
    ]
  },
  {
    id: 'advanced',
    label: 'Yippee',
    description: 'Later stage or advanced topic panels.',
    spacingMultiplier: 1.4,
    sections: [
  { index: 8, title: 'Section 8', description: 'Description for section 8.', image: '/section-media/images/section-8.png' },
  { index: 9, title: 'Section 9', description: 'Description for section 9.', image: '/section-media/images/section-9.png' },
  { index: 10, title: 'Section 10', description: 'Description for section 10.', image: '/section-media/images/section-10.png' },
    ]
  },
  {
    id: 'mixed-path',
    label: 'Gaming',
    description: 'A curated cross-section of various panels.',
    spacingMultiplier: 1.1,
    sections: [
  { index: 2, title: 'Section 2', description: 'Description for section 2.', image: '/section-media/images/section-2.png' },
  { index: 5, title: 'Section 5', description: 'Description for section 5.', image: '/section-media/images/section-5.png' },
  { index: 8, title: 'Section 8', description: 'Description for section 8.', image: '/section-media/images/section-8.png' },
    ]
  },
];
