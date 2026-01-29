// Initialize jsPDF
const { jsPDF } = window.jspdf;

/**
 * Generate Admission PDF using jsPDF
 */
async function generateAdmissionPDF() {
    try {
        // Show loading
        showPDFLoading();
        
        // Get the content to print
        const element = document.querySelector('.max-w-7xl');
        if (!element) {
            throw new Error('Application content not found');
        }
        
        // Create a cleaned version for PDF
        const pdfContent = await prepareForPDF(element);
        
        // Generate PDF
        await createPDFWithJSPDF(pdfContent);
        
    } catch (error) {
        console.error('PDF generation error:', error);
        showPDFError(error.message);
    } finally {
        hidePDFLoading();
    }
}

/**
 * Prepare content for PDF
 */
async function prepareForPDF(originalElement) {
    // Clone the element
    const clone = originalElement.cloneNode(true);
    
    // Remove interactive elements
    removeInteractiveElements(clone);
    
    // Enhance for PDF
    enhanceForPDF(clone);
    
    // Create a container for PDF
    const container = document.createElement('div');
    container.id = 'pdf-temp-container';
    container.style.cssText = `
        position: fixed;
        left: -9999px;
        top: 0;
        width: 800px;
        background: white;
        padding: 20px;
        font-family: 'Segoe UI', Arial, sans-serif;
        font-size: 12px;
    `;
    
    // Add header
    const header = createPDFHeader();
    container.appendChild(header);
    
    // Add content
    container.appendChild(clone);
    
    // Add footer
    const footer = createPDFFooter();
    container.appendChild(footer);
    
    // Add to document
    document.body.appendChild(container);
    
    // Wait for images to load
    await waitForImages(container);
    
    return container;
}

/**
 * Remove interactive elements
 */
function removeInteractiveElements(element) {
    const selectors = [
        'form',
        'button',
        'nav',
        'a[href^="/"]',
        '[onclick]',
        '.fa-arrow-left',
        '.fa-edit',
        '.print-btn',
        '.print-controls'
    ];
    
    selectors.forEach(selector => {
        element.querySelectorAll(selector).forEach(el => {
            if (!el.classList.contains('keep-in-pdf')) {
                el.remove();
            }
        });
    });
}

/**
 * Enhance content for PDF
 */
function enhanceForPDF(element) {
    // Add PDF-specific classes
    element.classList.add('pdf-version');
    
    // Fix images
    element.querySelectorAll('img').forEach(img => {
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.border = '1px solid #ddd';
        img.style.borderRadius = '4px';
        
        // Convert relative URLs to absolute
        if (img.src.startsWith('/')) {
            img.src = window.location.origin + img.src;
        }
    });
    
    // Add PDF styles
    const style = document.createElement('style');
    style.textContent = `
        .pdf-version * {
            color: #000 !important;
            font-family: 'Segoe UI', Arial, sans-serif !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        
        .pdf-version .bg-white { background-color: white !important; }
        .pdf-version .bg-gray-50 { background-color: #f9fafb !important; }
        .pdf-version .bg-blue-50 { background-color: #eff6ff !important; }
        .pdf-version .bg-red-50 { background-color: #fef2f2 !important; }
        .pdf-version .bg-green-100 { background-color: #d1fae5 !important; }
        .pdf-version .bg-yellow-100 { background-color: #fef3c7 !important; }
        .pdf-version .bg-purple-50 { background-color: #f5f3ff !important; }
        
        .pdf-version h1 { font-size: 24px; margin-bottom: 10px; }
        .pdf-version h2 { font-size: 20px; margin-bottom: 8px; }
        .pdf-version h3 { font-size: 16px; margin-bottom: 6px; }
        
        .pdf-version .text-sm { font-size: 12px !important; }
        .pdf-version .text-xs { font-size: 10px !important; }
        
        .pdf-version table {
            width: 100% !important;
            border-collapse: collapse !important;
        }
        
        .pdf-version th, .pdf-version td {
            border: 1px solid #e5e7eb !important;
            padding: 8px !important;
        }
        
        .pdf-version th {
            background-color: #f3f4f6 !important;
            font-weight: 600 !important;
        }
    `;
    element.appendChild(style);
}

