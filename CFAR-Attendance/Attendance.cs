using Avalonia;
using DPFP;
using DPFP.Capture;
using DPFP.Processing;
using DPFP.Verification;
using MySql.Data.MySqlClient;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Media;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using WebSocketSharp;

namespace HRIS_CheckWise_ATMS_
{
    public partial class Attendance : Form, DPFP.Capture.EventHandler
    {
        private db_connection dbConn;
        protected Capture Capturer;
        protected Verification Verificator;
        protected Dictionary<string, Template> LocalTemplates = new Dictionary<string, Template>();
        private bool IsDbVerifying = false;
        private bool isDeviceConnected = false;
            private bool isRefreshingAttendanceTable = false;


        public Attendance()
        {
            InitializeComponent();
            dbConn = new db_connection();
            Init();
            this.WindowState = FormWindowState.Maximized;
           
        }

        // Helper to marshal actions to the UI thread
        private void RunOnUiThread(Action action)
        {
            if (InvokeRequired)
            {
                BeginInvoke(action);
            }
            else
            {
                action();
            }
        }

        private bool IsDeviceConnected()
        {
            try
            {
                ReadersCollection readers = new ReadersCollection();
                readers.Refresh();

                if (readers.Count == 0)
                {
                    RunOnUiThread(() => MessageDb.Text = "No fingerprint device connected.");
                    return false;
                }
                else
                {
                    RunOnUiThread(() => MessageDb.Text = "Fingerprint device connected.");
                    return true;
                }
            }
            catch (Exception ex)
            {
                RunOnUiThread(() => MessageDb.Text = "Device check error: " + ex.Message);
                return false;
            }
        }

        protected virtual void Init()
        {
            try
            {
                Capturer = new Capture();
                if (Capturer != null)
                {
                    Capturer.EventHandler = this;
                    Verificator = new Verification();
                    SetStatus("Device ready.");
                    StartCapture();
                }
                else
                    MakeReport("Cannot initialize capture operation.");
            }
            catch (Exception ex)
            {
                MessageBox.Show("Error initializing capture: " + ex.Message);
            }
        }

        protected void StartCapture()
        {
            if (Capturer != null)
                Capturer.StartCapture();
        }

        protected void StopCapture()
        {
            if (Capturer != null)
                Capturer.StopCapture();
        }

        protected void SetStatus(string message)
        {
            //device_status.Text = message;
        }

        protected void MakeReport(string message)
        {
            //make_report.Text = message;
        }

        protected FeatureSet ExtractFeatures(Sample Sample, DPFP.Processing.DataPurpose Purpose)
        {
            DPFP.Processing.FeatureExtraction Extractor = new DPFP.Processing.FeatureExtraction();
            DPFP.Capture.CaptureFeedback feedback = DPFP.Capture.CaptureFeedback.None;
            FeatureSet features = new DPFP.FeatureSet();
            Extractor.CreateFeatureSet(Sample, Purpose, ref feedback, ref features);
            if (feedback == DPFP.Capture.CaptureFeedback.Good)
                return features;
            else
                return null;
        }

        protected Bitmap ConvertSampleToBitmap(Sample sample)
        {
            SampleConversion converter = new SampleConversion();
            Bitmap bitmap = null;
            converter.ConvertToPicture(sample, ref bitmap);
            return bitmap;
        }

        protected void DrawPicture(Bitmap bitmap)
        {
            // Implement image drawing for your UI
        }

        public void OnReaderConnect(object Capture, string ReaderSerialNumber)
        {
            SetStatus("Reader Connected.");
            RunOnUiThread(() => color_indicator.FillColor = Color.LightGreen);
        }

        public void OnReaderDisconnect(object Capture, string ReaderSerialNumber)
        {
            SetStatus("Reader Disconnected.");
            RunOnUiThread(() => color_indicator.FillColor = Color.Red);
        }

        public void OnFingerTouch(object Capture, string ReaderSerialNumber)
        {
            MakeReport("Finger touched.");
           
        }

        public void OnFingerGone(object Capture, string ReaderSerialNumber)
        {
            MakeReport("Finger removed.");
           
        }

        public void OnSampleQuality(object Capture, string ReaderSerialNumber, CaptureFeedback CaptureFeedback)
        {
            if (CaptureFeedback == CaptureFeedback.Good)
                MakeReport("Good sample.");
            else
                MakeReport("Poor sample.");
        }

