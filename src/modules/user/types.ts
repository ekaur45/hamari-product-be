export type EducationType = 'school' | 'college' | 'university' | 'course' | 'certification' | 'other';

export interface EducationItem {
  id: string;
  userId?: string;
  type: EducationType;
  institution: string;
  title?: string;
  field?: string;
  startDate?: Date;
  endDate?: Date;
  stillStudying?: boolean;
  credentialUrl?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AvailabilitySlot {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  notes?: string;
}

