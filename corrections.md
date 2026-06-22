# Dental Clinic Management System - Feature Implementation Requirements

## Instructions for Agent

# 1. Treatment Module

## 1.1 Multi-Tooth Selection

### Requirements

* Allow selecting multiple teeth in a single treatment entry (use tooth-chart image for selection).
* Store selected teeth as an array.
* Existing single-tooth records must remain functional.
* Display selected teeth clearly in treatment history and reports.

### Acceptance Criteria

* Multiple teeth can be selected.
* Database stores teeth as an array.
* Existing records continue working.
* UI displays all selected teeth properly.

## 1.2 Remove Cost From Treatment

### Requirements

* Remove treatment cost field from treatment creation form.
* Remove treatment cost field from treatment edit form.
* Treatment pricing should be controlled only through Billing and Treatment Master.
* Existing records must continue loading correctly.

### Acceptance Criteria

* Cost field is not visible in treatment forms.
* No treatment cost editing from treatment module.
* Historical data remains accessible.

---

## 1.3 Treatment → Billing Integration

### Requirements

* Completed treatments should be available in Billing.
* Receptionist/Admin can add completed treatments directly into a bill.
* Prevent duplicate billing.
* Maintain relationship between treatment and bill.

### Workflow

1. Treatment Created
2. Treatment Completed
3. Treatment Appears in Billing
4. Bill Generated
5. Treatment Marked as Billed

### Acceptance Criteria

* Completed treatments appear automatically in Billing.
* Same treatment cannot be billed twice.
* Bill references treatment.
* Treatment references bill.

## 1.4 Treatment Filters

### Requirements

Add filters:

* Today
* Weekly
* Monthly
* Custom Date Range

### Acceptance Criteria

* Filters return correct records.
* Search continues working.
* Pagination remains functional.

---

# 2. Billing & Finance

## 2.1 Auto Calculating Bill Total

### Requirements

Bill total should update automatically when:

* Treatment added
* Treatment removed
* Item added
* Item removed
* Quantity changed
* Discount changed

### Acceptance Criteria

* No manual total entry.
* Total is always accurate.
* Total recalculates instantly.

## 2.2 Editable Bills

### Requirements

Allow editing generated bills.

Track:

* Edited By
* Edited At
* Previous Values
* Change History

### Acceptance Criteria

* Bills can be updated safely.
* Audit trail is maintained.
* Previous changes can be reviewed.

## 2.3 Consultant Payment Tracking

### New Module Required

Track:

* Consultant Doctor
* Patient
* Treatment
* Treatment Cost
* Consultant Share
* Amount Paid
* Balance Due
* Payment Date
* Notes

### Features

* Add Payment
* Edit Payment
* Delete Payment
* Monthly Report
* Outstanding Due Report
* Consultant-wise Summary

### Acceptance Criteria

* Balance due calculated correctly.
* Monthly reports accurate.
* Consultant-wise summaries available.

# 3. Appointments & Patients

## 3.1 Walk-In Appointment Flow

### Requirements

Receptionist should be able to:

* Create appointment without existing patient record.
* Register walk-in patient immediately.
* Convert walk-in appointment into patient profile.

### Acceptance Criteria

* Walk-in appointment creation works.
* Walk-in registration generates patient record.
* Existing appointment workflow unaffected.

---

## 3.2 Patient ID (PID) Generation Rules

### Business Logic

#### Appointment Booking

* Do NOT generate Patient ID (PID).
* Appointment bookings are considered temporary records.
* These records should only be used for appointment scheduling and follow-up.
* Appointment records must not appear in the patient database.

#### Kiosk Registration

* Generate Patient ID (PID) immediately upon successful kiosk submission.
* Create a permanent patient record.
* Patient status = Active.
* Kiosk registrations are considered official patients.

### Important Rule

PID should only be generated when a patient record is intentionally created through:

1. Kiosk Registration
2. Reception / Admin Patient Registration

Appointment bookings must never generate a PID and must never be automatically converted into patients.

### Acceptance Criteria

* Appointment bookings do not create PID.
* Appointment bookings remain separate from patient records.
* Kiosk registrations automatically generate PID.
* Reception-created patients automatically generate PID.
* All patient records have a PID.
* Temporary appointment records never appear in the patient master list.

### Workflow

Appointment Booking
→ Temporary Appointment Record
→ No PID

Kiosk Registration
→ Create Patient
→ Generate PID
→ Active Patient

# 4. Admin & Kiosk

## 4.1 Treatment Cost Management

### New Admin Module

Create Treatment Master.

### Fields

* Treatment Name
* Category
* Standard Cost
* Active Status

### Features

* Add Treatment
* Edit Treatment
* Delete Treatment
* Search Treatment
* Enable / Disable Treatment

### Acceptance Criteria

* Admin controls pricing centrally.
* Billing automatically uses configured treatment price.
* Treatment module no longer stores cost manually.

## 4.2 Kiosk Email Field

### Requirements

Add Email field in kiosk registration.

### Validation

* Email is optional.
* If entered, must be valid email format.

### Acceptance Criteria

* Valid email accepted.
* Invalid email rejected.
* Existing kiosk flow unaffected.

# Additional Logic Validation Required

Before implementation verify:

## Treatment Workflow

* Treatment Creation
* Treatment Completion
* Treatment Billing
* Treatment Reversal

## Billing Workflow

* Draft Bill
* Final Bill
* Edit Bill
* Payment Collection

## Patient Workflow

* Appointment Booking
* Walk-In Registration
* Prospect Conversion
* Existing Patient Visit

## Consultant Workflow

* Treatment Assignment
* Consultant Share Calculation
* Payment Tracking
* Due Tracking