/**
 * Create PDF header
 */
function createPDFHeader() {
    const header = document.createElement('div');
    header.className = 'pdf-header';
    header.style.cssText = `
        text-align: center;
        margin-bottom: 30px;
        padding-bottom: 15px;
        border-bottom: 2px solid #4f46e5;
        background: white;
    `;
    
    // Get display name from template (this will be replaced by server-side rendering)
    const displayName = '<%= displayName %>' || 'Applicant';
    const appId = '<%= admission.id %>' || 'N/A';
    const appNo = '<%= admission.student?.applicationNo %>' || 'N/A';
    const courseType = '<%= isMba ? "MBA" : "BBA" %>';
    
    header.innerHTML = `
        <h1 style="font-size: 24px; color: #1e293b; margin: 0 0 10px 0; font-weight: bold;">
            ${courseType} ADMISSION APPLICATION
        </h1>
        <div style="display: flex; justify-content: center; gap: 30px; font-size: 12px; color: #64748b; margin-bottom: 10px;">
            <span><strong>Application ID:</strong> #${appId}</span>
            <span><strong>Application No:</strong> ${appNo}</span>
            <span><strong>Applicant:</strong> ${displayName}</span>
        </div>
        <div style="font-size: 11px; color: #94a3b8;">
            Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
        </div>
    `;
    
    return header;
}

/**
 * Create PDF footer
 */
function createPDFFooter() {
    const footer = document.createElement('div');
    footer.className = 'pdf-footer';
    footer.style.cssText = `
        margin-top: 40px;
        padding-top: 15px;
        border-top: 1px solid #e2e8f0;
        text-align: center;
        font-size: 10px;
        color: #94a3b8;
        background: white;
    `;
    
    footer.innerHTML = `
        <div style="margin-bottom: 5px;">
            <strong>OFFICIAL ADMISSION DOCUMENT</strong> - CONFIDENTIAL
        </div>
        <div>
            This document is computer generated and requires no signature
        </div>
    `;
    
    return footer;
}

/**
 * Wait for images to load
 */
function waitForImages(container) {
    return new Promise((resolve) => {
        const images = container.querySelectorAll('img');
        if (images.length === 0) {
            resolve();
            return;
        }
        
        let loaded = 0;
        const total = images.length;
        
        images.forEach(img => {
            if (img.complete) {
                loaded++;
            } else {
                img.onload = () => {
                    loaded++;
                    if (loaded === total) resolve();
                };
                img.onerror = () => {
                    loaded++;
                    if (loaded === total) resolve();
                };
            }
        });
        
        if (loaded === total) resolve();
        
        // Timeout fallback
        setTimeout(resolve, 3000);
    });
}

/**
 * Create PDF using jsPDF
 */
async function createPDFWithJSPDF(element) {
    return new Promise((resolve, reject) => {
        // Create canvas from HTML
        html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            allowTaint: true,
            onclone: function(clonedDoc) {
                // Apply print styles to cloned document
                const style = document.createElement('style');
                style.textContent = `
                    body { background: white !important; margin: 0; padding: 0; }
                    * { -webkit-print-color-adjust: exact !important; }
                    img { max-width: 100% !important; height: auto !important; }
                `;
                clonedDoc.head.appendChild(style);
            }
        }).then(canvas => {
            // Calculate PDF dimensions
            const imgWidth = 210; // A4 width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            // Create PDF
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            // Add image to PDF
            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            
            // Check if content fits on one page
            if (imgHeight > 297) { // A4 height is 297mm
                // Multi-page PDF
                let heightLeft = imgHeight;
                let position = 0;
                
                // Add first page
                pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
                heightLeft -= 297;
                
                // Add additional pages if needed
                while (heightLeft > 0) {
                    position -= 297;
                    pdf.addPage();
                    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
                    heightLeft -= 297;
                }
            } else {
                // Single page PDF
                pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
            }
            
            // Add page numbers
            const totalPages = pdf.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                pdf.setPage(i);
                pdf.setFontSize(8);
                pdf.setTextColor(100);
                pdf.text(
                    `Page ${i} of ${totalPages}`,
                    pdf.internal.pageSize.width - 20,
                    pdf.internal.pageSize.height - 10
                );
            }
            
            // Save PDF
            const displayName = '<%= displayName %>'.replace(/\s+/g, '_') || 'Application';
            const fileName = `Admission_${displayName}_${Date.now()}.pdf`;
            pdf.save(fileName);
            
            // Clean up
            const tempContainer = document.getElementById('pdf-temp-container');
            if (tempContainer) {
                tempContainer.remove();
            }
            
            resolve();
        }).catch(error => {
            reject(error);
        });
    });
}

