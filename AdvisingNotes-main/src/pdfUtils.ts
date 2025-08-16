import jsPDF from 'jspdf';
import { getLogoDataURL } from './getLogoDataURL';

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
 * Get the page dimensions
 */
const getPageSize = (doc: jsPDF) => {
  return { 
    W: doc.internal.pageSize.getWidth(), 
    H: doc.internal.pageSize.getHeight() 
  };
};

/**
 * Initialize a new PDF document
 */
// Note: We're using the default jsPDF constructor in generateSessionNotesPDF
// but keeping this code commented for reference if needed in the future
/*
const createPDF = (): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Use Times as default font
  doc.setFont('times');
  
  return doc;
};
*/

/**
 * Draw the header on the current page
 */
const drawHeader = (doc: jsPDF, dateISO: string, logoData?: string | null): void => {
  const { W } = getPageSize(doc);
  
  // Blue header background
  doc.setFillColor(BLUE_COLOR[0], BLUE_COLOR[1], BLUE_COLOR[2]);
  doc.rect(0, 0, W, HEADER_H, 'F');
  
  // White tile for logo
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(M, 8, 28, 28, 2, 2, 'F');
  doc.setDrawColor(200, 200, 200);
  doc.roundedRect(M, 8, 28, 28, 2, 2, 'D');
  
  // Add logo if available
  if (logoData) {
    try {
      // Fits inside the 28×28 tile
      doc.addImage(logoData, 'PNG', M + 3.5, 11.5, 21, 21);
    } catch (error) {
      console.error('Error adding logo:', error);
    }
  }
  
  // Title text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('times', 'bold');
  doc.text('STW College Consulting', M + 35, 20);
  
  // Session Notes text first
  doc.setFontSize(14);
  const sessionNotesText = 'Session Notes';
  doc.text(sessionNotesText, W - M - 30, 20, { align: 'right' });
  
  // Date below Session Notes
  doc.setFontSize(12);
  doc.setFont('times', 'normal');
  const formattedDate = new Date(dateISO).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  doc.text(formattedDate, W - M - 30, 30, { align: 'right' });
};

/**
 * Draw the footer on the current page
 */
const drawFooter = (doc: jsPDF, pageNum: number, totalPages: number): void => {
  const { W, H } = getPageSize(doc);
  const footerY = H - FOOTER_H;
  
  // Gray divider line
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(M, footerY + 5, W - M, footerY + 5);
  
  // Footer text
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  doc.setFont('times', 'normal');
  
  // Center company name
  doc.text('STW College Consulting', W / 2, footerY + 12, { align: 'center' });
  
  // Right aligned page numbers - only show if more than one page
  if (totalPages > 1) {
    const pageText = `Page ${pageNum} of ${totalPages}`;
    doc.text(pageText, W - M, footerY + 12, { align: 'right' });
  }
};

/**
 * Add page numbers and footers to all pages
 * Note: This function is now directly implemented in generateSessionNotesPDF
 */
/*
const addFootersToAllPages = (doc: jsPDF): void => {
  const totalPages = doc.internal.getNumberOfPages();
  
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawFooter(doc, i, totalPages);
  }
};
*/

/**
 * Ensure there is enough space on the current page, add a new page if needed
 */
const ensureSpace = (doc: jsPDF, currentY: number, neededHeight: number, dateISO: string, logoData?: string | null): number => {
  const { H } = getPageSize(doc);
  const maxY = H - FOOTER_H;
  
  if (currentY + neededHeight > maxY) {
    doc.addPage();
    drawHeader(doc, dateISO, logoData);
    return HEADER_H + 10; // Return new Y position after header
  }
  
  return currentY;
};

/**
 * Add student information card
 */
const addStudentCard = (doc: jsPDF, studentName: string, date: string, currentY: number, logoData?: string | null): number => {
  const { W } = getPageSize(doc);
  const contentWidth = W - (2 * M);
  
  // Calculate card height
  const cardHeight = 30;
  
  // Ensure space for the card
  const y = ensureSpace(doc, currentY, cardHeight, date, logoData);
  
  // Card background
  doc.setFillColor(LIGHT_BLUE_COLOR[0], LIGHT_BLUE_COLOR[1], LIGHT_BLUE_COLOR[2]);
  doc.roundedRect(M, y, contentWidth, cardHeight, 3, 3, 'F');
  
  // Student name
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('times', 'bold');
  doc.text(`Student: ${studentName}`, M + 5, y + 10);
  
  // Date
  doc.setFontSize(12);
  doc.setFont('times', 'normal');
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  doc.text(formattedDate, W / 2, y + 14, { align: 'center' });
  
  return y + cardHeight + 10;
};

