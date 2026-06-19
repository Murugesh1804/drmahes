# Phase 1 API Reference - New Endpoints

## Follow-Up Management Endpoints

### 1. Get Pending Follow-Ups
```
GET /api/follow-ups/pending
```

**Description:** Retrieve all follow-ups that are due today or overdue

**Response:**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "patient_id": "507f1f77bcf86cd799439012",
    "patient_name": "John Doe",
    "appointment_id": "507f1f77bcf86cd799439013",
    "treatment_id": "507f1f77bcf86cd799439014",
    "scheduled_date": "2026-06-19",
    "follow_up_type": "phase-2-treatment",
    "description": "Complete root canal part 2",
    "status": "pending",
    "reminder_sent": false,
    "created_at": "2026-06-15T10:30:00Z"
  }
]
```

**Follow-Up Types:**
- `phase-2-treatment` - Multi-phase treatment continuation
- `check-up` - Routine check-up needed
- `suture-removal` - Sutures need removal
- `root-canal-final` - Final session of root canal
- `crown-fitting` - Crown fitting appointment
- `review` - Review of previous treatment
- `emergency` - Emergency follow-up needed
- `other` - Other type

**Status Values:**
- `pending` - Created but not scheduled
- `scheduled` - Appointment created for follow-up
- `completed` - Follow-up completed
- `cancelled` - Follow-up cancelled
- `no-show` - Patient didn't show up
- `rescheduled` - Rescheduled to new date

---

### 2. Get Patient's Follow-Ups
```
GET /api/follow-ups/patient/:patientId
GET /api/follow-ups/patient/:patientId?pending=true
```

**Description:** Retrieve all follow-ups for a specific patient. Use `?pending=true` to get only pending/scheduled follow-ups.

**URL Parameters:**
- `patientId` - MongoDB ObjectId of patient

**Query Parameters:**
- `pending` - Optional boolean (true/false). If true, only returns pending and scheduled follow-ups

**Response:**
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "patient_id": "507f1f77bcf86cd799439012",
    "appointment_id": "507f1f77bcf86cd799439013",
    "treatment_id": "507f1f77bcf86cd799439014",
    "scheduled_date": "2026-06-25",
    "follow_up_type": "check-up",
    "description": "Post-treatment check-up",
    "status": "pending",
    "reminder_sent": false,
    "created_at": "2026-06-15T10:30:00Z",
    "updated_at": "2026-06-15T10:30:00Z"
  }
]
```

---

### 3. Create Follow-Up
```
POST /api/follow-ups
```

**Description:** Create a new follow-up record for a patient

**Request Body:**
```json
{
  "patient_id": "507f1f77bcf86cd799439012",
  "appointment_id": "507f1f77bcf86cd799439013",  // Optional
  "treatment_id": "507f1f77bcf86cd799439014",    // Optional
  "scheduled_date": "2026-06-25",                // YYYY-MM-DD format (required)
  "follow_up_type": "phase-2-treatment",         // From enum above (required)
  "description": "Second phase of root canal treatment"  // Optional
}
```

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439015",
  "patient_id": "507f1f77bcf86cd799439012",
  "appointment_id": "507f1f77bcf86cd799439013",
  "treatment_id": "507f1f77bcf86cd799439014",
  "scheduled_date": "2026-06-25",
  "follow_up_type": "phase-2-treatment",
  "description": "Second phase of root canal treatment",
  "status": "pending",
  "reminder_sent": false,
  "completed_appointment_id": null,
  "created_at": "2026-06-19T14:30:00Z",
  "updated_at": "2026-06-19T14:30:00Z"
}
```

**Error Responses:**
```json
// Invalid patient ID
{ "error": "Valid patient required" }

// Missing scheduled date
{ "error": "Follow-up date required" }

