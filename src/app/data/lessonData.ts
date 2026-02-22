import { Lesson } from './courses';

// Thumbnail image pool
const thumbs = {
  shoulder1: 'https://images.unsplash.com/photo-1763198302535-265c44183bcb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmF0b215JTIwc2hvdWxkZXIlMjBib25lcyUyMG1lZGljYWx8ZW58MXx8fHwxNzcwNTAyMjMxfDA&ixlib=rb-4.1.0&q=80&w=1080',
  muscles1: 'https://images.unsplash.com/photo-1768644675767-40b294727e10?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmF0b215JTIwbXVzY2xlcyUyMG1lZGljYWwlMjBpbGx1c3RyYXRpb258ZW58MXx8fHwxNzcwNTAyMjMyfDA&ixlib=rb-4.1.0&q=80&w=1080',
  skeleton1: 'https://images.unsplash.com/photo-1748712308129-1d200044113d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwc2tlbGV0b24lMjBqb2ludHN8ZW58MXx8fHwxNzcwNTAyMjMyfDA&ixlib=rb-4.1.0&q=80&w=1080',
  nerves1: 'https://images.unsplash.com/photo-1729339983367-770c2527ce75?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmF0b215JTIwbmVydmVzJTIwdmFzY3VsYXIlMjBtZWRpY2FsfGVufDF8fHx8MTc3MDUwMjIzM3ww&ixlib=rb-4.1.0&q=80&w=1080',
};

export const topicLessons: Record<string, Lesson[]> = {
  // ============ ANATOMIA - MEMBRO SUPERIOR (apenas Ombro e Axila) ============
  shoulder: [
    { id: 'shoulder-1', title: 'Osteologia do Ombro', duration: '16:19', thumbnailUrl: thumbs.shoulder1, completed: true, hasVideo: true, hasSummary: true, sectionIndex: 0 },
    { id: 'shoulder-2', title: 'Articulação Glenoumeral', duration: '12:45', thumbnailUrl: thumbs.skeleton1, completed: true, hasVideo: true, hasSummary: true, sectionIndex: 1 },
    { id: 'shoulder-3', title: 'Músculos do Ombro', duration: '14:30', thumbnailUrl: thumbs.muscles1, completed: false, hasVideo: true, hasSummary: true, sectionIndex: 2, alsoAppearsIn: ['Membro Superior'] },
  ],
};

export function getLessonsForTopic(topicId: string): Lesson[] {
  return topicLessons[topicId] || [];
}