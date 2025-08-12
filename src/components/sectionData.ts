import type { SectionInfo } from './types';

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
