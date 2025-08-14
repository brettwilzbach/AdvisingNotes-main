# STW College Consulting - Advising Notes App

A professional client management application for STW College Consulting, featuring session note generation, time tracking, and comprehensive client record management.

## Features

### 📝 Session Notes
- Professional PDF generation with STW branding
- Structured note-taking for conversation points, topics covered, and goals
- Interactive action item checklist
- Automatic client record saving

### ⏱️ Time Tracker & Invoicing
- Comprehensive time tracking with hourly rates
- Professional invoice generation
- Automatic calculation of hours and totals
- PDF export with STW branding

### 📊 Client Records (CRM)
- Automatic saving of all generated PDFs and invoices
- Search and filter functionality
- Client history tracking
- Record management with delete functionality
- Persistent storage using localStorage

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **PDF Generation**: jsPDF + html2canvas
- **Icons**: Lucide React
- **Storage**: localStorage for client records

## Railway Deployment

This application is optimized for Railway deployment with the following configuration:

### Build Settings
- **Build Command**: `npm run build`
- **Start Command**: `npm run preview`
- **Node Version**: 18+

### Environment Variables
No environment variables required - the app runs entirely client-side.

### Static Assets
Ensure the following assets are included in the `public/` directory:
- `STW_LOGO.JPG` - STW College Consulting logo

## Local Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

4. **Preview Production Build**
   ```bash
   npm run preview
   ```

## Project Structure

```
src/
├── components/
│   ├── TimeTracker.tsx    # Time tracking and invoicing
│   └── CRMRecords.tsx     # Client records management
├── App.tsx                # Main application component
└── main.tsx              # Application entry point
```

## Key Features for Railway

- ✅ **Static Build**: Generates static files for efficient serving
- ✅ **No Backend Required**: Fully client-side application
- ✅ **Persistent Storage**: Uses localStorage for client data
- ✅ **Professional Branding**: STW College Consulting theme throughout
- ✅ **Mobile Responsive**: Works on all device sizes
- ✅ **PDF Generation**: Client-side PDF creation with professional formatting

## Usage

1. **Session Notes**: Fill out client information and generate professional session notes
2. **Time Tracking**: Track billable hours and generate invoices
3. **Client Records**: View and manage all generated documents in one place

## Support

For technical support or feature requests, contact the development team.

---

**STW College Consulting** - Professional college consulting services with comprehensive client management.