/**
 * Formatted PDF with structured content
 */
async function generateFormattedPDF() {
    try {
        showPDFLoading();
        
        // Create PDF
        const pdf = new jsPDF('p', 'mm', 'a4');
        let yPosition = 20;
        
        // Add header
        yPosition = await addHeaderToPDF(pdf, yPosition);
        
        // Add personal information
        yPosition = await addPersonalInfoToPDF(pdf, yPosition);
        
        // Check for page break
        if (yPosition > 250) {
            pdf.addPage();
            yPosition = 20;
        }
        
        // Add address information
        yPosition = await addAddressInfoToPDF(pdf, yPosition);
        
        // Check for page break
        if (yPosition > 250) {
            pdf.addPage();
            yPosition = 20;
        }
        
        // Add family information
        yPosition = await addFamilyInfoToPDF(pdf, yPosition);
        
        // Check for page break
        if (yPosition > 250) {
            pdf.addPage();
            yPosition = 20;
        }
        
        // Add academic information
        yPosition = await addAcademicInfoToPDF(pdf, yPosition);
        
        // Check for page break
        if (yPosition > 250) {
            pdf.addPage();
            yPosition = 20;
        }
        
        // Add documents information
        await addDocumentsInfoToPDF(pdf, yPosition);
        
        // Add page numbers
        const totalPages = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFontSize(8);
            pdf.setTextColor(100);
            pdf.text(
                `Page ${i} of ${totalPages}`,
                pdf.internal.pageSize.width - 20,
                pdf.internal.pageSize.height - 10
            );
        }
        
        // Save PDF
        const displayName = '<%= displayName %>'.replace(/\s+/g, '_') || 'Application';
        const fileName = `Admission_Form_${displayName}.pdf`;
        pdf.save(fileName);
        
    } catch (error) {
        console.error('Formatted PDF error:', error);
        showPDFError('Failed to generate formatted PDF: ' + error.message);
    } finally {
        hidePDFLoading();
    }
}

/**
 * Add header to formatted PDF
 */
async function addHeaderToPDF(pdf, yPos) {
    const displayName = '<%= displayName %>' || 'Applicant';
    const appId = '<%= admission.id %>' || 'N/A';
    const appNo = '<%= admission.student?.applicationNo %>' || 'N/A';
    const courseType = '<%= isMba ? "MBA" : "BBA" %>';
    
    // Title
    pdf.setFontSize(20);
    pdf.setTextColor(30, 41, 59);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${courseType} ADMISSION APPLICATION`, 105, yPos, { align: 'center' });
    yPos += 10;
    
    // Applicant Info
    pdf.setFontSize(12);
    pdf.setTextColor(15, 23, 42);
    pdf.setFont('helvetica', 'bold');
    pdf.text('APPLICANT:', 20, yPos);
    pdf.setFont('helvetica', 'normal');
    pdf.text(displayName, 50, yPos);
    yPos += 8;
    
    // Application Details
    pdf.setFontSize(10);
    pdf.setTextColor(100, 116, 139);
    pdf.text(`Application ID: #${appId}`, 20, yPos);
    pdf.text(`Application No: ${appNo}`, 105, yPos, { align: 'center' });
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 190, yPos, { align: 'right' });
    yPos += 10;
    
    // Line separator
    pdf.setDrawColor(79, 70, 229);
    pdf.setLineWidth(0.5);
    pdf.line(20, yPos, 190, yPos);
    yPos += 15;
    
    return yPos;
}

