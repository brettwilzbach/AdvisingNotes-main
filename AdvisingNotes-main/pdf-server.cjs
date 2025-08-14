const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.post('/generate-pdf', async (req, res) => {
  let browser;
  try {
    const { html, studentName, date } = req.body;
    
    // Launch Puppeteer browser with compatibility settings
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security'
      ]
    });
    
    const page = await browser.newPage();
    
    // Set content with proper styling for PDF
    await page.setContent(html, {
      waitUntil: 'domcontentloaded'
    });
    
    // Add CSS for proper page breaks and styling
    await page.addStyleTag({
      content: `
        @page {
          size: A4;
          margin: 15mm;
        }
        
        body {
          font-family: Georgia, serif;
          font-size: 12px;
          line-height: 1.4;
          color: #374151;
        }
        
        .action-items-section {
          page-break-before: always;
        }
        
        h1 {
          font-size: 24px;
          margin-bottom: 12px;
        }
        
        h2 {
          font-size: 14px;
          margin-bottom: 10px;
        }
        
        input, textarea {
          border: 1px solid #e5e7eb !important;
          background: white !important;
          padding: 8px 10px !important;
          font-family: Georgia, serif !important;
          font-size: 12px !important;
          border-radius: 4px !important;
          color: #374151 !important;
        }
        
        textarea {
          min-height: 80px !important;
        }
        
        .edit-only {
          display: none !important;
        }
        
        .pdf-only {
          display: block !important;
        }
      `
    });
    
    // Wait a bit for styles to apply
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate PDF buffer directly (avoiding stream issues)
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '15mm',
        right: '15mm',
        bottom: '15mm',
        left: '15mm'
      },
      preferCSSPageSize: true
    });
    
    // Set response headers for PDF download
    const filename = `stw-advising-notes-${studentName.replace(/\s+/g, '-').toLowerCase() || 'student'}-${date}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ error: 'Failed to generate PDF', details: error.message });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`PDF server running on port ${PORT}`);
});
