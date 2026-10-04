# Parthsaarthi — Development Prompts & Engineering Log

This document preserves the original product prompts before the later development history. The project reference below describes the implementation as it currently exists; historical prompts may describe earlier intended behavior.

---

## Initial Prompts (Verbatim)

### PROMPT 1
```markdown
# Project: Parthsaarthi — Scheduled Slot Release MVP

## 1. Context

I am building a feature enhancement for the existing IIM Lucknow student portal "Parthsaarthi".

Existing Parthsaarthi is used by the junior batch to book mentoring/SIP slots released by senior students/mentors.

The current problem is:

* The junior batch has approximately 580 students.
* A mentor may release only a small number of slots, generally in single digits and sometimes up to around 15.
* Booking is effectively first-come-first-served.
* Mentors commonly announce on community/student communication channels when they intend to release slots, including:

  * topic/session details
  * expected release time
  * who the session is intended for
  * what students can expect
* Currently, the actual release can depend on the mentor manually returning to the portal and performing the release action.
* This creates a coordination problem: a mentor may forget, be delayed, or release the slots at a different time than announced.
* Students who are actively waiting may therefore miss the release despite having followed the announced timing.

## 2. Product idea

Build a new feature called:

"Scheduled Slot Release"

Core principle:

> The mentor decides when the slots should become available. The system takes care of making them bookable at that time.

The feature should automate the scheduled release while preserving manual controls for the mentor.

IMPORTANT:
This is NOT a replacement for Parthsaarthi.
This is NOT a complete rebuild of Parthsaarthi.
This is a functional MVP demonstrating only the new scheduling feature and the minimum surrounding UI needed to demonstrate it.

The existing booking flow after a slot becomes available is OUT OF SCOPE.

---

# 3. Exact MVP boundary

The implementation begins when a mentor is creating/scheduling a release.

The implementation ends when the scheduled time has passed and the student's "Book Now" buttons become enabled.

After that point, clicking "Book Now" can lead to a simple placeholder/demo action representing the existing Parthsaarthi booking flow.

DO NOT build a complete booking system.

DO NOT build:

* payment
* messaging
* chat
* notifications infrastructure
* calendar integration
* attendance
* complete student profiles
* complete mentor profiles
* admin dashboards
* complicated eligibility systems
* real IIM authentication
* complete replication of the existing Parthsaarthi portal

---

# 4. Important UX concept

A mentor creates ONE release containing MULTIPLE individual slots.

Example:

Session:
"Consulting Case Preparation"

Slots:

* 3:00 PM – 3:30 PM
* 3:30 PM – 4:00 PM
* 4:00 PM – 4:30 PM
* 4:30 PM – 5:00 PM

The mentor chooses ONE release date/time, for example:

7 October 2026, 2:00 PM

ALL slots belonging to that release become bookable at the same scheduled release time.

On the student interface, however, every slot appears as an individual card with its own:

* time
* details
* duration
* Book Now button
* booking status

---

# 5. Screens to build

Build the following screens.

## SCREEN 1 — Mentor: Create Scheduled Release

Route example:

/mentor/create

Create a polished mentor-facing interface.

Fields:

### Session details

* Session/topic title
* Description
* Mentor name
* Optional category

### Slot details

Allow mentor to add multiple individual slots.

Each slot should contain:

* Start time
* End time
* Optional location/mode
* Optional slot-specific note

Provide:

* Add Slot
* Remove Slot

Example:

Consulting Case Preparation

3:00 PM – 3:30 PM
3:30 PM – 4:00 PM
4:00 PM – 4:30 PM
4:30 PM – 5:00 PM

### Release scheduling

Fields:

* Release date
* Release time

Display a clear explanation:

"Students will be able to book these slots only after the scheduled release time."

Primary CTA:

"SCHEDULE RELEASE"

After successful submission show a confirmation state:

"Release scheduled successfully"

"Students can book these slots from 2:00 PM on 7 October 2026."

## SCREEN 2 — Mentor: Scheduled Releases

Route example:

/mentor/releases

Show the mentor's upcoming and past releases.

Each release card/table row should show:

* Session name
* Number of slots
* Release date
* Release time
* Status

Statuses:

SCHEDULED
OPEN
MANUALLY RELEASED
CANCELLED
COMPLETED

For scheduled releases provide:

* Edit
* Cancel
* Manual Release

IMPORTANT:

Manual Release is a deliberate fallback.

The scheduling feature should NOT remove the mentor's ability to manually release slots.

If a system issue occurs, the mentor should still be able to manually release the slots.

Manual release should require a confirmation dialog:

"Release these slots now?"

"Students will immediately be able to book them."

Buttons:

* Cancel
* Release Now

## SCREEN 3 — Student: Upcoming Session

Route example:

/student

Create a student-facing interface that feels like an extension of an existing IIM Lucknow student portal.

Do not attempt to perfectly reproduce the real Parthsaarthi UI because the exact student screenshots may not be available.

Instead, create a credible, clean academic/student portal design.

Each mentoring session should appear as a session section/card.

Example:

CONSULTING CASE PREPARATION

Mentor: Rahul Sharma
4 slots
30 minutes each

Description:
"Practice case interviews and discuss common consulting frameworks."

Show prominently:

"Slots release at 2:00 PM"

Then display a countdown:

00:14:32

Use a visually clear status:

LOCKED — BOOKING OPENS AT 2:00 PM

Below this, show the individual slots.

Each slot should be its own card.

Example:

3:00 PM – 3:30 PM
Case interview practice

[ BOOK NOW ]

The Book Now button must be disabled before release.

Repeat for every slot.

## SCREEN 4 — Student: After Release

Use the SAME student session UI.

The important difference is state.

Before release:

LOCKED

Book Now disabled.

After release:

OPEN

Book Now enabled.

For example:

3:00 PM – 3:30 PM

Case interview practice

[ BOOK NOW ]

The button is now clickable.

When clicked, do NOT implement the actual existing Parthsaarthi booking process.

Instead show a simple demo state:

"Continuing to Parthsaarthi booking flow..."

or

"Booking flow would continue here."

The purpose is only to demonstrate that our feature hands control back to the existing booking system.

---

# 9. Refresh behaviour

This is an important product requirement.

We do NOT need WebSockets.

We do NOT need live polling.

We do NOT need real-time push updates.

A student who was already viewing the page before the release time must refresh the page after the scheduled release time to see the newly enabled buttons.

The authoritative logic must be based on server/database state and current time.

Example:

scheduledReleaseAt = 2026-10-07T14:00:00

If:

current server time < scheduledReleaseAt

then:

* release is locked
* Book Now buttons are disabled

If:

current server time >= scheduledReleaseAt

then:

* release is open
* Book Now buttons are enabled

The UI should fetch the current release state on page load/refresh.

DO NOT rely only on client-side JavaScript time for the security/business decision.

---

# 10. Demo-only simulation control

Add a clearly labelled developer/demo control that is NOT part of the real student or mentor experience.

Example:

"DEMO CONTROLS"

[ Simulate Release Now ]

This allows the interviewer to demonstrate the transition without waiting until the actual scheduled time.

IMPORTANT:

* This should be hidden from normal student UI.
* It should be clearly labelled as a demo/development feature.
* It should NOT be described as part of the production feature.
* The actual production behaviour must depend on the scheduled release timestamp.

The demo should allow:

SCHEDULED
→ click Simulate Release Now
→ OPEN

This is purely for presentation.

---

# 11. Database

Use MongoDB Atlas.

Use the official MongoDB Node.js driver or another lightweight MongoDB integration compatible with Next.js.

Do NOT introduce unnecessary database abstraction unless useful.

Suggested collections:

## users

Fields:

* _id
* name
* email
* role

  * student
  * mentor
* createdAt

For the MVP, authentication can be simplified/demo-based.

Do NOT build real IIM SSO unless explicitly requested later.

---

## releases

Fields:

* _id
* mentorId
* title
* description
* category
* releaseAt
* status
* createdAt
* updatedAt
* manuallyReleasedAt
* cancelledAt

Possible status values:

scheduled
open
manually_released
cancelled
completed

IMPORTANT:

Do not rely solely on a status field to determine whether a scheduled release is actually available.

The business rule should be:

If status is scheduled AND current server time >= releaseAt,
the release should be considered open.

This protects against stale status values.

---

## slots

Fields:

* _id
* releaseId
* startTime
* endTime
* mode
* location
* note
* createdAt

Multiple slots belong to one release.

---

## bookings

For the MVP this can be minimal.

Fields:

* _id
* slotId
* studentId
* bookedAt

The actual booking implementation is out of scope, but structure the data model so that one slot can have only one booking.

Use a unique database constraint/index on slotId if implementing the demo booking action.

The database should be the final authority against duplicate bookings.

---

# 12. API / backend requirements

Create clean server-side API routes or route handlers.

At minimum:

POST /api/releases
Create a release.

GET /api/releases
List releases.

GET /api/releases/[id]
Get release and associated slots.

PATCH /api/releases/[id]
Edit scheduled release.

POST /api/releases/[id]/manual-release
Manually release a scheduled release.

POST /api/releases/[id]/cancel
Cancel a release.

GET /api/student/releases
Get relevant student releases.

The exact Next.js route organization can be chosen sensibly.

All database operations must happen server-side.

Never expose MONGODB_URI to the browser.

---

# 13. Authentication

For this MVP, implement a lightweight demo authentication mechanism.

Provide a login screen where the user chooses:

Student Demo
Mentor Demo

This is acceptable because the purpose is to demonstrate the product feature, not to reproduce IIM Lucknow's actual authentication system.

Persist the selected demo role using a secure/simple session mechanism appropriate for the MVP.

The UI should clearly indicate:

"Demo environment"

Do NOT pretend that this is real IIM authentication.

Structure the application so that real IIM SSO could replace this later.

---

# 14. Time handling

This feature is fundamentally time-sensitive.

Use a consistent timezone.

For the MVP use:

Asia/Kolkata / IST

Store timestamps in UTC where appropriate, but display them in IST.

Make the timezone explicit in the UI when useful.

Avoid ambiguous browser-local time behaviour.

The release decision should use a server-side authoritative timestamp.

---

# 15. UI / visual design

The design should look like a credible extension of a premium Indian B-school student portal.

Design principles:

* Clean
* Modern
* Professional
* Minimal
* Responsive
* Desktop-first but mobile-friendly
* Strong information hierarchy
* Clear distinction between scheduled and open states
* Avoid excessive animations

Use cards for individual slots.

The release countdown should be visually prominent but not gimmicky.

Use accessible button states.

Disabled Book Now should be visually obvious.

Open Book Now should look actionable.

Use a restrained academic/professional visual identity.

Do not use fake IIM Lucknow logos unless we have permission/assets.

You can use text such as:

"Parthsaarthi"
"Mentoring & SIP"

but make clear through the overall design that this is a prototype enhancement.

---

# 16. Demo data

Seed the database with realistic demo data.

Example mentor:

Rahul Sharma

Example student:

Vaibhav Raj Sahni

Example session:

"Consulting Case Preparation"

Description:

"Practice case interviews, discuss problem-solving approaches and receive feedback."

Example slots:

3:00 PM – 3:30 PM
3:30 PM – 4:00 PM
4:00 PM – 4:30 PM
4:30 PM – 5:00 PM

Use a configurable release time so the demo can easily be tested.

---

# 17. Important business rules

Implement these carefully.

### Rule 1

A release can contain multiple slots.

### Rule 2

All slots in a release become bookable at the same release time.

### Rule 3

Before releaseAt:
Book Now must be disabled.

### Rule 4

At or after releaseAt:
Book Now becomes enabled after the student refreshes/reloads the data.

### Rule 5

Mentor can manually release a scheduled release before its scheduled time.

### Rule 6

Mentor can edit/cancel a scheduled release.

### Rule 7

A cancelled release must not become bookable merely because its original releaseAt has passed.

### Rule 8

A manually released release should immediately be considered open.

### Rule 9

The demo "Simulate Release Now" function is not a production feature.

### Rule 10

Do not rebuild the existing booking system.

---

# 18. Error handling

Handle at minimum:

* Missing session title
* Missing release date/time
* Release time in the past
* No slots added
* Invalid slot times
* End time before start time
* Duplicate/overlapping slots where relevant
* Database unavailable
* Failed scheduling request
* Failed manual release
* Failed cancellation
* Invalid release ID

Show useful human-readable error messages.

Do not expose raw database errors to users.

---

# 19. Concurrency / scale

The application should be designed so that the scheduler itself does not require a continuously running server process.

Do NOT create a cron job simply to flip:

scheduled → open

Instead, store releaseAt and determine availability against the authoritative current time.

This means the system remains correct even if there is no process running exactly at releaseAt.

For future scale, mention that actual booking allocation must use an atomic database operation / unique constraint so that two students cannot successfully book the same slot.

---

# 20. Project structure

Use a clean Next.js project structure.

Suggested structure:

app/
login/
student/
mentor/
create/
releases/
api/
releases/
student/

components/
SlotCard
ReleaseCard
Countdown
StatusBadge
MentorReleaseForm
DemoControls

lib/
mongodb.ts
release-utils.ts
time-utils.ts

models/ or db/
users
releases
slots
bookings

scripts/
seed.ts

docs/
development-prompts.md
README.md

Use TypeScript.

---

# 21. Environment variables

Use:

MONGODB_URI=

Do NOT expose this as NEXT_PUBLIC_MONGODB_URI.

Keep secrets in .env.local during development.

Do not commit .env.local.

Create/update .gitignore appropriately.

---

# 22. Documentation requirement

Create a docs/README.md containing:

1. Product overview
2. Problem statement
3. MVP scope
4. Features
5. User flows
6. Tech stack
7. Architecture
8. Database collections
9. Authentication approach
10. Time/release logic
11. API routes
12. Hosting/deployment
13. Known limitations
14. Future improvements

Also create:

docs/development-prompts.md

Record the important AI prompts used during development.

Include:

* initial master prompt
* prompts used to debug
* prompts used to improve UI
* prompts used to implement MongoDB
* prompts used to deploy
* prompts used to fix bugs

Do not fabricate prompts that were not actually used.

---

# 23. Testing

Before considering the MVP complete, test:

### Mentor

* Create release
* Add multiple slots
* Schedule release
* View scheduled release
* Edit release
* Cancel release
* Manually release release

### Student

* View scheduled release
* See release time
* See countdown
* See disabled Book Now
* Refresh after release time
* See enabled Book Now
* Click Book Now

### Time edge cases

* Just before release
* Exactly at release
* Just after release
* Cancelled release after releaseAt
* Manually released before releaseAt

### Database

* Data persists after page refresh
* Multiple slots correctly reference one release
* MONGODB_URI remains server-side

---

# 24. Development priorities

Priority 1:
Core scheduling logic.

Priority 2:
MongoDB persistence.

Priority 3:
Student before/after release experience.

Priority 4:
Mentor manual controls.

Priority 5:
UI polish.

Priority 6:
Documentation.

Do NOT spend excessive time on animations or decorative features before the core flow works.

---

# 25. Acceptance test

The application is considered successful if I can perform this demo:

1. Log in as mentor.
2. Create "Consulting Case Preparation".
3. Add four slots:
   3:00, 3:30, 4:00, 4:30.
4. Set release time a few minutes into the future.
5. Schedule it.
6. Switch to student view.
7. See all four slot cards.
8. See the scheduled release time and countdown.
9. See Book Now disabled.
10. Use DEMO CONTROLS → Simulate Release Now.
11. Refresh student page.
12. See all four Book Now buttons enabled.
13. Click one.
14. See placeholder transition to the existing Parthsaarthi booking flow.

This flow must work reliably.

---

# 26. Important instruction to the AI developer

Do not overengineer this project.

The goal is a realistic MVP for an IIM Lucknow campus product pitch.

Prioritize:

* correct business logic
* clean UX
* working MongoDB persistence
* understandable architecture
* reliable demo
* maintainable code

Whenever there are multiple technically valid approaches, choose the simplest approach that is reliable and easy for a non-specialist founder/product owner to explain in a 15-minute interview.

Before making major architectural decisions that expand the scope, explain the decision and choose the simplest reasonable option.

Start by inspecting the current project structure if one exists. If the project is empty, initialize the Next.js TypeScript application and then implement the MVP above.

Do not stop at creating mockups. Build a genuinely functional full-stack MVP.
```