/**
 * Add personal information to formatted PDF
 */
async function addPersonalInfoToPDF(pdf, yPos) {
    // Section title
    pdf.setFontSize(14);
    pdf.setTextColor(30, 41, 59);
    pdf.setFont('helvetica', 'bold');
    pdf.text('1. PERSONAL INFORMATION', 20, yPos);
    yPos += 10;
    
    // Get data from the page or use placeholders
    const gender = '<%= admission.gender %>' || 'N/A';
    const dob = '<%= admission.dateOfBirth %>' || 'N/A';
    const category = '<%= admission.category %>' || 'N/A';
    const nationality = '<%= admission.nationality %>' || 'N/A';
    const aadhaar = '<%= admission.aadhaarNumber %>' || 'N/A';
    const pan = '<%= admission.panNumber %>' || 'N/A';
    const bloodGroup = '<%= admission.bloodGroup %>' || 'N/A';
    const mobile = '<%= admission.mobileNumber %>' || 'N/A';
    const email = '<%= admission.email %>' || 'N/A';
    
    // Create table-like structure
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    // Row 1
    pdf.setTextColor(71, 85, 105);
    pdf.text('Gender:', 20, yPos);
    pdf.setTextColor(15, 23, 42);
    pdf.text(gender, 50, yPos);
    
    pdf.setTextColor(71, 85, 105);
    pdf.text('Date of Birth:', 100, yPos);
    pdf.setTextColor(15, 23, 42);
    pdf.text(dob, 140, yPos);
    yPos += 7;
    
    // Row 2
    pdf.setTextColor(71, 85, 105);
    pdf.text('Category:', 20, yPos);
    pdf.setTextColor(15, 23, 42);
    pdf.text(category, 50, yPos);
    
    pdf.setTextColor(71, 85, 105);
    pdf.text('Nationality:', 100, yPos);
    pdf.setTextColor(15, 23, 42);
    pdf.text(nationality, 140, yPos);
    yPos += 7;
    
    // Row 3
    pdf.setTextColor(71, 85, 105);
    pdf.text('Aadhaar No:', 20, yPos);
    pdf.setTextColor(15, 23, 42);
    pdf.text(aadhaar, 50, yPos);
    
    const isMba = '<%= isMba %>' === 'true';
    if (isMba) {
        pdf.setTextColor(71, 85, 105);
        pdf.text('PAN No:', 100, yPos);
        pdf.setTextColor(15, 23, 42);
        pdf.text(pan, 140, yPos);
    }
    yPos += 7;
    
    // Row 4
    pdf.setTextColor(71, 85, 105);
    pdf.text('Blood Group:', 20, yPos);
    pdf.setTextColor(15, 23, 42);
    pdf.text(bloodGroup, 50, yPos);
    yPos += 7;
    
    // Row 5
    pdf.setTextColor(71, 85, 105);
    pdf.text('Mobile:', 20, yPos);
    pdf.setTextColor(15, 23, 42);
    pdf.text(mobile, 50, yPos);
    
    pdf.setTextColor(71, 85, 105);
    pdf.text('Email:', 100, yPos);
    pdf.setTextColor(15, 23, 42);
    pdf.text(email, 140, yPos);
    yPos += 15;
    
    return yPos;
}

/**
 * Add address information to formatted PDF
 */
