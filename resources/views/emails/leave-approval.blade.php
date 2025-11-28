<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leave Request Notification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #4F46E5;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            background-color: #f9fafb;
            padding: 30px;
            border: 1px solid #e5e7eb;
        }
        .info-box {
            background-color: white;
            padding: 15px;
            margin: 15px 0;
            border-left: 4px solid #4F46E5;
            border-radius: 4px;
        }
        .info-row {
            margin: 10px 0;
        }
        .label {
            font-weight: bold;
            color: #4F46E5;
            display: inline-block;
            width: 150px;
        }
        .status {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            margin-top: 10px;
        }
        .status-approved {
            background-color: #10B981;
            color: white;
        }
        .status-pending {
            background-color: #F59E0B;
            color: white;
        }
        .status-rejected {
            background-color: #EF4444;
            color: white;
        }
        .footer {
            background-color: #6B7280;
            color: white;
            padding: 15px;
            text-align: center;
            border-radius: 0 0 5px 5px;
            font-size: 12px;
        }
        .comments {
            background-color: #FEF3C7;
            padding: 15px;
            margin: 15px 0;
            border-radius: 4px;
            border-left: 4px solid #F59E0B;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>CFARBEMCO</h1>
        <h2>Leave Request Notification</h2>
    </div>

    <div class="content">
        <p>Dear {{ $employee->employee_name }},</p>

        <p>This is to inform you regarding your leave request. Below are the details:</p>

        <div class="info-box">
            <div class="info-row">
                <span class="label">Employee ID:</span>
                <span>{{ $employee->employeeid }}</span>
            </div>
            <div class="info-row">
                <span class="label">Department:</span>
                <span>{{ $employee->department }}</span>
            </div>
            <div class="info-row">
                <span class="label">Position:</span>
                <span>{{ $employee->position }}</span>
            </div>
        </div>

        <div class="info-box">
            <div class="info-row">
                <span class="label">Leave Type:</span>
                <span>{{ $leave->leave_type }}</span>
            </div>
            <div class="info-row">
                <span class="label">Start Date:</span>
                <span>{{ \Carbon\Carbon::parse($leave->leave_start_date)->format('F d, Y') }}</span>
            </div>
            <div class="info-row">
                <span class="label">End Date:</span>
                <span>{{ \Carbon\Carbon::parse($leave->leave_end_date)->format('F d, Y') }}</span>
            </div>
            <div class="info-row">
                <span class="label">Total Days:</span>
                <span>{{ $leave->leave_days }} day(s)</span>
            </div>
            <div class="info-row">
                <span class="label">Date Reported:</span>
                <span>{{ \Carbon\Carbon::parse($leave->leave_date_reported)->format('F d, Y') }}</span>
            </div>
            @if($leave->leave_date_approved)
            <div class="info-row">
                <span class="label">Date Approved:</span>
                <span>{{ \Carbon\Carbon::parse($leave->leave_date_approved)->format('F d, Y') }}</span>
            </div>
            @endif
        </div>

        <div class="info-box">
            <div class="info-row">
                <span class="label">Reason:</span>
                <span>{{ $leave->leave_reason }}</span>
            </div>
        </div>

        @if($leave->supervisor_status)
        <div class="info-box">
            <div class="info-row">
                <span class="label">Supervisor Status:</span>
                <span class="status status-{{ strtolower($leave->supervisor_status) }}">
                    {{ ucfirst($leave->supervisor_status) }}
                </span>
            </div>
            @if($supervisorApprover)
            <div class="info-row">
                <span class="label">Supervisor:</span>
                <span>{{ $supervisorApprover->fullname }}</span>
            </div>
            @endif
            @if($leave->supervisor_comments)
            <div class="comments">
                <strong>Supervisor Comments:</strong><br>
                {{ $leave->supervisor_comments }}
            </div>
            @endif
        </div>
        @endif

        @if($leave->hr_status)
        <div class="info-box">
            <div class="info-row">
                <span class="label">HR Status:</span>
                <span class="status status-{{ strtolower($leave->hr_status) }}">
                    {{ ucfirst($leave->hr_status) }}
                </span>
            </div>
            @if($hrApprover)
            <div class="info-row">
                <span class="label">HR Personnel:</span>
                <span>{{ $hrApprover->fullname }}</span>
            </div>
            @endif
            @if($leave->hr_comments)
            <div class="comments">
                <strong>HR Comments:</strong><br>
                {{ $leave->hr_comments }}
            </div>
            @endif
        </div>
        @endif

        <div class="info-box">
            <div class="info-row">
                <span class="label">Current Status:</span>
                <span class="status status-{{ strtolower(str_replace(' ', '-', $leave->leave_status)) }}">
                    {{ $leave->leave_status }}
                </span>
            </div>
        </div>

        @if($leave->leave_comments)
        <div class="comments">
            <strong>Additional Comments:</strong><br>
            {{ $leave->leave_comments }}
        </div>
        @endif

        <p>Thank you for your attention to this matter.</p>

        <p>Best regards,<br>
        <strong>CFARBEMCO HR Department</strong></p>
    </div>

    <div class="footer">
        <p>This is an automated email. Please do not reply to this message.</p>
        <p>&copy; {{ date('Y') }} CFARBEMCO. All rights reserved.</p>
    </div>
</body>
</html>

