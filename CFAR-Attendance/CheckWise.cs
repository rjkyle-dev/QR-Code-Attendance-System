using DPFP;
using DPFP.Capture;
using DPFP.Processing;
using DPFP.Verification;
using HRIS_CheckWise_ATMS_;
using MySql.Data.MySqlClient;
using System;
using System.Collections.Generic;
using System.Data;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Media;
using System.Web;
using System.Windows.Forms;
using static Guna.UI2.Native.WinApi;
using WebSocketSharp;
using Newtonsoft.Json;


namespace HRIS_CheckWise_ATMS_
{
    public partial class CheckWise : Form, DPFP.Capture.EventHandler
    {
        private db_connection dbConn;
        private NotifyIcon trayIcon;
        private ContextMenuStrip trayMenu;
        protected Capture Capturer;
        protected Enrollment Enroller;
        protected Verification Verificator;
        protected Dictionary<string, Template> LocalTemplates = new Dictionary<string, Template>();

        protected bool IsEnrolling = false;
        
        // Database-related variables
        private bool IsDbEnrolling = false;
        private Template CurrentDbTemplate;
        private Bitmap CurrentFingerprintImage;

        private WebSocket ws;
        private string pendingEmployeeId = null;

        public CheckWise()
        {
            InitializeComponent();
            Init();
            dbConn = new db_connection();
            InitWebSocket(); // Add this line to initialize WebSocket

        }

