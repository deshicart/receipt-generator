// Receipt generation and style management
class ReceiptGenerator {
    constructor() {
        this.currentStyle = 'classic';
        this.currencySymbols = {
            'BDT': '৳',
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'INR': '₹'
        };
    }

    // Get currency symbol
    getCurrencySymbol(currency) {
        return this.currencySymbols[currency] || currency;
    }

    // Format date based on selected format
    formatDate(date, format) {
        if (!date) return '';
        
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');

        switch (format) {
            case 'DD/MM/YYYY':
                return `${day}/${month}/${year}`;
            case 'MM/DD/YYYY':
                return `${month}/${day}/${year}`;
            case 'DD-MM-YYYY':
                return `${day}-${month}-${year}`;
            case 'YYYY-MM-DD':
            default:
                return `${year}-${month}-${day}`;
        }
    }

    // Format number with currency
    formatCurrency(amount, currency) {
        const symbol = this.getCurrencySymbol(currency);
        const formatted = parseFloat(amount || 0).toFixed(2);
        return `${symbol} ${formatted}`;
    }

    // Generate receipt HTML based on style
    generateReceipt(data, style = 'classic') {
        this.currentStyle = style;

        switch (style) {
            case 'modern':
                return this.generateModernReceipt(data);
            case 'thermal':
                return this.generateThermalReceipt(data);
            case 'classic':
            default:
                return this.generateClassicReceipt(data);
        }
    }

