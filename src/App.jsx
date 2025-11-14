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
          width: 250,
          height: 250,
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
      canvas.width = 350;
      canvas.height = 400;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 25, 25, 300, 300);
      ctx.fillStyle = '#4c1d95';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Deft QR Code Generator', canvas.width / 2, 345);
      ctx.fillStyle = '#6b7280';
      ctx.font = '12px Arial';
      ctx.fillText('by Deftmind Technology and Media Ventures', canvas.width / 2, 365);
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 px-2 py-3">
      <div className="max-w-full mx-auto">
        <div className="bg-white rounded-lg shadow-md p-3">
          <h1 className="text-xl font-bold text-gray-800 mb-2 text-center">
            Dynamic QR Form Builder
          </h1>
          <p className="text-gray-600 mb-4 text-xs text-center">
            {mode === 'build' 
              ? 'Create custom forms and generate QR codes'
              : 'Fill the form to generate QR code with data'}
          </p>

          {/* Mode Toggle */}
          <div className="flex flex-col gap-2 mb-4">
            <button
              onClick={() => setMode('build')}
              className={`px-4 py-3 rounded-lg font-semibold transition-colors text-sm ${
                mode === 'build' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Build Form
            </button>
            <button
              onClick={switchToFillMode}
              className={`px-4 py-3 rounded-lg font-semibold transition-colors text-sm ${
                mode === 'fill' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Fill & Generate
            </button>
          </div>

          {/* Form Management Bar */}
          {mode === 'build' && (
            <div className="flex flex-col gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
              <button
                onClick={saveForm}
                className="flex items-center justify-center gap-2 bg-green-600 text-white px-3 py-3 rounded-lg font-semibold text-sm"
              >
                <Save size={16} />
                Save Form
              </button>
              
              <label className="flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-3 rounded-lg font-semibold text-sm cursor-pointer">
                <Upload size={16} />
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
                className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-3 py-3 rounded-lg font-semibold text-sm"
              >
                <Download size={16} />
                Export Form
              </button>
            </div>
          )}

          {/* Saved Forms Panel */}
          {mode === 'build' && savedForms.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-700 mb-2 text-sm">Saved Forms:</h3>
              <div className="grid grid-cols-1 gap-2">
                {savedForms.map((form) => (
                  <div
                    key={form.id}
                    onClick={() => loadForm(form)}
                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <FolderOpen size={16} className="text-blue-600" />
                      <span className="text-sm">{form.name}</span>
                      <span className="text-xs text-gray-500">
                        ({form.fields.length} fields)
                      </span>
                    </div>
                    <button
                      onClick={(e) => deleteSavedForm(form.id, e)}
                      className="p-1 text-red-600 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BUILD MODE */}
          {mode === 'build' && (
            <div className="space-y-3">
              {formFields.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <p className="text-gray-500 mb-3 text-sm">No fields yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {formFields.map((field, index) => (
                    <div key={field.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => moveFieldUp(index)}
                            disabled={index === 0}
                            className="p-1 bg-white rounded disabled:opacity-30"
                          >
                            <MoveUp size={14} />
                          </button>
                          <button
                            onClick={() => moveFieldDown(index)}
                            disabled={index === formFields.length - 1}
                            className="p-1 bg-white rounded disabled:opacity-30"
                          >
                            <MoveDown size={14} />
                          </button>
                        </div>
                        <div className="flex-1 grid grid-cols-1 gap-2">
                          <input
                            type="text"
                            value={field.name}
                            onChange={(e) => updateField(field.id, 'name', e.target.value)}
                            placeholder="Field Name"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                          />
                          <select
                            value={field.type}
                            onChange={(e) => updateField(field.id, 'type', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                          >
                            <option value="text">Text</option>
                            <option value="number">Number</option>
                            <option value="email">Email</option>
                            <option value="tel">Phone</option>
                            <option value="date">Date</option>
                            <option value="textarea">Long Text</option>
                            <option value="url">URL</option>
                            <option value="location">Location</option>
                          </select>
                        </div>
                        <button
                          onClick={() => deleteField(field.id)}
                          className="p-2 text-red-600 bg-white rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-2 mb-3">
                        <input
                          type="text"
                          value={field.placeholder}
                          onChange={(e) => updateField(field.id, 'placeholder', e.target.value)}
                          placeholder="Placeholder text"
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                        />
                        <label className="flex items-center gap-2 px-3 py-2">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => updateField(field.id, 'required', e.target.checked)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-gray-700">Required</span>
                        </label>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Min Length</label>
                          <input
                            type="number"
                            min="0"
                            value={field.minLength}
                            onChange={(e) => updateField(field.id, 'minLength', parseInt(e.target.value) || 0)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Max Length</label>
                          <input
                            type="number"
                            min="0"
                            value={field.maxLength}
                            onChange={(e) => updateField(field.id, 'maxLength', parseInt(e.target.value) || 0)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={addField}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold text-sm"
              >
                <Plus size={16} />
                Add Field
              </button>
            </div>
          )}

          {/* FILL MODE */}
          {mode === 'fill' && (
            <div className="space-y-4">
              {formFields.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 mb-3 text-sm">No form fields yet.</p>
                  <button
                    onClick={addField}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Add Your First Field
                  </button>
                </div>
              ) : (
                formFields.map((field) => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.name}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    
                    {field.type === 'location' ? (
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          value={formData[field.id] || ''}
                          onChange={(e) => updateFormData(field.id, e.target.value)}
                          placeholder="Click button to get location"
                          className="flex-1 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => getCurrentLocation(field.id)}
                          className="px-3 py-3 bg-blue-600 text-white rounded-lg text-sm w-full"
                        >
                          📍 Get Location
                        </button>
                      </div>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        value={formData[field.id] || ''}
                        onChange={(e) => updateFormData(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        rows={3}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                      />
                    ) : (
                      <input
                        type={field.type}
                        value={formData[field.id] || ''}
                        onChange={(e) => updateFormData(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm ${
                          fieldValidations[field.id]?.length > 0 
                            ? 'border-red-500 bg-red-50' 
                            : 'border-gray-300'
                        }`}
                      />
                    )}

                    {getCharacterCount(field.id)}

                    {fieldValidations[field.id]?.map((error, index) => (
                      <p key={index} className="text-red-600 text-xs mt-1">
                        ⚠️ {error}
                      </p>
                    ))}
                  </div>
                ))
              )}

              {formFields.length > 0 && (
                <button
                  onClick={generateQRCode}
                  disabled={isGenerating}
                  className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold disabled:bg-purple-400 text-sm"
                >
                  {isGenerating ? 'Generating...' : 'Generate QR Code'}
                </button>
              )}
            </div>
          )}

          {/* QR Code Display */}
          {qrCodeDataUrl && (
            <div className="mt-6 border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                Generated QR Code
              </h2>
              
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <img 
                  src={qrCodeDataUrl} 
                  alt="Generated QR Code" 
                  className="mx-auto mb-4 border-4 border-white shadow-lg w-64 h-64"
                />
                
                <div className="text-xs text-gray-600 mb-4 text-left bg-white p-3 rounded border max-h-48 overflow-y-auto">
                  {formFields.map(field => (
                    formData[field.id] && (
                      <p key={field.id} className="break-words mb-1">
                        <strong>{field.name}:</strong> {formData[field.id]}
                      </p>
                    )
                  ))}
                  <p className="mt-2 pt-2 border-t text-xs">
                    <strong>Generated:</strong> {new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={downloadQRCode}
                    className="bg-green-600 text-white py-2 px-4 rounded-lg font-semibold text-sm"
                  >
                    Download QR Code
                  </button>
                  <button
                    onClick={resetAll}
                    className="bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold text-sm"
                  >
                    Create Another
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-4 bg-white rounded-lg shadow p-3">
          <h3 className="font-semibold text-gray-800 mb-2 text-sm">📋 How to use:</h3>
          <ol className="list-decimal list-inside space-y-1 text-gray-700 text-xs">
            <li><strong>Build Form:</strong> Add custom fields with validation rules</li>
            <li><strong>Save/Load:</strong> Save form templates for later use</li>
            <li><strong>Fill & Generate:</strong> Complete form and generate QR codes</li>
          </ol>
        </div>
        
        {/* Footer */}
        <footer className="mt-6 text-center text-gray-700">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
            <div className="max-w-md mx-auto">
              <p className="text-sm font-semibold text-gray-800 mb-1">
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
                className="inline-block bg-purple-600 text-white px-4 py-2 rounded-lg text-xs font-semibold"
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
