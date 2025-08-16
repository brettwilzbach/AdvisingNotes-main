import jsPDF from 'jspdf';

// Types
interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  assignedTo: 'Suzanne' | 'Student' | 'Parent/Guardian';
}

interface NotesData {
  studentName: string;
  date: string;
  conversationPoints: string;
  topicsCovered: string;
  goals: string;
  actionItems: ChecklistItem[];
}

// Constants
const M = 15; // Margin in mm
const HEADER_H = 40; // Header height in mm
const FOOTER_H = 18; // Footer height in mm
const LINE_H = 4.5; // Line height in mm
const PAGE_WIDTH = 210; // A4 width in mm
const PAGE_HEIGHT = 297; // A4 height in mm
const CONTENT_WIDTH = PAGE_WIDTH - (2 * M); // Content width in mm
const BLUE_COLOR = [0, 32, 96]; // RGB for blue
const LIGHT_BLUE_COLOR = [220, 230, 240]; // RGB for light blue background
const LIGHT_GRAY_COLOR = [240, 240, 240]; // RGB for light gray

// Uncomment and implement this function when you have the font files
/*
const registerFonts = () => {
  // Base64 encoded Georgia font files would go here
  // Example:
  // const georgiaRegularBase64 = '...';
  // const georgiaBoldBase64 = '...';
  // doc.addFileToVFS('Georgia-Regular.ttf', georgiaRegularBase64);
  // doc.addFont('Georgia-Regular.ttf', 'Georgia', 'normal');
  // doc.addFileToVFS('Georgia-Bold.ttf', georgiaBoldBase64);
  // doc.addFont('Georgia-Bold.ttf', 'Georgia', 'bold');
};
*/

/**
 * Initialize a new PDF document
 */
const pdfInit = (): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Use Times as default font
  doc.setFont('times');
  
  return doc;
};

/**
 * Draw the header on the current page
 */
const drawHeader = (doc: jsPDF, date: string): void => {
  // Blue header background
  doc.setFillColor(BLUE_COLOR[0], BLUE_COLOR[1], BLUE_COLOR[2]);
  doc.rect(0, 0, PAGE_WIDTH, HEADER_H, 'F');
  
  // Logo - use actual logo image
  try {
    // Try to add the logo image
    const logoData = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNmZmZmZmYiLz48dGV4dCB4PSI1MCIgeT0iNTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iIzAwMjA2MCI+U1RXPC90ZXh0Pjwvc3ZnPg==';
    doc.addImage(logoData, 'SVG', M, 10, 20, 20);
  } catch (error) {
    console.error('Error adding logo:', error);
    // Fallback to white rectangle if image fails
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(M, 10, 20, 20, 2, 2, 'F');
  }
  
  // Title text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('times', 'bold');
  doc.text('STW College Consulting', M + 25, 20);
  
  // Session Notes text first
  doc.setFontSize(14);
  const sessionNotesText = 'Session Notes';
  // Calculate text width manually
  const sessionNotesWidth = sessionNotesText.length * 3; // Approximate width based on character count
  doc.text(sessionNotesText, PAGE_WIDTH - M - sessionNotesWidth, 20);
  
  // Date below Session Notes
  doc.setFontSize(12);
  doc.setFont('times', 'normal');
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  // Calculate text width manually
  const dateWidth = formattedDate.length * 2.5; // Approximate width based on character count
  doc.text(formattedDate, PAGE_WIDTH - M - dateWidth, 30);
};

/**
 * Draw the footer on the current page
 */
const drawFooter = (doc: jsPDF, pageNum: number, totalPages: number): void => {
  const footerY = PAGE_HEIGHT - FOOTER_H;
  
  // Gray divider line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(M, footerY + 5, PAGE_WIDTH - M, footerY + 5);
  
  // Footer text
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  doc.setFont('times', 'normal');
  
  // Center company name
  doc.text('STW College Consulting', PAGE_WIDTH / 2, footerY + 12, { align: 'center' });
  
  // Right aligned page numbers - only show if more than one page
  if (totalPages > 1) {
    const pageText = `Page ${pageNum} of ${totalPages}`;
    doc.text(pageText, PAGE_WIDTH - M, footerY + 12);
  }
};

/**
 * Add page numbers and footers to all pages
 */
const paginateAllPages = (doc: jsPDF): void => {
  const totalPages = doc.internal.getNumberOfPages();
  
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(doc, i, totalPages);
  }
};

/**
 * Ensure there is enough space on the current page, add a new page if needed
 */
const ensureSpace = (doc: jsPDF, currentY: number, neededHeight: number, date: string): number => {
  const maxY = PAGE_HEIGHT - FOOTER_H;
  
  if (currentY + neededHeight > maxY) {
    doc.addPage();
    drawHeader(doc, date);
    return HEADER_H + 10; // Return new Y position after header
  }
  
  return currentY;
};

/**
 * Add student information card
 */
const addStudentCard = (doc: jsPDF, studentName: string, date: string, currentY: number): number => {
  const cardHeight = 25;
  let y = ensureSpace(doc, currentY, cardHeight, date);
  
  // Light blue background
  doc.setFillColor(LIGHT_BLUE_COLOR[0], LIGHT_BLUE_COLOR[1], LIGHT_BLUE_COLOR[2]);
  doc.roundedRect(M, y, CONTENT_WIDTH, cardHeight, 3, 3, 'F');
  
  // Student name label
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(10);
  doc.setFont('times', 'bold');
  doc.text('Student Name', M + 5, y + 7);
  
  // Student name value
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('times', 'normal');
  doc.text(studentName || 'Not specified', M + 5, y + 14);
  
  // Session date label
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(10);
  doc.setFont('times', 'bold');
  doc.text('Session Date', PAGE_WIDTH / 2, y + 7);
  
  // Session date value
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('times', 'normal');
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  doc.text(formattedDate, PAGE_WIDTH / 2, y + 14);
  
  return y + cardHeight + 10;
};

