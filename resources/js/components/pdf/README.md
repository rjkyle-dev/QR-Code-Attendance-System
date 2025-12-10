# PDF Components Documentation

This directory contains reusable PDF components for generating leave request documents.

## Components Overview

### 1. `leave-pdf-preview.tsx`
The main PDF preview component that displays the leave request in a modal with a download button.

**Features:**
- PDF preview using PDFViewer
- Download button with loading state
- Responsive design
- Uses the customizable template

### 2. `leave-pdf-template.tsx`
A customizable PDF template component that can be easily modified for different layouts and styles.

**Props:**
- `leave`: Leave data object
- `companyName`: Company name (default: "CFARBEMCO")
- `logoPath`: Path to company logo (default: "/AGOC.png")
- `customStyles`: Object with custom styles
- `showEmployeePhoto`: Show/hide employee photo (default: true)
- `showFooter`: Show/hide footer (default: true)
- `showHeader`: Show/hide header (default: true)

### 3. `leave-pdf-custom-example.tsx`
Example component showing how to customize the PDF template with different themes.

**Available Themes:**
- `modernBlue`: Modern blue theme with rounded corners
- `corporateGreen`: Corporate green theme with shadows
- `minimalist`: Clean minimalist design

### 4. `leave-style.ts`
Base styles for the PDF components.

## Usage

### Basic Usage
```tsx
import LeavePDFPreview from '@/components/pdf/leave-pdf-preview';

// In your component
<LeavePDFPreview leave={leaveData} />
```

### Custom Template Usage
```tsx
import LeavePDFTemplate from '@/components/pdf/leave-pdf-template';

const LeaveDocument = LeavePDFTemplate({
    leave: leaveData,
    companyName: "Your Company",
    logoPath: "/your-AGOC.png",
    customStyles: {
        page: { backgroundColor: '#f0f0f0' },
        header: { backgroundColor: '#007bff' },
        // ... more custom styles
    }
});
```

### Custom Styles Structure
```tsx
const customStyles = {
    page: {
        backgroundColor: '#ffffff',
        padding: '30px 50px',
    },
    header: {
        backgroundColor: '#1e40af',
        color: 'white',
        padding: '20px',
        borderRadius: '8px',
    },
    companyName: {
        color: 'white',
        fontSize: '28px',
    },
    documentTitle: {
        color: '#e2e8f0',
        fontSize: '14px',
    },
    employeeSection: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
    },
    sectionTitle: {
        color: '#1e40af',
        fontSize: '16px',
        borderBottom: '2px solid #1e40af',
    },
    detailText: {
        fontSize: '13px',
        color: '#374151',
    },
    statusBadge: {
        borderRadius: '20px',
        padding: '6px 12px',
    },
    // ... more style properties
};
```

## Customization Examples

### 1. Change Company Logo
```tsx
const LeaveDocument = LeavePDFTemplate({
    leave: leaveData,
    logoPath: "/path/to/your/AGOC.png"
});
```

### 2. Hide Employee Photo
```tsx
const LeaveDocument = LeavePDFTemplate({
    leave: leaveData,
    showEmployeePhoto: false
});
```

### 3. Custom Color Scheme
```tsx
const LeaveDocument = LeavePDFTemplate({
    leave: leaveData,
    customStyles: {
        header: { backgroundColor: '#059669' },
        sectionTitle: { color: '#059669' },
        statusBadge: { 
            backgroundColor: '#d1fae5',
            color: '#065f46'
        }
    }
});
```

### 4. Different Layout
```tsx
const LeaveDocument = LeavePDFTemplate({
    leave: leaveData,
    customStyles: {
        page: { padding: '20px' },
        employeeSection: { 
            flexDirection: 'column',
            alignItems: 'center'
        }
    }
});
```

## Integration with View Leave Details

The PDF preview is integrated into the `viewleavedetails.tsx` component:

1. Click the "Download PDF" button
2. A modal opens with the PDF preview
3. Click "Download PDF" in the modal to download the file

## File Structure
```
pdf/
├── leave-pdf-preview.tsx      # Main preview component
├── leave-pdf-template.tsx     # Customizable template
├── leave-pdf-custom-example.tsx # Example with themes
├── leave-style.ts             # Base styles
└── README.md                  # This documentation
```

## Dependencies
- `@react-pdf/renderer`: For PDF generation
- React components from your UI library
- TypeScript for type safety

## Notes
- The logo path should be relative to the public directory
- All styles use the react-pdf StyleSheet format
- The component is fully responsive and works in modals
- Loading states are handled automatically 