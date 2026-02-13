// Signature pad functionality
class SignatureManager {
    constructor() {
        this.canvas = null;
        this.signaturePad = null;
        this.initialized = false;
    }

    // Initialize signature pad
    init() {
        this.canvas = document.getElementById('signatureCanvas');
        
        if (!this.canvas) {
            console.error('Signature canvas not found');
            return;
        }

        // Set canvas size
        this.resizeCanvas();

        // Initialize SignaturePad
        if (typeof SignaturePad !== 'undefined') {
            this.signaturePad = new SignaturePad(this.canvas, {
                backgroundColor: 'rgb(255, 255, 255)',
                penColor: 'rgb(0, 0, 0)',
                minWidth: 1,
                maxWidth: 2.5,
                velocityFilterWeight: 0.7
            });
            this.initialized = true;
        } else {
            console.error('SignaturePad library not loaded');
        }

        // Add clear button listener
        const clearBtn = document.getElementById('clearSignature');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clear());
        }

        // Handle window resize
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    // Resize canvas to fit container
    resizeCanvas() {
        if (!this.canvas) return;

        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        const container = this.canvas.parentElement;
        
        // Set canvas size based on container
        this.canvas.width = container.offsetWidth * ratio;
        this.canvas.height = 200 * ratio;
        this.canvas.style.width = container.offsetWidth + 'px';
        this.canvas.style.height = '200px';
        
        const context = this.canvas.getContext('2d');
        context.scale(ratio, ratio);

        // If signature pad exists, clear and reinitialize
        if (this.signaturePad) {
            this.signaturePad.clear();
        }
    }

    // Clear signature
    clear() {
        if (this.signaturePad) {
            this.signaturePad.clear();
        }
    }

    // Check if signature is empty
    isEmpty() {
        return this.signaturePad ? this.signaturePad.isEmpty() : true;
    }

    // Get signature as data URL
    getDataURL(type = 'image/png') {
        if (!this.signaturePad || this.signaturePad.isEmpty()) {
            return null;
        }
        return this.signaturePad.toDataURL(type);
    }

    // Set signature from data URL
    fromDataURL(dataURL) {
        if (this.signaturePad && dataURL) {
            this.signaturePad.fromDataURL(dataURL);
        }
    }

    // Get signature as SVG
    toSVG() {
        if (!this.signaturePad || this.signaturePad.isEmpty()) {
            return null;
        }
        return this.signaturePad.toSVG();
    }

    // Enable signature pad
    enable() {
        if (this.signaturePad) {
            this.signaturePad.on();
        }
    }

    // Disable signature pad
    disable() {
        if (this.signaturePad) {
            this.signaturePad.off();
        }
    }
}

// Initialize signature manager
const signatureManager = new SignatureManager();

// Wait for DOM to be ready before initializing
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Initialize when signature checkbox is checked
        const includeSignatureCheckbox = document.getElementById('includeSignature');
        if (includeSignatureCheckbox) {
            includeSignatureCheckbox.addEventListener('change', (e) => {
                const signatureSection = document.getElementById('signatureSection');
                if (signatureSection) {
                    if (e.target.checked) {
                        signatureSection.classList.remove('hidden');
                        if (!signatureManager.initialized) {
                            signatureManager.init();
                        }
                    } else {
                        signatureSection.classList.add('hidden');
                    }
                }
            });
        }
    });
}
