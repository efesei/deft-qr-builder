# Deft QR Builder

A powerful React application for building custom dynamic forms and generating QR codes with embedded data. Perfect for data collection, digital forms, and quick information sharing.

![Deft QR Builder](https://img.shields.io/badge/React-18.2.0-blue) ![Vite](https://img.shields.io/badge/Vite-4.4.5-purple) ![Tailwind](https://img.shields.io/badge/Tailwind-3.3.0-cyan)

## 🚀 Features

### Form Building
- **Dynamic Form Builder** - Create custom forms with drag-and-drop field management
- **Multiple Field Types** - Text, number, email, phone, date, URL, location, and long text
- **Advanced Validation** - Required fields, min/max length, custom regex patterns
- **Real-time Validation** - Instant feedback with custom error messages

### QR Generation
- **Smart QR Codes** - Embed form data directly into QR codes
- **Branded Downloads** - Custom branded QR code images with metadata
- **Location Integration** - Automatic GPS coordinate capture
- **Data Preview** - Review all embedded data before generation

### Form Management
- **Save/Load Forms** - Create form templates for repeated use
- **Import/Export** - Share form templates as JSON files
- **Field Reordering** - Drag to rearrange form fields
- **PWA Support** - Works offline and can be installed as an app

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/deft-qr-builder.git
   cd deft-qr-builder
Install dependencies

bash
npm install
Start development server

bash
npm run dev
Open your browser
Navigate to http://localhost:5173

Build for Production
bash
npm run build
npm run preview
📖 How to Use
1. Build Your Form
Click "Build Form" to enter form creation mode

Add fields using the "Add Field" button

Configure each field:

Name: Descriptive label for the field

Type: Choose from text, number, email, etc.

Validation: Set requirements, length limits, patterns

Placeholder: Help text for users

2. Save Your Form Template
Use "Save Form" to store your form design

Forms are saved locally and can be loaded later

Export/Import forms as JSON files for sharing

3. Fill & Generate
Switch to "Fill & Generate" mode

Fill out the form with actual data

Use location button for automatic GPS coordinates

Click "Generate QR Code" to create your QR

4. Download & Use
Download branded QR code images

QR codes contain all form data in JSON format

Use for data collection, digital forms, or quick info sharing

🎯 Use Cases
Field Data Collection - Construction sites, inspections, surveys

Digital Business Cards - Contact information in QR format

Event Registration - Quick attendee data capture

Inventory Management - Product information and locations

Educational Tools - Student data, attendance, assignments

🏗️ Project Structure
text
deft-qr-builder/
├── src/
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # React entry point
│   └── index.css        # Global styles with Tailwind
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── postcss.config.js    # PostCSS configuration
🔧 Technologies Used
Frontend Framework: React 18.2.0

Build Tool: Vite 4.4.5

Styling: Tailwind CSS 3.3.0

Icons: Lucide React

QR Generation: QRCode.js

Package Manager: npm

📦 Available Scripts
npm run dev - Start development server

npm run build - Build for production

npm run preview - Preview production build

npm install - Install dependencies

🎨 Customization
Styling
The app uses Tailwind CSS for styling. Modify tailwind.config.js to customize:

Color scheme

Typography

Spacing

Component styles

Field Types
Add new field types by extending the type options in the form builder section of App.jsx.

Validation
Custom validation rules can be added in the validateField function in App.jsx.

🔒 Data Privacy
All form data is processed locally in the browser

No data is sent to external servers

QR codes contain only the data you explicitly enter

Form templates are stored in browser localStorage

🌐 Browser Support
Chrome/Edge 90+

Firefox 88+

Safari 14+

Mobile browsers (iOS Safari, Chrome Mobile)

🤝 Contributing
Fork the repository

Create a feature branch (git checkout -b feature/amazing-feature)

Commit your changes (git commit -m 'Add amazing feature')

Push to the branch (git push origin feature/amazing-feature)

Open a Pull Request

📝 License
This project is licensed under the MIT License - see the LICENSE file for details.

🐛 Troubleshooting
Common Issues
QR Code not generating?

Check that all required fields are filled

Ensure there are no validation errors

Try refreshing the page

Form not saving?

Check browser localStorage is enabled

Ensure all fields have names

Build errors?

Clear node_modules and reinstall: rm -rf node_modules && npm install

Ensure Node.js version is 14+

Getting Help
Check the browser console for error messages

Verify all dependencies are installed

Ensure you're using a supported browser

🙏 Acknowledgments
Built with Vite

Styled with Tailwind CSS

Icons by Lucide

QR Generation by QRCode.js

Deft QR Builder - Simplifying data collection through dynamic forms and QR technology

Built by Deftmind Technology and Media Ventures:Making technology work for everyone!