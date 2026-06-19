# PHASE 2 API REFERENCE

## Overview
Phase 2 implements the diagnosis system, payment reversals, cost history tracking, and enhanced appointment management (appointment types, urgency, walk-in support).

## Diagnosis Endpoints

### Record a Diagnosis
**POST** `/api/diagnoses`

Creates a new diagnosis record for a patient's appointment.

```json
{
  "patient_id": "ObjectId",
  "appointment_id": "ObjectId",
  "findings": {
    "affected_teeth": ["11", "12", "13"],
    "conditions": ["cavities", "gum_disease"],
    "description": "Patient has multiple cavities in upper right quadrant with mild gum inflammation"
  },
  "recommended_treatments": ["filling", "root_canal", "scaling"],
  "urgency": "high",
  "notes": "Recommend immediate filling before tooth decay worsens"
}
```

**Response** (201 Created)
```json
{
  "id": "ObjectId",
  "_id": "ObjectId",
  "patient_id": "ObjectId",
  "appointment_id": "ObjectId",
  "findings": {
    "affected_teeth": ["11", "12", "13"],
    "conditions": ["cavities", "gum_disease"],
    "description": "Patient has multiple cavities in upper right quadrant with mild gum inflammation"
  },
  "recommended_treatments": ["filling", "root_canal", "scaling"],
  "urgency": "high",
  "notes": "Recommend immediate filling before tooth decay worsens",
  "diagnosed_at": "2026-06-19T10:30:00.000Z"
}
```

**Error Cases**
- `400 Bad Request`: Missing required fields (patient_id, appointment_id, findings.description)
- `400 Bad Request`: Appointment doesn't belong to patient
- `400 Bad Request`: Invalid appointment_id format

---

### Get Diagnosis by Appointment
**GET** `/api/diagnoses/appointment/:appointment_id`

Retrieves the diagnosis for a specific appointment.

**Response** (200 OK)
```json
{
  "id": "ObjectId",
  "patient_id": "ObjectId",
  "appointment_id": "ObjectId",
  "findings": {
    "affected_teeth": ["11", "12"],
    "conditions": ["cavities"],
    "description": "Two small cavities detected"
  },
  "recommended_treatments": ["filling"],
  "urgency": "routine",
  "notes": "Schedule filling appointment",
  "diagnosed_at": "2026-06-19T10:30:00.000Z"
}
```

**Response** (null if not found)

---

### Get All Diagnoses for Patient
**GET** `/api/diagnoses/patient/:patient_id`

Retrieves all diagnoses for a patient, sorted by most recent first.

**Response** (200 OK)
```json
[
  {
    "id": "ObjectId",
    "patient_id": "ObjectId",
    "appointment_id": "ObjectId",
    "findings": { ... },
    "recommended_treatments": ["filling"],
    "urgency": "routine",
    "notes": "...",
    "diagnosed_at": "2026-06-19T10:30:00.000Z"
  },
  ...
]
```

---

### Update a Diagnosis
**PUT** `/api/diagnoses/:id`

Updates an existing diagnosis record.

```json
{
  "findings": {
    "affected_teeth": ["11", "12", "13"],
    "conditions": ["cavities", "gum_disease"],
    "description": "Updated diagnosis after consultation"
  },
  "recommended_treatments": ["filling", "scaling"],
  "urgency": "high",
  "notes": "Updated notes"
}
```

**Response** (200 OK) - Same as Record Diagnosis response

**Error Cases**
- `404 Not Found`: Diagnosis not found
- `400 Bad Request`: Invalid ID format

---

## Payment Reversal & Adjustment Endpoints

### Reverse a Payment
**POST** `/api/payments/:payment_id/reverse`

Marks a payment as reversed and recalculates bill balance.

```json
{
  "reason": "Customer requested refund due to service cancellation"
}
```

**Response** (200 OK)
```json
{
  "id": "ObjectId",
  "_id": "ObjectId",
  "bill_id": "ObjectId",
  "amount": 5000,
  "payment_method": "cash",
  "paid_at": "2026-06-19T10:30:00.000Z",
  "is_reversed": true,
  "reversed_at": "2026-06-19T11:00:00.000Z",
  "reversal_reason": "Customer requested refund due to service cancellation",
  "is_adjustment": false
}
```

**Bill Impact**
- Payment is marked as reversed (`is_reversed: true`)
- Bill's `paid_amount` is recalculated excluding reversed payment
- Bill's `balance` is updated
- Bill's `status` is updated (pending/partial/paid)

**Error Cases**
- `400 Bad Request`: Payment already reversed
- `404 Not Found`: Payment not found

---

### Adjust a Payment
**POST** `/api/payments/:payment_id/adjust`

Modifies a payment amount (for corrections) and recalculates bill balance.

```json
{
  "amount": 4500,
  "reason": "Correction: Customer originally paid ₹5000, should have been ₹4500"
}
```