### PROMPT 2
```text
For now lets do the following things:
1. Remove all hardcoded data in the system
2. create two users: mentor named PGP41, and student named PGP42.
3. for a mentor, while releasing slots, they get first option to choose time from when till when, and per slot time, which automatically adds those many slots in the list with the mode(online or offline) and defined type of slot (case slot: where in shadow count will be asked, or CV/HR Slot: where a dropdown will be shown to user having static fields). mentor name should be auto populated and category/description fields are not required. The mentor can then manually change slot type, mode and timings for each of the slot that they see. throughout all this, time should be a dropdown with actual legitimate times according to 24 hr clock with 5 minute intervals for the mentor to be able to add/edit. the release should give 2 options: release now (which releases instantly but rarely used) or the release datetime selection which should be calendar wise and time dropdown wise as discussed with proper minima maxima and overlap logics in place.
4. for the student, just one thing, when they click book now, if it is a case slot, then they get 2 options to choose from: shadow/solver. solver count is always 1 and shadow count decided by mentor while releasing. if it is a CV/HR slot then clicking on book now will give option to the student to choose from: Entire CV, workex, POR, HR Questions.
5. The navbar shows a few buttons which seem redundant as they only show what login based homepage shows for either of the profiles we have. There are essentially 2 screens for both users: My releases and schedule a release screen for mentor, and Upcoming releases and my bookings for the student. So lets keep these minimalistic with the current UI theme looking good but not cramming up the screen with a lot of information.
6. Remove the demo simulation controls thing as it is not needed and I can manage my present without it as well

Lets incorporate these changes into the current implementation.
```

