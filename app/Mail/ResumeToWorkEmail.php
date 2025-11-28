<?php

namespace App\Mail;

use App\Models\ResumeToWork;
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

class ResumeToWorkEmail extends Mailable
{
  use Queueable, SerializesModels;

  /**
   * Create a new message instance.
   */
  public function __construct(
    public ResumeToWork $resumeToWork
  ) {
    $this->resumeToWork->load(['employee', 'processedBy']);
  }

  /**
   * Get the message envelope.
   */
  public function envelope(): Envelope
  {
    $employee = $this->resumeToWork->employee;
    $subject = 'Resume to Work Notification - Return Date: ' . $this->resumeToWork->return_date->format('F d, Y');

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
      view: 'emails.resume-to-work',
      with: [
        'resumeToWork' => $this->resumeToWork,
        'employee' => $this->resumeToWork->employee,
        'processedBy' => $this->resumeToWork->processedBy,
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
      $pdf = DomPDF::loadView('emails.resume-to-work-pdf', [
        'resumeToWork' => $this->resumeToWork,
        'employee' => $this->resumeToWork->employee,
        'processedBy' => $this->resumeToWork->processedBy,
        'companyName' => 'CFARBEMCO',
      ]);

      $employeeId = $this->resumeToWork->employee?->employeeid ?? 'employee';
      $filename = 'resume_to_work_' . $employeeId . '_' . date('Y-m-d') . '.pdf';
      $pdfBinary = $pdf->output();

      // Store to disk
      $disk = 'public';
      $relativeDir = 'resume_to_work_pdfs/' . date('Y/m');
      $relativePath = $relativeDir . '/' . $filename;
      Storage::disk($disk)->put($relativePath, $pdfBinary, 'public');

      // Attach using storage disk (robust for SMTP providers)
      return [
        Attachment::fromStorageDisk($disk, $relativePath)
          ->as($filename)
          ->withMime('application/pdf'),
      ];
    } catch (\Exception $e) {
      Log::error('[RESUME TO WORK EMAIL] Failed to generate PDF attachment:', [
        'resume_to_work_id' => $this->resumeToWork->id,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString(),
      ]);
      return [];
    }
  }
}
