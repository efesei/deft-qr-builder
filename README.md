🚀 Deft QR Form Builder
A powerful, feature-rich React application for building custom forms and generating dynamic QR codes with encoded data. Create, customize, and deploy forms in minutes!
Show Image
Show Image
Show Image
Show Image
✨ Features
🏗️ Form Building

8+ Field Types: Text, Number, Email, Phone, Date, URL, Location, Long Text
Drag & Drop Reordering: Easily rearrange form fields
Custom Validation: Required fields, min/max length, regex patterns
Real-time Preview: See changes as you build

🔳 QR Generation

Dynamic QR Codes: Encode form data into scannable QR codes
Branded Downloads: Professional QR codes with your branding
JSON Data Storage: All form data stored in QR code as structured JSON
Timestamp Included: Automatic generation time tracking

📱 Advanced Features

GPS Integration: Automatic location detection for location fields
Form Templates: Save, load, and reuse form designs
PWA Ready: Install as app and work offline
Responsive Design: Works perfectly on all devices

🛠️ Developer Experience

Modern Stack: React 18, Vite, Tailwind CSS
Type Safety: Full TypeScript support (optional)
Custom Hooks: Reusable logic for forms and validation
Local Storage: Forms saved automatically in browser

🏗️ Project Structure
deft-qr-builder/
├── public/                     # Static files
│   ├── index.html
│   ├── manifest.json          # PWA configuration
│   └── sw.js                  # Service worker
├── src/
│   ├── components/            # React components
│   │   └── DynamicQRFormBuilder.js
│   ├── hooks/                 # Custom React hooks
│   │   ├── useLocalStorage.js
│   │   └── useGeolocation.js
│   ├── utils/                 # Utility functions
│   │   ├── validation.js
│   │   ├── storage.js
│   │   └── qrGenerator.js
│   ├── App.jsx                # Main app component
│   ├── main.jsx               # App entry point
│   └── index.css              # Global styles
├── package.json
├── vite.config.js             # Vite configuration
├── tailwind.config.js         # Tailwind CSS configuration
└── README.md
🚀 Quick Start
Prerequisites

Node.js 16+
npm or yarn
Modern web browser

Installation

Clone the repository

bash   git clone https://github.com/efesei/deft-qr-builder.git
   cd deft-qr-builder

Install dependencies

bash   npm install

Start development server

bash   npm run dev

Open your browser
Navigate to http://localhost:5173

Building for Production
bash# Create production build
npm run build

# Preview production build
npm run preview
💡 Usage Guide
1. Building Forms

Click "Build Form" mode
Add fields using the "Add Field" button
Configure each field: name, type, validation rules
Reorder fields with up/down arrows
Save your form template for later use

2. Filling & Generating

Switch to "Fill & Generate" mode
Fill out your form with actual data
Use location detection for GPS coordinates
Click "Generate QR Code" to create your QR code

3. Download & Use

Download branded QR codes with your data
Scan with any QR code reader to view encoded information
Data includes timestamps and field values

🛠️ Technology Stack
TechnologyPurposeReact 18UI FrameworkViteBuild Tool & Dev ServerTailwind CSSStyling & Design SystemLucide ReactIconsQRCode.jsQR Code GenerationPWAOffline Capability
🎯 Use Cases
📋 Business Applications

Event Registration: Collect attendee information
Contact Forms: Business cards with dynamic data
Product Labels: Encode product information
Inventory Management: Track items with QR codes

🎓 Educational

Student Forms: Enrollment and information collection
Library Systems: Book tracking and management
Attendance Systems: Event and class check-ins

🏥 Healthcare

Patient Intake: Medical history forms
Appointment Systems: Check-in and information capture
Medical Records: Secure data encoding

🔧 Configuration
Environment Variables
Create a .env file for customization:
envVITE_APP_NAME="Deft QR Builder"
VITE_APP_VERSION=1.0.0
VITE_DEFAULT_TIMEZONE=Africa/Lagos
Custom Styling
Modify tailwind.config.js for brand colors:
javascripttheme: {
  extend: {
    colors: {
      brand: {
        primary: '#4C1D95',
        secondary: '#7C3AED',
      }
    }
  }
}
🤝 Contributing
We love contributions! Here's how to help:

Fork the repository
Create a feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request

Development Guidelines

Follow React best practices
Use meaningful commit messages
Test on multiple devices
Ensure responsive design

🐛 Troubleshooting
Common Issues
QR Code Not Generating

Check browser console for errors
Ensure all required fields are filled
Verify QR code library loaded correctly

Location Detection Failing

Ensure HTTPS connection
Grant location permissions
Check browser compatibility

Form Not Saving

Clear browser storage and retry
Check available storage space
Verify no validation errors

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
🙏 Acknowledgments

React Team for the amazing framework
Vite Team for the fast build tool
Tailwind CSS for the utility-first CSS framework
Lucide for the beautiful icons

📞 Support

Issues: GitHub Issues
Email: samuel1.abiona@gmail.com
Documentation: Project Wiki


<div align="center">
Built with ❤️ by Deftmind Technology and Media Ventures
...making technology work for everyone!
</div>