        protected virtual void Init()
        {
            try
            {
                trayMenu = new ContextMenuStrip();
                trayMenu.Items.Add("Show", null, (s, e) => ShowApp());
                trayMenu.Items.Add("Exit", null, (s, e) => ExitApp());

                trayIcon = new NotifyIcon();
                trayIcon.Text = "CheckWise Fingerprint System";
                trayIcon.Icon = SystemIcons.Application; // Or load your custom icon
                trayIcon.ContextMenuStrip = trayMenu;
                trayIcon.Visible = false;
                trayIcon.DoubleClick += (s, e) => ShowApp();


                Capturer = new Capture();
                if (Capturer != null)
                {
                    Capturer.EventHandler = this;
                    Verificator = new Verification();
                    Enroller = new Enrollment();
                   
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

        protected void PlaySuccessSound()
        {
            try
            {
                SoundPlayer player = new SoundPlayer(@"C:\C#\HRIS-CheckWise(ATMS)\Sound\success.wav"); // adjust path if needed
                player.Play();
            }
            catch (Exception ex)
            {
                MakeReport("Error playing sound: " + ex.Message);
            }
        }

        protected void PlayErrorSound()
        {
            try
            {
                SoundPlayer player = new SoundPlayer(@"C:\C#\HRIS-CheckWise(ATMS)\Sound\error.wav"); // adjust path if needed
                player.Play();
            }
            catch (Exception ex)
            {
                MakeReport("Error playing sound: " + ex.Message);
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

        // Process captured sample
        protected virtual void Process(Sample sample)
        {
            DrawPicture(ConvertSampleToBitmap(sample));

            if (IsDbEnrolling)
            {
                ProcessDbEnrollment(sample);
            }
            // Remove verification logic
        }

        // Restore the ProcessDbEnrollment method
        private void ProcessDbEnrollment(Sample sample)
        {
            FeatureSet features = ExtractFeatures(sample, DataPurpose.Enrollment);
            if (features != null)
            {
                Enroller.AddFeatures(features);
                MessageDb.Text = "Feature added to enrollment.";

                if (Enroller.TemplateStatus == Enrollment.Status.Ready)
                {
                    CurrentDbTemplate = Enroller.Template;
                    CurrentFingerprintImage = ConvertSampleToBitmap(sample);
                    fImage.Image = new Bitmap(CurrentFingerprintImage, fImage.Size);

                    MessageDb.Text = "Fingerprint captured. Click 'Save' to store in database.";
                    PlaySuccessSound();

                    // Send fingerprint data to React via WebSocket
                    SendFingerprintDataToReact(pendingEmployeeId, CurrentFingerprintImage, DateTime.Now);
                    // Do NOT clear Enroller or set IsDbEnrolling = false yet; wait for Save
                }
                else if (Enroller.TemplateStatus == Enrollment.Status.Failed)
                {
                    MessageDb.Text = "Failed to enroll, try again.";
                    PlayErrorSound();
                    Enroller.Clear();
                    IsDbEnrolling = false;
                }
            }
        }


        protected FeatureSet ExtractFeatures(Sample Sample, DPFP.Processing.DataPurpose Purpose)
        {
            DPFP.Processing.FeatureExtraction Extractor = new DPFP.Processing.FeatureExtraction();
            DPFP.Capture.CaptureFeedback feedback = DPFP.Capture.CaptureFeedback.None;
            FeatureSet features = new DPFP.FeatureSet();
            // Extract the features from the sample
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
            if (fImage.InvokeRequired)
            {
                fImage.Invoke(new Action(() =>
                {
                    fImage.Image = new Bitmap(bitmap, fImage.Size);
                }));
            }
            else
            {
                fImage.Image = new Bitmap(bitmap, fImage.Size);
            }
        }

        protected void SetStatus(string message)
        {
            if (MessageDb.InvokeRequired)
            {
                MessageDb.Invoke(new Action(() =>
                {
                    MessageDb.Text = message;
                }));
            }
            else
            {
                MessageDb.Text = message;
            }
        }

        protected void MakeReport(string message)
        {
            if (readerInfo.InvokeRequired)
            {
                readerInfo.Invoke(new Action(() =>
                {
                    readerInfo.AppendText(message + "\r\n");
                }));
            }
            else
            {
                readerInfo.AppendText(message + "\r\n");
            }
        }

        // DPFP Event Handlers
        public void OnReaderConnect(object Capture, string ReaderSerialNumber)
        {
            SetStatus("Reader Connected.");
        }

        public void OnReaderDisconnect(object Capture, string ReaderSerialNumber)
        {
            SetStatus("Reader Disconnected.");
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
            MakeReport("Fingerprint captured.");
            Process(Sample);
        }

      
        // Verify button click
        

      

        private void OnBtn_Click(object sender, EventArgs e)
        {
            if (Capturer == null)
            {
                Capturer = new Capture();
                if (Capturer != null)
                {
                    Capturer.EventHandler = this;
                }
                else
                {
                    MakeReport("Cannot initialize capture operation.");
                    return;
                }
            }

            try
            {
                Capturer.StartCapture();
                SetStatus("Device ON — waiting for reader...");
                MakeReport("Capture started.");
            }
            catch (Exception ex)
            {
                MakeReport("Failed to start capture: " + ex.Message);
            }
        }

        private void OffBtn_Click(object sender, EventArgs e)
        {
            if (Capturer != null)
            {
                try
                {
                    Capturer.StopCapture();
                    SetStatus("Device OFF");
                    MakeReport("Capture stopped.");
                }
                catch (Exception ex)
                {
                    MakeReport("Failed to stop capture: " + ex.Message);
                }
            }
        }

       

        private void CheckWise_Load(object sender, EventArgs e)
        {

        }

        private byte[] TemplateToByteArray(Template template)
        {
            using (var stream = new System.IO.MemoryStream())
            {
                template.Serialize(stream);
                return stream.ToArray();
            }
        }

        // Restore the ImageToByteArray helper method
        private byte[] ImageToByteArray(Image image)
        {
            using (MemoryStream stream = new MemoryStream())
            {
                image.Save(stream, System.Drawing.Imaging.ImageFormat.Png);
                return stream.ToArray();
            }
        }


        private void verifyBtn_Click(object sender, EventArgs e)
        {
            if (LocalTemplates.Count == 0)
            {
                MessageBox.Show("No enrolled fingerprints yet.", "Verify Error", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            MakeReport("Ready to verify. Please place finger.");
            IsEnrolling = false;
        }

        private void CheckWise_FormClosing_1(object sender, FormClosingEventArgs e)
        {
            StopCapture();
        }

        private void guna2Button2_Click(object sender, EventArgs e)
        {
            this.Hide();
            trayIcon.Visible = true;
        }

        private void guna2Button5_Click(object sender, EventArgs e)
        {
            Application.Restart();
        }

        private void ShowApp()
        {
            this.Show();
            this.WindowState = FormWindowState.Normal;
            trayIcon.Visible = false;
        }

        private void ExitApp()
        {
            StopCapture();
            trayIcon.Visible = false;
            Application.Exit();
        }

        // Database functionality methods

      

      

        private void InitWebSocket()
        {
            ws = new WebSocket("ws://localhost:8080");
            ws.OnMessage += (sender, e) =>
            {
                try
                {
                    dynamic data = JsonConvert.DeserializeObject(e.Data);
                    if (data.type == "start_registration" && data.employeeid != null)
                    {
                        string employeeId = data.employeeid;
                        // Set pending employeeId and trigger registration
                        BeginFingerprintRegistration(employeeId);
                    }
                }
                catch { /* handle error */ }
            };
            ws.Connect();
        }

        // This method triggers the enrollment/registration for the given employeeId
        private void BeginFingerprintRegistration(string employeeId)
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
                // Optionally clear UI
                MessageDb.Text = "";
                fImage.Image = null;
                // Display the employee ID on the label
                employeeID.Text = employeeId;
                // Now start new registration
                pendingEmployeeId = employeeId;
                MessageDb.Text = $"Starting fingerprint registration for Employee ID: {employeeId}";
                IsDbEnrolling = true;
                // Optionally, focus the form or bring to front
                this.Show();
                this.WindowState = FormWindowState.Normal;
                // Start capture if not already started
                if (Capturer != null)
                {
                    try { Capturer.StartCapture(); } catch { /* ignore */ }
                }
            });
        }

        // Helper to send fingerprint data to React via WebSocket
        private void SendFingerprintDataToReact(string employeeId, Bitmap fingerprintImage, DateTime capturedAt)
        {
            if (ws != null && ws.IsAlive && employeeId != null && fingerprintImage != null)
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
                    employeeid = employeeId,
                    fingerprint_image = fingerprintImageBase64,
                    fingerprint_captured_at = capturedAt.ToString("o")
                };
                string json = JsonConvert.SerializeObject(msg);
                ws.Send(json);
            }
        }

       

       

       

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
                }
                else
                {
                    MessageDb.Text = "Employee not found in database!";
                    PlayErrorSound();
                }
            }
            catch (Exception ex)
            {
                MessageDb.Text = "Error saving fingerprint: " + ex.Message;
                PlayErrorSound();
            }
            finally
            {
                dbConn.CloseConnection();
            }
        }

        private void startcapturefingerprint_Click_1(object sender, EventArgs e)
        {

        }

        private void registration_Click(object sender, EventArgs e)
        {
            // Stop capture and release device before opening Attendance
            StopCapture();
            Attendance attendance = new Attendance();
            attendance.Show();
            this.Hide(); // Optionally hide the registration form to prevent multiple capture instances
        }
    }
}