## Earlier Condensed Prompt Notes (Historical)
```markdown
# Project: Parthsaarthi — Scheduled Slot Release MVP
## 1. Context

I am building a feature enhancement for the existing IIM Lucknow student portal "Parthsaarthi".

Existing Parthsaarthi is used by the junior batch to book mentoring/SIP slots released by senior students/mentors.

The current problem is:

* The junior batch has approximately 580 students.
* A mentor may release only a small number of slots, generally in single digits and sometimes up to around 15.
* Booking is effectively first-come-first-served.
* Mentors commonly announce on community/student communication channels when they intend to release slots, including:

  * topic/session details
  * expected release time
  * who the session is intended for
  * what students can expect
* Currently, the actual release can depend on the mentor manually returning to the portal and performing the release action.
* This creates a coordination problem: a mentor may forget, be delayed, or release the slots at a different time than announced.
* Students who are actively waiting may therefore miss the release despite having followed the announced timing.

## 2. Product idea

Build a new feature called:

"Scheduled Slot Release"

Core principle:

> The mentor decides when the slots should become available. The system takes care of making them bookable at that time.

The feature should automate the scheduled release while preserving manual controls for the mentor.

IMPORTANT:
This is NOT a replacement for Parthsaarthi.
This is NOT a complete rebuild of Parthsaarthi.
This is a functional MVP demonstrating only the new scheduling feature and the minimum surrounding UI needed to demonstrate it.

The existing booking flow after a slot becomes available is OUT OF SCOPE.

## 3. Exact MVP boundary

The implementation begins when a mentor is creating/scheduling a release.

The implementation ends when the scheduled time has passed and the student's "Book Now" buttons become enabled.

After that point, clicking "Book Now" can lead to a simple placeholder/demo action representing the existing Parthsaarthi booking flow.

DO NOT build a complete booking system.

DO NOT build:

* payment
* messaging
* chat
* notifications infrastructure
* calendar integration
* attendance
* complete student profiles
* complete mentor profiles
* admin dashboards
* complicated eligibility systems
* real IIM authentication
* complete replication of the existing Parthsaarthi portal

## 4. Important UX concept

A mentor creates ONE release containing MULTIPLE individual slots.

Example:

Session:
"Consulting Case Preparation"

Slots:

* 3:00 PM – 3:30 PM
* 3:30 PM – 4:00 PM
* 4:00 PM – 4:30 PM
* 4:30 PM – 5:00 PM

The mentor chooses ONE release date/time, for example:

7 October 2026, 2:00 PM

ALL slots belonging to that release become bookable at the same scheduled release time.

On the student interface, however, every slot appears as an individual card with its own:

* time
* details
* duration
* Book Now button
* booking status

## 5. Screens to build

Build the following screens.

### SCREEN 1 — Mentor: Create Scheduled Release

Route example:

/mentor/create

Create a polished mentor-facing interface.

Fields:

#### Session details

* Session/topic title
* Description
* Mentor name
* Optional category

#### Slot details

Allow mentor to add multiple individual slots.

Each slot should contain:

* Start time
* End time
* Optional location/mode
* Optional slot-specific note

Provide:

* Add Slot
* Remove Slot

Example:

Consulting Case Preparation

3:00 PM – 3:30 PM
3:30 PM – 4:00 PM
4:00 PM – 4:30 PM
4:30 PM – 5:00 PM

#### Release scheduling

Fields:

* Release date
* Release time

Display a clear explanation:

"Students will be able to book these slots only after the scheduled release time."

Primary CTA:

"SCHEDULE RELEASE"

After successful submission show a confirmation state:

"Release scheduled successfully"

"Students can book these slots from 2:00 PM on 7 October 2026."

### SCREEN 2 — Mentor: Scheduled Releases

Route example:

/mentor/releases

Show the mentor's upcoming and past releases.

Each release card/table row should show:

* Session name
* Number of slots
* Release date
* Release time
* Status

Statuses:

SCHEDULED
OPEN
MANUALLY RELEASED
CANCELLED
COMPLETED

For scheduled releases provide:

* Edit
* Cancel
* Manual Release

IMPORTANT:

Manual Release is a deliberate fallback.

The scheduling feature should NOT remove the mentor's ability to manually release slots.

If a system issue occurs, the mentor should still be able to manually release the slots.

Manual release should require a confirmation dialog:

"Release these slots now?"

"Students will immediately be able to book them."

Buttons:

* Cancel
* Release Now

### SCREEN 3 — Student: Upcoming Session

Route example:

/student

Create a student-facing interface that feels like an extension of an existing IIM Lucknow student portal.

Do not attempt to perfectly reproduce the real Parthsaarthi UI because the exact student screenshots may not be available.

Instead, create a credible, clean academic/student portal design.

Each mentoring session should appear as a session section/card.

Example:

CONSULTING CASE PREPARATION

Mentor: Rahul Sharma
4 slots
30 minutes each

Description:
"Practice case interviews and discuss common consulting frameworks."

Show prominently:

"Slots release at 2:00 PM"

Then display a countdown:

00:14:32

Use a visually clear status:

LOCKED — BOOKING OPENS AT 2:00 PM

Below this, show the individual slots.

Each slot should be its own card.

Example:

3:00 PM – 3:30 PM
Case interview practice

[ BOOK NOW ]

The Book Now button must be disabled before release.

Repeat for every slot.

### SCREEN 4 — Student: After Release

Use the SAME student session UI.

The important difference is state.

Before release:

LOCKED

Book Now disabled.

After release:

OPEN

Book Now enabled.

For example:

3:00 PM – 3:30 PM

Case interview practice

[ BOOK NOW ]

The button is now clickable.

When clicked, do NOT implement the actual existing Parthsaarthi booking process.

Instead show a simple demo state:

"Continuing to Parthsaarthi booking flow..."

or

"Booking flow would continue here."

The purpose is only to demonstrate that our feature hands control back to the existing booking system.

## 9. Refresh behaviour

This is an important product requirement.

We do NOT need WebSockets.

We do NOT need live polling.

We do NOT need real-time push updates.

A student who was already viewing the page before the release time must refresh the page after the scheduled release time to see the newly enabled buttons.

The authoritative logic must be based on server/database state and current time.

Example:

scheduledReleaseAt = 2026-10-07T14:00:00

If:

current server time < scheduledReleaseAt

then:

* release is locked
* Book Now buttons are disabled

If:

current server time >= scheduledReleaseAt

then:

* release is open
* Book Now buttons are enabled

The UI should fetch the current release state on page load/refresh.

DO NOT rely only on client-side JavaScript time for the security/business decision.

## 10. Demo-only simulation control

Add a clearly labelled developer/demo control that is NOT part of the real student or mentor experience.

Example:

"DEMO CONTROLS"

[ Simulate Release Now ]

This allows the interviewer to demonstrate the transition without waiting until the actual scheduled time.

IMPORTANT:

* This should be hidden from normal student UI.
* It should be clearly labelled as a demo/development feature.
* It should NOT be described as part of the production feature.
* The actual production behaviour must depend on the scheduled release timestamp.

The demo should allow:

SCHEDULED
→ click Simulate Release Now
→ OPEN

This is purely for presentation.

## 11. Database

Use MongoDB Atlas.

Use the official MongoDB Node.js driver or another lightweight MongoDB integration compatible with Next.js.

Do NOT introduce unnecessary database abstraction unless useful.

Suggested collections:

### users

Fields:

* _id
* name
* email
* role

  * student
  * mentor
* createdAt

For the MVP, authentication can be simplified/demo-based.

Do NOT build real IIM SSO unless explicitly requested later.

### releases

Fields:

* _id
* mentorId
* title
* description
* category
* releaseAt
* status
* createdAt
* updatedAt
* manuallyReleasedAt
* cancelledAt

Possible status values:

scheduled
open
manually_released
cancelled
completed

IMPORTANT:

Do not rely solely on a status field to determine whether a scheduled release is actually available.

The business rule should be:

If status is scheduled AND current server time >= releaseAt,
the release should be considered open.

This protects against stale status values.

### slots

Fields:

* _id
* releaseId
* startTime
* endTime
* mode
* location
* note
* createdAt

Multiple slots belong to one release.

### bookings

For the MVP this can be minimal.

Fields:

* _id
* slotId
* studentId
* bookedAt

The actual booking implementation is out of scope, but structure the data model so that one slot can have only one booking.

Use a unique database constraint/index on slotId if implementing the demo booking action.

The database should be the final authority against duplicate bookings.

## 12. API / backend requirements

Create clean server-side API routes or route handlers.

At minimum:

POST /api/releases
Create a release.

GET /api/releases
List releases.

GET /api/releases/[id]
Get release and associated slots.

PATCH /api/releases/[id]
Edit scheduled release.

POST /api/releases/[id]/manual-release
Manually release a scheduled release.

POST /api/releases/[id]/cancel
Cancel a release.

GET /api/student/releases
Get relevant student releases.

The exact Next.js route organization can be chosen sensibly.

All database operations must happen server-side.

Never expose MONGODB_URI to the browser.

## 13. Authentication

For this MVP, implement a lightweight demo authentication mechanism.

Provide a login screen where the user chooses:

Student Demo
Mentor Demo

This is acceptable because the purpose is to demonstrate the product feature, not to reproduce IIM Lucknow's actual authentication system.

Persist the selected demo role using a secure/simple session mechanism appropriate for the MVP.

The UI should clearly indicate:

"Demo environment"

Do NOT pretend that this is real IIM authentication.

Structure the application so that real IIM SSO could replace this later.

## 14. Time handling

This feature is fundamentally time-sensitive.

Use a consistent timezone.

For the MVP use:

Asia/Kolkata / IST

Store timestamps in UTC where appropriate, but display them in IST.

Make the timezone explicit in the UI when useful.

Avoid ambiguous browser-local time behaviour.

The release decision should use a server-side authoritative timestamp.

## 15. UI / visual design

The design should look like a credible extension of a premium Indian B-school student portal.

Design principles:

* Clean
* Modern
* Professional
* Minimal
* Responsive
* Desktop-first but mobile-friendly
* Strong information hierarchy
* Clear distinction between scheduled and open states
* Avoid excessive animations

Use cards for individual slots.

The release countdown should be visually prominent but not gimmicky.

Use accessible button states.

Disabled Book Now should be visually obvious.

Open Book Now should look actionable.

Use a restrained academic/professional visual identity.

Do not use fake IIM Lucknow logos unless we have permission/assets.

You can use text such as:

"Parthsaarthi"
"Mentoring & SIP"

but make clear through the overall design that this is a prototype enhancement.

## 16. Demo data

Seed the database with realistic demo data.

Example mentor:

Rahul Sharma

Example student:

Vaibhav Raj Sahni

Example session:

"Consulting Case Preparation"

Description:

"Practice case interviews, discuss problem-solving approaches and receive feedback."

Example slots:

3:00 PM – 3:30 PM
3:30 PM – 4:00 PM
4:00 PM – 4:30 PM
4:30 PM – 5:00 PM

Use a configurable release time so the demo can easily be tested.

## 17. Important business rules

Implement these carefully.

### Rule 1

A release can contain multiple slots.

### Rule 2

All slots in a release become bookable at the same release time.

### Rule 3

Before releaseAt:
Book Now must be disabled.

### Rule 4

At or after releaseAt:
Book Now becomes enabled after the student refreshes/reloads the data.

### Rule 5

Mentor can manually release a scheduled release before its scheduled time.

### Rule 6

Mentor can edit/cancel a scheduled release.

### Rule 7

A cancelled release must not become bookable merely because its original releaseAt has passed.

### Rule 8

A manually released release should immediately be considered open.

### Rule 9

The demo "Simulate Release Now" function is not a production feature.

### Rule 10

Do not rebuild the existing booking system.

## 18. Error handling

Handle at minimum:

* Missing session title
* Missing release date/time
* Release time in the past
* No slots added
* Invalid slot times
* End time before start time
* Duplicate/overlapping slots where relevant
* Database unavailable
* Failed scheduling request
* Failed manual release
* Failed cancellation
* Invalid release ID

Show useful human-readable error messages.

Do not expose raw database errors to users.

## 19. Concurrency / scale

The application should be designed so that the scheduler itself does not require a continuously running server process.

Do NOT create a cron job simply to flip:

scheduled → open

Instead, store releaseAt and determine availability against the authoritative current time.

This means the system remains correct even if there is no process running exactly at releaseAt.

For future scale, mention that actual booking allocation must use an atomic database operation / unique constraint so that two students cannot successfully book the same slot.

## 20. Project structure

Use a clean Next.js project structure.

Suggested structure:

app/
login/
student/
mentor/
create/
releases/
api/
releases/
student/

components/
SlotCard
ReleaseCard
Countdown
StatusBadge
MentorReleaseForm
DemoControls

lib/
mongodb.ts
release-utils.ts
time-utils.ts

models/ or db/
users
releases
slots
bookings

scripts/
seed.ts

docs/
development-prompts.md
README.md

Use TypeScript.

## 21. Environment variables

Use:

MONGODB_URI=

Do NOT expose this as NEXT_PUBLIC_MONGODB_URI.

Keep secrets in .env.local during development.

Do not commit .env.local.

Create/update .gitignore appropriately.

## 22. Documentation requirement

Create a docs/README.md containing:

1. Product overview
2. Problem statement
3. MVP scope
4. Features
5. User flows
6. Tech stack
7. Architecture
8. Database collections
9. Authentication approach
10. Time/release logic
11. API routes
12. Hosting/deployment
13. Known limitations
14. Future improvements

Also create:

docs/development-prompts.md

Record the important AI prompts used during development.

Include:

* initial master prompt
* prompts used to debug
* prompts used to improve UI
* prompts used to implement MongoDB
* prompts used to deploy
* prompts used to fix bugs

Do not fabricate prompts that were not actually used.

## 23. Testing

Before considering the MVP complete, test:

### Mentor

* Create release
* Add multiple slots
* Schedule release
* View scheduled release
* Edit release
* Cancel release
* Manually release release

### Student

* View scheduled release
* See release time
* See countdown
* See disabled Book Now
* Refresh after release time
* See enabled Book Now
* Click Book Now

### Time edge cases

* Just before release
* Exactly at release
* Just after release
* Cancelled release after releaseAt
* Manually released before releaseAt

### Database

* Data persists after page refresh
* Multiple slots correctly reference one release
* MONGODB_URI remains server-side

## 24. Development priorities

Priority 1:
Core scheduling logic.

Priority 2:
MongoDB persistence.

Priority 3:
Student before/after release experience.

Priority 4:
Mentor manual controls.

Priority 5:
UI polish.

Priority 6:
Documentation.

Do NOT spend excessive time on animations or decorative features before the core flow works.

## 25. Acceptance test

The application is considered successful if I can perform this demo:

1. Log in as mentor.
2. Create "Consulting Case Preparation".
3. Add four slots:
   3:00, 3:30, 4:00, 4:30.
4. Set release time a few minutes into the future.
5. Schedule it.
6. Switch to student view.
7. See all four slot cards.
8. See the scheduled release time and countdown.
9. See Book Now disabled.
10. Use DEMO CONTROLS → Simulate Release Now.
11. Refresh student page.
12. See all four Book Now buttons enabled.
13. Click one.
14. See placeholder transition to the existing Parthsaarthi booking flow.

This flow must work reliably.

## 26. Important instruction to the AI developer

Do not overengineer this project.

The goal is a realistic MVP for an IIM Lucknow campus product pitch.

Prioritize:

* correct business logic
* clean UX
* working MongoDB persistence
* understandable architecture
* reliable demo
* maintainable code

Whenever there are multiple technically valid approaches, choose the simplest approach that is reliable and easy for a non-specialist founder/product owner to explain in a 15-minute interview.

Before making major architectural decisions that expand the scope, explain the decision and choose the simplest reasonable option.

Start by inspecting the current project structure if one exists. If the project is empty, initialize the Next.js TypeScript application and then implement the MVP above.

Do not stop at creating mockups. Build a genuinely functional full-stack MVP.
```