        public void OnComplete(object Capture, string ReaderSerialNumber, Sample Sample)
        {
            RunOnUiThread(() =>
        {
            MakeReport("Fingerprint captured.");
            Process(Sample);
            });
        }

        protected virtual void Process(Sample sample)
        {
            DrawPicture(ConvertSampleToBitmap(sample));
            if (IsDbVerifying)
            {
                ProcessDbVerification(sample);
            }
        }

        private void LoadTemplatesFromDatabase()
        {
            try
            {
                LocalTemplates.Clear();
                dbConn.OpenConnection();
                string query = "SELECT employees.employeeid, fingerprints.fingerprint_template FROM fingerprints JOIN employees ON fingerprints.employee_id = employees.id";
                using (MySqlCommand cmd = new MySqlCommand(query, dbConn.Connection))
                using (MySqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        string employeeId = reader["employeeid"].ToString();
                        byte[] templateBytes = (byte[])reader["fingerprint_template"];
                        using (MemoryStream stream = new MemoryStream(templateBytes))
                        {
                            Template template = new Template();
                            template.DeSerialize(stream);
                            LocalTemplates.Add(employeeId, template);
                        }
                    }
                }
                SetStatus($"Loaded {LocalTemplates.Count} templates from database.");
            }
            catch (Exception ex)
            {
                RunOnUiThread(() => MessageBox.Show("Error loading templates: " + ex.Message, "Database Error", MessageBoxButtons.OK, MessageBoxIcon.Error));
            }
            finally
            {
                dbConn.CloseConnection();
            }
        }

        private async void ProcessDbVerification(Sample sample)
        {
            if (LocalTemplates.Count == 0)
            {
                SetStatus("No templates in database for verification.");
                return;
            }
            FeatureSet features = ExtractFeatures(sample, DataPurpose.Verification);
            if (features == null)
            {
                SetStatus("Bad sample.");
                return;
            }
            bool matched = false;
            string matchedEmployeeId = "";
            foreach (var pair in LocalTemplates)
            {
                Verification.Result result = new Verification.Result();
                Verificator.Verify(features, pair.Value, ref result);
                if (result.Verified)
                {
                    matched = true;
                    matchedEmployeeId = pair.Key;
                    break;
                }
            }
            if (matched)
            {
                VerifyEmployeeFromDatabase(matchedEmployeeId);
                await LogAttendanceAsync(matchedEmployeeId);
            }
            else
            {
                SetStatus("No match found in database.");
                System.Media.SoundPlayer player = new System.Media.SoundPlayer(@"C:\visual studio code\CFAR-Attendance\Sound\error.wav");
                player.Play();
                RunOnUiThread(() => new Toast(ToastType.Error, "Fingerprint Not Registered", "This fingerprint is not registered to any employee.").Show());
            }
            IsDbVerifying = true;
        }
        
