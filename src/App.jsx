import React, { useState, useEffect } from 'react';
import { Plus, Trash2, MoveUp, MoveDown, Save, FolderOpen, Download, Upload } from 'lucide-react';

export default function DynamicQRFormBuilder() {
  const [mode, setMode] = useState('fill');
  const [formFields, setFormFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedForms, setSavedForms] = useState([]);
  const [fieldValidations, setFieldValidations] = useState({});
  const [mobileDebug, setMobileDebug] = useState('');

  // Mobile detection and debug
  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const viewportWidth = window.innerWidth;
    const debugInfo = `
      Mobile: ${isMobile ? 'Yes' : 'No'}
      User Agent: ${navigator.userAgent}
      Viewport: ${viewportWidth}px
      Touch: ${'ontouchstart' in window ? 'Yes' : 'No'}
      CSS Touch: ${window.matchMedia('(pointer: coarse)').matches ? 'Yes' : 'No'}
    `;
    setMobileDebug(debugInfo);
    console.log('Mobile Debug:', debugInfo);
  }, []);

  // Initialize from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('deftQR_savedForms');
    if (saved) {
      setSavedForms(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('deftQR_savedForms', JSON.stringify(savedForms));
  }, [savedForms]);

  const addField = () => {
    const fieldNumber = formFields.length + 1;
    const newField = {
      id: Date.now(),
      name: `Field ${fieldNumber}`,
      type: 'text',
      placeholder: `Enter field ${fieldNumber}`,
      required: true,
      minLength: 0,
      maxLength: 100,
      pattern: '',
      patternMessage: ''
    };
    setFormFields([...formFields, newField]);
  };

  const updateField = (id, property, value) => {
    setFormFields(formFields.map(field => 
      field.id === id ? { ...field, [property]: value } : field
    ));
  };

  const deleteField = (id) => {
    setFormFields(formFields.filter(field => field.id !== id));
    const newFormData = { ...formData };
    delete newFormData[id];
    setFormData(newFormData);
  };

  const moveFieldUp = (index) => {
    if (index === 0) return;
    const newFields = [...formFields];
    [newFields[index - 1], newFields[index]] = [newFields[index], newFields[index - 1]];
    setFormFields(newFields);
  };

  const moveFieldDown = (index) => {
    if (index === formFields.length - 1) return;
    const newFields = [...formFields];
    [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
    setFormFields(newFields);
  };

  const validateField = (fieldId, value, fieldConfig) => {
    const errors = [];
    if (fieldConfig.required && (!value || value.trim() === '')) {
      errors.push('This field is required');
    }
    if (value) {
      if (fieldConfig.minLength > 0 && value.length < fieldConfig.minLength) {
        errors.push(`Minimum ${fieldConfig.minLength} characters required`);
      }
      if (fieldConfig.maxLength > 0 && value.length > fieldConfig.maxLength) {
        errors.push(`Maximum ${fieldConfig.maxLength} characters allowed`);
      }
      if (fieldConfig.pattern && !new RegExp(fieldConfig.pattern).test(value)) {
        errors.push(fieldConfig.patternMessage || 'Invalid format');
      }
      if (fieldConfig.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors.push('Please enter a valid email address');
      }
      if (fieldConfig.type === 'url' && !/^https?:\/\/.+\..+/.test(value)) {
        errors.push('Please enter a valid URL (include http:// or https://)');
      }
      if (fieldConfig.type === 'number' && isNaN(value)) {
        errors.push('Please enter a valid number');
      }
    }
    return errors;
  };

  const updateFormData = (fieldId, value) => {
    setFormData({ ...formData, [fieldId]: value });
    const fieldConfig = formFields.find(f => f.id === fieldId);
    if (fieldConfig) {
      const errors = validateField(fieldId, value, fieldConfig);
      setFieldValidations(prev => ({
        ...prev,
        [fieldId]: errors
      }));
    }
  };

  const getCurrentLocation = (fieldId) => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = `${position.coords.latitude}, ${position.coords.longitude}`;
        updateFormData(fieldId, location);
      },
      (error) => {
        alert('Unable to retrieve your location: ' + error.message);
      }
    );
  };

  const switchToFillMode = () => {
    if (formFields.length === 0) {
      addField();
    }
    const updatedFields = formFields.map((field, index) => {
      if (!field.name.trim()) {
        return { ...field, name: `Field ${index + 1}` };
      }
      return field;
    });
    if (updatedFields !== formFields) {
      setFormFields(updatedFields);
    }
    setMode('fill');
    setFieldValidations({});
  };

  const saveForm = () => {
    if (formFields.length === 0) {
      alert('Please add fields to the form before saving');
      return;
    }
    const formName = prompt('Enter a name for this form:');
    if (!formName) return;
    const formTemplate = {
      id: Date.now(),
      name: formName,
      fields: formFields,
      createdAt: new Date().toISOString()
    };
    setSavedForms(prev => [...prev, formTemplate]);
    alert(`Form "${formName}" saved successfully!`);
  };

  const loadForm = (formTemplate) => {
    if (confirm(`Load form "${formTemplate.name}"? This will replace your current form.`)) {
      setFormFields(formTemplate.fields);
      setFormData({});
      setQrCodeDataUrl('');
      setMode('build');
    }
  };

  const deleteSavedForm = (formId, e) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this saved form?')) {
      setSavedForms(prev => prev.filter(form => form.id !== formId));
    }
  };

  const exportForm = () => {
    const formTemplate = {
      name: `Exported Form ${new Date().toLocaleDateString()}`,
      fields: formFields,
      exportedAt: new Date().toISOString()
    };
    const dataStr = JSON.stringify(formTemplate, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.download = `deftqr_form_${Date.now()}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importForm = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const formTemplate = JSON.parse(e.target.result);
        if (formTemplate.fields && Array.isArray(formTemplate.fields)) {
          setFormFields(formTemplate.fields);
          setFormData({});
          setQrCodeDataUrl('');
          setMode('build');
          alert('Form imported successfully!');
        } else {
          throw new Error('Invalid form template');
        }
      } catch (error) {
        alert('Error importing form: Invalid file format');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const generateQRCode = async () => {
    const validationErrors = Object.values(fieldValidations).flat();
    const missingFields = formFields.filter(field => 
      field.required && !formData[field.id]?.trim()
    );
    if (missingFields.length > 0 || validationErrors.length > 0) {
      alert(`Please fix all validation errors before generating QR code.`);
      return;
    }
    setIsGenerating(true);
    const now = new Date();
    const qrData = {
      generatedAt: now.toISOString(),
      readableTime: now.toLocaleString('en-NG', { 
        timeZone: 'Africa/Lagos',
        dateStyle: 'medium',
        timeStyle: 'medium'
      })
    };
    formFields.forEach(field => {
      if (formData[field.id]) {
        qrData[field.name] = formData[field.id];
      }
    });
    const qrDataString = JSON.stringify(qrData, null, 2);
    try {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
      script.onload = () => {
        const tempDiv = document.createElement('div');
        tempDiv.style.display = 'none';
        document.body.appendChild(tempDiv);
        const qr = new window.QRCode(tempDiv, {
          text: qrDataString,
          width: 300,
          height: 300,
          colorDark: '#000000',
          colorLight: '#ffffff',
          correctLevel: window.QRCode.CorrectLevel.H
        });
        setTimeout(() => {
          const img = tempDiv.querySelector('img');
          if (img) {
            setQrCodeDataUrl(img.src);
          } else {
            const canvas = tempDiv.querySelector('canvas');
            if (canvas) {
              setQrCodeDataUrl(canvas.toDataURL());
            }
          }
          document.body.removeChild(tempDiv);
          setIsGenerating(false);
        }, 100);
      };
      script.onerror = () => {
        alert('Failed to load QR code library');
        setIsGenerating(false);
      };
      document.head.appendChild(script);
    } catch (err) {
      console.error('Error generating QR code:', err);
      alert('Failed to generate QR code');
      setIsGenerating(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = 400;
      canvas.height = 450;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 50, 50, 300, 300);
      ctx.fillStyle = '#4c1d95';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Deft QR Code Generator', canvas.width / 2, 380);
      ctx.fillStyle = '#6b7280';
      ctx.font = '14px Arial';
      ctx.fillText('by Deftmind Technology and Media Ventures', canvas.width / 2, 405);
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `deft_qr_code_${Date.now()}.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      });
    };
    img.src = qrCodeDataUrl;
  };

  const resetAll = () => {
    setFormData({});
    setQrCodeDataUrl('');
    setFieldValidations({});
  };

  const getCharacterCount = (fieldId) => {
    const value = formData[fieldId] || '';
    const fieldConfig = formFields.find(f => f.id === fieldId);
    if (!fieldConfig || (!fieldConfig.maxLength && !fieldConfig.minLength)) return null;
    return (
      <div className={`text-xs mt-1 ${
        fieldConfig.maxLength && value.length > fieldConfig.maxLength ? 'text-red-600' : 
        fieldConfig.minLength && value.length < fieldConfig.minLength ? 'text-yellow-600' : 'text-gray-500'
      }`}>
        {value.length}
        {fieldConfig.maxLength ? ` / ${fieldConfig.maxLength}` : ''}
        {fieldConfig.minLength ? ` (min: ${fieldConfig.minLength})` : ''}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-3 sm:p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Mobile Debug Info - Remove this after testing */}
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 p-3 rounded mb-4 text-xs">
          <strong>Mobile Debug Info:</strong>
          <pre className="whitespace-pre-wrap mt-1">{mobileDebug}</pre>
          <button 
            onClick={() => alert(`Screen: ${window.innerWidth}x${window.innerHeight}\nTouch: ${'ontouchstart' in window}`)}
            className="mt-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs"
          >
            Test Touch
          </button>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-3 sm:p-4 md:p-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2 text-center">
            Dynamic QR Form Builder
          </h1>
          <p className="text-gray-600 mb-4 sm:mb-6 text-xs sm:text-sm text-center">
            {mode === 'build' 
              ? 'Create your custom form fields, then fill and generate QR codes'
              : 'Fill in the form to generate a QR code with your data'}
          </p>

          {/* Mode Toggle */}
          <div className="flex flex-col xs:flex-row gap-2 mb-4 sm:mb-6">
            <button
              onClick={() => setMode('build')}
              className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base ${
                mode === 'build' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Build Form
            </button>
            <button
              onClick={switchToFillMode}
              className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base ${
                mode === 'fill' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Fill & Generate
            </button>
          </div>

          {/* Rest of your existing JSX remains the same but with mobile-optimized classes */}
          {/* I'm shortening this for brevity, but you should keep your existing structure */}
          {/* Just ensure all padding, margins, and fonts use responsive classes */}
          
          {/* Form Management Bar */}
          {mode === 'build' && (
            <div className="flex flex-col xs:flex-row gap-2 mb-4 sm:mb-6 p-3 bg-gray-50 rounded-lg">
              <button
                onClick={saveForm}
                className="flex items-center justify-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm flex-1"
              >
                <Save size={14} />
                Save Form
              </button>
              
              <label className="flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm flex-1 cursor-pointer">
                <Upload size={14} />
                Import Form
                <input
                  type="file"
                  accept=".json"
                  onChange={importForm}
                  className="hidden"
                />
              </label>
              
              <button
                onClick={exportForm}
                className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-sm flex-1"
              >
                <Download size={14} />
                Export Form
              </button>
            </div>
          )}

          {/* FILL MODE - Simplified for testing */}
          {mode === 'fill' && (
            <div className="space-y-4">
              {formFields.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 mb-3 text-sm">No form fields yet.</p>
                  <button
                    onClick={addField}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm"
                  >
                    Add Your First Field
                  </button>
                </div>
              ) : (
                formFields.slice(0, 2).map((field) => ( // Show only 2 fields for testing
                  <div key={field.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.name}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    
                    {field.type === 'location' ? (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={formData[field.id] || ''}
                          onChange={(e) => updateFormData(field.id, e.target.value)}
                          placeholder="Click button to get location"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => getCurrentLocation(field.id)}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:w-auto w-full"
                        >
                          📍 Get Location
                        </button>
                      </div>
                    ) : (
                      <input
                        type={field.type}
                        value={formData[field.id] || ''}
                        onChange={(e) => updateFormData(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                      />
                    )}
                  </div>
                ))
              )}

              {formFields.length > 0 && (
                <button
                  onClick={generateQRCode}
                  disabled={isGenerating}
                  className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:bg-purple-400 text-sm"
                >
                  {isGenerating ? 'Generating...' : 'Generate QR Code'}
                </button>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <footer className="mt-6 sm:mt-8 text-center text-gray-700">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg sm:rounded-xl p-4 border border-purple-200">
            <div className="max-w-md mx-auto">
              <p className="text-sm sm:text-base font-semibold text-gray-800 mb-2">
                Deftmind Technology and Media Ventures
              </p>
              <p className="text-xs text-gray-600 mb-2">
                Innovative solutions for the digital age
              </p>
              <p className="text-xs text-gray-500 mb-3">
                Copyright © {new Date().getFullYear()}. All rights reserved.
              </p>
              <a 
                href="https://deftmindai.com/welcome-to-deftmind-technology-and-media-ventures/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-xs font-semibold"
              >
                Learn More About Us
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
