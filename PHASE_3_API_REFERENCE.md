# PHASE 3 API REFERENCE

## Overview
Phase 3 implements patient archiving, appointment cancellation tracking, consent validation, and invoice number uniqueness features.

## Patient Archiving Endpoints

### Archive a Patient
**POST** `/api/patients/:id/archive`

Archives a patient record for GDPR compliance and data cleanup.

```json
{
  "reason": "Patient relocated, requested deletion of records",
  "archived_by": "admin"
}
```

**Response** (200 OK)
```json
{
  "id": "ObjectId",
  "_id": "ObjectId",
  "name": "John Doe",
  "phone": "+91-9999999999",
  "email": "john@example.com",
  "is_archived": true,
  "archived_at": "2026-06-19T12:30:00.000Z",
  "archived_by": "admin",
  "archived_reason": "Patient relocated, requested deletion of records",
  "total_outstanding_balance": 0,
  "created_at": "2026-01-15T10:00:00.000Z",
  "updated_at": "2026-06-19T12:30:00.000Z"
}
```

**Error Cases**
- `400 Bad Request`: Patient already archived
- `404 Not Found`: Patient not found

---

### Unarchive a Patient
**POST** `/api/patients/:id/unarchive`

Restores a previously archived patient record.

**Response** (200 OK)
```json
{
  "id": "ObjectId",
  "_id": "ObjectId",
  "name": "John Doe",
  "is_archived": false,
  "archived_at": null,
  "archived_by": null,
  "archived_reason": "",
  "created_at": "2026-01-15T10:00:00.000Z",
  "updated_at": "2026-06-19T12:35:00.000Z"
}
```

**Error Cases**
- `400 Bad Request`: Patient is not archived
- `404 Not Found`: Patient not found

---

### Get All Patients (Including Archived)
**GET** `/api/patients?includeArchived=true`

Retrieves all patients including archived ones. By default, archived patients are excluded.

**Query Parameters**
- `limit` (number, optional) - Max patients to return (default: 20)
- `includeArchived` (boolean, optional) - Include archived patients (default: false)

**Response** (200 OK)
```json
[
  {
    "id": "ObjectId",
    "name": "John Doe",
    "phone": "+91-9999999999",
    "age": 35,
    "gender": "Male",
    "is_archived": false,
    "appointment_count": 5,
    "last_visit": "2026-06-15",
    "created_at": "2026-01-15T10:00:00.000Z"
  },
  {
    "id": "ObjectId",
    "name": "Jane Smith",
    "phone": "+91-8888888888",
    "is_archived": true,
    "archived_at": "2026-06-19T12:30:00.000Z",
    "archived_reason": "Patient relocated",
    "appointment_count": 3,
    "last_visit": "2026-05-20"
  }
]
```

---

## Appointment Cancellation Endpoints

### Cancel an Appointment
**POST** `/api/appointments/:id/cancel`

Cancels an appointment with reason tracking.

```json
{
  "reason": "patient-requested",
  "cancelled_by": "staff"
}
```

**Valid Cancellation Reasons**
- `patient-requested` - Patient requested cancellation
- `doctor-requested` - Doctor requested cancellation
- `no-show` - Patient did not show up
- `emergency` - Emergency situation
- `rescheduled` - Appointment rescheduled
- `other` - Other reason

**Cancelled By Values**
- `patient` - Patient cancelled
- `staff` - Staff/receptionist cancelled
- `doctor` - Doctor cancelled

**Response** (200 OK)
```json
{
  "id": "ObjectId",
  "_id": "ObjectId",
  "patient_id": "ObjectId",
  "scheduled_date": "2026-06-20",
  "scheduled_time": "14:30",
  "reason": "Tooth pain checkup",
  "status": "cancelled",
  "cancellation_reason": "patient-requested",
  "cancelled_at": "2026-06-19T12:45:00.000Z",
  "cancelled_by": "staff",
  "appointment_type": "consultation",
  "is_urgent": false,
  "created_at": "2026-06-18T10:00:00.000Z",
  "updated_at": "2026-06-19T12:45:00.000Z"
}
```

**Error Cases**
- `400 Bad Request`: Invalid cancellation reason
- `400 Bad Request`: Appointment already cancelled
- `404 Not Found`: Appointment not found

---

## Billing with Consent Validation