## PROMPT 2 (Earlier Condensed Copy)
```text
For now lets do the following things:
1. Remove all hardcoded data in the system
2. create two users: mentor named PGP41, and student named PGP42.
3. for a mentor, while releasing slots, they get first option to choose time from when till when, and per slot time, which automatically adds those many slots in the list with the mode(online or offline) and defined type of slot (case slot: where in shadow count will be asked, or CV/HR Slot: where a dropdown will be shown to user having static fields). mentor name should be auto populated and category/description fields are not required. The mentor can then manually change slot type, mode and timings for each of the slot that they see. throughout all this, time should be a dropdown with actual legitimate times according to 24 hr clock with 5 minute intervals for the mentor to be able to add/edit. the release should give 2 options: release now (which releases instantly but rarely used) or the release datetime selection which should be calendar wise and time dropdown wise as discussed with proper minima maxima and overlap logics in place.
4. for the student, just one thing, when they click book now, if it is a case slot, then they get 2 options to choose from: shadow/solver. solver count is always 1 and shadow count decided by mentor while releasing. if it is a CV/HR slot then clicking on book now will give option to the student to choose from: Entire CV, workex, POR, HR Questions.
5. The navbar shows a few buttons which seem redundant as they only show what login based homepage shows for either of the profiles we have. There are essentially 2 screens for both users: My releases and schedule a release screen for mentor, and Upcoming releases and my bookings for the student. So lets keep these minimalistic with the current UI theme looking good but not cramming up the screen with a lot of information.
6. Remove the demo simulation controls thing as it is not needed and I can manage my present without it as well

Lets incorporate these changes into the current implementation.
```

