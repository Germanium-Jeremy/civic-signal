# CivicSignal Mobile Client Remediation Guide

This file applies only to the Expo client application in the `civic-signal` folder.

Scope:

- Update the app screens, components, hooks, and client API helpers in `civic-signal`.
- Do not modify the server-side Next.js app in `CivicSignal` unless a client contract mismatch must be documented.
- Treat the backend in `CivicSignal` as the source of truth for auth and issue API behavior.

---

## Goal

The current client app has a mix of working UI screens and partially wired auth flows. Several screens look complete, but they do not consistently follow the API contract, do not normalize user data correctly, and in some cases bypass validation or use state transitions that do not match backend rules.

The client must be corrected so it behaves like a real React Native/Expo app connected to the real auth backend, not a mock UI flow.

---

## Current problems discovered

### 1) Auth API contract is not consistently handled

Files involved:

- `services/apis/authServices.ts`
- `services/apis/config.ts`
- `app/(auth)/signin.tsx`
- `app/(auth)/signup.tsx`
- `app/(auth)/forgot.tsx`
- `app/(auth)/reset.tsx`

Issues:

- The client login flow expects a `result.requiresVerification` and `result.email` / `result.phone` response, but the server response is not uniformly shaped across all flows.
- Several calls return `{ success: true, data: ... }` or `{ success: false, error: ... }`, but screen logic is inconsistent about whether to read `result.data`, `result.message`, or `result.error`.
- The app sometimes calls the API and then ignores the backend contract when deciding whether to navigate or show an alert.
- Some auth functions do not normalize email/phone before sending to the server.

Corrective action:

- Standardize all auth responses in the client to a single pattern:
  - `success: boolean`
  - `message?: string`
  - `error?: string`
  - `data?: ...`
  - `requiresVerification?: boolean`
  - `email?: string`
  - `phone?: string`
- Every screen should gate navigation on the real response object instead of assumptions.
- Avoid reading nested properties that are not guaranteed by the backend contract.

---

### 2) Sign-in screen can mis-handle verification-required logins

File involved:

- `app/(auth)/signin.tsx`

Issues:

- The login screen calls `AuthService.login(email.toLowerCase(), password)` but does not validate the returned payload before redirecting.
- The verification branch uses `result.requiresVerification`, `result.email`, `result.phone`, `result.emailVerified`, and `result.phoneVerified`, but the backend login route only returns those values under a specific branch.
- If the response is missing fields, the app may still navigate or show broken verification state.

Corrective action:

- Before redirecting, verify `result.success` and then ensure all verification values are present when needed.
- If `requiresVerification` is true, pass the values through the verification screen in a predictable object.
- Ensure the app uses `email.toLowerCase()` consistently before submission.

---

### 3) Registration flow is incomplete and inconsistent with backend rules

File involved:

- `app/(auth)/signup.tsx`

Issues:

- The client validates `password.length < 8` only, while the backend uses a stronger validation helper that checks more requirements.
- The screen accepts a phone number without a consistent sanitization helper, even though the server normalizes phone values.
- The app navigates to the verification page with params but does not guarantee those params reflect the final normalized values from the backend.

Corrective action:

- Create a shared client-side validator that mirrors backend password rules.
- Normalize `email` and `phone` before submitting and before forwarding them to other screens.
- Use a single `normalizePhone()` and `normalizeEmail()` helper in the client app so the same values are used everywhere.

---

### 4) Forgot password flow is not actually implementing the real reset flow

File involved:

- `app/(auth)/forgot.tsx`

Issues:

- The screen accepts either email or phone, but it hardcodes `method: "email"`.
- It routes to `/(auth)/reset` with only `identifier` in params, which does not include the actual method or a stable verification state.
- The flow does not support both email and phone reset paths correctly.

Corrective action:

- Detect whether the entered identifier contains an `@` to decide between `email` and `phone`.
- Send the correct method value to `AuthService.forgotPassword(identifier, method)`.
- Pass enough params to the next screen to decide the correct reset logic and resend behavior.

---

### 5) Reset password flow is not aligned with the backend contract

File involved:

- `app/(auth)/reset.tsx`

Issues:

- The reset screen only checks password equality, then calls the API with a guessed method from the identifier.
- It does not validate the entered reset code length or the reset state before making the request.
- It does not keep a clear separation between the identifier used for reset and the method used for the reset token.
- It assumes the backend is always available and never handles a missing `identifier` state correctly.

Corrective action:

- Validate the code and new password before making the API call.
- Pass `identifier`, `resetCode`, `newPassword`, and `method` explicitly.
- Confirm that the app reads all values from the prior screen state or navigation params, not by inferring them late.

---

### 6) Verification flow has logic bugs and broken state handling

File involved:

- `app/(auth)/verifyaccount.tsx`

Issues:

