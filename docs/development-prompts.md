# Parthsaarthi — Development Prompts & Engineering Log

This document records the master prompts and iterative engineering prompts used to develop the **Parthsaarthi Scheduled Slot Release MVP** for the IIM Lucknow mentoring portal.

---

## 1. Initial Master Prompt
```markdown
# Project: Parthsaarthi — Scheduled Slot Release MVP
Context: Feature enhancement for the existing IIM Lucknow student portal "Parthsaarthi".
Problem: Junior batch (~580 students) competing for scarce mentoring/SIP slots (single digits up to ~15). FCFS booking. Mentors announce expected release time on communication channels, but actual release depends on mentor manually returning to portal. Coordination breakdowns occur when mentors forget or are delayed.
Core principle: "The mentor decides when the slots should become available. The system takes care of making them bookable at that time."
Exact MVP boundary:
- Begins when a mentor is creating/scheduling a release.
- Ends when the scheduled time has passed and student's "Book Now" buttons become enabled.
- Handoff modal after release demonstrating connection back to existing Parthsaarthi booking flow.
- Non-goals: Payment, chat, messaging, complex SSO, full calendar integration, admin dashboards.
Screens:
1. /mentor/create: Session details, multiple slots (add/remove), release date & time (IST), explanation, "SCHEDULE RELEASE".
2. /mentor/releases: Table of upcoming/past releases, status pills (SCHEDULED, OPEN, MANUALLY RELEASED, CANCELLED, COMPLETED), Edit, Cancel, Manual Release with confirmation modal.
3. /student: Academic portal UI, session details, prominent countdown, status LOCKED, individual slot cards with disabled Book Now.
4. /student (after release): Status OPEN, Book Now enabled, demo handoff modal.
Refresh behavior: No WebSockets/live polling needed. Authoritative server timestamp check: If status == 'scheduled' and serverTime >= releaseAt -> OPEN.
Simulation control: DEMO CONTROLS -> [ Simulate Release Now ].
Database: MongoDB Atlas with official Node.js driver, collections: users, releases, slots, bookings (unique index on slotId).
Timezone: Asia/Kolkata (IST).
```

---

## 2. Environment & Toolchain Resolution Prompts
### Issue: Node.js and NPM not initially recognized in Windows PATH
**Prompt / Command Executed**:
```powershell
# Extract portable Node.js LTS v20.18.0 using tar.exe and link into User PATH
tar -xf C:\Users\vaibh\node.zip -C C:\Users\vaibh\
Copy-Item -Path "C:\Users\vaibh\nodejs\*" -Destination "C:\Users\vaibh\.gemini\antigravity\bin" -Recurse -Force
```
**Outcome**:
Resolved environment pathing in Windows shell so both PowerShell and `cmd.exe` post-install scripts execute `node` and `npm` seamlessly.

---

## 3. Database Architecture & MongoDB Prompts
### Requirement: MongoDB Atlas with zero-dependency fallback
**Objective**:
Ensure the application connects seamlessly to MongoDB Atlas when `MONGODB_URI` is provided, while providing an in-memory collection fallback and auto-seed mechanism so the prototype can be evaluated immediately without external database dependencies.

**Implementation Prompt / Code**:
```typescript
// Auto-seed default Consulting Case Preparation session if database is empty on boot
if (!existing) {
  await db.collection('releases').insertOne({
    _id: 'demo_consulting_01',
    mentorName: 'Rahul Sharma',
    title: 'Consulting Case Preparation',
    category: 'Management Consulting',
    releaseAt: new Date(Date.now() + 3 * 60 * 1000).toISOString(),
    status: 'scheduled',
    ...
  });
}
```

---

## 4. UI / UX Design & Student Experience Prompts
### Design Goal:
Credible, premium Indian B-school academic aesthetic (IIM Lucknow style), clean typography, restrained animations, clear status contrast between `LOCKED` (amber/slate) and `OPEN` (emerald green).

**Key Components Designed**:
1. `Navbar.tsx`: Live IST clock ticking in real time with `Asia/Kolkata (UTC+5:30)` badge, demo persona switcher (Mentor vs. Student), and institutional branding.
2. `Countdown.tsx`: Live countdown with `HH:MM:SS` timer, displaying "Scheduled release time reached! Refresh to Book" when timer hits zero.
3. `SlotCard.tsx`: Individual slot cards displaying time, duration, room/Google Meet link, topic notes, and disabled `[ BOOK NOW (LOCKED) ]` vs actionable `[ BOOK NOW ]`.
4. `DemoBookingModal.tsx`: Explicitly demonstrates the MVP boundary and integration handoff to Parthsaarthi's existing booking flow.
5. `MentorReleaseForm.tsx`: Dynamic multi-slot addition/deletion, session metadata, and quick IST scheduling presets (+2m, +5m, +15m).
6. `DemoControls.tsx`: Floating reviewer drawer with `[ Simulate Release Now ]`, `[ Seed Sample Consulting Session ]`, and `[ Reset All Demo Data ]`.

---

## 5. Authoritative Business Logic Prompts
### Business Rules 1 to 10 Implementation
```typescript
export function computeReleaseStatus(
  release: Pick<Release, 'status' | 'releaseAt'>,
  currentServerTime: Date = new Date()
): ReleaseStatus {
  // Rule 7: Cancelled releases never open even if releaseAt passed
  if (release.status === 'cancelled') return 'cancelled';
  if (release.status === 'completed') return 'completed';
  // Rule 8: Manually released releases are immediately open
  if (release.status === 'manually_released') return 'manually_released';
  if (release.status === 'open') return 'open';

  // Rule 4: Scheduled releases evaluate against authoritative server timestamp
  if (release.status === 'scheduled') {
    const releaseTime = new Date(release.releaseAt).getTime();
    if (currentServerTime.getTime() >= releaseTime) {
      return 'open';
    }
    return 'scheduled';
  }
  return release.status;
}
```

---

## 6. Testing & Acceptance Verification Prompts
### Verification Sequence:
1. **Mentor Flow**:
   - Access `/mentor/create`.
   - Enter *"Consulting Case Preparation"*, mentor Rahul Sharma, add 4 slots (3:00 PM, 3:30 PM, 4:00 PM, 4:30 PM).
   - Set release time 3 minutes in future. Submit.
   - Verify confirmation banner and presence in `/mentor/releases`.
2. **Student Flow (Before Release)**:
   - Access `/student`.
   - Verify session details, 4 slot cards, countdown timer, and disabled `BOOK NOW` buttons.
3. **Simulation Transition**:
   - Use `DEMO CONTROLS` -> `[ Simulate Release Now ]`.
   - Refresh `/student` page.
   - Verify status transitions to `OPEN` and `BOOK NOW` buttons become active.
4. **Parthsaarthi Handoff**:
   - Click `BOOK NOW` on Slot #1 (3:00 PM – 3:30 PM).
   - Verify demo modal explains seamless handoff to existing Parthsaarthi booking workflow.