**Response** (200 OK)
```json
{
  "id": "ObjectId",
  "_id": "ObjectId",
  "bill_id": "ObjectId",
  "amount": 4500,
  "payment_method": "cash",
  "paid_at": "2026-06-19T10:30:00.000Z",
  "is_reversed": false,
  "is_adjustment": true,
  "adjustment_reason": "Correction: Customer originally paid ₹5000, should have been ₹4500"
}
```

**Bill Impact**
- Payment amount is updated
- Bill's `paid_amount` is recalculated with new payment amount
- Bill's `balance` is updated
- Bill's `status` is updated

**Error Cases**
- `400 Bad Request`: Cannot adjust reversed payments
- `404 Not Found`: Payment not found

---

### Get Payments for Bill
**GET** `/api/payments/bill/:bill_id`

Retrieves all payments (including reversed) for a bill.

**Response** (200 OK)
```json
[
  {
    "id": "ObjectId",
    "bill_id": "ObjectId",
    "amount": 5000,
    "payment_method": "cash",
    "paid_at": "2026-06-19T10:00:00.000Z",
    "is_reversed": false,
    "is_adjustment": false
  },
  {
    "id": "ObjectId",
    "bill_id": "ObjectId",
    "amount": 2500,
    "payment_method": "card",
    "paid_at": "2026-06-19T10:30:00.000Z",
    "is_reversed": true,
    "reversed_at": "2026-06-19T11:00:00.000Z",
    "reversal_reason": "Duplicate payment"
  }
]
```

---

## Enhanced Appointment Endpoints

### Create Appointment (Enhanced)
**POST** `/api/appointments`

Creates a new appointment with optional type, urgency, and walk-in support.

```json
{
  "patient_id": "ObjectId",
  "scheduled_date": "2026-06-20",
  "scheduled_time": "14:30",
  "reason": "Tooth pain and checkup",
  "appointment_type": "consultation",
  "is_urgent": false,
  "is_walk_in": false,
  "notes": "Patient is available in afternoon",
  "call_status": "pending"
}
```

**Walk-in Appointment Example**
```json
{
  "patient_id": "ObjectId",
  "scheduled_date": "2026-06-19",
  "scheduled_time": "",
  "reason": "Emergency tooth pain",
  "appointment_type": "emergency",
  "is_urgent": true,
  "is_walk_in": true,
  "notes": "Patient arrived without appointment"
}
```

**Response** (201 Created)
```json
{
  "id": "ObjectId",
  "_id": "ObjectId",
  "patient_id": "ObjectId",
  "scheduled_date": "2026-06-20",
  "scheduled_time": "14:30",
  "reason": "Tooth pain and checkup",
  "status": "waiting",
  "call_status": "pending",
  "queue_number": 5,
  "notes": "Patient is available in afternoon",
  "appointment_type": "consultation",
  "is_urgent": false,
  "is_walk_in": false,
  "is_time_confirmed": true,
  "created_at": "2026-06-19T10:00:00.000Z",
  "updated_at": "2026-06-19T10:00:00.000Z"
}
```

**Appointment Types**
- `consultation` - Initial consultation (default)
- `follow-up` - Follow-up visit
- `treatment` - Scheduled treatment
- `emergency` - Emergency visit
- `check-up` - Routine checkup
- `review` - Review appointment
- `walk-in` - Walk-in patient
- `other` - Other type

**Error Cases**
- `400 Bad Request`: Valid patient required
- `400 Bad Request`: Appointment slot is blocked
- `400 Bad Request`: Appointment slot is already booked
- `400 Bad Request`: Patient not found

---

### Update Appointment (Enhanced)
**PUT** `/api/appointments/:id`

Updates appointment details including type, urgency, and walk-in status.

```json
{
  "scheduled_date": "2026-06-21",
  "scheduled_time": "15:00",
  "reason": "Updated reason",
  "appointment_type": "follow-up",
  "is_urgent": true,
  "is_walk_in": false,
  "notes": "Updated notes"
}
```

**Response** (200 OK) - Same as Create Appointment response

**Error Cases**
- `404 Not Found`: Appointment not found
- `400 Bad Request`: Invalid ID format
- `400 Bad Request`: Appointment slot conflicts

---

## Treatment Cost History

Treatment costs are now tracked with automatic cost history entries.

### Cost History Structure
When a treatment cost is updated (and not yet billed), a cost history entry is automatically created:

```json
{
  "cost_history": [
    {
      "amount": 5000,
      "changed_at": "2026-06-19T10:30:00.000Z",
      "changed_by": "Dr. Mahe",
      "reason": "Price adjustment"
    },
    {
      "amount": 4500,
      "changed_at": "2026-06-19T11:00:00.000Z",
      "changed_by": "Dr. Mahe",
      "reason": "Special discount applied"
    }
  ]
}
```

### Update Treatment with Cost History
**PUT** `/api/treatments/:id`

```json
{
  "treatment_type": "Filling",
  "cost": 4800,
  "cost_change_reason": "Discount applied due to bulk treatment"
}
```