### Create Bill (Enhanced)
**POST** `/api/bills`

Creates a bill with automatic consent validation for treatments.

```json
{
  "patient_id": "ObjectId",
  "existingTreatmentIds": ["ObjectId1", "ObjectId2"],
  "payment_method": "cash",
  "notes": "Final payment pending"
}
```

**Validation**
- If bill includes treatments (existing or new), patient MUST have `consentFormSaved: true`
- Error message: "Patient consent form required before billing for treatments"

**Response** (201 Created)
```json
{
  "id": "ObjectId",
  "patient_id": "ObjectId",
  "total_amount": 10000,
  "paid_amount": 5000,
  "balance": 5000,
  "status": "partial",
  "invoice_number": "INV-2026-0042",
  "created_at": "2026-06-19T13:00:00.000Z"
}
```

**Error Cases**
- `400 Bad Request`: Patient consent form required before billing for treatments
- `400 Bad Request`: Cannot bill for incomplete treatments
- `400 Bad Request`: Valid patient is required

---

## Invoice Number Management

### Invoice Number Uniqueness
- All invoice numbers are guaranteed unique within a year
- Format: `INV-YYYY-NNNN` (e.g., `INV-2026-0042`)
- Counter resets each calendar year
- Automatic collision detection and retry

**Features**
- Unique constraint at database level
- Sequence validation
- Collision detection with retry logic
- No duplicate invoices possible

---

## Audit Logging

All Phase 3 operations are logged in the AuditLog collection:

### Archive Audit Log
```json
{
  "_id": "ObjectId",
  "action": "archive",
  "resource_type": "patient",
  "resource_id": "ObjectId",
  "before": {
    "is_archived": false
  },
  "after": {
    "is_archived": true,
    "archived_reason": "Patient relocated"
  },
  "message": "Patient archived. Reason: Patient relocated",
  "created_at": "2026-06-19T12:30:00.000Z"
}
```

### Cancellation Audit Log
```json
{
  "_id": "ObjectId",
  "action": "cancel",
  "resource_type": "appointment",
  "resource_id": "ObjectId",
  "before": {
    "status": "waiting"
  },
  "after": {
    "status": "cancelled",
    "cancellation_reason": "patient-requested"
  },
  "message": "Appointment cancelled. Reason: patient-requested. Cancelled by: staff",
  "created_at": "2026-06-19T12:45:00.000Z"
}
```

---

## Database Schema Updates

### Patient Schema (Updated)
```javascript
{
  _id: ObjectId,
  name: String,
  phone: String (unique, sparse, indexed),
  email: String (unique, sparse, indexed),
  age: Number,
  gender: String,
  address: String,
  complaint: String,
  notes: String,
  consentFormSaved: Boolean,
  consentFormPath: String,
  consentSignedAt: Date,
  total_outstanding_balance: Number,
  // FIX #3.1: Archiving
  is_archived: Boolean (indexed),
  archived_at: Date,
  archived_by: String,
  archived_reason: String,
  created_at: Date,
  updated_at: Date
}
```

### Appointment Schema (Updated)
```javascript
{
  _id: ObjectId,
  patient_id: ObjectId (indexed),
  scheduled_date: String (indexed),
  scheduled_time: String,
  reason: String,
  status: String enum [waiting, in-progress, done, cancelled],
  call_status: String enum [pending, called, not_required],
  queue_number: Number,
  notes: String,
  appointment_type: String,
  is_urgent: Boolean,
  is_walk_in: Boolean,
  is_time_confirmed: Boolean,
  // FIX #3.2: Cancellation tracking
  cancellation_reason: String enum [patient-requested, doctor-requested, no-show, emergency, rescheduled, other],
  cancelled_at: Date,
  cancelled_by: String,
  created_at: Date,
  updated_at: Date
}
```

### Bill Schema (Updated)
```javascript
{
  _id: ObjectId,
  patient_id: ObjectId (indexed),
  appointment_id: ObjectId,
  total_amount: Number,
  paid_amount: Number,
  balance: Number (min: 0),
  payment_method: String,
  status: String enum [paid, partial, pending],
  notes: String,
  // FIX #3.4: Invoice uniqueness
  invoice_number: String (unique, sparse, indexed),
  discount: Number,
  tax_percent: Number,
  tax_amount: Number,
  created_at: Date,
  updated_at: Date
}
```