async function addAddressInfoToPDF(pdf, yPos) {
    // Section title
    pdf.setFontSize(14);
    pdf.setTextColor(30, 41, 59);
    pdf.setFont('helvetica', 'bold');
    pdf.text('2. ADDRESS DETAILS', 20, yPos);
    yPos += 10;
    
    // Permanent Address
    pdf.setFontSize(11);
    pdf.setTextColor(71, 85, 105);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Permanent Address:', 20, yPos);
    yPos += 7;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    const isMba = '<%= isMba %>' === 'true';
    if (isMba) {
        const permAddress = [
            '<%= admission.permAddressLine1 %>',
            '<%= admission.permCity %>',
            '<%= admission.permDistrict %>',
            '<%= admission.permState %>',
            'PIN: <%= admission.permPinCode %>'
        ].filter(Boolean).join(', ') || 'N/A';
        
        pdf.setTextColor(15, 23, 42);
        pdf.text(permAddress, 20, yPos, { maxWidth: 170 });
        yPos += 15;
    } else {
        const permAddress = '<%= admission.permanentAddress %>' || 'N/A';
        pdf.setTextColor(15, 23, 42);
        pdf.text(permAddress, 20, yPos, { maxWidth: 170 });
        yPos += 15;
    }
    
    // Correspondence Address
    pdf.setFontSize(11);
    pdf.setTextColor(71, 85, 105);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Correspondence Address:', 20, yPos);
    yPos += 7;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    const corrAddress = [
        '<%= admission.corrAddressLine || admission.corrAddressLine1 %>',
        '<%= admission.corrCity %>',
        '<%= admission.corrDistrict %>',
        '<%= admission.corrState %>',
        'PIN: <%= admission.corrPinCode %>'
    ].filter(Boolean).join(', ') || 'N/A';
    
    pdf.setTextColor(15, 23, 42);
    pdf.text(corrAddress, 20, yPos, { maxWidth: 170 });
    yPos += 15;
    
    // Hostel Information
    const hostelRequired = '<%= admission.hostelRequired %>' || 'No';
    const hostelType = '<%= admission.hostelType %>' || 'N/A';
    
    pdf.setFontSize(11);
    pdf.setTextColor(71, 85, 105);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Hostel Requirement:', 20, yPos);
    yPos += 7;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(15, 23, 42);
    pdf.text(`${hostelRequired} ${hostelType !== 'N/A' ? `(${hostelType})` : ''}`, 20, yPos);
    yPos += 15;
    
    return yPos;
}

/**
 * Add family information to formatted PDF
 */
async function addFamilyInfoToPDF(pdf, yPos) {
    // Section title
    pdf.setFontSize(14);
    pdf.setTextColor(30, 41, 59);
    pdf.setFont('helvetica', 'bold');
    pdf.text('3. FAMILY INFORMATION', 20, yPos);
    yPos += 10;
    
    // Father's Details
    pdf.setFontSize(11);
    pdf.setTextColor(71, 85, 105);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Father\'s Details:', 20, yPos);
    yPos += 7;
    
    const fatherName = '<%= admission.fatherName %>' || 'N/A';
    const fatherOccupation = '<%= admission.fatherOccupation %>' || 'N/A';
    const fatherMobile = '<%= admission.fatherMobile %>' || 'N/A';
    const fatherIncome = '<%= admission.fatherIncome %>' || 'N/A';
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(15, 23, 42);
    pdf.text(`Name: ${fatherName}`, 20, yPos);
    yPos += 6;
    pdf.text(`Occupation: ${fatherOccupation}`, 20, yPos);
    yPos += 6;
    pdf.text(`Mobile: ${fatherMobile}`, 20, yPos);
    yPos += 6;
    pdf.text(`Income: ₹${fatherIncome}`, 20, yPos);
    yPos += 12;
    
    // Mother's Details
    pdf.setFontSize(11);
    pdf.setTextColor(71, 85, 105);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Mother\'s Details:', 20, yPos);
    yPos += 7;
    
    const motherName = '<%= admission.motherName %>' || 'N/A';
    const motherOccupation = '<%= admission.motherOccupation %>' || 'N/A';
    const motherMobile = '<%= admission.motherMobile %>' || 'N/A';
    const motherIncome = '<%= admission.motherIncome %>' || 'N/A';
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(15, 23, 42);
    pdf.text(`Name: ${motherName}`, 20, yPos);
    yPos += 6;
    pdf.text(`Occupation: ${motherOccupation}`, 20, yPos);
    yPos += 6;
    pdf.text(`Mobile: ${motherMobile}`, 20, yPos);
    yPos += 6;
    pdf.text(`Income: ₹${motherIncome}`, 20, yPos);
    yPos += 12;
    
    // Guardian's Details
    pdf.setFontSize(11);
    pdf.setTextColor(71, 85, 105);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Guardian\'s Details:', 20, yPos);
    yPos += 7;
    
    const guardianName = '<%= admission.guardianName %>' || 'N/A';
    const guardianRelation = '<%= admission.guardianRelation %>' || 'N/A';
    const guardianMobile = '<%= admission.guardianMobile %>' || 'N/A';
    const guardianAddress = '<%= admission.guardianAddress %>' || 'N/A';
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(15, 23, 42);
    pdf.text(`Name: ${guardianName} (${guardianRelation})`, 20, yPos);
    yPos += 6;
    pdf.text(`Mobile: ${guardianMobile}`, 20, yPos);
    yPos += 6;
    pdf.text(`Address: ${guardianAddress}`, 20, yPos, { maxWidth: 170 });
    yPos += 15;
    
    return yPos;
}