- The screen reads params from `useLocalSearchParams()`, but the verification flow does not consistently ensure the email/phone values are present before calls.
- The email and phone verification code states are assessed locally, but the actual backend says that full account verification only succeeds when both are verified server-side.
- The app uses local toggles and may redirect too early if a user only completed one side.
- Some states are not reset correctly after a failed verification and can leave stale code values in the input fields.

Corrective action:

- Only mark a value as verified after a successful backend response.
- Only allow navigation to home after both checks succeed, or after the backend declares `fullyVerified`.
- Always clear the relevant code field on an error and re-enable the user to retry cleanly.
- Before verifying, guard against empty `email` or `phone` params.

---

### 7) Phone and email normalization is inconsistent across the client

Files involved:

- `app/(auth)/signin.tsx`
- `app/(auth)/signup.tsx`
- `app/(auth)/forgot.tsx`
- `app/(auth)/reset.tsx`
- `services/apis/authServices.ts`

Issues:

- Some screens lower-case email before submission, others do not.
- Some screens strip spaces from the phone number, others do not.
- Some flows store raw strings and then rely on the server to clean them, which makes the app less predictable.

Corrective action:

- Create shared helpers in the client, for example:
  - `normalizeEmail(value: string): string`
  - `normalizePhone(value: string): string`
- Call them on every auth submission and before composing verification URLs or reset params.

---

### 8) Expo / React Native syntax and runtime issues are present in multiple screens

Files involved:

- `app/(auth)/signin.tsx`
- `app/(auth)/signup.tsx`
- `app/(auth)/verifyaccount.tsx`
- `app/(auth)/reset.tsx`
- `app/(tabs)/_layout.tsx`
- `components/*`

Examples observed:

- Some screens define state with unusual spacing or inconsistent formatting, which makes logic harder to audit.
- Some code uses `useRouter` incorrectly for dynamic params, and the screen sometimes relies on route objects that are not consistently constructed.
- There are multiple states that are declared but never actively used in the final navigation logic.
- Some components have mismatched prop patterns or inconsistent naming conventions (`lodingSubmit`, `fullNames`, `navigate`/`router` variables, etc.), which increases risk.

Corrective action:

- Standardize component naming and state naming across the whole client app.
- Use `router.push` / `router.replace` with explicit path + params objects that match Expo Router expectations.
- Remove unused state and dead code after refactoring auth screens.
- Keep all screen-level state tracked in a single predictable pattern: input -> validate -> call API -> handle response -> navigate.

---

### 9) Tab screens and issue API usage contain response-handling and TypeScript risks

Files involved:

- `app/(tabs)/home/index.tsx`
- `app/(tabs)/issues/index.tsx`
- `app/(tabs)/issues/details.tsx`
- `app/(tabs)/profile/index.tsx`
- `services/apis/issueServices.ts`

Issues:

- `HomeScreen.fetchData()` reads nested values such as `issuesResult.data.data.issues` without guarding the intermediate objects. If the response shape changes or a call fails partially, the app will throw and break the screen.
- `HomeScreen` logs the raw issue list with `console.log("Issues: ", issuesResult.data.data.issues)` in production code. That makes debugging noisy and is not appropriate for a production mobile app.
- `IssuesScreen.fetchIssues()` does not guard for a failed `IssueService.getMyIssues()` call before writing to state. It also updates `pages` after the fetch, but the page counter is not synchronized with the actual response and can drift if requests fail or return inconsistent data.
- `IssuesScreen.handleLoadMore()` uses `loadingMore` correctly, but the logic does not account for partial failures and may leave `pages` and `hasMore` in incorrect states after a failed API call.
- `IssuesScreen.fetchAllInitial()` loads all tabs simultaneously with `Promise.all`, which is heavy and can generate unnecessary backend traffic. It is acceptable only when the app is designed for it; the current implementation does not show guardrails or a loading strategy for large data sets.
- `ProfileScreen` treats logout as success regardless of backend result: `if (result.success || !result.success) { navigate.replace(...) }`. This bypasses the actual error state and can hide failed logout requests.
- `ProfileScreen` uses `setUserStats({ pending: statsResult.data.inProgress, ...})` while the UI type defines `pending`, but the data source is `inProgress`. This is a contract mismatch that is easy to break during refactoring.
- `IssueDetailsScreen` uses a nested response contract (`response.data.data.issue`) without a stable fallback when `data` is missing or the API returns a different shape. The app should validate the response and handle empty payloads before reading nested properties.
- `IssueService.getMyIssues()` and `IssueService.getMyStats()` assume the presence of `TokenManager.getUserData()` and a specific backend response shape. These helpers should validate the response before returning success and should not assume `user.id` always exists.
- `IssueService.getMyStats()` relies on `response.data.success` without checking whether `response.data` is defined, and then reads `response.data.data.issues` directly. This is a brittle contract and can fail silently or produce a runtime error.