/**
 * Add a section with title and content
 */
const addSection = (doc: jsPDF, title: string, content: string, currentY: number, date: string): number => {
  // First check if we have space for at least the title bar
  const titleBarHeight = 10;
  let y = ensureSpace(doc, currentY, titleBarHeight, date);
  
  // Calculate content height based on text wrapping
  doc.setFontSize(11);
  const splitText = doc.splitTextToSize(content || 'No content provided', CONTENT_WIDTH - 10);
  const contentHeight = splitText.length * LINE_H;
  const totalHeight = titleBarHeight + contentHeight + 10; // 10mm padding
  
  // Second check if we have space for the entire section
  y = ensureSpace(doc, y, totalHeight, date);
  
  // Draw title bar
  doc.setFillColor(BLUE_COLOR[0], BLUE_COLOR[1], BLUE_COLOR[2]);
  doc.rect(M, y, CONTENT_WIDTH, titleBarHeight, 'F');
  
  // Title text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('times', 'bold');
  doc.text(title, M + 5, y + 7);
  
  // Content background
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(M, y + titleBarHeight, CONTENT_WIDTH, contentHeight + 10, 2, 2, 'F');
  
  // Content text
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont('times', 'normal');
  doc.text(splitText, M + 5, y + titleBarHeight + 7);
  
  return y + titleBarHeight + contentHeight + 15; // 15mm spacing after section
};

/**
 * Add action items section with individual cards
 */
const addActionItems = (doc: jsPDF, actionItems: ChecklistItem[], currentY: number, date: string): number => {
  if (actionItems.length === 0) {
    return currentY;
  }
  
  // Title bar
  const titleBarHeight = 10;
  let y = ensureSpace(doc, currentY, titleBarHeight, date);
  
  // Draw title bar
  doc.setFillColor(BLUE_COLOR[0], BLUE_COLOR[1], BLUE_COLOR[2]);
  doc.rect(M, y, CONTENT_WIDTH, titleBarHeight, 'F');
  
  // Title text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('times', 'bold');
  doc.text('Action Items', M + 5, y + 7);
  
  y += titleBarHeight + 5; // Space after title bar
  
  // Add each action item as a separate card
  actionItems.forEach((item) => {
    // Calculate card height
    doc.setFontSize(11);
    const splitText = doc.splitTextToSize(item.text || 'No description', CONTENT_WIDTH - 20);
    const textHeight = splitText.length * LINE_H;
    const cardHeight = textHeight + 20; // Extra space for checkbox and assigned to
    
    // Ensure space for this card
    y = ensureSpace(doc, y, cardHeight + 5, date);
    
    // Card background
    doc.setFillColor(LIGHT_GRAY_COLOR[0], LIGHT_GRAY_COLOR[1], LIGHT_GRAY_COLOR[2]);
    doc.roundedRect(M, y, CONTENT_WIDTH, cardHeight, 3, 3, 'F');
    
    // Checkbox
    doc.setDrawColor(100, 100, 100);
    doc.setFillColor(item.completed ? 0 : 255, item.completed ? 150 : 255, item.completed ? 0 : 255);
    doc.rect(M + 5, y + 5, 5, 5, item.completed ? 'FD' : 'D');
    
    // Item text
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('times', item.completed ? 'italic' : 'normal');
    doc.text(splitText, M + 15, y + 7);
    
    // Assigned to
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.setFont('times', 'normal');
    doc.text(`Assigned to: ${item.assignedTo}`, M + 5, y + cardHeight - 5);
    
    y += cardHeight + 5; // Space after card
  });
  
  return y;
};

/**
 * Generate a PDF from session notes
 */
export async function generateSessionNotesPDF(notes: NotesData): Promise<{ fileName: string }> {
  console.log('generateSessionNotesPDF called with:', notes);
  const { studentName } = notes;
  
  try {
    // Create a new PDF document
    console.log('Creating new jsPDF instance');
    const doc = pdfInit();
    console.log('jsPDF instance created successfully');
    
    // Draw header on first page
    drawHeader(doc, notes.date);
    
    // Start Y position after header
    let currentY = HEADER_H + 10;
    
    // Add student information
    currentY = addStudentCard(doc, notes.studentName, notes.date, currentY);
    
    // Add conversation points section
    currentY = addSection(doc, 'Conversation Points', notes.conversationPoints, currentY, notes.date);
    
    // Add topics covered section
    currentY = addSection(doc, 'Topics Covered', notes.topicsCovered, currentY, notes.date);
    
    // Add goals section
    currentY = addSection(doc, 'Goals', notes.goals, currentY, notes.date);
    
    // Add action items
    currentY = addActionItems(doc, notes.actionItems, currentY, notes.date);
    
    // Add footers and page numbers
    paginateAllPages(doc);
    
    // Generate file name
    const fileName = `STW-Session-Notes-${studentName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
    console.log('Preparing PDF with filename:', fileName);
  
    // For browser environment, we need to use a different approach
    const pdfOutput = doc.output('blob');
    const url = URL.createObjectURL(pdfOutput);
  
    // Create a link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
  
    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100);
    console.log('PDF download triggered');
    
    return { fileName };
  } catch (error) {
    console.error('Error in PDF generation:', error);
    throw error;
  }
};
