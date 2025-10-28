// Academy Enums
export enum AcademyStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

// Class Enums
export enum ClassType {
  INDIVIDUAL = 'individual',
  ACADEMY = 'academy',
}

export enum ClassStatus {
  SCHEDULED = 'scheduled',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// Class Enrollment Enums
export enum EnrollmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

// Payment Enums
export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  ONLINE = 'online',
}

// Performance Enums
export enum PerformanceType {
  ATTENDANCE = 'attendance',
  HOMEWORK = 'homework',
  QUIZ = 'quiz',
  EXAM = 'exam',
  PROJECT = 'project',
  PARTICIPATION = 'participation',
  OTHER = 'other',
}

// Academy Teacher Enums
export enum TeacherRole {
  TEACHER = 'teacher',
  SENIOR_TEACHER = 'senior_teacher',
  HEAD_TEACHER = 'head_teacher',
  ADMIN = 'admin',
}

export enum TeacherStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

// Parent Child Enums
export enum RelationshipType {
  FATHER = 'father',
  MOTHER = 'mother',
  GUARDIAN = 'guardian',
  GRANDPARENT = 'grandparent',
  SIBLING = 'sibling',
  OTHER = 'other',
}

export enum RelationshipStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
}

// Academy Invitation Enums
export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired',
}

// User Role Enum (if not already defined elsewhere)
export enum UserRole {
  ADMIN = 'Admin',
  TEACHER = 'Teacher',
  PARENT = 'Parent',
  STUDENT = 'Student',
  ACADEMY_OWNER = 'Academy Owner',
  OTHER = 'Other',
}