Corrective action:

- Add response-shape guards in every tab screen before reading nested fields.
- Replace production logging with proper error state handling.
- Normalize all issue API results into a consistent contract: `success`, `data`, `error`, `message`.
- Update the page state only after confirming the backend returned the expected payload.
- Keep `pages` and `hasMore` synchronized with actual API results.
- Treat logout as a real action: only navigate on confirmed success, or show an error if the backend rejected the request.
- Standardize naming between `pending` and `inProgress` across the client and server contract.
- Centralize issue data parsing into a typed helper so the screens do not keep re-reading the same nested response contracts.

---

### 10) API helper patterns in the tabs are brittle and should be normalized

Files involved:

- `services/apis/issueServices.ts`
- `services/apis/config.ts`
- `app/(tabs)/*.tsx`

Issues:

- Several functions in `IssueService` return `{ success: true, data: response.data }` while screens expect `result.data.data.issue` or `result.data.data.issues`. That is a deeply nested contract and is not self-documenting.
- The app repeatedly reaches into backend responses by assuming a fixed nesting level, which is fragile and can break any time the API response structure changes.
- Many tab screens do not enforce a TypeScript contract for the returned objects, which makes them vulnerable to `undefined` access and runtime crashes.
- Some screens use `any` liberally for issue objects and state, which hides bugs instead of making them visible to TypeScript.

Corrective action:

- Define typed interfaces for issue payloads, stats payloads, and API results.
- Make `IssueService` return stable shapes such as `{ success: boolean; data?: Issue[] | IssueStats | IssueDetail; error?: string }`.
- Let screen code consume a normalized structure instead of assuming a nested `data.data` chain.
- Replace `any` with concrete types where possible, especially in list items and API payloads.
- Validate `response?.data` before using it.

---

## Backend contract to mirror on the client

The current backend in `CivicSignal/src/app/api/auth/*` already defines the expected behavior. The client should follow this contract closely:

- `login`:
  - Success: returns `success: true`, tokens, user info.
  - Verification required: returns `requiresVerification: true` with `email` and `phone` values.
- `register`:
  - Returns `success: true` and verification metadata after creating a user.
- `verify-email` / `verify-phone`:
  - Return `success: true`, `fullyVerified`, and user state.
- `forgot-password`:
  - Returns `success: true` and a message after sending the code.
- `reset-password`:
  - Returns `success: true` after password change, otherwise an invalid or expired code error.

The client must respect that contract rather than inventing its own flow assumptions.

---

## Recommended fix order

1. Normalize the client auth contract
   - Centralize all auth response handling in `services/apis/authServices.ts`.
   - Make every method return a consistent result shape.

2. Add shared input normalization helpers
   - Normalize email values to lower-case.
   - Strip whitespace and sanitize phone values before sending them.

3. Fix the auth entry screens
   - `signin.tsx`
   - `signup.tsx`
   - `forgot.tsx`
   - `reset.tsx`

4. Fix verification screens and state flow
   - `verifyaccount.tsx`
   - `verifycode.tsx` if still used

5. Clean up route navigation and params
   - Ensure navigation objects include the exact params the next screen expects.
   - Avoid hiding missing params behind default values.

6. Remove dead code and inconsistent variable names
   - Delete unused states.
   - Rename confusing variables (`fullNames`, `lodingSubmit`, `navigate`, `searchItems`) so the logic is readable.

7. Type-check and lint the client app
   - Run `npx tsc --noEmit`
   - Run `npx expo lint`
   - Run the mobile app manually and verify each auth flow end-to-end.

---

## Implementation rules for this app only

- Do not rewrite the server-side API logic in `CivicSignal` as part of this mobile fix.
- Treat the API under `src/app/api/auth/*` as the contract source.
- Keep modifications isolated to the `civic-signal` client app.
- Use shared helpers to keep formatting and validation consistent across all auth screens.
- Keep route params transparent and explicit.
- Only navigate to the next screen when the backend has accepted the action.

---

## Minimum validation checklist before finishing

- User can sign up with valid values.
- Email and phone are normalized before API calls.
- Registration redirects to the verification screen with correct params.
- Email and phone verification send valid codes and wait for server confirmation.
- Login handles both verified and unverified accounts correctly.
- Forgot password sends the correct method and contacts the correct destination.
- Reset password validates the code and updates the password successfully.
- The app does not rely on fake timers or mock success states for account actions.
- TypeScript and lint checks pass on the client app.

---

## Summary

The main issue is not one single syntax bug; it is a client-side auth and state-management problem caused by inconsistent contracts, inconsistent validation, and partial logic around verification and reset flows. The fix should be targeted, step-by-step, and restricted to the Expo app in `civic-signal`.
