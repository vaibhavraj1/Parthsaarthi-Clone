export type UserRole = 'student' | 'mentor';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export type ReleaseStatus = 'scheduled' | 'open' | 'manually_released' | 'cancelled' | 'completed';

export interface Release {
  _id: string;
  mentorId: string;
  mentorName: string;
  title: string;
  description: string;
  category?: string;
  releaseAt: string; // ISO 8601 UTC string
  status: ReleaseStatus;
  createdAt: string;
  updatedAt: string;
  manuallyReleasedAt?: string;
  cancelledAt?: string;
}

export interface Slot {
  _id: string;
  releaseId: string;
  startTime: string; // e.g. "03:00 PM"
  endTime: string;   // e.g. "03:30 PM"
  mode?: string;      // e.g. "Online (Google Meet)" or "Offline (SR-102)"
  location?: string;
  note?: string;
  isBooked?: boolean;
  bookedBy?: string;
  createdAt: string;
}

export interface Booking {
  _id: string;
  slotId: string;
  studentId: string;
  studentName?: string;
  bookedAt: string;
}

export interface ReleaseWithSlots extends Release {
  slots: Slot[];
  computedStatus: ReleaseStatus;
  isBookable: boolean;
  serverTime: string;
}
