namespace HRIS_CheckWise_ATMS_
{
    partial class Registration
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
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(Registration));
            this.readerInfo = new System.Windows.Forms.TextBox();
            this.StatusTextLabel = new Guna.UI2.WinForms.Guna2HtmlLabel();
            this.employeeID = new System.Windows.Forms.Label();
            this.notifyIcon1 = new System.Windows.Forms.NotifyIcon(this.components);
            this.save = new Guna.UI2.WinForms.Guna2Button();
            this.MessageDb = new System.Windows.Forms.Label();
            this.guna2HtmlLabel1 = new Guna.UI2.WinForms.Guna2HtmlLabel();
            this.fImage = new Guna.UI2.WinForms.Guna2PictureBox();
            this.guna2GradientPanel1 = new Guna.UI2.WinForms.Guna2GradientPanel();
            this.enrollmentProgressBar = new Guna.UI2.WinForms.Guna2ProgressBar();
            this.progressLabel = new System.Windows.Forms.Label();
            ((System.ComponentModel.ISupportInitialize)(this.fImage)).BeginInit();
            this.guna2GradientPanel1.SuspendLayout();
            this.SuspendLayout();
            // 
            // readerInfo
            // 
            this.readerInfo.BackColor = System.Drawing.Color.Honeydew;
            this.readerInfo.Location = new System.Drawing.Point(95, 58);
            this.readerInfo.Multiline = true;
            this.readerInfo.Name = "readerInfo";
            this.readerInfo.ReadOnly = true;
            this.readerInfo.ScrollBars = System.Windows.Forms.ScrollBars.Both;
            this.readerInfo.Size = new System.Drawing.Size(295, 56);
            this.readerInfo.TabIndex = 11;
            // 
            // StatusTextLabel
            // 
            this.StatusTextLabel.BackColor = System.Drawing.Color.Transparent;
            this.StatusTextLabel.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.StatusTextLabel.Location = new System.Drawing.Point(6, 27);
            this.StatusTextLabel.Name = "StatusTextLabel";
            this.StatusTextLabel.Size = new System.Drawing.Size(66, 15);
            this.StatusTextLabel.TabIndex = 12;
            this.StatusTextLabel.Text = "Employee ID:";
            // 
            // employeeID
            // 
            this.employeeID.AutoSize = true;
            this.employeeID.Location = new System.Drawing.Point(73, 28);
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
            // save
            // 
            this.save.Animated = true;
            this.save.AutoRoundedCorners = true;
            this.save.BorderRadius = 17;
            this.save.BorderThickness = 1;
            this.save.DisabledState.BorderColor = System.Drawing.Color.DarkGray;
            this.save.DisabledState.CustomBorderColor = System.Drawing.Color.DarkGray;
            this.save.DisabledState.FillColor = System.Drawing.Color.FromArgb(((int)(((byte)(169)))), ((int)(((byte)(169)))), ((int)(((byte)(169)))));
            this.save.DisabledState.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(141)))), ((int)(((byte)(141)))), ((int)(((byte)(141)))));
            this.save.FillColor = System.Drawing.Color.LightGreen;
            this.save.Font = new System.Drawing.Font("Segoe UI", 9F, System.Drawing.FontStyle.Bold);
            this.save.ForeColor = System.Drawing.Color.Black;
            this.save.Location = new System.Drawing.Point(95, 420);
            this.save.Name = "save";
            this.save.Size = new System.Drawing.Size(295, 37);
            this.save.TabIndex = 26;
            this.save.Text = "Save";
            this.save.Click += new System.EventHandler(this.save_Click_1);
            // 
            // MessageDb
            // 
            this.MessageDb.AutoSize = true;
            this.MessageDb.Location = new System.Drawing.Point(46, 9);
            this.MessageDb.Name = "MessageDb";
            this.MessageDb.Size = new System.Drawing.Size(59, 13);
            this.MessageDb.TabIndex = 28;
            this.MessageDb.Text = "Initialize.....";
            // 
            // guna2HtmlLabel1
            // 
            this.guna2HtmlLabel1.BackColor = System.Drawing.Color.Transparent;
            this.guna2HtmlLabel1.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.guna2HtmlLabel1.Location = new System.Drawing.Point(7, 8);
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
            this.fImage.FillColor = System.Drawing.Color.WhiteSmoke;
            this.fImage.ImageRotate = 0F;
            this.fImage.Location = new System.Drawing.Point(95, 139);
            this.fImage.Name = "fImage";
            this.fImage.Size = new System.Drawing.Size(295, 277);
            this.fImage.TabIndex = 22;
            this.fImage.TabStop = false;
            this.fImage.UseTransparentBackground = true;
            // 
            // guna2GradientPanel1
            // 
            this.guna2GradientPanel1.BackColor = System.Drawing.Color.Transparent;
            this.guna2GradientPanel1.BackgroundImage = ((System.Drawing.Image)(resources.GetObject("guna2GradientPanel1.BackgroundImage")));
            this.guna2GradientPanel1.BackgroundImageLayout = System.Windows.Forms.ImageLayout.Stretch;
            this.guna2GradientPanel1.Controls.Add(this.readerInfo);
            this.guna2GradientPanel1.Controls.Add(this.fImage);
            this.guna2GradientPanel1.Controls.Add(this.save);
            this.guna2GradientPanel1.Controls.Add(this.enrollmentProgressBar);
            this.guna2GradientPanel1.Controls.Add(this.progressLabel);
            this.guna2GradientPanel1.Location = new System.Drawing.Point(0, 49);
            this.guna2GradientPanel1.Name = "guna2GradientPanel1";
            this.guna2GradientPanel1.Size = new System.Drawing.Size(481, 474);
            this.guna2GradientPanel1.TabIndex = 29;
            this.guna2GradientPanel1.UseTransparentBackground = true;
            // 
            // enrollmentProgressBar
            // 
            this.enrollmentProgressBar.Location = new System.Drawing.Point(95, 119);
            this.enrollmentProgressBar.Name = "enrollmentProgressBar";
            this.enrollmentProgressBar.ProgressColor = System.Drawing.Color.FromArgb(((int)(((byte)(46)))), ((int)(((byte)(213)))), ((int)(((byte)(115)))));
            this.enrollmentProgressBar.ProgressColor2 = System.Drawing.Color.FromArgb(((int)(((byte)(46)))), ((int)(((byte)(213)))), ((int)(((byte)(115)))));
            this.enrollmentProgressBar.Size = new System.Drawing.Size(295, 15);
            this.enrollmentProgressBar.TabIndex = 30;
            this.enrollmentProgressBar.Text = "0/4";
            this.enrollmentProgressBar.TextRenderingHint = System.Drawing.Text.TextRenderingHint.SystemDefault;
            // 
            // progressLabel
            // 
            this.progressLabel.AutoSize = true;
            this.progressLabel.Font = new System.Drawing.Font("Microsoft Sans Serif", 8.25F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.progressLabel.Location = new System.Drawing.Point(95, 387);
            this.progressLabel.Name = "progressLabel";
            this.progressLabel.Size = new System.Drawing.Size(60, 13);
            this.progressLabel.TabIndex = 31;
            this.progressLabel.Text = "Progress:";
            // 
            // Registration
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.BackColor = System.Drawing.Color.Honeydew;
            this.ClientSize = new System.Drawing.Size(481, 525);
            this.Controls.Add(this.guna2GradientPanel1);
            this.Controls.Add(this.MessageDb);
            this.Controls.Add(this.employeeID);
            this.Controls.Add(this.guna2HtmlLabel1);
            this.Controls.Add(this.StatusTextLabel);
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedDialog;
            this.Icon = ((System.Drawing.Icon)(resources.GetObject("$this.Icon")));
            this.MaximizeBox = false;
            this.MinimizeBox = false;
            this.MinimumSize = new System.Drawing.Size(345, 489);
            this.Name = "Registration";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
            this.Text = "Registration";
            this.FormClosing += new System.Windows.Forms.FormClosingEventHandler(this.CheckWise_FormClosing_1);
            this.Load += new System.EventHandler(this.CheckWise_Load_1);
            ((System.ComponentModel.ISupportInitialize)(this.fImage)).EndInit();
            this.guna2GradientPanel1.ResumeLayout(false);
            this.guna2GradientPanel1.PerformLayout();
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion
        private System.Windows.Forms.TextBox readerInfo;
        private Guna.UI2.WinForms.Guna2HtmlLabel StatusTextLabel;
        private System.Windows.Forms.Label employeeID;
        private System.Windows.Forms.NotifyIcon notifyIcon1;
        private Guna.UI2.WinForms.Guna2PictureBox fImage;
        private Guna.UI2.WinForms.Guna2Button save;
        private System.Windows.Forms.Label MessageDb;
        private Guna.UI2.WinForms.Guna2HtmlLabel guna2HtmlLabel1;
        private Guna.UI2.WinForms.Guna2GradientPanel guna2GradientPanel1;
        private Guna.UI2.WinForms.Guna2ProgressBar enrollmentProgressBar;
        private System.Windows.Forms.Label progressLabel;
    }
}