## Current Project Reference (As Built)

### Stack and commands
- Next.js 14.2.15 App Router, React 18.3.1, TypeScript, and Tailwind CSS 3.4.13.
- MongoDB Node.js driver 6.9.0; `lucide-react` for icons.
- `npm run dev` starts Next.js on port 3000; `npm run build` builds; `npm start` serves the build on port 3000; `npm run seed` runs `scripts/seed.ts`.
- IST display and date conversion use `Asia/Kolkata`; timestamps are stored as UTC ISO strings.

### Main MongoDB collections
- `users`: `_id`, `name`, `email`, `role`, `createdAt`. Startup ensures demo mentor/student records; the UI role picker is not real authentication.
- `releases`: `_id`, `mentorId`, `mentorName`, `title`, optional `description`/`category`, `releaseAt`, `status`, timestamps, and optional manual-release/cancellation timestamps.
- `slots`: `_id`, `releaseId`, `startTime`, `endTime`, `mode`, `slotType`; case slots also hold `shadowCount`, solver reservation, and shadow reservations. CV/HR bookings hold the student's selected focus and booking identity.
- `bookings`: `_id`, `slotId`, `releaseId`, student identity, mentor/session details, time/mode, case role or CV/HR choice, and `bookedAt`.
- `lib/mongodb.ts` uses `MONGODB_URI` server-side when configured and falls back to a lightweight in-memory store when no database is configured or reachable. In-memory data is not durable across process restarts.

