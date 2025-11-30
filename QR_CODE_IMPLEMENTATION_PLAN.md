# QR Code Attendance Implementation Plan

## 📋 Overview

This document outlines the best practices and implementation strategy for adding QR Code-based attendance functionality to the CFARBEMCO-HRIS system.

## 🎯 Implementation Goals

1. **Generate unique, secure QR codes for each employee**
2. **Enable employees to scan QR codes for attendance**
3. **Integrate with existing attendance session system**
4. **Ensure security and prevent abuse**
5. **Support both employee self-scan and kiosk/admin scan modes**

---

## 🔐 Security Architecture

### QR Code Token Structure

Each QR code will contain a **secure, time-limited token**:

```
{
  "employee_id": 123,
  "employeeid": "EMP10282001",
  "token": "secure_random_hash",
  "expires_at": "2025-01-20T10:30:00Z",
  "signature": "hmac_sha256_signature"
}
```

### Security Features

1. **Time-based expiration**: QR codes expire after 30-60 seconds (configurable)
2. **HMAC signature**: Prevents tampering with token data
3. **One-time use tokens**: Tokens are invalidated after successful scan
4. **Rate limiting**: Prevent abuse (max 5 scans per employee per minute)
5. **Device fingerprinting**: Optional - track scanning device for audit
6. **Location validation**: Optional - validate scan location (if GPS enabled)

---

## 📊 Database Schema

### New Table: `employee_qr_tokens`

```sql
CREATE TABLE employee_qr_tokens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT UNSIGNED NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    scanned_by_device VARCHAR(255) NULL,
    ip_address VARCHAR(45) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_token (token),
    INDEX idx_employee_expires (employee_id, expires_at),
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);
```

### Employee Model Addition

Add to `employees` table:

- `qr_code_secret` VARCHAR(255) - Unique secret for HMAC signing (generated once per employee)

---

## 🏗️ Architecture Flow

### 1. QR Code Generation Flow

```
Employee Portal
    ↓
Employee clicks "Show My QR Code"
    ↓
Frontend requests QR token from API
    ↓
Backend generates secure token (30-60s expiry)
    ↓
Backend stores token in database
    ↓
Backend returns token to frontend
    ↓
Frontend generates QR code image using token
    ↓
Employee sees QR code on screen
```

### 2. QR Code Scanning Flow

```
Scanner (Mobile/Tablet/Kiosk)
    ↓
Camera captures QR code
    ↓
Extract token from QR code
    ↓
Send token to API endpoint (/api/qr-attendance/scan)
    ↓
Backend validates:
    - Token exists and not expired
    - Token not already used
    - Employee exists and active
    - Current time within attendance session window
    ↓
Backend logs attendance
    ↓
Backend invalidates token (mark as used)
    ↓
Backend broadcasts via WebSocket (real-time update)
    ↓
Response sent to scanner
    ↓
Success/Error message displayed
```

---

## 📦 Technology Stack

### Frontend Libraries

1. **QR Code Generation**: `qrcode.react` or `qrcode.js`

    ```bash
    bun add qrcode.react
    # or
    bun add qrcode @types/qrcode
    ```

2. **QR Code Scanning**: `html5-qrcode` (Best for web cameras)
    ```bash
    bun add html5-qrcode
    ```

### Backend (Laravel)

- Built-in `Hash` facade for HMAC signatures
- Existing `Attendance` model and logic
- Laravel Reverb for real-time updates

---

## 🔧 Implementation Steps

### Step 1: Database Migration

Create migration for `employee_qr_tokens` table and add `qr_code_secret` to employees table.

### Step 2: Employee Model Updates

Add methods to Employee model:

- `generateQrSecret()` - Generate unique secret on first use
- `generateQrToken()` - Generate time-limited QR token
- `validateQrToken($token)` - Validate incoming token

### Step 3: Backend API Endpoints

**Routes:**

- `GET /api/qr-code/generate` - Generate QR token for logged-in employee
- `POST /api/qr-attendance/scan` - Scan and validate QR code, log attendance

**Controllers:**

- `QrCodeController` - Handle QR code generation
- `QrAttendanceController` - Handle QR code scanning and attendance logging

### Step 4: Frontend Components

1. **EmployeeQRCode Component** - Display QR code in employee portal

    - Auto-refresh every 30-60 seconds
    - Show expiration countdown
    - Download/Print options

2. **QRScanner Component** - Scanner interface
    - Camera access
    - Real-time scanning feedback
    - Success/Error notifications
    - Support both employee self-scan and kiosk mode

### Step 5: Integration

- Integrate with existing `AttendanceSession` model
- Use existing attendance logging logic
- Broadcast attendance events via Laravel Reverb
- Show attendance in existing attendance lists

---

## 📱 User Interfaces

### Employee Portal - QR Code Page

```
┌─────────────────────────────────────┐
│        My QR Code for Attendance    │
├─────────────────────────────────────┤
│                                     │
│        ┌──────────────┐            │
│        │              │            │
│        │   [QR CODE]  │            │
│        │              │            │
│        └──────────────┘            │
│                                     │
│  Expires in: 00:45                 │
│                                     │
│  [Refresh QR Code] [Download]      │
│                                     │
│  📱 Instructions:                  │
│  • Show this QR code at attendance │
│    station                          │
│  • QR code refreshes automatically │
│  • One QR code = one attendance    │
└─────────────────────────────────────┘
```

### Kiosk/Scanner Page

```
┌─────────────────────────────────────┐
│      QR Code Attendance Scanner     │
├─────────────────────────────────────┤
│                                     │
│  📷 Camera Preview                  │
│  ┌──────────────────────┐          │
│  │                      │          │
│  │   [Camera Feed]      │          │
│  │                      │          │
│  └──────────────────────┘          │
│                                     │
│  Status: Ready to scan...          │
│                                     │
│  [Start Camera] [Stop Camera]      │
│                                     │
└─────────────────────────────────────┘
```

