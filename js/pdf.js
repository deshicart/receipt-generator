// PDF generation and print functionality
class PDFManager {
    constructor() {
        this.options = {
            classic: {
                margin: 10,
                filename: 'invoice.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, logging: false },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            },
            modern: {
                margin: 10,
                filename: 'receipt.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, logging: false },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            },
            thermal: {
                margin: [5, 5, 5, 5],
                filename: 'receipt.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, logging: false },
                jsPDF: { unit: 'mm', format: [80, 200], orientation: 'portrait' }
            }
        };
    }

    // Generate and download PDF
    async downloadPDF(elementId, style = 'classic') {
        const element = document.getElementById(elementId);
        
        if (!element) {
            console.error('Element not found for PDF generation');
            showToast('Error generating PDF', 'error');
            return;
        }

        // Show loading
        showLoading('Generating PDF...');

        try {
            // Get options for the current style
            const options = this.options[style] || this.options.classic;

            // Generate PDF using html2pdf
            if (typeof html2pdf !== 'undefined') {
                await html2pdf()
                    .set(options)
                    .from(element)
                    .save();
                
                showToast('PDF downloaded successfully!', 'success');
            } else {
                throw new Error('html2pdf library not loaded');
            }
        } catch (error) {
            console.error('PDF generation error:', error);
            showToast('Failed to generate PDF', 'error');
        } finally {
            hideLoading();
        }
    }

    // Print receipt
    printReceipt() {
        try {
            window.print();
            showToast('Print dialog opened', 'success');
        } catch (error) {
            console.error('Print error:', error);
            showToast('Failed to open print dialog', 'error');
        }
    }

    // Generate PDF as blob (for saving to history)
    async generatePDFBlob(elementId, style = 'classic') {
        const element = document.getElementById(elementId);
        
        if (!element) {
            console.error('Element not found for PDF generation');
            return null;
        }

        try {
            const options = this.options[style] || this.options.classic;

            if (typeof html2pdf !== 'undefined') {
                const pdf = await html2pdf()
                    .set(options)
                    .from(element)
                    .outputPdf('blob');
                
                return pdf;
            } else {
                throw new Error('html2pdf library not loaded');
            }
        } catch (error) {
            console.error('PDF blob generation error:', error);
            return null;
        }
    }

    // Get PDF as data URL (for storing)
    async generatePDFDataURL(elementId, style = 'classic') {
        const element = document.getElementById(elementId);
        
        if (!element) {
            console.error('Element not found for PDF generation');
            return null;
        }

        try {
            const options = this.options[style] || this.options.classic;

            if (typeof html2pdf !== 'undefined') {
                const pdf = await html2pdf()
                    .set(options)
                    .from(element)
                    .outputPdf('datauristring');
                
                return pdf;
            } else {
                throw new Error('html2pdf library not loaded');
            }
        } catch (error) {
            console.error('PDF data URL generation error:', error);
            return null;
        }
    }
}

// Initialize PDF manager
const pdfManager = new PDFManager();

// Helper functions for loading overlay
function showLoading(message = 'Loading...') {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        const messageEl = overlay.querySelector('p');
        if (messageEl) {
            messageEl.textContent = message;
        }
        overlay.classList.remove('hidden');
    }
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}

// Helper function for toast notifications
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.className = 'toast show ' + type;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}
