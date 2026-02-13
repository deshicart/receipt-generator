// Main application logic
class ReceiptApp {
    constructor() {
        this.products = [];
        this.currentDraftId = null;
        this.init();
    }

    // Initialize app
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    // Setup event listeners and initial state
    setup() {
        // Set default date
        document.getElementById('orderDate').valueAsDate = new Date();

        // Generate initial order ID
        this.generateOrderId();

        // Add first product row
        this.addProductRow();

        // Setup event listeners
        this.setupEventListeners();

        // Update totals initially
        this.updateTotals();
    }

    // Setup all event listeners
    setupEventListeners() {
        // Header buttons
        document.getElementById('draftBtn').addEventListener('click', () => this.openDraftsModal());
        document.getElementById('templateBtn').addEventListener('click', () => this.openTemplatesModal());
        document.getElementById('historyBtn').addEventListener('click', () => this.openHistoryModal());

        // Business logo upload
        document.getElementById('businessLogo').addEventListener('change', (e) => this.handleLogoUpload(e));

        // Order ID generation
        document.getElementById('generateOrderId').addEventListener('click', () => this.generateOrderId());

        // Add product button
        document.getElementById('addProduct').addEventListener('click', () => this.addProductRow());

        // Product table - use event delegation
        document.getElementById('productsTableBody').addEventListener('input', (e) => {
            if (e.target.matches('.product-quantity, .product-unit-price, .product-tax')) {
                this.updateProductTotal(e.target.closest('tr'));
                this.updateTotals();
            }
        });

        document.getElementById('productsTableBody').addEventListener('click', (e) => {
            if (e.target.matches('.btn-remove') || e.target.closest('.btn-remove')) {
                this.removeProductRow(e.target.closest('tr'));
            }
        });

        // Shipping and discount inputs
        document.getElementById('shippingCost').addEventListener('input', () => this.updateTotals());
        document.getElementById('couponDiscount').addEventListener('input', () => this.updateTotals());

        // Action buttons
        document.getElementById('saveDraft').addEventListener('click', () => this.saveDraft());
        document.getElementById('saveTemplate').addEventListener('click', () => this.saveTemplate());
        document.getElementById('generatePreview').addEventListener('click', () => this.generatePreview());

        // Preview actions
        document.getElementById('downloadPDF').addEventListener('click', () => this.downloadPDF());
        document.getElementById('printReceipt').addEventListener('click', () => this.printReceipt());
        document.getElementById('closePreview').addEventListener('click', () => this.closePreview());

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modalId = e.target.dataset.modal || e.target.closest('.modal-close').dataset.modal;
                this.closeModal(modalId);
            });
        });

        // Close modal when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    }

    // Generate order ID
    generateOrderId() {
        const prefix = document.getElementById('orderIdPrefix').value || 'ORD';
        const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
        const timestamp = Date.now().toString().slice(-6);
        document.getElementById('orderId').value = `${prefix}-${timestamp}${random.slice(-3)}`;
    }

    // Handle logo upload
    handleLogoUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const preview = document.getElementById('logoPreview');
                preview.innerHTML = `<img src="${event.target.result}" alt="Business Logo">`;
                preview.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    }

    // Add product row
    addProductRow() {
        const tbody = document.getElementById('productsTableBody');
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td><input type="text" class="product-name" placeholder="Product name" required></td>
            <td><input type="text" class="product-variation" placeholder="Size, Color..."></td>
            <td>
                <select class="product-delivery">
                    <option value="">Select</option>
                    <option value="Standard">Standard</option>
                    <option value="Express">Express</option>
                    <option value="Pickup">Pickup</option>
                    <option value="Digital">Digital</option>
                </select>
            </td>
            <td><input type="number" class="product-quantity" value="1" min="1" step="1"></td>
            <td><input type="number" class="product-unit-price" value="0" min="0" step="0.01"></td>
            <td><input type="number" class="product-tax" value="0" min="0" max="100" step="0.1"></td>
            <td><span class="product-total">0.00</span></td>
            <td><button type="button" class="btn-remove"><i class="fas fa-trash"></i></button></td>
        `;

        tbody.appendChild(row);
        this.updateProductTotal(row);
    }

    // Remove product row
    removeProductRow(row) {
        const tbody = document.getElementById('productsTableBody');
        if (tbody.children.length > 1) {
            row.remove();
            this.updateTotals();
        } else {
            showToast('At least one product is required', 'warning');
        }
    }

    // Update product total
    updateProductTotal(row) {
        const quantity = parseFloat(row.querySelector('.product-quantity').value) || 0;
        const unitPrice = parseFloat(row.querySelector('.product-unit-price').value) || 0;
        const tax = parseFloat(row.querySelector('.product-tax').value) || 0;
        
        const subtotal = quantity * unitPrice;
        const taxAmount = (subtotal * tax) / 100;
        const total = subtotal + taxAmount;
        
        row.querySelector('.product-total').textContent = total.toFixed(2);
    }

    // Update all totals
    updateTotals() {
        const products = receiptGenerator.getProducts();
        const shippingCost = parseFloat(document.getElementById('shippingCost').value) || 0;
        const couponDiscount = parseFloat(document.getElementById('couponDiscount').value) || 0;
        
        const totals = receiptGenerator.calculateTotals(products, shippingCost, couponDiscount);
        
        document.getElementById('subTotal').textContent = totals.subTotal.toFixed(2);
        document.getElementById('totalTax').textContent = totals.totalTax.toFixed(2);
        document.getElementById('grandTotal').textContent = totals.grandTotal.toFixed(2);
    }

    // Generate preview
    async generatePreview() {
        // Validate required fields
        if (!this.validateForm()) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        showLoading('Generating preview...');

        try {
            // Collect form data
            const data = receiptGenerator.collectFormData();

            // Generate receipt HTML
            const receiptHTML = receiptGenerator.generateReceipt(data, data.receiptStyle);

            // Insert into preview
            const previewContainer = document.getElementById('receiptPreview');
            previewContainer.innerHTML = receiptHTML;

            // Generate QR code and barcode if needed
            if (data.includeQR || data.includeBarcode) {
                const codes = codeGenerator.generateReceiptCodes(data);
                renderCodesInPreview(codes, data.includeQR, data.includeBarcode);
            }

            // Show preview section
            document.getElementById('previewSection').classList.remove('hidden');

            // Scroll to preview
            document.getElementById('previewSection').scrollIntoView({ behavior: 'smooth' });

            hideLoading();
            showToast('Preview generated successfully!', 'success');

            // Save to history
            await this.saveToHistory(data);
        } catch (error) {
            console.error('Preview generation error:', error);
            hideLoading();
            showToast('Failed to generate preview', 'error');
        }
    }

    // Download PDF
    async downloadPDF() {
        const style = document.getElementById('receiptStyle').value;
        await pdfManager.downloadPDF('receiptPreview', style);
    }

    // Print receipt
    printReceipt() {
        pdfManager.printReceipt();
    }

    // Close preview
    closePreview() {
        document.getElementById('previewSection').classList.add('hidden');
    }

    // Validate form
    validateForm() {
        const businessName = document.getElementById('businessName').value.trim();
        const customerName = document.getElementById('customerName').value.trim();
        
        // Check if at least one product has a name
        const products = receiptGenerator.getProducts();
        const hasProducts = products.some(p => p.name.trim() !== '');

        if (!businessName) {
            document.getElementById('businessName').focus();
            return false;
        }

        if (!customerName) {
            document.getElementById('customerName').focus();
            return false;
        }

        if (!hasProducts) {
            showToast('Please add at least one product', 'warning');
            return false;
        }

        return true;
    }

    // Save draft
    async saveDraft() {
        try {
            const data = receiptGenerator.collectFormData();
            
            if (this.currentDraftId) {
                data.id = this.currentDraftId;
                await storage.updateDraft(data);
                showToast('Draft updated successfully!', 'success');
            } else {
                const id = await storage.saveDraft(data);
                this.currentDraftId = id;
                showToast('Draft saved successfully!', 'success');
            }
        } catch (error) {
            console.error('Save draft error:', error);
            showToast('Failed to save draft', 'error');
        }
    }

    // Save template
    async saveTemplate() {
        const name = prompt('Enter template name:');
        
        if (!name || name.trim() === '') {
            showToast('Template name is required', 'warning');
            return;
        }

        try {
            const data = receiptGenerator.collectFormData();
            await storage.saveTemplate(data, name.trim());
            showToast('Template saved successfully!', 'success');
        } catch (error) {
            console.error('Save template error:', error);
            showToast('Failed to save template', 'error');
        }
    }

    // Save to history
    async saveToHistory(data) {
        try {
            await storage.saveToHistory(data);
        } catch (error) {
            console.error('Save to history error:', error);
        }
    }

    // Open drafts modal
    async openDraftsModal() {
        const modal = document.getElementById('draftsModal');
        const listContainer = document.getElementById('draftsList');
        
        try {
            const drafts = await storage.getDrafts();
            
            if (drafts.length === 0) {
                listContainer.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-file-alt"></i>
                        <p>No drafts saved yet</p>
                    </div>
                `;
            } else {
                listContainer.innerHTML = drafts.map(draft => `
                    <div class="list-item">
                        <div class="list-item-info">
                            <h3>${draft.businessName || 'Untitled'} - ${draft.customerName || 'No customer'}</h3>
                            <p>Order: ${draft.orderId || 'N/A'} | ${new Date(draft.timestamp).toLocaleString()}</p>
                        </div>
                        <div class="list-item-actions">
                            <button class="btn btn-primary" onclick="app.loadDraft(${draft.id})">
                                <i class="fas fa-edit"></i> Load
                            </button>
                            <button class="btn btn-secondary" onclick="app.deleteDraft(${draft.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `).join('');
            }
            
            modal.classList.add('active');
        } catch (error) {
            console.error('Load drafts error:', error);
            showToast('Failed to load drafts', 'error');
        }
    }

    // Open templates modal
    async openTemplatesModal() {
        const modal = document.getElementById('templatesModal');
        const listContainer = document.getElementById('templatesList');
        
        try {
            const templates = await storage.getTemplates();
            
            if (templates.length === 0) {
                listContainer.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-layer-group"></i>
                        <p>No templates saved yet</p>
                    </div>
                `;
            } else {
                listContainer.innerHTML = templates.map(template => `
                    <div class="list-item">
                        <div class="list-item-info">
                            <h3>${template.name}</h3>
                            <p>${template.businessName || 'No business'} | ${new Date(template.timestamp).toLocaleString()}</p>
                        </div>
                        <div class="list-item-actions">
                            <button class="btn btn-primary" onclick="app.loadTemplate(${template.id})">
                                <i class="fas fa-copy"></i> Use
                            </button>
                            <button class="btn btn-secondary" onclick="app.deleteTemplate(${template.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `).join('');
            }
            
            modal.classList.add('active');
        } catch (error) {
            console.error('Load templates error:', error);
            showToast('Failed to load templates', 'error');
        }
    }

    // Open history modal
    async openHistoryModal() {
        const modal = document.getElementById('historyModal');
        const listContainer = document.getElementById('historyList');
        
        try {
            const history = await storage.getHistory();
            
            if (history.length === 0) {
                listContainer.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-history"></i>
                        <p>No history yet</p>
                    </div>
                `;
            } else {
                listContainer.innerHTML = history.map(item => `
                    <div class="list-item">
                        <div class="list-item-info">
                            <h3>${item.businessName || 'Untitled'} - ${item.customerName || 'No customer'}</h3>
                            <p>Order: ${item.orderId || 'N/A'} | ${new Date(item.timestamp).toLocaleString()}</p>
                            <p>Total: ${receiptGenerator.formatCurrency(item.grandTotal, item.currency)}</p>
                        </div>
                        <div class="list-item-actions">
                            <button class="btn btn-primary" onclick="app.loadHistory(${item.id})">
                                <i class="fas fa-eye"></i> View
                            </button>
                            <button class="btn btn-secondary" onclick="app.deleteHistory(${item.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `).join('');
            }
            
            modal.classList.add('active');
        } catch (error) {
            console.error('Load history error:', error);
            showToast('Failed to load history', 'error');
        }
    }

    // Load draft
    async loadDraft(id) {
        try {
            const draft = await storage.getById('drafts', id);
            if (draft) {
                this.loadFormData(draft);
                this.currentDraftId = id;
                this.closeModal('draftsModal');
                showToast('Draft loaded successfully!', 'success');
            }
        } catch (error) {
            console.error('Load draft error:', error);
            showToast('Failed to load draft', 'error');
        }
    }

    // Load template
    async loadTemplate(id) {
        try {
            const template = await storage.getById('templates', id);
            if (template) {
                this.loadFormData(template);
                this.currentDraftId = null; // Reset draft ID for templates
                this.closeModal('templatesModal');
                showToast('Template loaded successfully!', 'success');
            }
        } catch (error) {
            console.error('Load template error:', error);
            showToast('Failed to load template', 'error');
        }
    }

    // Load history item
    async loadHistory(id) {
        try {
            const item = await storage.getById('history', id);
            if (item) {
                this.loadFormData(item);
                this.closeModal('historyModal');
                
                // Auto-generate preview
                await this.generatePreview();
            }
        } catch (error) {
            console.error('Load history error:', error);
            showToast('Failed to load history item', 'error');
        }
    }

    // Delete draft
    async deleteDraft(id) {
        if (!confirm('Are you sure you want to delete this draft?')) return;
        
        try {
            await storage.deleteDraft(id);
            showToast('Draft deleted successfully!', 'success');
            this.openDraftsModal(); // Refresh list
        } catch (error) {
            console.error('Delete draft error:', error);
            showToast('Failed to delete draft', 'error');
        }
    }

    // Delete template
    async deleteTemplate(id) {
        if (!confirm('Are you sure you want to delete this template?')) return;
        
        try {
            await storage.deleteTemplate(id);
            showToast('Template deleted successfully!', 'success');
            this.openTemplatesModal(); // Refresh list
        } catch (error) {
            console.error('Delete template error:', error);
            showToast('Failed to delete template', 'error');
        }
    }

    // Delete history item
    async deleteHistory(id) {
        if (!confirm('Are you sure you want to delete this history item?')) return;
        
        try {
            await storage.deleteHistory(id);
            showToast('History item deleted successfully!', 'success');
            this.openHistoryModal(); // Refresh list
        } catch (error) {
            console.error('Delete history error:', error);
            showToast('Failed to delete history item', 'error');
        }
    }

    // Load form data
    loadFormData(data) {
        // Load business info
        if (data.businessLogo) {
            const preview = document.getElementById('logoPreview');
            preview.innerHTML = `<img src="${data.businessLogo}" alt="Business Logo">`;
            preview.classList.remove('hidden');
        }

        document.getElementById('businessName').value = data.businessName || '';
        document.getElementById('businessEmail').value = data.businessEmail || '';
        document.getElementById('businessPhone').value = data.businessPhone || '';
        document.getElementById('businessAddress').value = data.businessAddress || '';
        
        document.getElementById('invoiceTitle').value = data.invoiceTitle || 'INVOICE';
        document.getElementById('orderIdPrefix').value = data.orderIdPrefix || 'ORD';
        document.getElementById('orderId').value = data.orderId || '';
        document.getElementById('orderDate').value = data.orderDate || '';
        document.getElementById('dateFormat').value = data.dateFormat || 'YYYY-MM-DD';
        
        document.getElementById('customerName').value = data.customerName || '';
        document.getElementById('customerEmail').value = data.customerEmail || '';
        document.getElementById('customerPhone').value = data.customerPhone || '';
        document.getElementById('customerAddress').value = data.customerAddress || '';
        
        document.getElementById('receiptStyle').value = data.receiptStyle || 'classic';
        document.getElementById('currency').value = data.currency || 'BDT';
        document.getElementById('paymentMethod').value = data.paymentMethod || '';
        document.getElementById('paymentStatus').value = data.paymentStatus || 'Paid';
        
        document.getElementById('shippingCost').value = data.shippingCost || 0;
        document.getElementById('couponDiscount').value = data.couponDiscount || 0;
        
        document.getElementById('notes').value = data.notes || '';
        document.getElementById('terms').value = data.terms || '';
        
        document.getElementById('includeQR').checked = data.includeQR || false;
        document.getElementById('includeBarcode').checked = data.includeBarcode || false;
        document.getElementById('includeSignature').checked = data.includeSignature || false;

        // Load products
        const tbody = document.getElementById('productsTableBody');
        tbody.innerHTML = '';
        
        if (data.products && data.products.length > 0) {
            data.products.forEach(product => {
                this.addProductRow();
                const row = tbody.lastElementChild;
                row.querySelector('.product-name').value = product.name || '';
                row.querySelector('.product-variation').value = product.variation || '';
                row.querySelector('.product-delivery').value = product.delivery || '';
                row.querySelector('.product-quantity').value = product.quantity || 1;
                row.querySelector('.product-unit-price').value = product.unitPrice || 0;
                row.querySelector('.product-tax').value = product.tax || 0;
                this.updateProductTotal(row);
            });
        } else {
            this.addProductRow();
        }

        // Load signature if exists
        if (data.signatureDataURL && typeof signatureManager !== 'undefined') {
            document.getElementById('includeSignature').checked = true;
            document.getElementById('signatureSection').classList.remove('hidden');
            setTimeout(() => {
                if (!signatureManager.initialized) {
                    signatureManager.init();
                }
                signatureManager.fromDataURL(data.signatureDataURL);
            }, 100);
        }

        this.updateTotals();
    }

    // Close modal
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }
}

// Initialize app
const app = new ReceiptApp();
