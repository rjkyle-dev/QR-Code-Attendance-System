# C# Application Update Guide for Add Crew Fingerprint Support

## Problem

The C# application (`CFAR-Register/Registration.cs`) currently only supports employees with `employeeid`. Add Crew employees don't have an `employeeid`, so fingerprint registration fails.

## Required Changes

### 1. Update the WebSocket Message Handler

**File:** `CFAR-Register/Registration.cs`

**Current Code (around line 478):**

```csharp
if (data.type == "start_registration" && data.employeeid != null)
{
    string employeeId = data.employeeid;
    BeginFingerprintRegistration(employeeId);
}
```

**Updated Code:**

```csharp
if (data.type == "start_registration" && data.employeeid != null)
{
    string employeeId = data.employeeid;

    // Check if this is a database ID format (Add Crew employees: "DB_ID_<id>")
    if (employeeId.StartsWith("DB_ID_"))
    {
        // Extract the database ID from the format "DB_ID_<id>"
        string dbIdString = employeeId.Replace("DB_ID_", "");
        if (int.TryParse(dbIdString, out int employeeDbId))
        {
            BeginFingerprintRegistrationWithDbId(employeeDbId);
        }
        else
        {
            MessageDb.Text = "Invalid database ID format.";
        }
    }
    else
    {
        // Regular employeeid (Regular/Probationary employees)
        BeginFingerprintRegistration(employeeId);
    }
}
```

### 2. Add New Field for Database ID

**File:** `CFAR-Register/Registration.cs`

**Add after line 43 (where `pendingEmployeeId` is declared):**

```csharp
private string pendingEmployeeId = null;
private int? pendingEmployeeDbId = null; // Add this line
```

### 3. Create New Method for Database ID Registration

**File:** `CFAR-Register/Registration.cs`

**Add this new method after `BeginFingerprintRegistration`:**

```csharp
// This method triggers the enrollment/registration for Add Crew employees using database ID
private void BeginFingerprintRegistrationWithDbId(int employeeDbId)
{
    // Always clear previous state and reset flags for new registration
    this.Invoke((MethodInvoker)delegate {
        // Stop any ongoing capture (if needed)
        if (Capturer != null)
        {
            try { Capturer.StopCapture(); } catch { /* ignore */ }
        }
        // Reset enrollment state
        Enroller.Clear();
        IsDbEnrolling = false;
        pendingEmployeeId = null;
        pendingEmployeeDbId = null; // Clear previous database ID
        // Reset progress bar
        ResetProgressBar();

        // Set the database ID
        pendingEmployeeDbId = employeeDbId;
        pendingEmployeeId = null; // Clear employeeid since we're using database ID
        employeeID.Text = $"DB ID: {employeeDbId}";
        MessageDb.Text = $"Starting fingerprint registration for Employee DB ID: {employeeDbId}. Please touch the device 4 times.";

        // Start enrollment
        IsDbEnrolling = true;
        StartCapture();
    });
}
```

### 4. Update the Save Method

**File:** `CFAR-Register/Registration.cs`

**Current Code (around line 555-602):**

```csharp
private void save_Click_1(object sender, EventArgs e)
{
    if (CurrentDbTemplate == null || CurrentFingerprintImage == null || string.IsNullOrEmpty(pendingEmployeeId))
    {
        MessageDb.Text = "No fingerprint captured or employee not set.";
        PlayErrorSound();
        return;
    }
    try
    {
        dbConn.OpenConnection();
        // Get employee's internal DB id using employeeid
        string getEmpIdQuery = "SELECT id FROM employees WHERE employeeid = @employeeid LIMIT 1";
        int employeeDbId = -1;
        using (var cmd = new MySqlCommand(getEmpIdQuery, dbConn.Connection))
        {
            cmd.Parameters.AddWithValue("@employeeid", pendingEmployeeId);
            var result = cmd.ExecuteScalar();
            if (result != null)
                employeeDbId = Convert.ToInt32(result);
        }
        if (employeeDbId != -1)
        {
            // ... save fingerprint ...
        }
    }
    catch (Exception ex)
    {
        // ... error handling ...
    }
}
```

**Updated Code:**

