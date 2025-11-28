<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leave Request Document</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 14mm 12mm 14mm 12mm; /* top right bottom left */
        }
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: Arial, sans-serif;
            font-size: 11px;
            color: #333;
            padding: 0;
            line-height: 1.6;
        }
        .header {
            margin-bottom: 16px;
            padding-bottom: 8px;
            border-bottom: 2px solid #333;
            overflow: hidden;
        }
        .header-left {
            float: left;
            width: 68%;
        }
        .header-right {
            float: right;
            width: 30%;
            text-align: right;
            font-size: 9px;
            color: #888;
            padding-top: 6px;
        }
        .logo {
            width: 44px;
            height: 44px;
            object-fit: contain;
        }
        .company-info {
            display: flex;
            flex-direction: column;
        }
        .company-name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 3px;
        }
        .document-title {
            font-size: 12px;
            color: #666;
        }
        .section {
            margin-bottom: 12px;
            page-break-inside: avoid;
        }
        .section-title {
            font-size: 12px;
            font-weight: bold;
            margin-bottom: 8px;
            padding-bottom: 4px;
            border-bottom: 1px solid #ccc;
        }
        /* Use block layout instead of CSS tables for dompdf stability */
        .info-grid {
            display: block;
            width: 100%;
            margin-bottom: 8px;
        }
        .info-row {
            display: block;
            margin-bottom: 4px;
        }
        .info-label {
            display: block;
            font-weight: bold;
            color: #555;
            padding: 4px 0 2px 0;
            font-size: 10px;
        }
        .info-value {
            display: block;
            padding: 6px 8px;
            background-color: #f9f9f9;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 10px;
        }
        .employee-photo {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            border: 2px solid #ddd;
            object-fit: cover;
            margin-right: 12px;
            float: left;
        }
        .employee-info-container {
            margin-bottom: 12px;
            overflow: hidden;
        }
        .employee-details {
            overflow: hidden;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 10px;
            margin-top: 4px;
        }
        .status-approved {
            background-color: #d4edda;
            color: #155724;
        }
        .status-pending {
            background-color: #fff3cd;
            color: #856404;
        }
        .status-rejected {
            background-color: #f8d7da;
            color: #721c24;
        }
        .status-cancelled {
            background-color: #f8d7da;
            color: #721c24;
        }
        .comments-box {
            background-color: #FEF3C7;
            padding: 10px;
            margin: 10px 0;
            border-radius: 4px;
            border-left: 4px solid #F59E0B;
            font-size: 10px;
        }
        .approval-section {
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid #ddd;
        }
        .approval-row {
            margin-bottom: 10px;
            page-break-inside: avoid;
        }
        .footer {
            margin-top: 16px;
            padding-top: 10px;
            border-top: 1px solid #ccc;
            text-align: center;
            font-size: 9px;
            color: #666;
        }
        .clear {
            clear: both;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-left">
            @php
                $logoPath = public_path('Logo.png');
                if (file_exists($logoPath)) {
                    $logoData = base64_encode(file_get_contents($logoPath));
                    $logoMime = mime_content_type($logoPath);
                    $logoBase64 = 'data:' . $logoMime . ';base64,' . $logoData;
                } else {
                    $logoBase64 = null;
                }
            @endphp
            @if($logoBase64)
                <img src="{{ $logoBase64 }}" alt="Logo" class="logo" />
            @endif
            <div class="company-info">
                <div class="company-name">{{ $companyName ?? 'CFARBEMCO' }}</div>
                <div class="document-title">Leave Request Document</div>
            </div>
        </div>
        <div class="header-right">
            Generated: {{ now()->format('F d, Y') }}
        </div>
    </div>

    <div class="section">
        <div class="section-title">Employee Information</div>
        <div class="employee-info-container">
            @php
                $pictureBase64 = null;
                if ($employee->picture) {
                    // Handle both absolute paths and relative paths
                    if (str_starts_with($employee->picture, '/')) {
                        $picturePath = public_path(ltrim($employee->picture, '/'));
                    } else {
                        $picturePath = public_path($employee->picture);
                    }
                    
                    if (file_exists($picturePath)) {
                        $pictureData = base64_encode(file_get_contents($picturePath));
                        $pictureMime = mime_content_type($picturePath);
                        $pictureBase64 = 'data:' . $pictureMime . ';base64,' . $pictureData;
                    }
                }
            @endphp
            @if($pictureBase64)
                <img src="{{ $pictureBase64 }}" alt="Employee Photo" class="employee-photo" />
            @endif
            <div class="employee-details">
                <div class="info-grid">
                    <div class="info-row">
                        <div class="info-label">Employee ID:</div>
                        <div class="info-value">{{ $employee->employeeid ?? 'N/A' }}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Full Name:</div>
                        <div class="info-value">{{ $employee->employee_name ?? 'N/A' }}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Department:</div>
                        <div class="info-value">{{ $employee->department ?? 'N/A' }}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Position:</div>
                        <div class="info-value">{{ $employee->position ?? 'N/A' }}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Email:</div>
                        <div class="info-value">{{ $employee->email ?? 'N/A' }}</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="clear"></div>
    </div>

    <div class="section">
        <div class="section-title">Leave Details</div>
        <div class="info-grid">
            <div class="info-row">
                <div class="info-label">Leave Type:</div>
                <div class="info-value">{{ $leave->leave_type ?? 'N/A' }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Start Date:</div>
                <div class="info-value">{{ \Carbon\Carbon::parse($leave->leave_start_date)->format('F d, Y') }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">End Date:</div>
                <div class="info-value">{{ \Carbon\Carbon::parse($leave->leave_end_date)->format('F d, Y') }}</div>
            </div>
            <div class="info-row">
                <div class="info-label">Total Days:</div>
                <div class="info-value">{{ $leave->leave_days ?? 0 }} day(s)</div>
            </div>
            <div class="info-row">
                <div class="info-label">Date Reported:</div>
                <div class="info-value">{{ \Carbon\Carbon::parse($leave->leave_date_reported)->format('F d, Y') }}</div>
            </div>
            @if($leave->leave_date_approved)
            <div class="info-row">
                <div class="info-label">Date Approved:</div>
                <div class="info-value">{{ \Carbon\Carbon::parse($leave->leave_date_approved)->format('F d, Y') }}</div>
            </div>
            @endif
            <div class="info-row">
                <div class="info-label">Status:</div>
                <div class="info-value">
                    <span class="status-badge status-{{ strtolower(str_replace(' ', '-', $leave->leave_status ?? 'pending')) }}">
                        {{ $leave->leave_status ?? 'Pending' }}
                    </span>
                </div>
            </div>
        </div>
    </div>

    @if($leave->leave_reason)
    <div class="section">
        <div class="section-title">Reason</div>
        <div class="info-value" style="padding: 15px;">{{ $leave->leave_reason }}</div>
    </div>
    @endif

    @if($leave->supervisor_status || $leave->hr_status)
    <div class="section approval-section">
        <div class="section-title">Approval Information</div>
        
        @if($leave->supervisor_status)
        <div class="approval-row">
            <div class="info-grid">
                <div class="info-row">
                    <div class="info-label">Supervisor Status:</div>
                    <div class="info-value">
                        <span class="status-badge status-{{ strtolower($leave->supervisor_status) }}">
                            {{ ucfirst($leave->supervisor_status) }}
                        </span>
                    </div>
                </div>
                @if($supervisorApprover)
                <div class="info-row">
                    <div class="info-label">Approved by:</div>
                    <div class="info-value">{{ $supervisorApprover->fullname }}</div>
                </div>
                @endif
                @if($leave->supervisor_approved_at)
                <div class="info-row">
                    <div class="info-label">Approved on:</div>
                    <div class="info-value">{{ \Carbon\Carbon::parse($leave->supervisor_approved_at)->format('F d, Y') }}</div>
                </div>
                @endif
            </div>
            @if($leave->supervisor_comments)
            <div class="comments-box">
                <strong>Supervisor Comments:</strong><br>
                {{ $leave->supervisor_comments }}
            </div>
            @endif
        </div>
        @endif

        @if($leave->hr_status)
        <div class="approval-row">
            <div class="info-grid">
                <div class="info-row">
                    <div class="info-label">HR Status:</div>
                    <div class="info-value">
                        <span class="status-badge status-{{ strtolower($leave->hr_status) }}">
                            {{ ucfirst($leave->hr_status) }}
                        </span>
                    </div>
                </div>
                @if($hrApprover)
                <div class="info-row">
                    <div class="info-label">Approved by:</div>
                    <div class="info-value">{{ $hrApprover->fullname }}</div>
                </div>
                @endif
                @if($leave->hr_approved_at)
                <div class="info-row">
                    <div class="info-label">Approved on:</div>
                    <div class="info-value">{{ \Carbon\Carbon::parse($leave->hr_approved_at)->format('F d, Y') }}</div>
                </div>
                @endif
            </div>
            @if($leave->hr_comments)
            <div class="comments-box">
                <strong>HR Comments:</strong><br>
                {{ $leave->hr_comments }}
            </div>
            @endif
        </div>
        @endif
    </div>
    @endif

    @if($leave->leave_comments)
    <div class="section">
        <div class="section-title">Additional Comments</div>
        <div class="info-value" style="padding: 15px;">{{ $leave->leave_comments }}</div>
    </div>
    @endif

    <div class="footer">
        <p>This document was generated automatically by CFARBEMCO HRIS (CheckWise) system.</p>
        <p>&copy; {{ date('Y') }} CFARBEMCO. All rights reserved.</p>
    </div>
</body>
</html>

