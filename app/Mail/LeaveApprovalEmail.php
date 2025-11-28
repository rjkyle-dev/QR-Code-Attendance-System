<?php

namespace App\Mail;

use App\Models\Leave;
use App\Models\LeaveDocument;
use Barryvdh\DomPDF\Facade\Pdf as DomPDF;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class LeaveApprovalEmail extends Mailable
{
  use Queueable, SerializesModels;

  /**
   * Create a new message instance.
   */
  public function __construct(
    public Leave $leave
  ) {
    $this->leave->load(['employee', 'supervisorApprover', 'hrApprover']);
  }

  /**
   * Get the message envelope.
   */
  public function envelope(): Envelope
  {
    $employee = $this->leave->employee;
    $subject = 'Leave Request ' . $this->leave->leave_status . ' - ' . $this->leave->leave_type;

    return new Envelope(
      subject: $subject,
    );
  }

  /**
   * Get the message content definition.
   */
  public function content(): Content
  {
    return new Content(
      view: 'emails.leave-approval',
      with: [
        'leave' => $this->leave,
        'employee' => $this->leave->employee,
        'supervisorApprover' => $this->leave->supervisorApprover,
        'hrApprover' => $this->leave->hrApprover,
      ],
    );
  }

  /**
   * Get the attachments for the message.
   *
   * @return array<int, \Illuminate\Mail\Mailables\Attachment>
   */
  public function attachments(): array
  {
    try {
      // Generate PDF
      $pdf = DomPDF::loadView('emails.leave-pdf', [
        'leave' => $this->leave,
        'employee' => $this->leave->employee,
        'supervisorApprover' => $this->leave->supervisorApprover,
        'hrApprover' => $this->leave->hrApprover,
        'companyName' => 'CFARBEMCO',
      ]);

      $employeeId = $this->leave->employee?->employeeid ?? 'employee';
      $filename = 'leave_request_' . $employeeId . '_' . date('Y-m-d') . '.pdf';
      $pdfBinary = $pdf->output();

      // Store to disk and DB
      $disk = 'public';
      $relativeDir = 'leave_pdfs/' . date('Y/m');
      $relativePath = $relativeDir . '/' . $filename;
      Storage::disk($disk)->put($relativePath, $pdfBinary, 'public');

      LeaveDocument::create([
        'leave_id' => $this->leave->id,
        'file_name' => $filename,
        'mime_type' => 'application/pdf',
        'disk' => $disk,
        'path' => $relativePath,
        'size_bytes' => strlen($pdfBinary),
      ]);

      // Attach using storage disk (robust for SMTP providers)
      return [
        Attachment::fromStorageDisk($disk, $relativePath)
          ->as($filename)
          ->withMime('application/pdf'),
      ];
    } catch (\Exception $e) {
      Log::error('[LEAVE EMAIL] Failed to generate PDF attachment:', [
        'leave_id' => $this->leave->id,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);
      return [];
    }
  }
}
