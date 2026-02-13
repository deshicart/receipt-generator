// QR Code and Barcode generation
class CodeGenerator {
    constructor() {
        this.qrCode = null;
        this.barcodeData = null;
    }

    // Generate QR Code
    generateQRCode(text, elementId, size = 150) {
        // Clear existing QR code
        const container = document.getElementById(elementId);
        if (!container) {
            console.error('QR code container not found');
            return null;
        }

        container.innerHTML = '';

        // Generate new QR code
        try {
            if (typeof QRCode !== 'undefined') {
                this.qrCode = new QRCode(container, {
                    text: text,
                    width: size,
                    height: size,
                    colorDark: '#000000',
                    colorLight: '#ffffff',
                    correctLevel: QRCode.CorrectLevel.H
                });
                return container;
            } else {
                console.error('QRCode library not loaded');
                return null;
            }
        } catch (error) {
            console.error('QR code generation error:', error);
            return null;
        }
    }

    // Generate Barcode
    generateBarcode(text, elementId, format = 'CODE128') {
        const container = document.getElementById(elementId);
        if (!container) {
            console.error('Barcode container not found');
            return null;
        }

        container.innerHTML = '';

        // Create SVG element for barcode
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('id', 'barcodeSVG');
        container.appendChild(svg);

        // Generate barcode
        try {
            if (typeof JsBarcode !== 'undefined') {
                JsBarcode(svg, text, {
                    format: format,
                    width: 2,
                    height: 50,
                    displayValue: true,
                    fontSize: 14,
                    margin: 10
                });
                this.barcodeData = text;
                return container;
            } else {
                console.error('JsBarcode library not loaded');
                return null;
            }
        } catch (error) {
            console.error('Barcode generation error:', error);
            return null;
        }
    }

    // Get QR code as data URL
    getQRCodeDataURL() {
        if (this.qrCode) {
            const canvas = this.qrCode._el.querySelector('canvas');
            return canvas ? canvas.toDataURL() : null;
        }
        return null;
    }

    // Get barcode as data URL
    getBarcodeDataURL() {
        const svg = document.getElementById('barcodeSVG');
        if (!svg) return null;

        try {
            // Convert SVG to data URL
            const svgData = new XMLSerializer().serializeToString(svg);
            const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);
            
            // Create image from SVG
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = svg.width.baseVal.value;
                    canvas.height = svg.height.baseVal.value;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    URL.revokeObjectURL(url);
                    resolve(canvas.toDataURL('image/png'));
                };
                img.src = url;
            });
        } catch (error) {
            console.error('Barcode data URL conversion error:', error);
            return null;
        }
    }

    // Generate receipt data string for QR code
    generateReceiptDataString(receiptData) {
        const {
            businessName = '',
            orderId = '',
            orderDate = '',
            customerName = '',
            grandTotal = 0,
            currency = 'BDT'
        } = receiptData;

        return `${businessName}\nOrder: ${orderId}\nDate: ${orderDate}\nCustomer: ${customerName}\nTotal: ${currency} ${grandTotal}`;
    }

    // Validate barcode text
    validateBarcodeText(text) {
        // Remove invalid characters for CODE128
        return text.replace(/[^\x00-\x7F]/g, '').toUpperCase();
    }

    // Generate codes for receipt
    generateReceiptCodes(receiptData) {
        const codes = {};

        // Generate QR code data
        const qrData = this.generateReceiptDataString(receiptData);
        
        // Generate barcode data (use order ID)
        const barcodeData = this.validateBarcodeText(receiptData.orderId || 'RECEIPT');

        return {
            qrData,
            barcodeData
        };
    }
}

// Initialize code generator
const codeGenerator = new CodeGenerator();

// Helper function to generate codes for preview
function generateCodesForPreview(receiptData, includeQR, includeBarcode) {
    const codes = codeGenerator.generateReceiptCodes(receiptData);
    
    let qrHTML = '';
    let barcodeHTML = '';

    if (includeQR) {
        qrHTML = `
            <div class="qr-code">
                <div id="qrCodePreview"></div>
                <p style="font-size: 0.75rem; margin-top: 0.5rem;">Scan for details</p>
            </div>
        `;
    }

    if (includeBarcode) {
        barcodeHTML = `
            <div class="barcode">
                <div id="barcodePreview"></div>
            </div>
        `;
    }

    return { qrHTML, barcodeHTML, codes };
}

// Helper function to render codes after HTML is inserted
function renderCodesInPreview(codes, includeQR, includeBarcode) {
    setTimeout(() => {
        if (includeQR && codes.qrData) {
            codeGenerator.generateQRCode(codes.qrData, 'qrCodePreview', 150);
        }
        
        if (includeBarcode && codes.barcodeData) {
            codeGenerator.generateBarcode(codes.barcodeData, 'barcodePreview');
        }
    }, 100);
}