---

## 🔄 Integration Points

### 1. Attendance Session Integration

QR code attendance should respect existing attendance sessions:

- Check if current time is within `time_in_start` and `time_in_end` (for time-in)
- Check if current time is within `time_out_start` and `time_out_end` (for time-out)
- Determine session (morning/afternoon/night) automatically

### 2. Existing Attendance Logic

Reuse existing attendance logging:

- Use same `Attendance` model
- Same validation rules
- Same status calculation (Present, Late, etc.)
- Same session-based logic

### 3. Real-time Updates

Use existing Laravel Reverb channels:

- Broadcast attendance events
- Update admin dashboards in real-time
- Show notifications

---

## 🛡️ Security Best Practices

1. **Token Expiration**: Short-lived tokens (30-60 seconds)
2. **One-time Use**: Tokens invalidated after successful scan
3. **HMAC Signature**: Prevent token tampering
4. **Rate Limiting**: Max 10 token generations per employee per hour
5. **Audit Trail**: Log all QR code scans (who, when, where)
6. **HTTPS Only**: QR codes should only work over HTTPS
7. **CORS Protection**: API endpoints should validate origins
8. **Employee Validation**: Verify employee is active, not deleted

---

## 📈 Additional Features (Future Enhancements)

1. **Geolocation Validation**: Require employees to be within office location
2. **Face Recognition**: Combine QR + face verification for higher security
3. **QR Code History**: Show employees their QR scan history
4. **Bulk QR Generation**: Admin can generate QR codes for all employees
5. **QR Code Stats**: Analytics on QR code usage vs fingerprint
6. **Offline Mode**: Support offline scanning with sync later
7. **Multi-factor**: QR code + PIN verification

---

## 🧪 Testing Strategy

1. **Unit Tests**:

    - Token generation
    - Token validation
    - Expiration logic
    - HMAC signature verification

2. **Integration Tests**:

    - End-to-end QR code generation → scanning → attendance logging
    - Session validation
    - Rate limiting

3. **Security Tests**:
    - Token tampering attempts
    - Expired token usage
    - Replay attacks
    - Rate limit bypass attempts

---

## 📝 API Endpoints Specification

### GET /api/qr-code/generate

**Request Headers:**

```
Authorization: Bearer {employee_session_token}
```

**Response:**

```json
{
    "success": true,
    "token": "abc123...",
    "expires_at": "2025-01-20T10:30:00Z",
    "expires_in": 60,
    "qr_data": {
        "employee_id": 123,
        "employeeid": "EMP10282001",
        "token": "abc123...",
        "expires_at": "2025-01-20T10:30:00Z",
        "signature": "hmac_signature..."
    }
}
```

### POST /api/qr-attendance/scan

**Request Body:**

```json
{
    "token": "abc123...",
    "device_fingerprint": "optional_device_id",
    "location": {
        "latitude": 14.5995,
        "longitude": 120.9842
    }
}
```

**Response:**

```json
{
    "success": true,
    "message": "Attendance recorded successfully",
    "attendance": {
        "id": 456,
        "employee_id": 123,
        "time_in": "09:15:00",
        "attendance_date": "2025-01-20",
        "session": "morning",
        "status": "Present"
    }
}
```

---

## 🚀 Deployment Checklist

- [ ] Run database migrations
- [ ] Generate QR secrets for existing employees
- [ ] Test QR code generation
- [ ] Test QR code scanning
- [ ] Test integration with attendance sessions
- [ ] Test real-time updates via WebSocket
- [ ] Configure rate limiting
- [ ] Set up monitoring/analytics
- [ ] Train staff on new feature
- [ ] Create user documentation

---

## 📚 Dependencies to Install

```bash
# Frontend
bun add qrcode.react
# or
bun add qrcode @types/qrcode

bun add html5-qrcode

# Backend (Laravel - no additional packages needed)
# Use built-in Hash::hmac() for signatures
```

---

## 🎯 Recommended Approach

**Phase 1: Basic Implementation**

1. Database migration
2. Employee model updates
3. Basic QR code generation API
4. Employee portal QR display
5. Basic scanner page
6. Attendance logging

**Phase 2: Security & Polish**

1. HMAC signatures
2. Rate limiting
3. Token expiration
4. Better UI/UX
5. Error handling

**Phase 3: Advanced Features**

1. Geolocation validation
2. Analytics
3. Admin bulk operations
4. Mobile app (optional)

---

## 💡 Best Practices Summary

✅ **DO:**

- Use short-lived, one-time tokens
- Implement HMAC signatures
- Add rate limiting
- Log all scans for audit
- Auto-refresh QR codes
- Show clear expiration countdown
- Provide manual refresh option
- Integrate with existing attendance system
- Use HTTPS only

❌ **DON'T:**

- Store sensitive data in QR code
- Use long-lived tokens
- Allow token reuse
- Skip validation
- Expose employee secrets
- Allow unauthenticated scanning
- Skip rate limiting
- Forget to invalidate used tokens

---

## 🔗 Related Files to Modify

1. `database/migrations/` - Create new migration
2. `app/Models/Employee.php` - Add QR methods
3. `app/Http/Controllers/` - Create QrCodeController, QrAttendanceController
4. `routes/api.php` - Add QR routes
5. `routes/employee_auth.php` - Add employee QR route
6. `resources/js/pages/employee-view/` - Create QR display page
7. `resources/js/pages/attendance/` - Create scanner page
8. `app/Models/Attendance.php` - May need minor updates

---

This implementation plan provides a secure, scalable, and user-friendly QR code attendance system that integrates seamlessly with your existing infrastructure.
