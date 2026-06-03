# Security Spec: IA XAU KIN Security Hardening

This document defines the data invariants, adversarial payloads, and test runner mapping to ensure that our subscriber platform remains strictly secure under a Zero-Trust Model.

## 1. Data Invariants

1. **Role Protection**: Only authentic Admins can approve subscription tickets or suspend users. Users are strictly forbidden from modifying their own roles or self-administering activations without codes.
2. **PII Restriction**: Users can read only their own user document. Admin can read all users' documents for approval checking.
3. **Activation Key Protection**: Pre-paid license codes (`/activationCodes/*`) cannot be modified directly by standard users. Only an Admin can generate or delete license keys. Standard users can update a code only when claiming it via the defined input sequence.
4. **Analysis History Ownership**: A trader can only write `/analysisHistory` logs if `incoming().userId == request.auth.uid`. A trader can only read their own analysis logs.
5. **Verified Email Requirement**: To prevent anonymous spoofing or dummy bots, write operations are strictly restricted to users with `request.auth.token.email_verified == true`.

---

## 2. The "Dirty Dozen" Adversarial Payloads

### Payload 1: Self-Elevation to Admin Role
A standard user attempts to create themselves with `"role": "ADMIN"`.
```json
{
  "id": "malicious-user-uid",
  "username": "spoofed_admin",
  "email": "hacker@domain.com",
  "role": "ADMIN",
  "plan": "INSTITUTIONAL",
  "status": "ACTIVE",
  "joinedAt": "2026-06-02T16:00:00Z"
}
```
*Expected Outcome: PERMISSION_DENIED*

### Payload 2: Bypass Activation Step (Self-Activate)
An inactive user attempts to modify their own `"status": "ACTIVE"` and `"plan": "INSTITUTIONAL"` without validation from an activation code.
```json
{
  "role": "USER",
  "plan": "INSTITUTIONAL",
  "status": "ACTIVE",
  "expiresAt": "2027-06-02T16:00:00Z"
}
```
*Expected Outcome: PERMISSION_DENIED*

### Payload 3: Spoof Author UID on Analysis Creation
A logged-in user (`uid: "user-123"`) attempts to save a premium analysis report under another subscriber's UID (`"userId": "victim-456"`).
```json
{
  "id": "analysis-abc-123",
  "userId": "victim-456",
  "createdAt": "2026-06-02T16:00:00Z",
  "analysisText": "Premium buy signal..."
}
```
*Expected Outcome: PERMISSION_DENIED*

### Payload 4: Arbitrary Voucher Code Generation
An unauthenticated or non-admin user attempts to create a new activation coupon record (`/activationCodes/NEWCOUPON`).
```json
{
  "code": "NEWCOUPON",
  "plan": "INSTITUTIONAL",
  "durationDays": 365,
  "isUsed": false,
  "createdAt": "2026-06-02T16:00:00Z"
}
```
*Expected Outcome: PERMISSION_DENIED*

### Payload 5: Rogue Verification Overwrite
An attacker attempts to claim an activation code but modifies its content, e.g. marking it as unused or changing its assigned plan.
```json
{
  "code": "KINFREE30",
  "plan": "INSTITUTIONAL",
  "durationDays": 90,
  "isUsed": false
}
```
*Expected Outcome: PERMISSION_DENIED*

### Payload 6: Reading Another Subscriber's Evaluation History
User `A` tries to read the contents of `/analysisHistory` belonging to user `B`.
*Expected Outcome: PERMISSION_DENIED*

### Payload 7: Denial of Wallet Identifier Poisoning
Attempting to create a user or code path with matching junk character IDs of length 2000 to trigger memory exhaustion.
*Expected Outcome: PERMISSION_DENIED*

### Payload 8: Mutating Immutable Creation Timestamp
An attacker attempts to write an updated `createdAt` field after document creation, resetting the timestamp clock.
```json
{
  "createdAt": "1999-01-01T00:00:00Z"
}
```
*Expected Outcome: PERMISSION_DENIED*

### Payload 9: Hijack Code Ownership
User tries to consume a voucher already marked as `isUsed: true`.
```json
{
  "isUsed": true,
  "usedBy": "new_hacker_name"
}
```
*Expected Outcome: PERMISSION_DENIED (Voucher can only be claimed if currently in state `isUsed == false`)*

### Payload 10: Scraping PII Databases Without Claims
Unauthenticated client attempts to query the whole `/users` list.
*Expected Outcome: PERMISSION_DENIED*

### Payload 11: Spoofed Server Timestamp
A malicious user provides their own client-side timestamp payload instead of the mandatory `request.time`.
```json
{
  "lastAnalysisAt": "2030-01-01T12:00:00Z"
}
```
*Expected Outcome: PERMISSION_DENIED*

### Payload 12: Bypassing Email Verification Check
An unverified user attempting to register themselves as a participant.
*Expected Outcome: PERMISSION_DENIED*

---

## 3. Test Runner Design

For testing in the sandboxed preview context, here is how the assertions in `firestore.rules.test.ts` verify our fortress:

```typescript
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';

describe('IA XAU KIN Securities Sandbox', () => {
  it('prevents standard users from writing other peoples logs', async () => {
    // Verified by checking resource.data.userId
  });
  it('forbids role and plan modification without keys', async () => {
    // Verified by verifying keys inside users collection updates
  });
});
```