### Login and identity
- `/login` presents Student and Mentor demo personas. Selection is saved in browser `localStorage` as `parthsaarthi_demo_role`; it does not verify credentials or protect API routes.
- The navbar reflects the current `/student` or `/mentor` route and offers a role switch. The current displayed personas are Gayathri Arvind (mentor) and Vaibhav Raj Sahni (student).
- Replace this demo mechanism with real authentication/authorization before production use.

### Hosting and environment
- No production hosting provider or deployment configuration is present in this repository. The project is configured to run locally; do not describe it as deployed.
- Configure `MONGODB_URI` in a local ignored environment file or hosting provider's server-side environment settings. `.env.example` currently uses a local MongoDB URI and sets `NEXT_PUBLIC_TIMEZONE=Asia/Kolkata`.
- Never expose the database URI through a `NEXT_PUBLIC_` variable.

### Main routes and current behavior
- Mentor: `/mentor/create` creates multi-slot releases; `/mentor/releases` lists, edits, cancels, and manually releases them.
- Student: `/student` has separate Upcoming and Booked Slots tabs. Case bookings collect Solver/Shadow; CV/HR bookings collect one of four focus areas.
- Release availability is calculated against server time and the stored `releaseAt`; manual release and cancellation remain supported.
- Demo simulation controls and their simulation/reset endpoints were removed. Release timing should be tested by scheduling a real near-future timestamp.

