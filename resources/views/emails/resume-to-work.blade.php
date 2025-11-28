<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resume to Work Notification</title>
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
        .status-processed {
            background-color: #10B981;
            color: white;
        }
        .status-pending {
            background-color: #F59E0B;
            color: white;
        }
        .return-date {
            background-color: #DBEAFE;
            padding: 15px;
            margin: 15px 0;
            border-radius: 4px;
            border-left: 4px solid #3B82F6;
            text-align: center;
        }
        .return-date h3 {
            margin: 0;
            color: #1E40AF;
            font-size: 18px;
        }
        .return-date p {
            margin: 5px 0 0 0;
            color: #1E3A8A;
            font-size: 24px;
            font-weight: bold;
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
        <h2>Resume to Work Notification</h2>
    </div>

    <div class="content">
        <p>Dear {{ $employee->employee_name }},</p>

        <p>This is to inform you regarding your return to work schedule. Please see the details below:</p>

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

        <div class="return-date">
            <h3>Your Return to Work Date</h3>
            <p>{{ \Carbon\Carbon::parse($resumeToWork->return_date)->format('F d, Y') }}</p>
        </div>

        @if($resumeToWork->previous_absence_reference)
        <div class="info-box">
            <div class="info-row">
                <span class="label">Previous Absence Reference:</span>
                <span>{{ $resumeToWork->previous_absence_reference }}</span>
            </div>
        </div>
        @endif

        @if($resumeToWork->comments)
        <div class="comments">
            <strong>Comments:</strong><br>
            {{ $resumeToWork->comments }}
        </div>
        @endif

        <div class="info-box">
            <div class="info-row">
                <span class="label">Status:</span>
                <span class="status status-{{ strtolower($resumeToWork->status) }}">
                    {{ ucfirst($resumeToWork->status) }}
                </span>
            </div>
            @if($processedBy)
            <div class="info-row">
                <span class="label">Processed By:</span>
                <span>{{ $processedBy->fullname ?? $processedBy->name }}</span>
            </div>
            @endif
            @if($resumeToWork->processed_at)
            <div class="info-row">
                <span class="label">Processed At:</span>
                <span>{{ \Carbon\Carbon::parse($resumeToWork->processed_at)->format('F d, Y h:i A') }}</span>
            </div>
            @endif
        </div>

        <p>Please ensure you are ready to resume work on the specified date. If you have any questions or concerns, please contact the HR Department.</p>

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

