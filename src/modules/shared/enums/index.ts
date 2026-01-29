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
  TEACHER = 'Teacher',
  SENIOR_TEACHER = 'Senior Teacher',
  HEAD_TEACHER = 'Head Teacher',
  ADMIN = 'Admin',
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



// User Role Enum (if not already defined elsewhere)
export enum UserRole {
  ADMIN = 'Admin',
  TEACHER = 'Teacher',
  PARENT = 'Parent',
  STUDENT = 'Student',
  ACADEMY_OWNER = 'Academy Owner',
  OTHER = 'Other',
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export enum MonthOfYear {
  JANUARY = 'January',
  FEBRUARY = 'February',
  MARCH = 'March',
  APRIL = 'April',
  MAY = 'May',
  JUNE = 'June',
  JULY = 'July',
  AUGUST = 'August',
  SEPTEMBER = 'September',
  OCTOBER = 'October',
  NOVEMBER = 'November',
  DECEMBER = 'December',
}

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LEAVE = 'leave',
  EXCUSED = 'excused',
}

export enum CurrencyStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export enum OtpType {
  LOGIN = 'login',
  REGISTER = 'register',
  FORGOT_PASSWORD = 'forgot_password',
  VERIFY_EMAIL = 'verify_email',
}

export enum MetadataKeys {
  UserRoles = 'user_roles',
}

export enum NotificationType {
  CHAT = 'chat',
  MESSAGE = 'message',
  BOOKING = 'booking',
  PAYMENT = 'payment',
  BOOKING_CONFIRMED = 'booking_confirmed',
  PAYMENT_CONFIRMED = 'payment_confirmed',
  PAYMENT_FAILED = 'payment_failed',
  PAYMENT_REFUNDED = 'payment_refunded',
  PAYMENT_PENDING = 'payment_pending',
  PAYMENT_PARTIAL_REFUNDED = 'payment_partial_refunded',
  NEW_REGISTER = 'new_register',
  PROFILE_COMPLETED = 'profile_completed',
  OTHER = 'other',
}