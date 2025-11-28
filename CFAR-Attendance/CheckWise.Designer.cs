namespace HRIS_CheckWise_ATMS_
{
    partial class CheckWise
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.components = new System.ComponentModel.Container();
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(CheckWise));
            this.readerInfo = new System.Windows.Forms.TextBox();
            this.StatusTextLabel = new Guna.UI2.WinForms.Guna2HtmlLabel();
            this.employeeID = new System.Windows.Forms.Label();
            this.notifyIcon1 = new System.Windows.Forms.NotifyIcon(this.components);
            this.registration = new Guna.UI2.WinForms.Guna2Button();
            this.save = new Guna.UI2.WinForms.Guna2Button();
            this.MessageDb = new System.Windows.Forms.Label();
            this.guna2HtmlLabel1 = new Guna.UI2.WinForms.Guna2HtmlLabel();
            this.fImage = new Guna.UI2.WinForms.Guna2PictureBox();
            ((System.ComponentModel.ISupportInitialize)(this.fImage)).BeginInit();
            this.SuspendLayout();
            // 
            // readerInfo
            // 
            this.readerInfo.BackColor = System.Drawing.Color.Honeydew;
            this.readerInfo.Location = new System.Drawing.Point(69, 61);
            this.readerInfo.Multiline = true;
            this.readerInfo.Name = "readerInfo";
            this.readerInfo.ReadOnly = true;
            this.readerInfo.ScrollBars = System.Windows.Forms.ScrollBars.Both;
            this.readerInfo.Size = new System.Drawing.Size(245, 56);
            this.readerInfo.TabIndex = 11;
            // 
            // StatusTextLabel
            // 
            this.StatusTextLabel.BackColor = System.Drawing.Color.Transparent;
            this.StatusTextLabel.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.StatusTextLabel.Location = new System.Drawing.Point(12, 28);
            this.StatusTextLabel.Name = "StatusTextLabel";
            this.StatusTextLabel.Size = new System.Drawing.Size(66, 15);
            this.StatusTextLabel.TabIndex = 12;
            this.StatusTextLabel.Text = "Employee ID:";
            // 
            // employeeID
            // 
            this.employeeID.AutoSize = true;
            this.employeeID.Location = new System.Drawing.Point(51, 29);
            this.employeeID.Name = "employeeID";
            this.employeeID.Size = new System.Drawing.Size(59, 13);
            this.employeeID.TabIndex = 13;
            this.employeeID.Text = "Initialize.....";
            // 
            // notifyIcon1
            // 
            this.notifyIcon1.Icon = ((System.Drawing.Icon)(resources.GetObject("notifyIcon1.Icon")));
            this.notifyIcon1.Text = " CheckWise Fingerprint System";
            // 
            // registration
            // 
            this.registration.BorderRadius = 10;
            this.registration.BorderThickness = 1;
            this.registration.DisabledState.BorderColor = System.Drawing.Color.DarkGray;
            this.registration.DisabledState.CustomBorderColor = System.Drawing.Color.DarkGray;
            this.registration.DisabledState.FillColor = System.Drawing.Color.FromArgb(((int)(((byte)(169)))), ((int)(((byte)(169)))), ((int)(((byte)(169)))));
            this.registration.DisabledState.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(141)))), ((int)(((byte)(141)))), ((int)(((byte)(141)))));
            this.registration.FillColor = System.Drawing.Color.LightGreen;
            this.registration.Font = new System.Drawing.Font("Segoe UI", 9F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.registration.ForeColor = System.Drawing.Color.Black;
            this.registration.Location = new System.Drawing.Point(217, 427);
            this.registration.Name = "registration";
            this.registration.Size = new System.Drawing.Size(97, 25);
            this.registration.TabIndex = 20;
            this.registration.Text = "Attendance";
            this.registration.Click += new System.EventHandler(this.registration_Click);
            // 
            // save
            // 
            this.save.BorderRadius = 10;
            this.save.BorderThickness = 1;
            this.save.DisabledState.BorderColor = System.Drawing.Color.DarkGray;
            this.save.DisabledState.CustomBorderColor = System.Drawing.Color.DarkGray;
            this.save.DisabledState.FillColor = System.Drawing.Color.FromArgb(((int)(((byte)(169)))), ((int)(((byte)(169)))), ((int)(((byte)(169)))));
            this.save.DisabledState.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(141)))), ((int)(((byte)(141)))), ((int)(((byte)(141)))));
            this.save.FillColor = System.Drawing.Color.LightGreen;
            this.save.Font = new System.Drawing.Font("Segoe UI", 9F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.save.ForeColor = System.Drawing.Color.Black;
            this.save.Location = new System.Drawing.Point(69, 373);
            this.save.Name = "save";
            this.save.Size = new System.Drawing.Size(245, 39);
            this.save.TabIndex = 26;
            this.save.Text = "Save";
            this.save.Click += new System.EventHandler(this.save_Click_1);
            // 
            // MessageDb
            // 
            this.MessageDb.AutoSize = true;
            this.MessageDb.Location = new System.Drawing.Point(51, 9);
            this.MessageDb.Name = "MessageDb";
            this.MessageDb.Size = new System.Drawing.Size(59, 13);
            this.MessageDb.TabIndex = 28;
            this.MessageDb.Text = "Initialize.....";
            // 
            // guna2HtmlLabel1
            // 
            this.guna2HtmlLabel1.BackColor = System.Drawing.Color.Transparent;
            this.guna2HtmlLabel1.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.guna2HtmlLabel1.Location = new System.Drawing.Point(12, 8);
            this.guna2HtmlLabel1.Name = "guna2HtmlLabel1";
            this.guna2HtmlLabel1.Size = new System.Drawing.Size(41, 15);
            this.guna2HtmlLabel1.TabIndex = 27;
            this.guna2HtmlLabel1.Text = "Reader:";
            // 
            // fImage
            // 
            this.fImage.BackColor = System.Drawing.Color.Transparent;
            this.fImage.BorderRadius = 5;
            this.fImage.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.fImage.FillColor = System.Drawing.Color.Transparent;
            this.fImage.ImageRotate = 0F;
            this.fImage.Location = new System.Drawing.Point(69, 141);
            this.fImage.Name = "fImage";
            this.fImage.Size = new System.Drawing.Size(245, 226);
            this.fImage.TabIndex = 22;
            this.fImage.TabStop = false;
            this.fImage.UseTransparentBackground = true;
            // 
            // CheckWise
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.BackColor = System.Drawing.Color.Honeydew;
            this.ClientSize = new System.Drawing.Size(390, 472);
            this.Controls.Add(this.MessageDb);
            this.Controls.Add(this.guna2HtmlLabel1);
            this.Controls.Add(this.save);
            this.Controls.Add(this.fImage);
            this.Controls.Add(this.registration);
            this.Controls.Add(this.employeeID);
            this.Controls.Add(this.StatusTextLabel);
            this.Controls.Add(this.readerInfo);
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedDialog;
            this.Icon = ((System.Drawing.Icon)(resources.GetObject("$this.Icon")));
            this.MaximizeBox = false;
            this.MinimizeBox = false;
            this.MinimumSize = new System.Drawing.Size(345, 489);
            this.Name = "CheckWise";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
            this.Text = "Registration";
            this.FormClosing += new System.Windows.Forms.FormClosingEventHandler(this.CheckWise_FormClosing_1);
            ((System.ComponentModel.ISupportInitialize)(this.fImage)).EndInit();
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion
        private System.Windows.Forms.TextBox readerInfo;
        private Guna.UI2.WinForms.Guna2HtmlLabel StatusTextLabel;
        private System.Windows.Forms.Label employeeID;
        private System.Windows.Forms.NotifyIcon notifyIcon1;
        private Guna.UI2.WinForms.Guna2Button registration;
        private Guna.UI2.WinForms.Guna2PictureBox fImage;
        private Guna.UI2.WinForms.Guna2Button save;
        private System.Windows.Forms.Label MessageDb;
        private Guna.UI2.WinForms.Guna2HtmlLabel guna2HtmlLabel1;
    }
}