/**
 * Add academic information to formatted PDF
 */
async function addAcademicInfoToPDF(pdf, yPos) {
    // Section title
    pdf.setFontSize(14);
    pdf.setTextColor(30, 41, 59);
    pdf.setFont('helvetica', 'bold');
    pdf.text('4. ACADEMIC QUALIFICATIONS', 20, yPos);
    yPos += 10;
    
    // Create academic table
    const headers = ['Examination', 'Board/School', 'Year', 'Marks Obtained', 'Percentage'];
    const data = [
        [
            'Class 10th',
            '<%= admission.c10Board %>' + ('<%= admission.c10School %>' ? '/' + '<%= admission.c10School %>' : ''),
            '<%= admission.c10Year %>',
            '<%= admission.c10MarksObt %>' + '/' + '<%= admission.c10MaxMarks %>',
            '<%= admission.c10Percentage %>%'
        ],
        [
            'Class 12th',
            '<%= admission.c12Board %>' + ('<%= admission.c12School %>' ? '/' + '<%= admission.c12School %>' : ''),
            '<%= admission.c12Year %>',
            '<%= admission.c12MarksObt %>' + '/' + '<%= admission.c12MaxMarks %>',
            '<%= admission.c12Percentage %>%'
        ]
    ];
    
    // Table setup
    const colWidths = [40, 50, 25, 40, 30];
    const startX = 20;
    
    // Draw headers
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    let currentX = startX;
    
    headers.forEach((header, i) => {
        // Draw header cell
        pdf.setFillColor(59, 130, 246); // blue-500
        pdf.rect(currentX, yPos, colWidths[i], 8, 'F');
        pdf.text(header, currentX + 2, yPos + 5);
        currentX += colWidths[i];
    });
    
    yPos += 8;
    pdf.setTextColor(15, 23, 42);
    
    // Draw data rows
    pdf.setFont('helvetica', 'normal');
    data.forEach(row => {
        currentX = startX;
        let maxHeight = 6;
        
        row.forEach((cell, i) => {
            const lines = pdf.splitTextToSize(cell, colWidths[i] - 4);
            const cellHeight = lines.length * 5;
            if (cellHeight > maxHeight) maxHeight = cellHeight;
            
            pdf.text(lines, currentX + 2, yPos + 4);
            currentX += colWidths[i];
        });
        
        // Draw cell borders
        currentX = startX;
        for (let i = 0; i < colWidths.length; i++) {
            pdf.setDrawColor(209, 213, 219);
            pdf.setLineWidth(0.2);
            pdf.rect(currentX, yPos, colWidths[i], maxHeight);
            currentX += colWidths[i];
        }
        
        yPos += maxHeight;
    });
    
    yPos += 10;
    
    // Graduation Details (for MBA)
    const isMba = '<%= isMba %>' === 'true';
    if (isMba) {
        const cgpa = '<%= admission.cgpa %>' || 'N/A';
        pdf.setFontSize(11);
        pdf.setTextColor(71, 85, 105);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Graduation CGPA:', 20, yPos);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(15, 23, 42);
        pdf.text(cgpa, 60, yPos);
        yPos += 10;
    }
    
    return yPos;
}