---

## Phase 3 Implementation Details

### Archiving Benefits
- ✅ GDPR compliance (soft-delete instead of hard-delete)
- ✅ Data recovery (unarchive if needed)
- ✅ Audit trail (who archived and why)
- ✅ Clean patient lists (archived excluded by default)

### Cancellation Tracking Benefits
- ✅ Analytics (analyze cancellation patterns)
- ✅ Patient follow-up (identify unhappy patients)
- ✅ No-show tracking (identify unreliable patients)
- ✅ Operational insights

### Consent Validation Benefits
- ✅ Legal protection (proof of consent before treatment)
- ✅ Regulatory compliance
- ✅ Prevents billing without consent
- ✅ Audit trail preserved

### Invoice Uniqueness Benefits
- ✅ Tax authority compliance
- ✅ Prevents duplicate invoices
- ✅ Cleaner accounting records
- ✅ Financial audit ready

---

## Testing Recommendations

### Patient Archiving Testing
```bash
# Archive a patient
curl -X POST http://localhost:5000/api/patients/{patient_id}/archive \
  -H "Content-Type: application/json" \
  -d '{"reason": "Test archive", "archived_by": "admin"}'

# Get all patients (archived excluded)
curl http://localhost:5000/api/patients

# Get all patients (including archived)
curl http://localhost:5000/api/patients?includeArchived=true

# Unarchive patient
curl -X POST http://localhost:5000/api/patients/{patient_id}/unarchive
```

### Appointment Cancellation Testing
```bash
# Cancel appointment
curl -X POST http://localhost:5000/api/appointments/{appointment_id}/cancel \
  -H "Content-Type: application/json" \
  -d '{"reason": "patient-requested", "cancelled_by": "staff"}'

# Try to cancel already-cancelled appointment (should fail)
curl -X POST http://localhost:5000/api/appointments/{appointment_id}/cancel \
  -H "Content-Type: application/json" \
  -d '{"reason": "patient-requested", "cancelled_by": "staff"}'
```

### Consent Validation Testing
```bash
# Try to bill patient without consent (should fail)
curl -X POST http://localhost:5000/api/bills \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "{patient_id_without_consent}",
    "existingTreatmentIds": ["..."],
    "payment_method": "cash"
  }'
# Expected error: "Patient consent form required before billing for treatments"

# Update patient with consent
curl -X PUT http://localhost:5000/api/patients/{patient_id} \
  -H "Content-Type: application/json" \
  -d '{"consentFormSaved": true}'

# Now bill patient (should succeed)
curl -X POST http://localhost:5000/api/bills \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "{patient_id}",
    "existingTreatmentIds": ["..."],
    "payment_method": "cash"
  }'
```

### Invoice Uniqueness Testing
```bash
# Create multiple bills - each gets unique invoice number
curl -X POST http://localhost:5000/api/bills \
  -H "Content-Type: application/json" \
  -d '{"patient_id": "...", "payment_method": "cash"}'
# Returns: invoice_number: "INV-2026-0001"

curl -X POST http://localhost:5000/api/bills \
  -H "Content-Type: application/json" \
  -d '{"patient_id": "...", "payment_method": "cash"}'
# Returns: invoice_number: "INV-2026-0002"

# Each year resets counter
# If you create bill in 2027, will be INV-2027-0001
```

---

## Error Handling

All Phase 3 endpoints follow standard error format:

```json
{
  "error": "Error message describing what went wrong"
}
```

**Common Errors**
- `400 Bad Request` - Validation failed
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Backward Compatibility

All existing endpoints remain unchanged:
- `GET /api/patients` - Still works (excludes archived by default)
- `POST /api/appointments/:id` - Cancel still works via old DELETE endpoint
- `POST /api/bills` - Consent validation added, but only for bills with treatments
- All other endpoints unchanged

---

## Migration Notes

If upgrading from Phase 2 to Phase 3:

1. **Patient Schema**: Add archiving fields (automatically defaults to `is_archived: false`)
2. **Appointment Schema**: Add cancellation fields (automatically defaults to `cancellation_reason: null`)
3. **Bill Schema**: Add unique constraint on invoice_number (automatically migrated)
4. **Existing Data**: All existing records compatible, no data loss
5. **No Breaking Changes**: All existing functionality preserved
