import React, { useState } from 'react';
import './ContentGenerator.css';

const GAMING_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7',
    alt: 'High-end gaming PC setup with RGB lighting',
    category: 'pc'
  },
  {
    url: 'https://images.unsplash.com/photo-1593640495253-23196b27a87f',
    alt: 'Gaming laptop with colorful keyboard',
    category: 'laptop'
  },
  {
    url: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3',
    alt: 'PlayStation 5 with controller',
    category: 'playstation'
  },
  {
    url: 'https://images.unsplash.com/photo-1547082299-de196ea013d6',
    alt: 'Professional gaming setup with multiple monitors',
    category: 'pc'
  },
  {
    url: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2',
    alt: 'Gaming laptop with RGB backlight',
    category: 'laptop'
  },
  {
    url: 'https://images.unsplash.com/photo-1605901309584-818e25960a8f',
    alt: 'PlayStation gaming controller',
    category: 'playstation'
  }
];

const PROMPT_TEMPLATES = [
  { 
    label: 'YouTube Video Description', 
    value: 'youtube', 
    template: 'Write a compelling YouTube video description for a gaming PC.',
    imagePrompt: 'Create a thumbnail image for a gaming PC YouTube video'
  },
  { 
    label: 'Social Media Post', 
    value: 'social', 
    template: 'Create a catchy social media post for a new gaming PC.',
    imagePrompt: 'Generate a social media banner featuring a gaming PC setup'
  },
  { 
    label: 'Product Review', 
    value: 'review', 
    template: 'Generate a detailed product review for a gaming PC.',
    imagePrompt: 'Create a professional product photo of a gaming PC'
  },
  { 
    label: 'Ad Copy', 
    value: 'ad', 
    template: 'Write a persuasive ad copy for a high-end gaming PC.',
    imagePrompt: 'Design an advertisement image for a gaming PC'
  },
  { 
    label: 'Blog Introduction', 
    value: 'blog', 
    template: 'Write an engaging blog introduction about the latest gaming PC trends.',
    imagePrompt: 'Create a blog header image featuring gaming PC components'
  },
];

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const ContentGenerator: React.FC = () => {
  const [promptType, setPromptType] = useState(PROMPT_TEMPLATES[0].value);
  const [customParam1, setCustomParam1] = useState('');
  const [customParam2, setCustomParam2] = useState('');
  const [customParam3, setCustomParam3] = useState('');
  const [output, setOutput] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [performance, setPerformance] = useState<{ time?: number; tokens?: number }>({});

  const buildPrompt = () => {
    const template = PROMPT_TEMPLATES.find(t => t.value === promptType)?.template || '';
    return `${template}\nTarget Audience: ${customParam1}\nTone: ${customParam2}\nKey Features: ${customParam3}`;
  };

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImages(prev => {
      if (prev.includes(imageUrl)) {
        return prev.filter(url => url !== imageUrl);
      }
      return [...prev, imageUrl].slice(0, 3); // Limit to 3 selected images
    });
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOutput('');
    const start = Date.now();
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    if (!apiKey) {
      setError('Gemini API key not found. Please check your .env file.');
      setLoading(false);
      return;
    }
    const prompt = buildPrompt();
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });
      const data = await response.json();
      
      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        setOutput(data.candidates[0].content.parts[0].text);
        setPerformance({ time: Date.now() - start, tokens: data.usageMetadata?.totalTokens || undefined });
      } else if (data.error) {
        setError(data.error.message || 'Unknown error from Gemini API.');
      } else {
        setError('No content generated.');
      }
    } catch (err: any) {
      setError('Failed to connect to Gemini API.');
    }
    setLoading(false);
  };

  const handleExport = () => {
    const content = `${output}\n\nSelected Images:\n${selectedImages.join('\n')}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-content.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="content-generator-container">
      <div className="header">
        <h1>Computer Gaming Content Creator</h1>
        <p className="subtitle">Create professional content for gaming PCs, laptops, and consoles</p>
      </div>

      <div className="main-content">
        <div className="input-section">
          <form onSubmit={handleGenerate} className="content-generator-form">
            <div className="form-group">
              <label>
                Content Type:
                <select value={promptType} onChange={e => setPromptType(e.target.value)}>
                  {PROMPT_TEMPLATES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="form-group">
              <label>
                Target Audience:
                <input 
                  value={customParam1} 
                  onChange={e => setCustomParam1(e.target.value)} 
                  placeholder="e.g., Gaming enthusiasts, PC builders"
                  required 
                />
              </label>
            </div>

            <div className="form-group">
              <label>
                Content Tone:
                <input 
                  value={customParam2} 
                  onChange={e => setCustomParam2(e.target.value)} 
                  placeholder="e.g., Professional, Enthusiastic"
                  required 
                />
              </label>
            </div>

            <div className="form-group">
              <label>
                Key Features:
                <input 
                  value={customParam3} 
                  onChange={e => setCustomParam3(e.target.value)} 
                  placeholder="e.g., RTX 4090, 32GB RAM"
                  required 
                />
              </label>
            </div>

            <div className="image-gallery">
              <h3>Select Images (up to 3)</h3>
              <div className="image-grid">
                {GAMING_IMAGES.map((image, index) => (
                  <div 
                    key={index} 
                    className={`image-item ${selectedImages.includes(image.url) ? 'selected' : ''}`}
                    onClick={() => handleImageSelect(image.url)}
                  >
                    <img src={image.url} alt={image.alt} />
                    <div className="image-category">{image.category}</div>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} className="generate-button">
              {loading ? 'Generating...' : 'Generate Content'}
            </button>
          </form>
        </div>

        <div className="output-section">
          {error && <div className="error-message">{error}</div>}
          
          {output && (
            <div className="generated-content">
              <h3>Generated Content</h3>
              <div className="content-box">
                <pre>{output}</pre>
              </div>
              
              {selectedImages.length > 0 && (
                <div className="selected-images">
                  <h3>Selected Images</h3>
                  <div className="selected-images-grid">
                    {selectedImages.map((url, index) => (
                      <div key={index} className="selected-image">
                        <img src={url} alt={GAMING_IMAGES.find(img => img.url === url)?.alt || 'Selected gaming image'} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <button onClick={handleExport} className="export-button">
                Export Content
              </button>
            </div>
          )}

          {performance.time && (
            <div className="performance-metrics">
              <div className="metric">
                <span>Generation Time:</span>
                <span>{performance.time} ms</span>
              </div>
              {performance.tokens && (
                <div className="metric">
                  <span>Tokens Used:</span>
                  <span>{performance.tokens}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentGenerator; 