/**
 * Add documents information to formatted PDF
 */
async function addDocumentsInfoToPDF(pdf, yPos) {
    // Section title
    pdf.setFontSize(14);
    pdf.setTextColor(30, 41, 59);
    pdf.setFont('helvetica', 'bold');
    pdf.text('5. DOCUMENTS & STATUS', 20, yPos);
    yPos += 10;
    
    // Medical & Social Status
    pdf.setFontSize(11);
    pdf.setTextColor(71, 85, 105);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Medical & Social Status:', 20, yPos);
    yPos += 7;
    
    const statusData = [
        ['BPL Status', '<%= admission.isBpl %>'],
        ['PWD Status', '<%= admission.isPwd %>'],
        ['Chronic Illness', '<%= admission.isChronic %>'],
        ['Psychological Issue', '<%= admission.isPsychology %>']
    ];
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    statusData.forEach(([label, value]) => {
        pdf.setTextColor(71, 85, 105);
        pdf.text(`${label}:`, 20, yPos);
        pdf.setTextColor(15, 23, 42);
        pdf.text(value || 'N/A', 70, yPos);
        yPos += 6;
    });
    
    yPos += 6;
    
    // Application Status
    const admissionStatus = '<%= admission.status %>' || 'Pending';
    const entranceExamStatus = '<%= admission.entranceExamStatus %>' || 'Pending';
    const paymentStatus = '<%= admission.payStatusStudent %>' || 'Pending';
    
    pdf.setFontSize(11);
    pdf.setTextColor(71, 85, 105);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Application Status:', 20, yPos);
    yPos += 7;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(15, 23, 42);
    pdf.text(`Admission: ${admissionStatus.toUpperCase()}`, 20, yPos);
    yPos += 6;
    pdf.text(`Entrance Exam: ${entranceExamStatus}`, 20, yPos);
    yPos += 6;
    pdf.text(`Payment: ${paymentStatus}`, 20, yPos);
    yPos += 15;
    
    // Document Checklist
    pdf.setFontSize(11);
    pdf.setTextColor(71, 85, 105);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Document Checklist:', 20, yPos);
    yPos += 7;
    
    const documents = [
        '10th Marksheet',
        '12th Marksheet',
        'Graduation Marksheet (if applicable)',
        'Caste Certificate',
        'BPL Certificate (if applicable)',
        'PWD Certificate (if applicable)',
        'Photograph',
        'Signature',
        'Payment Receipt'
    ];
    
    pdf.setFontSize(9);
    pdf.setTextColor(15, 23, 42);
    
    let col1Y = yPos;
    let col2Y = yPos;
    const midPoint = Math.ceil(documents.length / 2);
    
    // First column
    documents.slice(0, midPoint).forEach(doc => {
        pdf.text('✓', 20, col1Y);
        pdf.text(doc, 27, col1Y);
        col1Y += 5;
    });
    
    // Second column
    documents.slice(midPoint).forEach(doc => {
        pdf.text('✓', 110, col2Y);
        pdf.text(doc, 117, col2Y);
        col2Y += 5;
    });
    
    yPos = Math.max(col1Y, col2Y) + 10;
    
    // Final note
    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);
    pdf.text('Note: All uploaded documents are verified and attached to the original application.', 20, yPos, { maxWidth: 170 });
    
    return yPos;
}

