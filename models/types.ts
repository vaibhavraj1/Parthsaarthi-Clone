export type UserRole = 'student' | 'mentor';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export type ReleaseStatus = 'scheduled' | 'open' | 'manually_released' | 'cancelled' | 'completed';

export type SlotType = 'case' | 'cv_hr';
export type SlotMode = 'Online' | 'Offline';
export type CvHrOption = 'Entire CV' | 'Workex' | 'POR' | 'HR Questions';

export interface ShadowBooking {
  studentId: string;
  studentName: string;
  bookedAt: string;
}

export interface Slot {
  _id: string;
  releaseId: string;
  startTime: string; // 24-hr format "HH:mm", e.g. "14:00"
  endTime: string;   // 24-hr format "HH:mm", e.g. "14:30"
  mode: SlotMode;
  slotType: SlotType;
  
  // Case Slot properties
  shadowCount?: number; // configured by mentor (0 to 15)
  solverBooked?: boolean;
  solverStudentId?: string;
  solverStudentName?: string;
  shadowsBooked?: ShadowBooking[];

  // CV/HR Slot properties
  cvHrSelection?: CvHrOption; // choice picked by student during booking

  location?: string;
  note?: string;
  isBooked?: boolean;
  bookedBy?: string;
  bookedStudentId?: string;
  createdAt: string;
}

export interface Release {
  _id: string;
  mentorId: string;
  mentorName: string;
  title: string;
  description?: string;
  category?: string;
  releaseAt: string; // ISO 8601 UTC string
  status: ReleaseStatus;
  createdAt: string;
  updatedAt: string;
  manuallyReleasedAt?: string;
  cancelledAt?: string;
}

export interface Booking {
  _id: string;
  slotId: string;
  releaseId: string;
  studentId: string;
  studentName: string;
  mentorName: string;
  title?: string;
  startTime: string;
  endTime: string;
  mode: SlotMode;
  slotType: SlotType;
  bookingRole?: 'solver' | 'shadow';
  cvHrSelection?: CvHrOption;
  bookedAt: string;
}

export interface ReleaseWithSlots extends Release {
  slots: Slot[];
  computedStatus: ReleaseStatus;
  isBookable: boolean;
  serverTime: string;
}
