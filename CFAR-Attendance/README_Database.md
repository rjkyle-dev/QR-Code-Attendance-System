# HRIS CheckWise Database Functionality

## Overview

This document describes the database functionality added to the HRIS CheckWise fingerprint system.

## Database Setup

### 1. MySQL Database Requirements

- MySQL Server (5.7 or higher)
- Database name: `cfarbemco_db_fingerprint`
- User: `root` (or update connection string in `db_connection.cs`)

### 2. Database Schema

Run the `database_schema.sql` script in your MySQL server to create the required table:

```sql
-- Execute this in MySQL
source database_schema.sql;
```

## Database Features

### Employee Management

The system now supports storing employee data in the database with the following information:

- Employee name
- Profile image
- Fingerprint template (for verification)
- Fingerprint image (visual representation)
- Creation and update timestamps

### UI Components

#### Left Side (Local Testing)

- **fImage**: Displays captured fingerprint image
- **nameTest**: Textbox for employee name (local testing)
- **enrollBtn**: "Start Capture Test" - for local enrollment
- **verifyBtn**: "Verification Test" - for local verification

#### Right Side (Database Operations)

- **profileImgDb**: PictureBox for profile image (click to select)
- **nameDb**: Textbox for employee name (database operations)
- **fingerprintDB**: PictureBox for fingerprint image display
- **StartCaptureDb**: "Start Capture" - capture fingerprint for database
- **StartVerifyDb**: "Start Verify" - verify fingerprint against database
- **saveDb**: "Save" - save employee data to database
- **MessageDb**: Label for status messages

## Usage Instructions

### Adding New Employee to Database

1. **Enter Employee Name**: Type the employee's name in the `nameDb` textbox
2. **Select Profile Image**: Click on the `profileImgDb` picture box to open file dialog and select an image
3. **Capture Fingerprint**: Click "Start Capture" button and place finger on the scanner
4. **Save to Database**: Click "Save" button to store all data in the database

### Verifying Employee from Database

1. **Start Verification**: Click "Start Verify" button
2. **Place Finger**: Place finger on the scanner for verification
3. **View Results**: If match found, employee information will be displayed in the right panel

### Local Testing (Left Side)

The left side maintains the original functionality for local testing without database storage.

## Database Operations

### Key Methods

- `SelectProfileImage()`: Opens file dialog to select profile image
- `StartCaptureDb_Click()`: Initiates fingerprint capture for database
- `StartVerifyDb_Click()`: Initiates fingerprint verification against database
- `saveDb_Click()`: Saves employee data to database
- `LoadTemplatesFromDatabase()`: Loads all fingerprint templates from database on startup
- `VerifyEmployeeFromDatabase()`: Retrieves and displays employee information on successful verification

### Database Table Structure

```sql
CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    profile_image LONGBLOB,
    fingerprint_template LONGBLOB NOT NULL,
    fingerprint_image LONGBLOB,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_name (name)
);
```

## Error Handling

The system includes comprehensive error handling for:

- Database connection issues
- Duplicate employee names
- Missing required data (name, image, fingerprint)
- Invalid fingerprint samples
- File loading errors

## Security Features

- Duplicate fingerprint detection
- Employee name uniqueness validation
- Secure parameterized queries to prevent SQL injection
- Proper resource disposal for database connections

## Troubleshooting

### Common Issues

1. **Database Connection Error**: Check MySQL server is running and connection string in `db_connection.cs`
2. **Duplicate Employee**: System prevents adding employees with same name
3. **Image Loading Error**: Ensure image file is not corrupted and format is supported
4. **Fingerprint Capture Issues**: Check fingerprint scanner connection and driver installation

### Database Connection String

Update the connection string in `db_connection.cs` if needed:

```csharp
private string connectionString = "server=localhost;database=cfarbemco_db_fingerprint;uid=root;pwd=;";
```

## Performance Considerations

- Fingerprint templates are loaded into memory on application startup
- Database connections are properly managed with using statements
- Large BLOB data (images) are handled efficiently
- Indexes are created for better query performance