### Follow-up chat prompt history

These are subsequent product-change prompts from the development conversation, in chronological order.

#### Mentor identity, booking flow, demo controls, and navigation
```text
Lets do the following:
1. Remove all the logic for demo simulation controls
2. Name the mentor "Gayathri Arvind" everywhere for now, instead of rahul sharma or PGP41
3. You need to understand this logic: mentor either selects case slot along with shadow count as already done, or just CV/HR slot. the mentor does not see that dropdown for cv hr slot, it is being shown to the student only. and for the student, when they click book now button, if it is a case slot, they will get to choose either shadow or solver button only then complete booking button will be enabled, and if it is a cv hr slot, then those 4 entries will be shown as a dropdown after clicking book now button and before clicking complete booking button.
4. just remove the "student view", "scheduled releases" and "+schedule release" buttons from the navbar as they dont serve any new purpose here. we want to keep it simplistic here
```

#### Student booking, times, and booked-slot view
```text
1. shadow max count should not be 5, it should be 15
2. schedule release timing dropdown for mentor should not show past times like if while filling details a certain time passed away from dropdown it should be removed. at 6:10, 6:15 should be the first slot
3. when view as student is clicked, the page changes but in navbar it still shows you are gayathri arvind
4. once you have taken a shadow or a solver, that particular slot should be disabled for you as you cannot book the same slot more than once
5. Add a section for the student to show list of their currently booked slots
```

