<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resume to Work Document</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 20mm;
        }
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            color: #333;
            padding: 0;
            line-height: 1.6;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 15px;
            border-bottom: 2px solid #4F46E5;
        }
        .header h1 {
            color: #4F46E5;
            font-size: 24px;
            margin-bottom: 5px;
        }
        .header h2 {
            color: #666;
            font-size: 18px;
            font-weight: normal;
        }
        .content {
            margin: 20px 0;
        }
        .info-section {
            margin-bottom: 20px;
        }
        .info-row {
            margin: 8px 0;
            display: flex;
        }
        .label {
            font-weight: bold;
            width: 180px;
            color: #4F46E5;
        }
        .value {
            flex: 1;
        }
        .return-date-box {
            background-color: #DBEAFE;
            border: 2px solid #3B82F6;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        .return-date-box h3 {
            color: #1E40AF;
            font-size: 16px;
            margin-bottom: 10px;
        }
        .return-date-box .date {
            color: #1E3A8A;
            font-size: 28px;
            font-weight: bold;
        }
        .comments-box {
            background-color: #FEF3C7;
            border-left: 4px solid #F59E0B;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 10px;
            color: #666;
        }
        .status-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 11px;
        }
        .status-processed {
            background-color: #10B981;
            color: white;
        }
        .status-pending {
            background-color: #F59E0B;
            color: white;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ $companyName }}</h1>
        <h2>Resume to Work Notification</h2>
    </div>

    <div class="content">
        <div class="info-section">
            <div class="info-row">
                <span class="label">Employee Name:</span>
                <span class="value">{{ $employee->employee_name }}</span>
            </div>
            <div class="info-row">
                <span class="label">Employee ID:</span>
                <span class="value">{{ $employee->employeeid }}</span>
            </div>
            <div class="info-row">
                <span class="label">Department:</span>
                <span class="value">{{ $employee->department }}</span>
            </div>
            <div class="info-row">
                <span class="label">Position:</span>
                <span class="value">{{ $employee->position }}</span>
            </div>
        </div>

        <div class="return-date-box">
            <h3>Return to Work Date</h3>
            <div class="date">{{ \Carbon\Carbon::parse($resumeToWork->return_date)->format('F d, Y') }}</div>
        </div>

        @if($resumeToWork->previous_absence_reference)
        <div class="info-section">
            <div class="info-row">
                <span class="label">Previous Absence Reference:</span>
                <span class="value">{{ $resumeToWork->previous_absence_reference }}</span>
            </div>
        </div>
        @endif

        @if($resumeToWork->comments)
        <div class="comments-box">
            <strong>Comments:</strong><br>
            {{ $resumeToWork->comments }}
        </div>
        @endif

        <div class="info-section">
            <div class="info-row">
                <span class="label">Status:</span>
                <span class="value">
                    <span class="status-badge status-{{ strtolower($resumeToWork->status) }}">
                        {{ ucfirst($resumeToWork->status) }}
                    </span>
                </span>
            </div>
            @if($processedBy)
            <div class="info-row">
                <span class="label">Processed By:</span>
                <span class="value">{{ $processedBy->fullname ?? $processedBy->name }}</span>
            </div>
            @endif
            @if($resumeToWork->processed_at)
            <div class="info-row">
                <span class="label">Processed At:</span>
                <span class="value">{{ \Carbon\Carbon::parse($resumeToWork->processed_at)->format('F d, Y h:i A') }}</span>
            </div>
            @endif
        </div>
    </div>

    <div class="footer">
        <p>This document was generated on {{ date('F d, Y h:i A') }}</p>
        <p>&copy; {{ date('Y') }} {{ $companyName }}. All rights reserved.</p>
    </div>
</body>
</html>