/**
 * Show loading indicator
 */
function showPDFLoading() {
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'pdf-loading-overlay';
    loadingDiv.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.85);
            z-index: 9999;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            backdrop-filter: blur(5px);
        ">
            <div style="
                width: 80px;
                height: 80px;
                border: 4px solid rgba(255,255,255,0.2);
                border-top: 4px solid #4f46e5;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-bottom: 20px;
            "></div>
            <h3 style="font-size: 22px; margin-bottom: 10px; font-weight: 600; background: linear-gradient(90deg, #4f46e5, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                Generating PDF Document
            </h3>
            <p style="font-size: 14px; opacity: 0.9; max-width: 400px; text-align: center; margin-bottom: 30px;">
                Please wait while we compile your admission application...
            </p>
            <div style="
                width: 300px;
                height: 3px;
                background: rgba(255,255,255,0.1);
                border-radius: 2px;
                overflow: hidden;
            ">
                <div style="
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, #4f46e5, #8b5cf6);
                    border-radius: 2px;
                    animation: loading 2s ease-in-out infinite;
                "></div>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes loading {
                    0% { transform: translateX(-100%); }
                    50% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }
            </style>
        </div>
    `;
    document.body.appendChild(loadingDiv);
}

/**
 * Hide loading indicator
 */
function hidePDFLoading() {
    const loadingDiv = document.getElementById('pdf-loading-overlay');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

/**
 * Show error message
 */
function showPDFError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.id = 'pdf-error-message';
    errorDiv.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(239,68,68,0.3);
            z-index: 10000;
            max-width: 400px;
            animation: slideIn 0.3s ease;
        ">
            <div style="display: flex; align-items: flex-start; gap: 12px;">
                <div style="font-size: 20px; flex-shrink: 0;">
                    <i class="fas fa-exclamation-circle"></i>
                </div>
                <div>
                    <strong style="display: block; margin-bottom: 5px;">PDF Generation Failed</strong>
                    <div style="font-size: 14px; opacity: 0.9;">${message}</div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="
                            background: none;
                            border: none;
                            color: white;
                            cursor: pointer;
                            margin-left: auto;
                            padding: 5px;
                            flex-shrink: 0;
                        ">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
        <style>
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        </style>
    `;
    document.body.appendChild(errorDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

/**
 * Simple PDF generation (quick method)
 */
async function generateQuickPDF() {
    try {
        const button = event?.target;
        if (button) {
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Creating PDF...';
            button.disabled = true;
        }
        
        const element = document.querySelector('.max-w-7xl');
        
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false
        });
        
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
        
        const displayName = '<%= displayName %>'.replace(/\s+/g, '_') || 'Application';
        pdf.save(`Admission_${displayName}_${Date.now()}.pdf`);
        
    } catch (error) {
        console.error('Quick PDF error:', error);
        showPDFError('Failed to generate PDF: ' + error.message);
    } finally {
        if (event?.target) {
            const button = event.target;
            button.innerHTML = '<i class="fas fa-file-pdf mr-2"></i>Download PDF';
            button.disabled = false;
        }
    }
}

// Make functions globally available
window.generateAdmissionPDF = generateAdmissionPDF;
window.generateQuickPDF = generateQuickPDF;
window.generateFormattedPDF = generateFormattedPDF;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admission PDF tools loaded');
    
    // Add CSS for PDF optimization
    const style = document.createElement('style');
    style.textContent = `
        /* PDF optimization */
        img {
            max-width: 100%;
            height: auto;
        }
        
        /* Ensure background colors print */
        .bg-white,
        .bg-gray-50,
        .bg-blue-50,
        .bg-red-50,
        .bg-green-100,
        .bg-yellow-100 {
            background-color: inherit !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
        
        /* Better table rendering */
        table {
            border-collapse: collapse;
            width: 100%;
        }
        
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
        }
    `;
    document.head.appendChild(style);
});