#### Separate student views
```text
showing upcoming and already booked slots one below the other seems a bit weird. just add both of these separately by using a toggle above maybe so they are separately easily accessible
```

#### Slot duration options
```text
per slot duration should be 10 to 60 minutes dropdown intervals of 5 minutes
```

#### Documentation request
```text
Document: The prompts you have used to develop the app in a markdown file in the folder itself. Tech stack, main database tables, how login works, and where it's hosted etc.

I want you to create this file and keep it here in this project. Before all your chat prompt history, add the following initial prompts i gave in the beginning to this document as well.
```

---

## Development History

The following notes preserve the earlier engineering log. They describe historical implementation goals where they differ from the current reference above.

### Environment & toolchain notes
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

## 3. Database Architecture & MongoDB Notes
The implementation uses the MongoDB Node.js driver when `MONGODB_URI` is available and has an in-memory fallback for local evaluation. Startup ensures demo user records; it does not automatically insert a sample release. The optional seed script clears and seeds demo users, but release creation is performed through the mentor interface.

---

## 4. UI / UX Design & Student Experience Prompts
### Design Goal:
Credible, premium Indian B-school academic aesthetic (IIM Lucknow style), clean typography, restrained animations, clear status contrast between `LOCKED` (amber/slate) and `OPEN` (emerald green).

**Key Components Designed**:
1. `Navbar.tsx`: Live IST clock ticking in real time with `Asia/Kolkata (UTC+5:30)` badge, demo persona switcher (Mentor vs. Student), and institutional branding.
2. `Countdown.tsx`: Live countdown with `HH:MM:SS` timer, displaying "Scheduled release time reached! Refresh to Book" when timer hits zero.
3. `SlotCard.tsx`: Individual slot cards displaying time, duration, room/Google Meet link, topic notes, and disabled `[ BOOK NOW (LOCKED) ]` vs actionable `[ BOOK NOW ]`.
4. `BookingModal.tsx`: Collects case role or CV/HR focus before completing a booking.
5. `MentorReleaseForm.tsx`: Dynamic multi-slot addition/deletion, case shadow counts (up to 15), and IST scheduling.
6. Student slot views: Upcoming releases and My Booked Slots are separated into tabs.

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
  - Enter *"Consulting Case Preparation"*, mentor Gayathri Arvind, add 4 slots (3:00 PM, 3:30 PM, 4:00 PM, 4:30 PM).
   - Set release time 3 minutes in future. Submit.
   - Verify confirmation banner and presence in `/mentor/releases`.
2. **Student Flow (Before Release)**:
   - Access `/student`.
   - Verify session details, 4 slot cards, countdown timer, and disabled `BOOK NOW` buttons.
3. **Release & Booking**:
  - Wait until the scheduled timestamp, then refresh `/student`.
  - Click `BOOK NOW`, select Solver or Shadow for a case slot (or a CV/HR focus), and complete the booking.
