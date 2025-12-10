import LeavePDF from '@/components/pdf/leave-pdf';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Link } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { CheckCircle, Clock, Download, Edit, Star, Trash2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Leave } from '../types/leave';

interface LeaveDetailsModalProps {
    leave: Leave | null;
    isOpen: boolean;
    onClose: () => void;
    onEdit: (leave: Leave) => void;
    onDelete: (id: string, onSuccess: () => void) => void;
}

const ViewLeaveDetails = ({ isOpen, onClose, leave, onEdit, onDelete }: LeaveDetailsModalProps) => {
    // if (!employee) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, index) => (
            <Star key={index} className={`h-5 w-5 ${index < Math.floor(rating) ? 'fill-current text-yellow-400' : 'text-gray-300'}`} />
        ));
    };

    const [preview, setPreview] = useState<string>('');
    const [showPDF, setShowPDF] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const [data, setData] = useState({
        id: '',
        leave_start_date: '',
        employee_name: '',
        leave_type: '',
        leave_end_date: '',
        leave_days: '',
        status: '',
        leave_reason: '',
        leave_date_reported: '',
        leave_date_approved: '',
        leave_comments: '',
        picture: '',
        department: '',
        position: '',
        employeeid: '',
    });

    useEffect(() => {
        if (leave) {
            console.log('Populating form with leave:', leave);
            populateForm(leave);
        }
    }, [leave]);

    const populateForm = (data: Leave) => {
        setData({
            id: data.id,
            leave_start_date: data.leave_start_date,
            employee_name: data.employee_name,
            leave_type: data.leave_type,
            leave_end_date: data.leave_end_date,
            leave_days: data.leave_days,
            status: data.status,
            leave_reason: data.leave_reason,
            leave_date_reported: data.leave_date_reported,
            leave_date_approved: data.leave_date_approved,
            leave_comments: data.leave_comments,
            picture: data.picture,
            employeeid: data.employeeid,
            department: data.department,
            position: data.position,
        });
        setPreview(data.picture);
    };

    const handleDelete = () => {
        if (leave) {
            onDelete(leave.id, onClose);
        }
    };

    const printPDF = () => {
        // Create a new window for printing
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast.error('Please allow popups to print the PDF');
            return;
        }

        // Get current date for the document
        const currentDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        // Create the HTML content for the PDF
        const pdfContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Leave Request Document</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 20px;
                        line-height: 1.6;
                        color: #333;
                    }
                    .header {
                        text-align: center;
                        border-bottom: 2px solid #333;
                        padding-bottom: 20px;
                        margin-bottom: 30px;
                    }
                    .logo {
                        height: 90px;
                        margin-bottom: 10px;
                    }
                    .company-name {
                        font-size: 24px;
                        font-weight: bold;
                        margin-bottom: 5px;
                    }
                    .document-title {
                        font-size: 18px;
                        margin-bottom: 5px;
                    }
                    .date {
                        font-size: 14px;
                        color: #666;
                    }
                    .section {
                        margin-bottom: 25px;
                    }
                    .section-title {
                        font-size: 16px;
                        font-weight: bold;
                        border-bottom: 1px solid #ccc;
                        padding-bottom: 5px;
                        margin-bottom: 15px;
                    }
                    .info-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 15px;
                        margin-bottom: 15px;
                    }
                    .info-item {
                        margin-bottom: 10px;
                    }
                    .label {
                        font-weight: bold;
                        color: #555;
                        margin-bottom: 3px;
                    }
                    .value {
                        padding: 5px 10px;
                        background-color: #f9f9f9;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                    }
                    .status-approved {
                        background-color: #d4edda;
                        color: #155724;
                        padding: 8px 12px;
                        border-radius: 4px;
                        font-weight: bold;
                        display: inline-block;
                    }
                    .status-pending {
                        background-color: #fff3cd;
                        color: #856404;
                        padding: 8px 12px;
                        border-radius: 4px;
                        font-weight: bold;
                        display: inline-block;
                    }
                    .status-rejected {
                        background-color: #f8d7da;
                        color: #721c24;
                        padding: 8px 12px;
                        border-radius: 4px;
                        font-weight: bold;
                        display: inline-block;
                    }
                    .footer {
                        margin-top: 40px;
                        padding-top: 20px;
                        border-top: 1px solid #ccc;
                        text-align: center;
                        font-size: 12px;
                        color: #666;
                    }
                    @media print {
                        body {
                            padding: 0;
                        }
                        .no-print {
                            display: none;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <img src="/AGOC.png" alt="Logo" class="logo" />
                    <div class="company-name">HRIS (CheckWise)</div>
                    <div class="document-title">Leave Request Document</div>
                    <div class="date">Generated on: ${currentDate}</div>
                </div>

                <div class="section">
                    <div class="section-title">Employee Information</div>
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="label">Employee ID:</div>
                            <div class="value">${data.employeeid || 'N/A'}</div>
                        </div>
                        <div class="info-item">
                            <div class="label">Employee Name:</div>
                            <div class="value">${data.employee_name || 'N/A'}</div>
                        </div>
                        <div class="info-item">
                            <div class="label">Department:</div>
                            <div class="value">${data.department || 'N/A'}</div>
                        </div>
                        <div class="info-item">
                            <div class="label">Position:</div>
                            <div class="value">${data.position || 'N/A'}</div>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">Leave Details</div>
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="label">Leave Type:</div>
                            <div class="value">${data.leave_type || 'N/A'}</div>
                        </div>
                        <div class="info-item">
                            <div class="label">Leave Status:</div>
                            <div class="value">
                                <span class="status-${data.status?.toLowerCase() || 'pending'}">
                                    ${data.status || 'Pending'}
                                </span>
                            </div>
                        </div>
                        <div class="info-item">
                            <div class="label">Start Date:</div>
                            <div class="value">${data.leave_start_date ? format(parseISO(data.leave_start_date), 'PPP') : 'N/A'}</div>
                        </div>
                        <div class="info-item">
                            <div class="label">End Date:</div>
                            <div class="value">${data.leave_end_date ? format(parseISO(data.leave_end_date), 'PPP') : 'N/A'}</div>
                        </div>
                        <div class="info-item">
                            <div class="label">Total Days:</div>
                            <div class="value">${data.leave_days || 0} day(s)</div>
                        </div>
                        <div class="info-item">
                            <div class="label">Date Reported:</div>
                            <div class="value">${data.leave_date_reported ? format(parseISO(data.leave_date_reported), 'PPP') : 'N/A'}</div>
                        </div>
                        <div class="info-item">
                            <div class="label">Date Approved:</div>
                            <div class="value">${data.leave_date_approved ? format(parseISO(data.leave_date_approved), 'PPP') : 'N/A'}</div>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">Leave Reason</div>
                    <div class="value" style="grid-column: 1 / -1; min-height: 60px;">
                        ${data.leave_reason || 'No reason provided'}
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">Additional Comments</div>
                    <div class="value" style="grid-column: 1 / -1; min-height: 60px;">
                        ${data.leave_comments || 'No additional comments'}
                    </div>
                </div>

                <div class="footer">
                    <p>This document was generated automatically by the HRIS system.</p>
                    <p>For any questions, please contact the HR department.</p>
                </div>

                <div class="no-print" style="position: fixed; top: 20px; right: 20px;">
                    <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Print PDF
                    </button>
                    <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;">
                        Close
                    </button>
                </div>
            </body>
            </html>
        `;

        // Write the content to the new window
        printWindow.document.write(pdfContent);
        printWindow.document.close();

        // Wait for content to load then trigger print
        printWindow.onload = () => {
            setTimeout(() => {
                printWindow.print();
            }, 500);
        };

        toast.success('PDF document opened in new window');
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl border-2 border-main">
                <DialogHeader>
                    <DialogTitle className="text-primary-custom">Leave Request Details</DialogTitle>
                    <DialogDescription>Complete information about the leave request</DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="flex items-center space-x-4 rounded-lg bg-green-100 p-4">
                        <Avatar className="h-16 w-16 border-2 border-green-300">
                            <AvatarImage src={data.picture} />
                            <AvatarFallback className="bg-green-100 text-main">
                                {/* {data.employee_name
                                        .split(' ')
                                        .map((n) => n[0])
                                        .join('')} */}
                                <img src="AGOC.png" alt="" />
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="text-lg font-bold text-main">{data.employee_name}</h3>
                            {/* <p className="text-muted-foreground">{data.}</p> */}
                            <p className="text-muted-foreground">{data.employeeid}</p>

                            <p className="text-sm text-muted-foreground">
                                {data.department} - {data.position}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Leave Type</label>
                                <p className="font-medium">{data.leave_type}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                                <p className="font-medium">{formatDate(data.leave_start_date)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Duration</label>
                                <p className="font-medium">{data.leave_days} days</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-muted-foreground">Status</label>
                                {(() => {
                                    let statusLeaveColors = '';
                                    let StatusIcon = null;
                                    if (data.status === 'Pending') {
                                        statusLeaveColors = 'bg-yellow-100 text-yellow-800 font-semibold text-lg p-3';
                                        StatusIcon = Clock;
                                    } else if (data.status === 'Approved') {
                                        statusLeaveColors = 'bg-green-100 text-green-800';
                                        StatusIcon = CheckCircle;
                                    } else {
                                        statusLeaveColors = 'bg-red-100 text-red-800';
                                        StatusIcon = XCircle;
                                    }
                                    return (
                                        <div className="w-24">
                                            {' '}
                                            {/* Tailwind: w-32 = 8rem = 128px */}
                                            <span className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-medium ${statusLeaveColors}`}>
                                                {StatusIcon && <StatusIcon className="mr-1 h-4 w-4" />}
                                                {data.status}
                                            </span>
                                        </div>
                                    );
                                })()}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">End Date</label>
                                <p className="font-medium">{formatDate(data.leave_end_date)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Submitted Date</label>
                                <p className="font-medium">{formatDate(data.leave_date_reported)}</p>
                            </div>
                        </div>
                        <div className="col-span-2">
                            <label className="text-sm font-medium text-muted-foreground">Reason</label>
                            <p className="mt-1 rounded-lg bg-muted/50 p-3 font-medium">{data.leave_reason}</p>
                        </div>
                        {data.leave_comments && (
                            <div className="col-span-2">
                                <label className="text-sm font-medium text-muted-foreground">Comments</label>
                                <p className="mt-1 rounded-lg bg-muted/50 p-3 font-medium">{data.leave_comments}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-5 ml-auto flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setShowPDF(true)}
                        className="border-blue-500 bg-blue-50 text-blue-600 hover:scale-105 hover:bg-blue-100"
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                    </Button>

                    <Link href={route('leave.edit', data.id)}>
                        <Button
                            variant="outline"
                            // onClick={() => handleEditLeave(selectedLeave)}
                            className="border-main bg-green-50 text-main-500 hover:scale-105 hover:bg-green-100"
                        >
                            <Edit className="mr-2 h-4 w-4" />
                            Update
                        </Button>
                    </Link>

                    <Button
                        variant="outline"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="border-destructive/20 text-destructive hover:scale-105 hover:bg-red-100"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                    {/* <Button
                            variant="outline"
                            onClick={() => setIsViewDialogOpen(false)}
                        >
                            Close
                        </Button> */}
                </div>
            </DialogContent>
            {/* PDF Modal */}
            <Dialog open={showPDF} onOpenChange={setShowPDF}>
                <DialogContent className="max-w-3xl">{leave && <LeavePDF leave={leave} />}</DialogContent>
            </Dialog>
            {/* Delete Confirmation Modal */}
            <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            {data.employee_name || data.employeeid
                                ? `Are you sure you want to delete the leave request for ${data.employee_name ? data.employee_name : ''}${data.employeeid ? ` (ID: ${data.employeeid})` : ''}? This action cannot be undone.`
                                : 'Are you sure you want to delete this leave request? This action cannot be undone.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                handleDelete();
                                setShowDeleteConfirm(false);
                            }}
                        >
                            Delete
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </Dialog>
    );
};

export default ViewLeaveDetails;
