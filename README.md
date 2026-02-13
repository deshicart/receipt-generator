# Receipt Generator - Professional Invoice Creator

A fully functional, AI-optimized, high-performance **Receipt / Invoice Generator Web Application** that works **100% offline** after initial load. Built with modern web technologies (HTML, CSS, JavaScript) and designed as a Progressive Web App (PWA).

## 🚀 Features

### Core Features
- **3 Receipt Styles**: Classic Professional, Modern Compact, and Thermal/POS
- **100% Offline**: Full functionality without internet after first load
- **PWA Support**: Install as mobile or desktop app
- **Multi-language**: Supports both Bangla (Hind Siliguri) and English (Poppins) fonts
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop

### Business & Customer Management
- Business logo upload with preview
- Complete business information (name, email, phone, address)
- Customer details management
- Auto-generated or manual Order IDs
- Customizable date formats

### Product Management
- Dynamic product rows (add/remove as needed)
- Product variations (size, color, model)
- Delivery type selection
- Quantity, unit price, and tax per product
- Real-time total calculations

### Pricing & Payments
- Automatic subtotal calculation
- Shipping cost input
- Tax calculation per product
- Coupon discount support
- Multiple payment methods (Cash, Card, Mobile Banking, Bank Transfer, Online Payment)
- Payment status tracking (Paid, Unpaid, Partial)
- Multiple currency support (BDT ৳, USD $, EUR €, GBP £, INR ₹)

### Advanced Features
- **QR Code Generation**: Embed receipt data in QR codes
- **Barcode Generation**: Generate barcodes for order IDs
- **Digital Signature**: Canvas-based signature pad
- **PDF Export**: High-quality PDF download
- **Print Support**: One-click printing with optimized layouts
- **Draft System**: Save incomplete receipts for later editing
- **Template System**: Save receipts as reusable templates
- **Receipt History**: View and regenerate past receipts

### Data Management
- **IndexedDB Storage**: Efficient local data storage
- **LocalStorage Fallback**: Works even if IndexedDB is unavailable
- Complete offline data persistence
- Import/Export functionality via drafts and templates

## 📱 Installation

### Option 1: Use Online (GitHub Pages)
Simply visit the deployed URL and start using immediately. The app will cache itself for offline use.

### Option 2: Install as PWA
1. Visit the app in a supported browser (Chrome, Edge, Safari, Firefox)
2. Look for the "Install" prompt or option in the browser menu
3. Click "Install" to add the app to your device
4. Launch from your home screen or app drawer

### Option 3: Self-Host
1. Clone this repository
2. Serve the files using any static web server:
   ```bash
   # Using Python
   python3 -m http.server 8000
   
   # Using Node.js
   npx serve
   
   # Using PHP
   php -S localhost:8000
   ```
3. Open `http://localhost:8000` in your browser

## 🎨 Receipt Styles

### Classic Professional Invoice
- Traditional invoice layout
- Structured business header
- Detailed product table
- Professional presentation
- Best for: Formal business invoices

### Modern Compact Receipt
- Card-based design
- Gradient background
- Simplified layout
- Mobile-optimized
- Best for: Modern businesses, retail

### Thermal / POS Receipt
- Narrow format (80mm width)
- Optimized for thermal printers
- Monospace font
- Minimalist design
- Best for: Point of sale systems, receipt printers

## 🛠️ Technologies Used

- **HTML5**: Semantic markup structure
- **CSS3**: Modern styling with flexbox, grid, animations
- **JavaScript (ES6+)**: Modern JavaScript features
- **IndexedDB**: Client-side database
- **Service Workers**: Offline functionality
- **Web App Manifest**: PWA configuration

### External Libraries (CDN)
- **html2pdf.js**: PDF generation
- **QRCode.js**: QR code generation
- **JsBarcode**: Barcode generation
- **Signature Pad**: Digital signature functionality
- **Font Awesome**: Icons
- **Google Fonts**: Hind Siliguri (Bangla) + Poppins (English)

## 📖 Usage Guide

### Creating a Receipt

1. **Enter Business Information**
   - Upload your business logo (optional)
   - Fill in business name (required)
   - Add contact details

2. **Fill Invoice Details**
   - Set invoice title
   - Generate or enter order ID
   - Select date and format
   - Choose currency

3. **Add Customer Information**
   - Enter customer name (required)
   - Add contact details

4. **Add Products**
   - Click "Add Product" to add items
   - Fill in product details
   - Quantities and prices update automatically

5. **Configure Additional Settings**
   - Choose receipt style
   - Set payment method and status
   - Add shipping costs or discounts
   - Enable QR code/barcode if needed
   - Add signature if required

6. **Generate and Export**
   - Click "Preview Receipt" to see the result
   - Download as PDF or print directly
   - Receipt automatically saves to history

### Managing Drafts

- Click **"Save as Draft"** to save incomplete work
- Access drafts from the **Drafts** button in header
- Load, edit, or delete saved drafts

### Using Templates

- Create reusable receipt templates with common data
- Click **"Save as Template"** and provide a name
- Load templates from **Templates** button
- Customize template data for each new receipt

### Viewing History

- All generated receipts are automatically saved
- Access history from **History** button
- View, regenerate, or delete past receipts

## 🔒 Privacy & Security

- **100% Local**: All data stays on your device
- **No Server**: No data is sent to external servers
- **No Tracking**: No analytics or tracking
- **Secure Storage**: Data encrypted by browser's IndexedDB

## 🌐 Browser Support

- **Chrome/Edge**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: Full support (iOS 11.3+)
- **Opera**: Full support
- **Mobile Browsers**: Optimized for mobile use

## 📱 Offline Functionality

After the first load:
- Generate unlimited receipts offline
- Save drafts and templates locally
- Access full history without internet
- Export PDFs offline
- All features work without connectivity

## 🎯 Use Cases

- Small businesses and shops
- Freelancers and consultants
- Market vendors
- Service providers
- E-commerce sellers
- Event organizers
- Any business needing professional invoices

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Font Awesome for icons
- Google Fonts for typography
- All open-source library contributors

## 📞 Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Made with ❤️ for businesses worldwide**
