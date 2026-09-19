# Village Voice Hub

Build the complete frontend for GramVoice 2.0, a village-governance web platform, using React + Vite + TypeScript + Tailwind CSS + React Router. This is a UI-first build — no real backend yet. Use a mock API layer (functions shaped like future REST calls) and mock/local state for everything, including authentication.

THEME: Light theme, but colorful and warm — not monochrome. Use a light off-white/white background (#FAFAF9) as the base, with 2-3 confident accent colors: a primary color (deep teal or blue, e.g. #1D7A73) for main actions and navigation, a secondary warm accent (e.g. golden amber #E0A526) for highlights/secondary actions, and clear distinct colors for the 4 complaint statuses (see below). Keep it clean and uncluttered despite being colorful — color should create hierarchy and warmth, not noise. Rounded corners (12-16px), soft shadows only on elevated elements, large touch targets (48px min), 16px+ body text, icons always paired with text labels. Must feel simple, modern, trustworthy, and easy for first-time/low-literacy rural users — never like a bureaucratic government portal.

TOTAL SCREEN COUNT: exactly 20 screens, listed below. Do not add, split, or duplicate screens beyond this list.

═══════════════════════════════════

AUTHENTICATION LOGIC (build exactly this)

═══════════════════════════════════

CITIZEN — passwordless by design (for accessibility), secured with a 4-digit PIN instead of a full password:

- Signup fields: Full Name (letters/spaces, 3-50 chars), Phone Number (exactly 10 digits, numeric, must be unique), Address (required text), Preferred Language (dropdown: English / Hindi / Tamil), 4-digit PIN (numeric, set once at signup — this is the only "credential" a citizen has).

- Login fields: Phone Number + 4-digit PIN. On success → redirect to Citizen Dashboard.

- No email, no OTP, no traditional password for citizens.

[NOTE: if you truly want zero credential at all, matching the original sketch, simply delete the PIN field from both signup and login here — everything else stays the same. Recommended to keep it for minimum security.]

ADMIN — full strength auth:

- Register fields: Government Registration Key (required, validate against a mock fixed value e.g. "GRAM-ADMIN-2026"), Full Name, Office/Department (text), Email, Phone Number, Password (min 8 chars, 1+ letter, 1+ number), Confirm Password (must match). After these, show a "Set Security Questions" step: 2 questions chosen from a fixed dropdown list (e.g. "Your first village posting?", "Your mother's hometown?") with free-text answers — these are used ONLY for password recovery, no email/OTP. On completion → redirect to Admin Login.

- Login fields: Email or Phone + Password. On success → redirect to Admin Dashboard.

- Forgot Password (admin only, since citizens have no password to forget): Step 1 enter Email/Phone → Step 2 answer the 2 security questions set at registration → Step 3 if correct, set New Password + Confirm Password → success → redirect to Admin Login.

All forms: inline validation errors under each field, submit button disabled until valid, clear loading/success/error states for every action. Protect all /citizen/* routes (except login/signup) and all /admin/* routes (except login/register/forgot-password) behind mock auth — redirect to the correct login screen if not authenticated. Citizen and Admin sessions are completely separate; a citizen session can never open an admin route and vice versa.

═══════════════════════════════════

COMPLAINT STATUS LOGIC (exact labels, exact order)

═══════════════════════════════════

Every complaint starts at "Under Review" the moment it's submitted. Admin can move it to "In Progress" while working on it. Admin then closes it as either "Completed" or "Rejected" (final states). Use these 4 exact labels everywhere a status appears, each with a distinct color:

1. Under Review (default on submit)

2. In Progress

3. Completed

4. Rejected

The citizen's Track Complaint screen must reflect whatever status the admin sets, in real time (mock this with local state).

═══════════════════════════════════

EXACT ROUTES / SCREENS TO BUILD (20 total)

═══════════════════════════════════

SHARED (1 screen)

1. `/` — Landing Page: GramVoice branding, one-line trust statement, "I'm a Citizen" and "I'm an Administrator" buttons, language switcher.

CITIZEN AUTH (2 screens)

2. `/citizen/login` — Phone Number + PIN, link to Signup.

3. `/citizen/signup` — Name, Phone, Address, Language, PIN (as specified above).

ADMIN AUTH (3 screens)

4. `/admin/login` — Email/Phone + Password, link to Register and Forgot Password.

5. `/admin/register` — Government Key, Name, Office/Department, Email, Phone, Password, Confirm Password, Security Questions setup (as specified above).

6. `/admin/forgot-password` — 3-step security question recovery flow (as specified above).

CITIZEN SCREENS (8 screens)

7. `/citizen/home` — Dashboard/hub: greeting, large action tiles for Register Complaint, Track Complaint, Rule Book, Request Service (no scrolling wall — just the essentials, rest reachable from a simple nav).

8. `/citizen/complaint/new` — Register a Complaint: clear toggle between "Voice" and "Text". Voice mode: mic button → recording indicator → simulated "Transcribing..." state → editable transcript box. Text mode: direct text area. Single Submit button, disabled until content present (min 10 characters). New complaints default to "Under Review".

9. `/citizen/complaints` — Track Complaint: list of all the citizen's complaints with color-coded status badges (using the 4 exact statuses above), newest first, tap to expand/view full detail with a simple status timeline.

10. `/citizen/rulebook` — Rule Book: simple readable list/sections of village rules (read-only for citizens).

11. `/citizen/contacts` — Access different Contacts: searchable list of important village/Panchayat contacts (name, role, phone).

12. `/citizen/services` — Request Service: simple form to request a public service + list of past requests.

13. `/citizen/chatbot` — Chat Bot: simple chat UI (mock bot responses for now) to answer citizen questions in plain language — this replaces a traditional FAQ page.

14. `/citizen/profile` — Profile: Image (avatar placeholder + upload), Name, Phone Number, Address, an Edit option to update these, and Logout.

ADMIN SCREENS (6 screens)

15. `/admin/home` — Admin Dashboard: brief overview (count of complaints by each of the 4 statuses, shortcut into Complaints Review) — keep to a few key numbers, not a wall of charts.

16. `/admin/complaints` — Complaints Review: filterable list of all citizen complaints (filter by the 4 statuses), each row shows citizen name, short preview, current status, date.

17. `/admin/complaints/:id` — Complaint Detail: full transcript/text, citizen info, a Reply field (admin's response to the complaint), and a status dropdown (Under Review / In Progress / Completed / Rejected) with a Save button — saving updates the admin dashboard AND the citizen's Track Complaint screen.

18. `/admin/rules` — Manage Rules: add / edit / delete village rules shown on the citizen Rule Book screen.

19. `/admin/announcements` — Manage Announcements: add / edit / delete announcements (displayed to citizens — surface these on the Citizen Home screen as a small section).

20. `/admin/profile` — Admin Profile: all registration details, Change Password (old password + new + confirm), Logout.

═══════════════════════════════════

SHARED COMPONENTS (build once, reuse everywhere)

═══════════════════════════════════

Button (primary/secondary/text variants), Input, TextArea, Select, PinInput (4-digit), Card, StatusBadge (4 status colors), VoiceRecorderControl, LanguageSwitcher, TopBar, SideNav (citizen) / SideNav (admin — visually distinct from citizen nav so the two portals never feel confusable), EmptyState, Toast/Alert, LoadingSpinner, Modal, ChatBubble (for chatbot).

Every list screen needs a designed empty state. Every async action needs a visible loading state and success/error feedback. Do not add screens, nav items, or dashboard widgets beyond the 20 listed above. Generate the full project: folder structure, routing, shared component library, a design-tokens file (Tailwind config), mock data layer, and all 20 screens fully styled with realistic placeholder data — production-quality, not wireframes.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/85809e3d-6580-4721-ba54-2a4ee2725b5b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