// Missing follow-up type
{ "error": "Follow-up type required" }
```

---

### 4. Complete Follow-Up
```
PUT /api/follow-ups/:id/complete
```

**Description:** Mark a follow-up as completed and optionally link to the completion appointment

**URL Parameters:**
- `id` - MongoDB ObjectId of follow-up record

**Request Body:**
```json
{
  "appointment_id": "507f1f77bcf86cd799439020"  // Optional: appointment ID where follow-up was completed
}
```

**Response:**
```json
{
  "id": "507f1f77bcf86cd799439015",
  "patient_id": "507f1f77bcf86cd799439012",
  "appointment_id": "507f1f77bcf86cd799439013",
  "treatment_id": "507f1f77bcf86cd799439014",
  "scheduled_date": "2026-06-25",
  "follow_up_type": "phase-2-treatment",
  "description": "Second phase of root canal treatment",
  "status": "completed",
  "reminder_sent": false,
  "completed_appointment_id": "507f1f77bcf86cd799439020",
  "created_at": "2026-06-19T14:30:00Z",
  "updated_at": "2026-06-19T15:45:00Z"
}
```

---

## Audit Logging

### Query Audit Logs
```
GET /api/audit-logs  (NOT YET EXPOSED - would require new route)
GET /api/audit-logs?entity_type=bill&entity_id=:id
```

**Audit Log Fields:**
- `action` - 'create', 'update', 'delete', 'payment'
- `entity_type` - 'patient', 'appointment', 'treatment', 'bill', 'payment', 'follow-up'
- `entity_id` - ObjectId of the entity changed
- `changed_by` - Who made the change (currently 'Dr. Mahe')
- `before` - Object with values before change
- `after` - Object with values after change
- `details` - Human-readable description
- `logged_at` - ISO timestamp

---

## Enhanced Endpoints (Modified Behavior)

### POST /api/bills (Enhanced)

**Changes:**
- Now runs in a MongoDB transaction for consistency
- Validates that all linked treatments have `status: 'completed'`
- Automatically updates patient's `total_outstanding_balance`
- Creates audit log entry for bill creation
- Logs created via transaction (rollback-safe)

**New Validation:**
```json
// Will throw error if any treatment is not completed
{
  "error": "Cannot bill for incomplete treatments: Cavity Fill, Root Canal"
}
```

### PUT /api/appointments/:id/status (Enhanced)

**Changes:**
- Now creates audit log entry for status changes
- Tracks who changed the status (via audit log)
- Prevents spam by not logging if status doesn't actually change

### PUT /api/treatments/:id (Enhanced)

**Changes:**
- Now creates audit log entry for updates
- Prevents cost modification after billing (existing validation still works)
- Logs all detail changes with before/after snapshots

### PUT /api/treatments/:id/status (Enhanced)

**Changes:**
- New endpoint for updating treatment status
- Creates audit log for status transitions
- Supports session completion tracking
- Validates treatment is linked to bill before marking complete

**Request:**
```json
{
  "status": "completed",  // or 'in-progress', 'on-hold', 'cancelled'
  "sessionCompleted": true  // Optional: increment sessions_completed
}
```

### PUT /api/bills/:id/payment (Enhanced)

**Changes:**
- Now creates audit log entry for payments
- Automatically updates patient's `total_outstanding_balance`
- Logs payment method and amount in audit trail

---

## Best Practices

### Follow-Up Workflow

1. **At End of Treatment Appointment:**
   ```javascript
   // If treatment requires follow-up
   await fetch('/api/follow-ups', {
     method: 'POST',
     body: JSON.stringify({
       patient_id: patientId,
       appointment_id: currentAppointmentId,
       treatment_id: treatmentId,
       scheduled_date: '2026-06-25',  // 5-7 days from today
       follow_up_type: 'phase-2-treatment',
       description: 'Continue root canal treatment'
     })
   })
   ```

2. **Daily: Check Pending Follow-Ups**
   ```javascript
   const pending = await fetch('/api/follow-ups/pending').then(r => r.json())
   // Display on dashboard for staff
   // Send reminders if `reminder_sent` is false
   ```

3. **When Follow-Up Appointment Completed:**
   ```javascript
   await fetch('/api/follow-ups/:id/complete', {
     method: 'PUT',
     body: JSON.stringify({
       appointment_id: newAppointmentId
     })
   })
   ```

### Treatment Billing Workflow

1. **Create Treatment as Planned:**
   ```javascript
   const treatment = await fetch('/api/treatments', {
     method: 'POST',
     body: JSON.stringify({
       patient_id: patientId,
       appointment_id: appointmentId,
       treatment_type: 'Root Canal',
       cost: 5000,
       status: 'planned'  // NEW FIELD
     })
   }).then(r => r.json())
   ```

2. **Update Status During Treatment:**
   ```javascript
   // When starting
   await fetch(`/api/treatments/${treatmentId}/status`, {
     method: 'PUT',
     body: JSON.stringify({ status: 'in-progress' })
   })
   
   // When completed
   await fetch(`/api/treatments/${treatmentId}/status`, {
     method: 'PUT',
     body: JSON.stringify({ 
       status: 'completed',
       sessionCompleted: true
     })
   })
   ```

3. **Create Bill (Only with Completed Treatments):**
   ```javascript
   const bill = await fetch('/api/bills', {
     method: 'POST',
     body: JSON.stringify({
       patient_id: patientId,
       appointment_id: appointmentId,
       existingTreatmentIds: [treatmentId],  // Must be completed
       paid_amount: 2500,
       discount: 0,
       tax_percent: 18,
       payment_method: 'cash'
     })
   }).then(r => r.json())
   
   // Will fail if treatment status !== 'completed'
   ```

---

## Error Handling

All endpoints return standard error responses:

```json
// 400 Bad Request - Validation error
{
  "error": "Patient with phone 9841234567 already exists (ID: 507f...)"
}

// 400 Bad Request - Business logic error
{
  "error": "Cannot bill for incomplete treatments: Cavity Fill"
}

// 404 Not Found
{
  "error": "Route not found"
}

// 500 Internal Server Error - Transactional rollback
{
  "error": "Internal server error"
}
```

When transactions rollback, the entire operation is reverted:
- Bill not created
- Payments not recorded
- Treatments not linked
- Audit log entry not created

---

## Performance Notes

- **Follow-up queries:** Indexed on `patient_id` and `scheduled_date`
- **Audit logs:** Indexed on `entity_type` and `logged_at`
- **Transactions:** 5-10ms overhead per bill creation
- **Audit logging:** 2-5ms overhead per operation

---

**Last Updated:** June 19, 2026  
**API Version:** 1.0 (Phase 1 Complete)
