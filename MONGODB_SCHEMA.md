# MNC Pro EMS - MongoDB Schema Reference

If you are setting up this application locally with MongoDB, here is the recommended schema for your collections.

## 1. `employees` Collection
Stores all user profiles and role information.

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Unique identifier (maps to Firebase UID) |
| `name` | String | Full name of the employee |
| `email` | String | Corporate email address |
| `role` | String | `admin`, `manager`, or `employee` |
| `status` | String | `active`, `onboarding`, or `inactive` |
| `department`| String | Department name (e.g., Engineering, HR) |
| `location` | String | Office location or "Remote" |
| `photoURL` | String | URL to profile picture |
| `joinDate` | Date | Date of joining the organization |
| `phone` | String | Contact number |
| `bio` | String | Short professional summary |

## 2. `attendance` Collection
Tracks daily check-in and check-out events.

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Unique identifier |
| `employeeId`| ObjectId | Reference to `employees._id` |
| `date` | String | ISO Date string (YYYY-MM-DD) |
| `checkIn` | Date | Timestamp of check-in |
| `checkOut` | Date | Timestamp of check-out |
| `status` | String | `present`, `late`, or `absent` |
| `location` | String | Detected location at check-in |

## 3. `leaves` Collection
Manages time-off requests.

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Unique identifier |
| `employeeId`| ObjectId | Reference to `employees._id` |
| `employeeName`| String | Denormalized name for quick display |
| `type` | String | `annual`, `sick`, `unpaid`, or `other` |
| `startDate` | Date | Beginning of leave |
| `endDate` | Date | End of leave |
| `reason` | String | Employee's explanation |
| `status` | String | `pending`, `approved`, or `rejected` |
| `createdAt` | Date | Request submission timestamp |

## 4. `expenses` Collection
Tracks business-related reimbursement claims.

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Unique identifier |
| `employeeId`| ObjectId | Reference to `employees._id` |
| `employeeName`| String | Denormalized name for quick display |
| `amount` | Number | Total claim amount |
| `category` | String | `Travel`, `Meals`, `Software`, etc. |
| `date` | Date | Date the expense occurred |
| `description`| String | Purpose of the expense |
| `status` | String | `pending`, `approved`, or `rejected` |
| `createdAt` | Date | Claim submission timestamp |

## 5. `reviews` Collection
Stores performance evaluation data.

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Unique identifier |
| `employeeId`| ObjectId | Reference to `employees._id` |
| `employeeName`| String | Denormalized name of employee |
| `managerId` | ObjectId | Reference to the reviewer's `employees._id` |
| `managerName`| String | Name of the reviewer |
| `period` | String | Review period (e.g., "Q1 2026") |
| `rating` | Number | Performance score (1.0 - 5.0) |
| `feedback` | String | Qualitative feedback |
| `goals` | String | Future objectives |
| `date` | Date | Completion timestamp |
