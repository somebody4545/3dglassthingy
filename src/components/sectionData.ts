import type { SectionInfo, PanelPageConfig } from './types';

export const sectionData: SectionInfo[] = [
  {
    index: 0,
    title: 'Start',
    description: 'Return to the starting overview.',
    image: '/section-media/images/section-0.png',
    video: '/section-media/videos/section-0.mp4'
  },
  {
    index: 1,
    title: 'Section 1',
    description: 'Description for section 1.',
    image: '/section-media/images/section-1.png',
    video: '/section-media/videos/section-1.mp4'
  },
  {
    index: 2,
    title: 'Section 2',
    description: 'Description for section 2.',
    image: '/section-media/images/section-2.png',
    video: '/section-media/videos/section-2.mp4'
  },
  {
    index: 3,
    title: 'Section 3',
    description: 'Description for section 3.',
    image: '/section-media/images/section-3.png',
    video: '/section-media/videos/section-3.mp4'
  },
  {
    index: 4,
    title: 'Section 4',
    description: 'Description for section 4.',
    image: '/section-media/images/section-4.png',
    video: '/section-media/videos/section-4.mp4'
  },
  {
    index: 5,
    title: 'Section 5',
    description: 'Description for section 5.',
    image: '/section-media/images/section-5.png',
    video: '/section-media/videos/section-5.mp4'
  },
  {
    index: 6,
    title: 'Section 6',
    description: 'Description for section 6.',
    image: '/section-media/images/section-6.png',
    video: '/section-media/videos/section-6.mp4'
  },
  {
    index: 7,
    title: 'Section 7',
    description: 'Description for section 7.',
    image: '/section-media/images/section-7.png',
    video: '/section-media/videos/section-7.mp4'
  },
  {
    index: 8,
    title: 'Section 8',
    description: 'Description for section 8.',
    image: '/section-media/images/section-8.png',
    video: '/section-media/videos/section-8.mp4'
  },
  {
    index: 9,
    title: 'Section 9',
    description: 'Description for section 9.',
    image: '/section-media/images/section-9.png',
    video: '/section-media/videos/section-9.mp4'
  },
  {
    index: 10,
    title: 'Section 10',
    description: 'Description for section 10.',
    image: '/section-media/images/section-10.png',
    video: '/section-media/videos/section-10.mp4'
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
    label: 'Overview',
    description: 'High-level introduction panels.',
    spacingMultiplier: 1.2,
    sections: [
  { index: 0, title: 'Start', description: 'Return to the starting overview.', image: '/section-media/images/section-0.png', video: '/section-media/videos/section-0.mp4' },
  { index: 1, title: 'Section 1', description: 'Description for section 1.', image: '/section-media/images/section-1.png', video: '/section-media/videos/section-1.mp4' },
  { index: 2, title: 'Section 2', description: 'Description for section 2.', image: '/section-media/images/section-2.png', video: '/section-media/videos/section-2.mp4' },
  { index: 3, title: 'Section 3', description: 'Description for section 3.', image: '/section-media/images/section-3.png', video: '/section-media/videos/section-3.mp4' },
    ]
  },
  {
    id: 'mid-cluster',
    label: 'Middle Cluster',
    description: 'Core middle sections grouped together.',
    spacingMultiplier: 1,
    sections: [
  { index: 0, title: 'Start', description: 'Return to the starting overview.', image: '/section-media/images/section-0.png', video: '/section-media/videos/section-0.mp4' },
  { index: 4, title: 'Section 4', description: 'Description for section 4.', image: '/section-media/images/section-4.png', video: '/section-media/videos/section-4.mp4' },
  { index: 5, title: 'Section 5', description: 'Description for section 5.', image: '/section-media/images/section-5.png', video: '/section-media/videos/section-5.mp4' },
  { index: 6, title: 'Section 6', description: 'Description for section 6.', image: '/section-media/images/section-6.png', video: '/section-media/videos/section-6.mp4' },
  { index: 7, title: 'Section 7', description: 'Description for section 7.', image: '/section-media/images/section-7.png', video: '/section-media/videos/section-7.mp4' },
    ]
  },
  {
    id: 'advanced',
    label: 'Advanced',
    description: 'Later stage or advanced topic panels.',
    spacingMultiplier: 1.4,
    sections: [
  { index: 0, title: 'Start', description: 'Return to the starting overview.', image: '/section-media/images/section-0.png', video: '/section-media/videos/section-0.mp4' },
  { index: 8, title: 'Section 8', description: 'Description for section 8.', image: '/section-media/images/section-8.png', video: '/section-media/videos/section-8.mp4' },
  { index: 9, title: 'Section 9', description: 'Description for section 9.', image: '/section-media/images/section-9.png', video: '/section-media/videos/section-9.mp4' },
  { index: 10, title: 'Section 10', description: 'Description for section 10.', image: '/section-media/images/section-10.png', video: '/section-media/videos/section-10.mp4' },
    ]
  },
  {
    id: 'mixed-path',
    label: 'Mixed Path',
    description: 'A curated cross-section of various panels.',
    spacingMultiplier: 1.1,
    sections: [
  { index: 0, title: 'Start', description: 'Return to the starting overview.', image: '/section-media/images/section-0.png', video: '/section-media/videos/section-0.mp4' },
  { index: 2, title: 'Section 2', description: 'Description for section 2.', image: '/section-media/images/section-2.png', video: '/section-media/videos/section-2.mp4' },
  { index: 5, title: 'Section 5', description: 'Description for section 5.', image: '/section-media/images/section-5.png', video: '/section-media/videos/section-5.mp4' },
  { index: 8, title: 'Section 8', description: 'Description for section 8.', image: '/section-media/images/section-8.png', video: '/section-media/videos/section-8.mp4' },
    ]
  },
  {
    id: 'full-ten',
    label: 'Full Ten',
    description: 'Page showing ten content sections (1-10) without the Start panel.',
    spacingMultiplier: 1,
    sections: [
      { index: 1, title: 'Section 1', description: 'Description for section 1.', image: '/section-media/images/section-1.png', video: '/section-media/videos/section-1.mp4' },
      { index: 2, title: 'Section 2', description: 'Description for section 2.', image: '/section-media/images/section-2.png', video: '/section-media/videos/section-2.mp4' },
      { index: 3, title: 'Section 3', description: 'Description for section 3.', image: '/section-media/images/section-3.png', video: '/section-media/videos/section-3.mp4' },
      { index: 4, title: 'Section 4', description: 'Description for section 4.', image: '/section-media/images/section-4.png', video: '/section-media/videos/section-4.mp4' },
      { index: 5, title: 'Section 5', description: 'Description for section 5.', image: '/section-media/images/section-5.png', video: '/section-media/videos/section-5.mp4' },
      { index: 6, title: 'Section 6', description: 'Description for section 6.', image: '/section-media/images/section-6.png', video: '/section-media/videos/section-6.mp4' },
      { index: 7, title: 'Section 7', description: 'Description for section 7.', image: '/section-media/images/section-7.png', video: '/section-media/videos/section-7.mp4' },
      { index: 8, title: 'Section 8', description: 'Description for section 8.', image: '/section-media/images/section-8.png', video: '/section-media/videos/section-8.mp4' },
      { index: 9, title: 'Section 9', description: 'Description for section 9.', image: '/section-media/images/section-9.png', video: '/section-media/videos/section-9.mp4' },
      { index: 10, title: 'Section 10', description: 'Description for section 10.', image: '/section-media/images/section-10.png', video: '/section-media/videos/section-10.mp4' },
    ]
  },
];