**Note**: Cost history is only tracked for unbilled treatments. Billed treatments cannot have their cost modified.

---

## Patient Balance Tracking

Patient `total_outstanding_balance` is automatically updated whenever:
- A bill is created
- A payment is made
- A payment is reversed
- A payment is adjusted
- A bill status changes

### Get Patient with Balance
**GET** `/api/patients/:id`

```json
{
  "id": "ObjectId",
  "name": "John Doe",
  "phone": "+91-9999999999",
  "email": "john@example.com",
  "address": "123 Main St",
  "total_outstanding_balance": 8500,
  "created_at": "2026-01-15T10:00:00.000Z",
  "updated_at": "2026-06-19T10:00:00.000Z"
}
```

The `total_outstanding_balance` is the sum of all bill balances where `status !== 'paid'`.

---

## Audit Logging

All Phase 2 operations are logged in the AuditLog collection:

```json
{
  "_id": "ObjectId",
  "action": "create",
  "resource_type": "diagnosis",
  "resource_id": "ObjectId",
  "before": {},
  "after": {
    "conditions": ["cavities", "gum_disease"],
    "urgency": "high"
  },
  "message": "Diagnosis recorded with conditions: cavities, gum_disease",
  "created_at": "2026-06-19T10:30:00.000Z"
}
```

Logged actions include:
- Diagnosis creation, updates
- Payment reversals and adjustments
- Treatment cost changes
- Appointment type/urgency changes

---

## Database Schema Updates

### Diagnosis Schema (New)
```
{
  patient_id: ObjectId (indexed),
  appointment_id: ObjectId (indexed with patient_id),
  findings: {
    affected_teeth: [String],
    conditions: [String],
    description: String
  },
  recommended_treatments: [String],
  urgency: String enum [routine, urgent, high],
  notes: String,
  diagnosed_at: Date (indexed)
}
```

### Payment Schema (Updated)
```
{
  // ... existing fields ...
  is_reversed: Boolean,
  reversed_at: Date,
  reversal_reason: String,
  is_adjustment: Boolean,
  adjustment_reason: String
}
```

### Treatment Schema (Updated)
```
{
  // ... existing fields ...
  cost_history: [{
    amount: Number,
    changed_at: Date,
    changed_by: String,
    reason: String
  }],
  diagnosis_id: ObjectId (optional, reference to Diagnosis)
}
```

### Appointment Schema (Updated)
```
{
  // ... existing fields ...
  appointment_type: String enum [consultation, follow-up, treatment, emergency, check-up, review, walk-in, other],
  is_urgent: Boolean,
  is_walk_in: Boolean,
  is_time_confirmed: Boolean
}
```

### Patient Schema (Updated)
```
{
  // ... existing fields ...
  total_outstanding_balance: Number (auto-calculated)
}
```

---

## Phase 2 Complete Implementation Checklist

- ✅ Diagnosis system with CRUD operations
- ✅ Diagnosis routes (GET appointment, GET patient, POST create, PUT update)
- ✅ Payment reversal system with bill recalculation
- ✅ Payment adjustment system
- ✅ Payment routes (GET bill payments, POST reverse, POST adjust)
- ✅ Cost history tracking in treatment updates
- ✅ Enhanced appointment management (type, urgency, walk-in)
- ✅ Patient balance tracking (total_outstanding_balance)
- ✅ Audit logging for all Phase 2 operations
- ✅ Build verification (no errors)

---

## Testing Recommendations

### Diagnosis Testing
```bash
# Record diagnosis
curl -X POST http://localhost:5000/api/diagnoses \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "...",
    "appointment_id": "...",
    "findings": {
      "affected_teeth": ["11"],
      "conditions": ["cavities"],
      "description": "Test diagnosis"
    },
    "recommended_treatments": ["filling"],
    "urgency": "routine"
  }'

# Get diagnosis by appointment
curl http://localhost:5000/api/diagnoses/appointment/{appointment_id}

# Get all diagnoses for patient
curl http://localhost:5000/api/diagnoses/patient/{patient_id}
```

### Payment Reversal Testing
```bash
# Reverse a payment
curl -X POST http://localhost:5000/api/payments/{payment_id}/reverse \
  -H "Content-Type: application/json" \
  -d '{"reason": "Test reversal"}'

# Get bill payments to verify reversal
curl http://localhost:5000/api/payments/bill/{bill_id}
```

### Appointment Type Testing
```bash
# Create appointment with type
curl -X POST http://localhost:5000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "...",
    "scheduled_date": "2026-06-20",
    "scheduled_time": "14:30",
    "appointment_type": "follow-up",
    "is_urgent": true
  }'

# Create walk-in appointment
curl -X POST http://localhost:5000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "...",
    "scheduled_date": "2026-06-19",
    "is_walk_in": true,
    "appointment_type": "emergency",
    "is_urgent": true
  }'
```