/**
 * Add a section with title and content
 */
const addSection = (doc: jsPDF, title: string, content: string, currentY: number, date: string, logoData?: string | null): number => {
  const { W } = getPageSize(doc);
  const contentWidth = W - (2 * M);
  
  // First check if we have space for at least the title bar
  const titleBarHeight = 10;
  let y = ensureSpace(doc, currentY, titleBarHeight, date, logoData);
  
  // Calculate content height based on text wrapping
  doc.setFontSize(11);
  const splitText = doc.splitTextToSize(content || 'No content provided', contentWidth - 10);
  const contentHeight = splitText.length * LINE_H;
  const totalHeight = titleBarHeight + contentHeight + 10; // 10mm padding
  
  // Second check if we have space for the entire section
  y = ensureSpace(doc, y, totalHeight, date, logoData);
  
  // Draw title bar
  doc.setFillColor(BLUE_COLOR[0], BLUE_COLOR[1], BLUE_COLOR[2]);
  doc.rect(M, y, contentWidth, titleBarHeight, 'F');
  
  // Title text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('times', 'bold');
  doc.text(title, M + 5, y + 7);
  
  // Content background
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(M, y + titleBarHeight, contentWidth, contentHeight + 10, 2, 2, 'F');
  
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
const addActionItems = (doc: jsPDF, actionItems: ChecklistItem[], currentY: number, date: string, logoData?: string | null): number => {
  if (actionItems.length === 0) {
    return currentY;
  }
  
  const { W } = getPageSize(doc);
  const contentWidth = W - (2 * M);
  
  // Title bar
  const titleBarHeight = 10;
  let y = ensureSpace(doc, currentY, titleBarHeight, date, logoData);
  
  // Draw title bar
  doc.setFillColor(BLUE_COLOR[0], BLUE_COLOR[1], BLUE_COLOR[2]);
  doc.rect(M, y, contentWidth, titleBarHeight, 'F');
  
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
    const splitText = doc.splitTextToSize(item.text || 'No description', contentWidth - 20);
    const textHeight = splitText.length * LINE_H;
    const cardHeight = textHeight + 20; // Extra space for checkbox and assigned to
    
    // Ensure space for this card
    y = ensureSpace(doc, y, cardHeight + 5, date, logoData);
    
    // Card background
    doc.setFillColor(LIGHT_GRAY_COLOR[0], LIGHT_GRAY_COLOR[1], LIGHT_GRAY_COLOR[2]);
    doc.roundedRect(M, y, contentWidth, cardHeight, 3, 3, 'F');
    
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
    doc.text(`Assigned to: ${item.assignedTo}`, contentWidth - 5, y + cardHeight - 5, { align: 'right' });
    
    y += cardHeight + 5; // Space after card
  });
  
  return y;
};

/**
 * Generate a PDF from session notes
 */
export const generateSessionNotesPDF = async (notes: NotesData): Promise<{ fileName: string }> => {
  try {
    const doc = new jsPDF();
    const { H } = getPageSize(doc);
    
    // Get logo data once
    const logoData = await getLogoDataURL('/STW_LOGO.JPG');
    
    // Draw header
    drawHeader(doc, notes.date, logoData);
    
    let y = HEADER_H + 10;
    
    // Add student card
    y = addStudentCard(doc, notes.studentName, notes.date, y, logoData);
    y += 10;
    
    // Add conversation points section
    y = ensureSpace(doc, y, 40, notes.date, logoData);
    y = addSection(doc, 'Conversation Points', notes.conversationPoints, y, notes.date, logoData);
    y += 10;
    
    // Add topics covered section
    y = ensureSpace(doc, y, 40, notes.date, logoData);
    y = addSection(doc, 'Topics Covered', notes.topicsCovered, y, notes.date, logoData);
    y += 10;
    
    // Add goals section
    y = ensureSpace(doc, y, 40, notes.date, logoData);
    y = addSection(doc, 'Goals', notes.goals, y, notes.date, logoData);
    y += 10;
    
    // Add action items section
    y = ensureSpace(doc, y, 40, notes.date, logoData);
    
    // If we're close to the bottom, start a new page for action items
    if (y > H - 150) {
      doc.addPage();
      drawHeader(doc, notes.date, logoData);
      y = HEADER_H + 10;
    }
    
    y = addActionItems(doc, notes.actionItems, y, notes.date, logoData);
    
    // Add page numbers and footers
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      drawFooter(doc, i, totalPages);
    }
    
    const fileName = `STW-Session-Notes-${notes.studentName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
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
