using System;
using System.Drawing;
using System.Windows.Forms;

namespace HRIS_CheckWise_ATMS_
{

//     // Success
// new Toast(ToastType.Success, "Congratulations!", "Your OS has been updated to the latest version.").Show();
// // Info
// new Toast(ToastType.Info, "Did you know?", "You can switch between artboards using ⌘ + T").Show();
// // Warning
// new Toast(ToastType.Warning, "Warning", "Your password strength is low.").Show();
// // Error
// new Toast(ToastType.Error, "Something went wrong!", "The program has turned off unexpectedly.").Show();
    public partial class Toast : Form
    {
        private Timer timer;

        public Toast(ToastType type, string title, string message, int duration = 3000)
        {
            InitializeComponent();

            // Set up form
            this.FormBorderStyle = FormBorderStyle.None;
            this.ShowInTaskbar = false;
            this.TopMost = true;
            this.StartPosition = FormStartPosition.Manual;
            this.Width = 400;
            this.Height = 70;
            this.Opacity = 0.95;

            // Panel for background color and rounded corners
            var panel = new Panel
            {
                Dock = DockStyle.Fill,
                BackColor = GetBackColor(type),
                Padding = new Padding(16),
            };
            this.Controls.Add(panel);

            // Title
            var titleLabel = new Label
            {
                Text = title,
                Font = new Font("Segoe UI", 11, FontStyle.Bold),
                ForeColor = GetTitleColor(type),
                Location = new Point(10, 10),
                AutoSize = true
            };
            panel.Controls.Add(titleLabel);

            // Message
            var messageLabel = new Label
            {
                Text = message,
                Font = new Font("Segoe UI", 9),
                ForeColor = Color.DimGray,
                Location = new Point(10, 32),
                AutoSize = true
            };
            panel.Controls.Add(messageLabel);

            // Close button
            var closeBtn = new Button
            {
                Text = "✕",
                FlatStyle = FlatStyle.Flat,
                BackColor = Color.Transparent,
                ForeColor = Color.Gray,
                Font = new Font("Segoe UI", 10, FontStyle.Bold),
                Size = new Size(32, 32),
                Location = new Point(this.Width - 40, 10),
                TabStop = false
            };
            closeBtn.FlatAppearance.BorderSize = 0;
            closeBtn.Click += (s, e) => this.Close();
            panel.Controls.Add(closeBtn);

            // Rounded corners
            this.Region = System.Drawing.Region.FromHrgn(
                NativeMethods.CreateRoundRectRgn(0, 0, this.Width, this.Height, 16, 16)
            );

            // Position bottom right
            var workingArea = Screen.PrimaryScreen.WorkingArea;
            this.Location = new Point(workingArea.Right - this.Width - 10, workingArea.Bottom - this.Height - 10);

            // Timer for auto-dismiss
            timer = new Timer();
            timer.Interval = duration;
            timer.Tick += (s, e) => { this.Close(); };
        }

        protected override void OnShown(EventArgs e)
        {
            base.OnShown(e);
            timer.Start();
        }

        // Helper: Get background color by type
        private Color GetBackColor(ToastType type)
        {
            switch (type)
            {
                case ToastType.Success: return Color.FromArgb(232, 248, 239);
                case ToastType.Info: return Color.FromArgb(237, 242, 255);
                case ToastType.Warning: return Color.FromArgb(255, 249, 230);
                case ToastType.Error: return Color.FromArgb(255, 235, 238);
                default: return Color.White;
            }
        }

        // Helper: Get title color by type
        private Color GetTitleColor(ToastType type)
        {
            switch (type)
            {
                case ToastType.Success: return Color.FromArgb(34, 139, 34);
                case ToastType.Info: return Color.FromArgb(30, 144, 255);
                case ToastType.Warning: return Color.FromArgb(255, 165, 0);
                case ToastType.Error: return Color.FromArgb(220, 53, 69);
                default: return Color.Black;
            }
        }

        // Native for rounded corners
        private static class NativeMethods
        {
            [System.Runtime.InteropServices.DllImport("gdi32.dll", SetLastError = true)]
            public static extern IntPtr CreateRoundRectRgn(
                int nLeftRect, int nTopRect, int nRightRect, int nBottomRect, int nWidthEllipse, int nHeightEllipse);
        }
    }
}

public enum ToastType
{
    Success,
    Info,
    Warning,
    Error
}