    // Generate Classic Professional Invoice
    generateClassicReceipt(data) {
        const {
            businessLogo,
            businessName,
            businessEmail,
            businessPhone,
            businessAddress,
            invoiceTitle,
            orderId,
            orderDate,
            dateFormat,
            customerName,
            customerEmail,
            customerPhone,
            customerAddress,
            products,
            subTotal,
            shippingCost,
            totalTax,
            couponDiscount,
            grandTotal,
            currency,
            paymentMethod,
            paymentStatus,
            notes,
            terms,
            includeQR,
            includeBarcode,
            signatureDataURL
        } = data;

        const formattedDate = this.formatDate(orderDate, dateFormat);
        const currencySymbol = this.getCurrencySymbol(currency);

        let html = `
            <div class="receipt-classic">
                <div class="receipt-header">
                    <div class="business-info">
                        ${businessLogo ? `
                            <div class="business-logo">
                                <img src="${businessLogo}" alt="${businessName}">
                            </div>
                        ` : ''}
                        <h1 class="business-name">${businessName || 'Business Name'}</h1>
                        ${businessEmail ? `<p><i class="fas fa-envelope"></i> ${businessEmail}</p>` : ''}
                        ${businessPhone ? `<p><i class="fas fa-phone"></i> ${businessPhone}</p>` : ''}
                        ${businessAddress ? `<p><i class="fas fa-map-marker-alt"></i> ${businessAddress}</p>` : ''}
                    </div>
                    <div class="invoice-info">
                        <h1 class="invoice-title">${invoiceTitle || 'INVOICE'}</h1>
                        <p><strong>Order ID:</strong> ${orderId || 'N/A'}</p>
                        <p><strong>Date:</strong> ${formattedDate}</p>
                        ${paymentMethod ? `<p><strong>Payment:</strong> ${paymentMethod}</p>` : ''}
                        ${paymentStatus ? `<p><strong>Status:</strong> <span style="color: ${paymentStatus === 'Paid' ? 'green' : 'orange'}">${paymentStatus}</span></p>` : ''}
                    </div>
                </div>

                <div class="info-section">
                    <div class="info-block">
                        <h3>Bill To:</h3>
                        <p><strong>${customerName || 'Customer Name'}</strong></p>
                        ${customerEmail ? `<p>${customerEmail}</p>` : ''}
                        ${customerPhone ? `<p>${customerPhone}</p>` : ''}
                        ${customerAddress ? `<p>${customerAddress}</p>` : ''}
                    </div>
                </div>

                <table class="products-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Variation</th>
                            <th>Delivery</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Tax</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products.map(product => `
                            <tr>
                                <td>${product.name}</td>
                                <td>${product.variation || '-'}</td>
                                <td>${product.delivery || '-'}</td>
                                <td>${product.quantity}</td>
                                <td>${this.formatCurrency(product.unitPrice, currency)}</td>
                                <td>${product.tax}%</td>
                                <td>${this.formatCurrency(product.total, currency)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="summary">
                    <div class="summary-row">
                        <span>Sub Total:</span>
                        <span>${this.formatCurrency(subTotal, currency)}</span>
                    </div>
                    <div class="summary-row">
                        <span>Shipping:</span>
                        <span>${this.formatCurrency(shippingCost, currency)}</span>
                    </div>
                    <div class="summary-row">
                        <span>Tax:</span>
                        <span>${this.formatCurrency(totalTax, currency)}</span>
                    </div>
                    ${parseFloat(couponDiscount) > 0 ? `
                        <div class="summary-row">
                            <span>Discount:</span>
                            <span>- ${this.formatCurrency(couponDiscount, currency)}</span>
                        </div>
                    ` : ''}
                    <div class="summary-row total">
                        <span>Grand Total:</span>
                        <span>${this.formatCurrency(grandTotal, currency)}</span>
                    </div>
                </div>

                <div class="footer-section">
                    ${notes ? `
                        <div class="notes">
                            <h4>Notes:</h4>
                            <p>${notes}</p>
                        </div>
                    ` : ''}
                    
                    ${terms ? `
                        <div class="terms">
                            <h4>Terms and Conditions:</h4>
                            <p>${terms}</p>
                        </div>
                    ` : ''}

                    ${signatureDataURL ? `
                        <div class="signature-area">
                            <h4>Authorized Signature:</h4>
                            <img src="${signatureDataURL}" alt="Signature">
                        </div>
                    ` : ''}

                    ${(includeQR || includeBarcode) ? `
                        <div class="codes-section">
                            ${includeQR ? '<div id="qrCodePreview" class="qr-code"></div>' : ''}
                            ${includeBarcode ? '<div id="barcodePreview" class="barcode"></div>' : ''}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        return html;
    }

    // Generate Modern Compact Receipt
    generateModernReceipt(data) {
        const {
            businessLogo,
            businessName,
            businessEmail,
            businessPhone,
            businessAddress,
            invoiceTitle,
            orderId,
            orderDate,
            dateFormat,
            customerName,
            customerEmail,
            customerPhone,
            customerAddress,
            products,
            subTotal,
            shippingCost,
            totalTax,
            couponDiscount,
            grandTotal,
            currency,
            paymentMethod,
            paymentStatus,
            notes,
            terms,
            includeQR,
            includeBarcode,
            signatureDataURL
        } = data;

        const formattedDate = this.formatDate(orderDate, dateFormat);

        let html = `
            <div class="receipt-modern">
                <div class="receipt-content">
                    <div class="receipt-header">
                        ${businessLogo ? `
                            <div class="business-logo">
                                <img src="${businessLogo}" alt="${businessName}">
                            </div>
                        ` : ''}
                        <h1 class="business-name">${businessName || 'Business Name'}</h1>
                        ${businessEmail ? `<p>${businessEmail}</p>` : ''}
                        ${businessPhone ? `<p>${businessPhone}</p>` : ''}
                        <h2 class="invoice-title">${invoiceTitle || 'RECEIPT'}</h2>
                        <p><strong>${orderId || 'N/A'}</strong> | ${formattedDate}</p>
                    </div>

                    <div class="info-cards">
                        <div class="info-card">
                            <h4>Customer</h4>
                            <p><strong>${customerName || 'Customer'}</strong></p>
                            ${customerPhone ? `<p>${customerPhone}</p>` : ''}
                        </div>
                        <div class="info-card">
                            <h4>Payment</h4>
                            ${paymentMethod ? `<p>${paymentMethod}</p>` : ''}
                            ${paymentStatus ? `<p style="color: ${paymentStatus === 'Paid' ? 'green' : 'orange'}">${paymentStatus}</p>` : ''}
                        </div>
                    </div>

                    <div class="products-list">
                        ${products.map(product => `
                            <div class="product-item">
                                <div class="product-details">
                                    <div class="product-name">${product.name}</div>
                                    <div class="product-meta">
                                        ${product.variation ? `${product.variation} | ` : ''}
                                        Qty: ${product.quantity} × ${this.formatCurrency(product.unitPrice, currency)}
                                        ${product.tax > 0 ? ` | Tax: ${product.tax}%` : ''}
                                    </div>
                                </div>
                                <div class="product-price">${this.formatCurrency(product.total, currency)}</div>
                            </div>
                        `).join('')}
                    </div>

                    <div class="summary">
                        <div class="summary-row">
                            <span>Sub Total:</span>
                            <span>${this.formatCurrency(subTotal, currency)}</span>
                        </div>
                        ${parseFloat(shippingCost) > 0 ? `
                            <div class="summary-row">
                                <span>Shipping:</span>
                                <span>${this.formatCurrency(shippingCost, currency)}</span>
                            </div>
                        ` : ''}
                        ${parseFloat(totalTax) > 0 ? `
                            <div class="summary-row">
                                <span>Tax:</span>
                                <span>${this.formatCurrency(totalTax, currency)}</span>
                            </div>
                        ` : ''}
                        ${parseFloat(couponDiscount) > 0 ? `
                            <div class="summary-row">
                                <span>Discount:</span>
                                <span>- ${this.formatCurrency(couponDiscount, currency)}</span>
                            </div>
                        ` : ''}
                        <div class="summary-row total">
                            <span>Total:</span>
                            <span>${this.formatCurrency(grandTotal, currency)}</span>
                        </div>
                    </div>

                    <div class="footer">
                        ${notes ? `<p style="font-size: 0.75rem; margin-bottom: 0.5rem;">${notes}</p>` : ''}
                        
                        ${(includeQR || includeBarcode) ? `
                            <div class="codes-section">
                                ${includeQR ? '<div id="qrCodePreview" class="qr-code"></div>' : ''}
                                ${includeBarcode ? '<div id="barcodePreview" class="barcode"></div>' : ''}
                            </div>
                        ` : ''}

                        ${signatureDataURL ? `
                            <div class="signature-area" style="margin-top: 1rem;">
                                <img src="${signatureDataURL}" alt="Signature" style="max-width: 150px;">
                            </div>
                        ` : ''}
                        
                        <p style="font-size: 0.75rem; margin-top: 1rem;">Thank you for your business!</p>
                    </div>
                </div>
            </div>
        `;

        return html;
    }

    // Generate Thermal / POS Receipt
    generateThermalReceipt(data) {
        const {
            businessLogo,
            businessName,
            businessPhone,
            invoiceTitle,
            orderId,
            orderDate,
            dateFormat,
            customerName,
            products,
            subTotal,
            shippingCost,
            totalTax,
            couponDiscount,
            grandTotal,
            currency,
            paymentMethod,
            paymentStatus,
            notes,
            includeQR,
            includeBarcode,
            signatureDataURL
        } = data;

        const formattedDate = this.formatDate(orderDate, dateFormat);

        let html = `
            <div class="receipt-thermal">
                <div class="receipt-header">
                    ${businessLogo ? `
                        <div class="business-logo">
                            <img src="${businessLogo}" alt="${businessName}">
                        </div>
                    ` : ''}
                    <div class="business-name">${businessName || 'Business Name'}</div>
                    ${businessPhone ? `<div style="font-size: 0.75rem;">${businessPhone}</div>` : ''}
                </div>

                <div class="section-divider"></div>

                <div class="invoice-title">${invoiceTitle || 'RECEIPT'}</div>
                <div class="info-line">
                    <span>Order:</span>
                    <span>${orderId || 'N/A'}</span>
                </div>
                <div class="info-line">
                    <span>Date:</span>
                    <span>${formattedDate}</span>
                </div>
                <div class="info-line">
                    <span>Customer:</span>
                    <span>${customerName || 'N/A'}</span>
                </div>
                ${paymentMethod ? `
                    <div class="info-line">
                        <span>Payment:</span>
                        <span>${paymentMethod}</span>
                    </div>
                ` : ''}
                ${paymentStatus ? `
                    <div class="info-line">
                        <span>Status:</span>
                        <span>${paymentStatus}</span>
                    </div>
                ` : ''}

                <div class="section-divider"></div>

                ${products.map(product => `
                    <div class="product-item">
                        <div class="product-name">${product.name}</div>
                        ${product.variation ? `<div style="font-size: 0.625rem; color: #666;">${product.variation}</div>` : ''}
                        <div class="product-line">
                            <span>${product.quantity} × ${this.formatCurrency(product.unitPrice, currency)}</span>
                            <span>${this.formatCurrency(product.total, currency)}</span>
                        </div>
                    </div>
                `).join('')}

                <div class="summary">
                    <div class="summary-row">
                        <span>Sub Total:</span>
                        <span>${this.formatCurrency(subTotal, currency)}</span>
                    </div>
                    ${parseFloat(shippingCost) > 0 ? `
                        <div class="summary-row">
                            <span>Shipping:</span>
                            <span>${this.formatCurrency(shippingCost, currency)}</span>
                        </div>
                    ` : ''}
                    ${parseFloat(totalTax) > 0 ? `
                        <div class="summary-row">
                            <span>Tax:</span>
                            <span>${this.formatCurrency(totalTax, currency)}</span>
                        </div>
                    ` : ''}
                    ${parseFloat(couponDiscount) > 0 ? `
                        <div class="summary-row">
                            <span>Discount:</span>
                            <span>-${this.formatCurrency(couponDiscount, currency)}</span>
                        </div>
                    ` : ''}
                    <div class="summary-row total">
                        <span>TOTAL:</span>
                        <span>${this.formatCurrency(grandTotal, currency)}</span>
                    </div>
                </div>

                ${(includeQR || includeBarcode) ? `
                    <div class="section-divider"></div>
                    <div class="codes-section">
                        ${includeQR ? '<div id="qrCodePreview" class="qr-code"></div>' : ''}
                        ${includeBarcode ? '<div id="barcodePreview" class="barcode"></div>' : ''}
                    </div>
                ` : ''}

                ${notes ? `
                    <div class="section-divider"></div>
                    <div class="footer">
                        <div style="font-size: 0.625rem;">${notes}</div>
                    </div>
                ` : ''}

                <div class="footer">
                    <div>Thank You!</div>
                    <div>Visit Again</div>
                </div>
            </div>
        `;

        return html;
    }

    // Collect form data
    collectFormData() {
        // Get business info
        const businessLogoInput = document.getElementById('businessLogo');
        const businessLogoPreview = document.querySelector('#logoPreview img');
        const businessLogo = businessLogoPreview ? businessLogoPreview.src : null;

        // Get all form fields
        const data = {
            businessLogo: businessLogo,
            businessName: document.getElementById('businessName').value,
            businessEmail: document.getElementById('businessEmail').value,
            businessPhone: document.getElementById('businessPhone').value,
            businessAddress: document.getElementById('businessAddress').value,
            
            invoiceTitle: document.getElementById('invoiceTitle').value,
            orderIdPrefix: document.getElementById('orderIdPrefix').value,
            orderId: document.getElementById('orderId').value,
            orderDate: document.getElementById('orderDate').value,
            dateFormat: document.getElementById('dateFormat').value,
            
            customerName: document.getElementById('customerName').value,
            customerEmail: document.getElementById('customerEmail').value,
            customerPhone: document.getElementById('customerPhone').value,
            customerAddress: document.getElementById('customerAddress').value,
            
            receiptStyle: document.getElementById('receiptStyle').value,
            currency: document.getElementById('currency').value,
            paymentMethod: document.getElementById('paymentMethod').value,
            paymentStatus: document.getElementById('paymentStatus').value,
            
            shippingCost: parseFloat(document.getElementById('shippingCost').value) || 0,
            couponDiscount: parseFloat(document.getElementById('couponDiscount').value) || 0,
            
            notes: document.getElementById('notes').value,
            terms: document.getElementById('terms').value,
            
            includeQR: document.getElementById('includeQR').checked,
            includeBarcode: document.getElementById('includeBarcode').checked,
            includeSignature: document.getElementById('includeSignature').checked,
            
            signatureDataURL: null
        };

        // Get signature if included
        if (data.includeSignature && typeof signatureManager !== 'undefined') {
            data.signatureDataURL = signatureManager.getDataURL();
        }

        // Get products
        data.products = this.getProducts();

        // Calculate totals
        const totals = this.calculateTotals(data.products, data.shippingCost, data.couponDiscount);
        data.subTotal = totals.subTotal;
        data.totalTax = totals.totalTax;
        data.grandTotal = totals.grandTotal;

        return data;
    }

    // Get products from table
    getProducts() {
        const products = [];
        const rows = document.querySelectorAll('#productsTableBody tr');

        rows.forEach(row => {
            const name = row.querySelector('.product-name').value;
            const variation = row.querySelector('.product-variation').value;
            const delivery = row.querySelector('.product-delivery').value;
            const quantity = parseFloat(row.querySelector('.product-quantity').value) || 0;
            const unitPrice = parseFloat(row.querySelector('.product-unit-price').value) || 0;
            const tax = parseFloat(row.querySelector('.product-tax').value) || 0;
            
            const subtotal = quantity * unitPrice;
            const taxAmount = (subtotal * tax) / 100;
            const total = subtotal + taxAmount;

            if (name) {
                products.push({
                    name,
                    variation,
                    delivery,
                    quantity,
                    unitPrice,
                    tax,
                    total
                });
            }
        });

        return products;
    }

    // Calculate totals
    calculateTotals(products, shippingCost = 0, couponDiscount = 0) {
        let subTotal = 0;
        let totalTax = 0;

        products.forEach(product => {
            const productSubtotal = product.quantity * product.unitPrice;
            const productTax = (productSubtotal * product.tax) / 100;
            
            subTotal += productSubtotal;
            totalTax += productTax;
        });

        const grandTotal = subTotal + totalTax + parseFloat(shippingCost) - parseFloat(couponDiscount);

        return {
            subTotal,
            totalTax,
            grandTotal: Math.max(0, grandTotal)
        };
    }
}

// Initialize receipt generator
const receiptGenerator = new ReceiptGenerator();
