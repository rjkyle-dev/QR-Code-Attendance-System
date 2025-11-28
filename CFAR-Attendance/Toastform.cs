using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace HRIS_CheckWise_ATMS_
{
    public partial class Toastform : Form
    {
        private Timer timer;

        public Toastform(string message, int duration = 2000)
        {
            InitializeComponent();
            this.FormBorderStyle = FormBorderStyle.None;
            this.ShowInTaskbar = false;
            this.StartPosition = FormStartPosition.Manual;
            this.TopMost = true;
            this.BackColor = System.Drawing.Color.Black;
            this.Opacity = 0.85;
            this.Width = 300;
            this.Height = 50;

            Label label = new Label();
            label.Text = message;
            label.ForeColor = System.Drawing.Color.White;
            label.Dock = DockStyle.Fill;
            label.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            label.Font = new System.Drawing.Font("Segoe UI", 12);
            this.Controls.Add(label);

            // Position bottom right
            var workingArea = Screen.PrimaryScreen.WorkingArea;
            this.Location = new System.Drawing.Point(workingArea.Right - this.Width - 10, workingArea.Bottom - this.Height - 10);

            timer = new Timer();
            timer.Interval = duration;
            timer.Tick += (s, e) => { this.Close(); };
        }

        protected override void OnShown(EventArgs e)
        {
            base.OnShown(e);
            timer.Start();
        }
    }
}