        private void VerifyEmployeeFromDatabase(string employeeId)
        {
            try
            {
                dbConn.OpenConnection();

                string query = "SELECT employee_name,department,position,employeeid,work_status FROM employees WHERE employeeid = @id";
                using (MySqlCommand cmd = new MySqlCommand(query, dbConn.Connection))
                {
                    cmd.Parameters.AddWithValue("@id", employeeId);
                    using (MySqlDataReader reader = cmd.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            string name = reader["employee_name"].ToString();
                            string department = reader["department"].ToString();
                            string position = reader["position"].ToString();
                            string employeeid = reader["employeeid"].ToString();
                            string work_status = reader["work_status"].ToString();
                            RunOnUiThread(() =>
                            {
                            lblEmployeeName.Text = name;
                            lblEmployeeDepartment.Text = department;
                            lblEmployeePosition.Text = position;
                            lblEmployeeID.Text = employeeId;
                            lblwork_status.Text = work_status;
                            new Toast(ToastType.Success, "Successfully", "Attendance.").Show();
                            });

                            System.Media.SoundPlayer player = new System.Media.SoundPlayer(@"C:\visual studio code\CFAR-Attendance\Sound\success.wav");
                            player.Play();
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                System.Media.SoundPlayer player = new System.Media.SoundPlayer(@"C:\visual studio code\CFAR-Attendance\Sound\error.wav");
                player.Play();
                RunOnUiThread(() => MessageBox.Show("Error verifying employee: " + ex.Message));
            }
            finally
            {
                dbConn.CloseConnection();
            }
        }

        // API base URL - configured through ApiConfig

        // Add this function to determine session using API data
        private async Task<string> DetermineSessionAsync(DateTime timeIn)
        {
            try
            {
                return await AttendanceSessionApiHelper.DetermineSessionAsync(timeIn, ApiConfig.ApiBaseUrl);
            }
            catch (Exception ex)
            {
                // Fallback to original logic if API fails
                Console.WriteLine($"Error determining session: {ex.Message}");
                return DetermineSessionFallback(timeIn);
            }
        }

        // Fallback method for when API is unavailable
        private string DetermineSessionFallback(DateTime timeIn)
        {
            // Single company-wide schedule
            return "company";
        }

        // Check if employee is late based on session times
        private async Task<bool> IsLateAsync(DateTime timeIn, string sessionName)
        {
            try
            {
                return await AttendanceSessionApiHelper.IsLateAsync(timeIn, sessionName, ApiConfig.ApiBaseUrl);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error checking late status: {ex.Message}");
                return false;
            }
        }

        // Check if attendance is allowed at current time
        private async Task<bool> IsAttendanceAllowedAsync(DateTime currentTime)
        {
            try
            {
                return await AttendanceSessionApiHelper.IsAttendanceAllowedAsync(currentTime, ApiConfig.ApiBaseUrl);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error checking attendance allowance: {ex.Message}");
                return true; // Allow if API fails
            }
        }

        // Get current session name for display
        private async Task<string> GetCurrentSessionNameAsync(DateTime currentTime)
        {
            try
            {
                return await AttendanceSessionApiHelper.GetCurrentSessionNameAsync(currentTime, ApiConfig.ApiBaseUrl);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting current session: {ex.Message}");
                return "Unknown";
            }
        }

        private async Task LogAttendanceAsync(string employeeId)
        {
            try
            {
                // Check if attendance is allowed at current time
                DateTime now = DateTime.Now;
                bool isAttendanceAllowed = await IsAttendanceAllowedAsync(now);
                
                if (!isAttendanceAllowed)
                {
                    string currentSession = await GetCurrentSessionNameAsync(now);
                    string message = $"Attendance not allowed at this time. Current time: {now.ToString("hh:mm:ss tt")}. Active session: {currentSession}";
                    
                    System.Media.SoundPlayer player = new System.Media.SoundPlayer(@"C:\visual studio code\CFAR-Attendance\Sound\error.wav");
                    player.Play();
                    RunOnUiThread(() => new Toast(ToastType.Error, "Biometrics Attendance Restricted", message).Show());
                    //MessageDb.Text = "Attendance not allowed outside session hours.";
                    return;
                }

                dbConn.OpenConnection();

                // Step 1: Get numeric ID from employeeid string (e.g. "EMP10282001")
                int numericId = -1;
                string idQuery = "SELECT id FROM employees WHERE employeeid = @empid";
                using (var idCmd = new MySqlCommand(idQuery, dbConn.Connection))
                {
                    idCmd.Parameters.AddWithValue("@empid", employeeId);
                    object result = idCmd.ExecuteScalar();

                    if (result == null)
                    {
                        string message = $"Employee ID not found!";
                        SystemSounds.Exclamation.Play();
                        RunOnUiThread(() => new Toast(ToastType.Error," ", message).Show());
                        //MessageDb.Text = "Employee ID not found.";
                        return;
                    }
                    numericId = Convert.ToInt32(result);
                }

                // Step 2: Determine if we're in time-in or time-out period
                string session = await DetermineSessionAsync(now);
                bool isInTimeOutPeriod = await AttendanceSessionApiHelper.IsInTimeOutPeriodAsync(now, session, ApiConfig.ApiBaseUrl);

                // Step 3: Check for existing attendance today
                string checkQuery = "SELECT id, time_in, time_out FROM attendances WHERE employee_id = @id AND attendance_date = CURDATE()";
                using (var checkCmd = new MySqlCommand(checkQuery, dbConn.Connection))
                {
                    checkCmd.Parameters.AddWithValue("@id", numericId);
                    using (var reader = checkCmd.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            int attendanceId = reader.GetInt32("id");
                            TimeSpan timeIn = reader.GetTimeSpan("time_in");
                            bool hasTimeOut = !reader.IsDBNull(reader.GetOrdinal("time_out"));
                            reader.Close();

                            if (hasTimeOut)
                            {
                                // Already has both time-in and time-out, show message
                                SystemSounds.Exclamation.Play();
                                // MessageDb.Text = "Attendance already completed for today.";
                                new Toast(ToastType.Warning, "Already Completed", "You have already completed your attendance for today.").Show();
                                return;
                            }

                            // Has time-in but no time-out
                            if (isInTimeOutPeriod)
                            {
                                // Check if time-out is configured for this session
                                bool isTimeOutConfigured = await AttendanceSessionApiHelper.IsTimeOutConfiguredAsync(session, ApiConfig.ApiBaseUrl);
                                
                                if (!isTimeOutConfigured)
                                {
                                    SystemSounds.Exclamation.Play();
                                    // MessageDb.Text = "Time-out not configured for this session.";
                                    new Toast(ToastType.Warning, "Time-out Not Configured", "Time-out period is not set for this session.").Show();
                                    return;
                                }

                                // Record time-out
                                TimeSpan breakDuration = now.TimeOfDay - timeIn;
                                string timeOut24 = now.ToString("HH:mm:ss");
                                string break12 = breakDuration.ToString();

                                string updateQuery = @"UPDATE attendances 
                            SET time_out = @out, break_time = @break, attendance_status = @status, session = @session 
                            WHERE id = @aid";

                                using (var updateCmd = new MySqlCommand(updateQuery, dbConn.Connection))
                                {
                                    updateCmd.Parameters.AddWithValue("@out", timeOut24);
                                    updateCmd.Parameters.AddWithValue("@break", break12);
                                    updateCmd.Parameters.AddWithValue("@status", "Complete");
                                    updateCmd.Parameters.AddWithValue("@session", session);
                                    updateCmd.Parameters.AddWithValue("@aid", attendanceId);
                                    updateCmd.ExecuteNonQuery();
                                }

                                SystemSounds.Asterisk.Play();
                                // MessageDb.Text = "Time-out recorded.";
                                RunOnUiThread(() => new Toast(ToastType.Success, "Time-Out Recorded", "Time-out recorded successfully!").Show());
                            }
                            else
                            {
                                // Not in time-out period, show message
                                SystemSounds.Exclamation.Play();
                                // MessageDb.Text = "Not within time-out period.";
                                RunOnUiThread(() => new Toast(ToastType.Warning, "Time-Out Restricted", "Current time is not within the time-out period.").Show());
                            }
                        }
                        else
                        {
                            reader.Close();

                            // No existing attendance - record time-in
                            if (!isInTimeOutPeriod)
                            {
                                // In time-in period - record time-in
                                bool isLate = await IsLateAsync(now, session);
                                string attendanceStatus = isLate ? "Late" : "Time In";
                                string timeIn24 = now.ToString("HH:mm:ss");
                                
                                string insertQuery = "INSERT INTO attendances (employee_id, time_in, attendance_date, attendance_status, session) VALUES (@id, @in, CURDATE(), @status, @session)";
                                using (var insertCmd = new MySqlCommand(insertQuery, dbConn.Connection))
                                {
                                    insertCmd.Parameters.AddWithValue("@id", numericId);
                                    insertCmd.Parameters.AddWithValue("@in", timeIn24);
                                    insertCmd.Parameters.AddWithValue("@status", attendanceStatus);
                                    insertCmd.Parameters.AddWithValue("@session", session);
                                    insertCmd.ExecuteNonQuery();
                                }

                                SystemSounds.Asterisk.Play();
                                // MessageDb.Text = "Time-in recorded.";
                                RunOnUiThread(() => new Toast(ToastType.Success, "Time-In Recorded", "Time-in recorded successfully!").Show());
                            }
                            else
                            {
                                // In time-out period but no time-in recorded
                                SystemSounds.Exclamation.Play();
                                // MessageDb.Text = "No time-in recorded. Cannot record time-out.";
                                RunOnUiThread(() => new Toast(ToastType.Error, "No Time-In", "You must record time-in before recording time-out.").Show());
                            }
                        }
                    }
                }

                LoadAttendanceData();
            }
            catch (Exception ex)
            {
                SystemSounds.Hand.Play();
                string errorMessage = $"Attendance error: {ex.Message}";
                if (ex.InnerException != null)
                {
                    errorMessage += $"\nInner error: {ex.InnerException.Message}";
                }
                RunOnUiThread(() => MessageBox.Show(errorMessage, "Attendance Error", MessageBoxButtons.OK, MessageBoxIcon.Error));
                Console.WriteLine($"Attendance error details: {ex}");
            }
            finally
            {
                dbConn.CloseConnection();
            }
        }

        // Helper function to format time string from 24-hour to 12-hour format
        private string FormatTimeTo12Hour(string time24)
        {
            if (TimeSpan.TryParse(time24, out TimeSpan timeSpan))
            {
                DateTime dt = DateTime.Today.Add(timeSpan);
                return dt.ToString("hh:mm:ss tt");
            }
            return time24;
        }

        private async void Attendance_Load(object sender, EventArgs e)
        {
            LoadTemplatesFromDatabase();
            IsDbVerifying = true;
            LoadAttendanceData(); // 👈 Load table on form load
            timer1.Start();
            lblDate.Text = DateTime.Now.ToString("dddd, MMMM dd, yyyy");
            AutoDetectDeviceConnection();
            isDeviceConnected = IsDeviceConnected();
            timer2.Start();
            // Removed timer3 - no more continuous API fetching
            timer4.Interval = 100000; // Slow down auto refresh to avoid blocking UI
            timer4.Start(); // Start automatic attendance data refresh timer

            // Set initial status without API call
            RunOnUiThread(() => MessageDb.Text = "Ready. Click Refresh to check session status.");

            if (isDeviceConnected)
            {
                StartCapture();
            }
            else
            {
                RunOnUiThread(() => MessageDb.Text = "Device not detected.");
            }
        }

        private async Task UpdateSessionStatus()
        {
            try
            {
                RunOnUiThread(() => MessageDb.Text = "Checking session status...");
                
                bool apiConnected = ApiConfig.TestApiConnection();
                DateTime now = DateTime.Now;
                string currentSession = await GetCurrentSessionNameAsync(now);
                bool isAttendanceAllowed = await IsAttendanceAllowedAsync(now);

                if (apiConnected)
                {
                    if (isAttendanceAllowed)
                    {
                        RunOnUiThread(() => MessageDb.Text = $"Place your fingerprint in Biometrics: {currentSession}");
                    }
                    else
                    {
                        RunOnUiThread(() => MessageDb.Text = $"Biometrics Attendance restricted: {currentSession}");
                    }
                }
                else
                {
                    RunOnUiThread(() => MessageDb.Text = "API not available. Check connection.");
                }
            }
            catch (Exception ex)
            {
                RunOnUiThread(() => MessageDb.Text = "Error checking session status.");
                Console.WriteLine($"Error updating session status: {ex.Message}");
            }
        }

    
        private void LoadAttendanceData()
        {
            try
            {
                if (isRefreshingAttendanceTable)
                {
                    return;
                }
                isRefreshingAttendanceTable = true;
                dbConn.OpenConnection();
                string query = @"
            SELECT 
                e.employee_name AS fullname, 
                a.time_in, 
                a.time_out, 
                a.attendance_status, 
                a.attendance_date, 
                a.session
            FROM 
                attendances a
            JOIN 
                employees e ON e.id = a.employee_id
            ORDER BY 
                a.attendance_date DESC";

                using (MySqlCommand cmd = new MySqlCommand(query, dbConn.Connection))
                using (MySqlDataAdapter adapter = new MySqlDataAdapter(cmd))
                {
                    DataTable dt = new DataTable();
                    adapter.Fill(dt);

                    RunOnUiThread(() =>
                    {
                    attendanceTable.AutoGenerateColumns = false;
                    attendanceTable.DataSource = dt;
                        attendanceTable.CellFormatting -= AttendanceTable_CellFormatting;
                    attendanceTable.CellFormatting += AttendanceTable_CellFormatting;
                    });
                }
            }
            catch (Exception ex)
            {
                RunOnUiThread(() => MessageBox.Show("Error loading attendance data: " + ex.Message));
            }
            finally
            {
                dbConn.CloseConnection();
                isRefreshingAttendanceTable = false;
            }
        }

        // Event handler for formatting time columns in 12-hour format for display
        private void AttendanceTable_CellFormatting(object sender, DataGridViewCellFormattingEventArgs e)
        {
            var dgv = sender as DataGridView;
            if (dgv.Columns[e.ColumnIndex].Name == "TimeIn" || dgv.Columns[e.ColumnIndex].Name == "TimeOut")
            {
                if (e.Value != null && e.Value is TimeSpan)
                {
                    DateTime dt = DateTime.Today.Add((TimeSpan)e.Value);
                    e.Value = dt.ToString("hh:mm:ss tt");
                    e.FormattingApplied = true;
                }
            }
        }


       

        private void timer1_Tick(object sender, EventArgs e)
        {
            lblTime.Text = DateTime.Now.ToString("hh:mm:ss tt"); // 12-hour with AM/PM
                                                                 // Or: DateTime.Now.ToString("HH:mm:ss"); // 24-hour format
        }

        
       

        // Auto-detect device connection and update UI/state
        private void AutoDetectDeviceConnection()
        {
            bool currentlyConnected = IsDeviceConnected();

            if (currentlyConnected && !isDeviceConnected)
            {
                // Device just connected
                isDeviceConnected = true;
                //device_status.Text = "Device connected.";
                StartCapture(); // Reinitialize capture
            }
            else if (!currentlyConnected && isDeviceConnected)
            {
                // Device just disconnected
                isDeviceConnected = false;
                //device_status.Text = "Device disconnected.";
                StopCapture(); // Optional: stop to avoid errors
            }
            // No need to update UI if status hasn't changed - keep it simple
        }

      

        // Add event handler for submitID button (optional attendance by employee ID)


        private async void submitID_Click_1(object sender, EventArgs e)
        {
            string empId = employeeIDoptional.Text.Trim();
            if (!string.IsNullOrEmpty(empId))
            {
                try
                {
                    await LogAttendanceAsync(empId); // Use the same attendance logic
                    new Toastform("Attendance recorded!").Show();
                }
                catch (Exception ex)
                {
                    System.Media.SoundPlayer player = new System.Media.SoundPlayer(@"C:\visual studio code\CFAR-Attendance\Sound\error.wav");
                    player.Play();
                    MessageBox.Show("Optional attendance error: " + ex.Message);
                }
            }
            else
            {
                MessageBox.Show("Please enter a valid Employee ID.");
            }
        }

        // Manual refresh button click handler
        private async void refreshBtn_Click(object sender, EventArgs e)
        {
            // Add immediate feedback that button was clicked
            RunOnUiThread(() => MessageDb.Text = "Refreshing session status...");
            await UpdateSessionStatus();
        }

        private void timer4_Tick(object sender, EventArgs e)
        {
            // Skip auto-refresh while user is typing or clicking on the optional input controls
            if (employeeIDoptional.Focused || submitID.Focused)
            {
                return;
            }
            if (isRefreshingAttendanceTable)
            {
                return;
            }
            LoadAttendanceData();
        }

        private void guna2Button1_Click(object sender, EventArgs e)
        {
        
        }

        private void attendanceTable_CellContentClick(object sender, DataGridViewCellEventArgs e)
        {
            foreach (DataGridViewRow row in attendanceTable.Rows)
            {
                if (row.Index % 2 == 0)
                    row.DefaultCellStyle.BackColor = Color.LightGreen;
                else
                    row.DefaultCellStyle.BackColor = Color.LightCoral;
            }
        }

        private void guna2HtmlLabel14_Click(object sender, EventArgs e)
        {

        }

        private void lblEmployeeID_TextChanged(object sender, EventArgs e)
        {

        }

        private void attendanceTable_AlternatingRowsDefaultCellStyleChanged(object sender, EventArgs e)
        {
            foreach (DataGridViewRow row in attendanceTable.Rows)
            {
                if (row.Index % 2 == 0)
                    row.DefaultCellStyle.BackColor = Color.LightGreen;
                else
                    row.DefaultCellStyle.BackColor = Color.LightCoral;
            }
        }
    }
}