```csharp
private void save_Click_1(object sender, EventArgs e)
{
    if (CurrentDbTemplate == null || CurrentFingerprintImage == null ||
        (string.IsNullOrEmpty(pendingEmployeeId) && !pendingEmployeeDbId.HasValue))
    {
        MessageDb.Text = "No fingerprint captured or employee not set.";
        PlayErrorSound();
        return;
    }
    try
    {
        dbConn.OpenConnection();
        int employeeDbId = -1;

        // Check if we have a database ID directly (Add Crew employees)
        if (pendingEmployeeDbId.HasValue)
        {
            employeeDbId = pendingEmployeeDbId.Value;
        }
        // Otherwise, lookup by employeeid (Regular/Probationary employees)
        else if (!string.IsNullOrEmpty(pendingEmployeeId))
        {
            string getEmpIdQuery = "SELECT id FROM employees WHERE employeeid = @employeeid LIMIT 1";
            using (var cmd = new MySqlCommand(getEmpIdQuery, dbConn.Connection))
            {
                cmd.Parameters.AddWithValue("@employeeid", pendingEmployeeId);
                var result = cmd.ExecuteScalar();
                if (result != null)
                    employeeDbId = Convert.ToInt32(result);
            }
        }

        if (employeeDbId != -1)
        {
            string insertQuery = "INSERT INTO fingerprints (employee_id, fingerprint_template, fingerprint_image, fingerprint_captured_at) VALUES (@employee_id, @template, @image, @captured_at)";
            using (var cmd = new MySqlCommand(insertQuery, dbConn.Connection))
            {
                cmd.Parameters.AddWithValue("@employee_id", employeeDbId);
                cmd.Parameters.AddWithValue("@template", TemplateToByteArray(CurrentDbTemplate));
                cmd.Parameters.AddWithValue("@image", Convert.ToBase64String(ImageToByteArray(CurrentFingerprintImage)));
                cmd.Parameters.AddWithValue("@captured_at", DateTime.Now);
                cmd.ExecuteNonQuery();
            }
            MessageDb.Text = "Fingerprint saved to database!";
            PlaySuccessSound();
            // Clear state for next registration
            Enroller.Clear();
            IsDbEnrolling = false;
            CurrentDbTemplate = null;
            CurrentFingerprintImage = null;
            pendingEmployeeId = null;
            pendingEmployeeDbId = null; // Clear database ID
            // Reset progress bar
            ResetProgressBar();
        }
        else
        {
            MessageDb.Text = "Employee not found in database!";
            PlayErrorSound();
        }
    }
    catch (Exception ex)
    {
        MessageDb.Text = $"Error saving fingerprint: {ex.Message}";
        PlayErrorSound();
        Console.WriteLine($"Error: {ex.Message}");
    }
    finally
    {
        dbConn.CloseConnection();
    }
}
```

### 5. Update SendFingerprintDataToReact Method

**File:** `CFAR-Register/Registration.cs`

**Current Code (around line 527):**

```csharp
private void SendFingerprintDataToReact(string employeeId, Bitmap fingerprintImage, DateTime capturedAt)
```

**Updated Code:**

```csharp
private void SendFingerprintDataToReact(string employeeId, Bitmap fingerprintImage, DateTime capturedAt)
{
    if (ws != null && ws.IsAlive && fingerprintImage != null &&
        (!string.IsNullOrEmpty(employeeId) || pendingEmployeeDbId.HasValue))
    {
        string fingerprintImageBase64 = null;
        using (var ms = new MemoryStream())
        {
            fingerprintImage.Save(ms, System.Drawing.Imaging.ImageFormat.Png);
            fingerprintImageBase64 = Convert.ToBase64String(ms.ToArray());
        }

        var msg = new
        {
            type = "fingerprint_data",
            employeeid = employeeId, // Will be null for Add Crew
            employee_db_id = pendingEmployeeDbId, // Will be null for Regular/Probationary
            fingerprint_image = fingerprintImageBase64,
            fingerprint_captured_at = capturedAt.ToString("o")
        };
        string json = JsonConvert.SerializeObject(msg);
        ws.Send(json);
    }
}
```

**Update the call to this method (around line 168):**

```csharp
// Send fingerprint data to React via WebSocket
// For Add Crew, send the DB_ID format; for others, send the regular employeeid
string employeeIdForReact = pendingEmployeeDbId.HasValue
    ? $"DB_ID_{pendingEmployeeDbId.Value}"
    : pendingEmployeeId;
SendFingerprintDataToReact(employeeIdForReact, CurrentFingerprintImage, DateTime.Now);
```

**Note:** The WebSocket server will automatically convert the `DB_ID_` format back to `employee_db_id` when sending to React clients and the Laravel backend API.

## Summary

The key changes are:

1. Detect `DB_ID_<id>` format in WebSocket messages (sent by WebSocket server for Add Crew employees)
2. Extract and store the database ID separately when the format is detected
3. Use the database ID directly when saving (skip the employeeid lookup)
4. Send `DB_ID_<id>` format in fingerprint_data messages for Add Crew employees (WebSocket server will convert it back)

## How It Works

1. **Frontend (React)**: Sends `employee_db_id` in WebSocket message for Add Crew employees
2. **WebSocket Server**: Converts `employee_db_id` to `DB_ID_<id>` format and sends as `employeeid` to C# app
3. **C# App**: Detects `DB_ID_` prefix, extracts the database ID, and uses it directly when saving
4. **C# App**: Sends fingerprint*data with `DB_ID*<id>` format back via WebSocket
5. **WebSocket Server**: Converts `DB_ID_<id>` back to `employee_db_id` for React clients and backend API

After these changes, the C# application will support both Regular/Probationary employees (with employeeid) and Add Crew employees (with database ID only).
