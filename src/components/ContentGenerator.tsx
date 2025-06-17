import React, { useState } from 'react';
import './ContentGenerator.css';

// Prompt templates for different scenarios
const PROMPT_TEMPLATES = [
  { label: 'YouTube Video Description', value: 'youtube', template: 'Write a compelling YouTube video description for a gaming PC.' },
  { label: 'Social Media Post', value: 'social', template: 'Create a catchy social media post for a new gaming PC.' },
  { label: 'Product Review', value: 'review', template: 'Generate a detailed product review for a gaming PC.' },
  { label: 'Ad Copy', value: 'ad', template: 'Write a persuasive ad copy for a high-end gaming PC.' },
  { label: 'Blog Introduction', value: 'blog', template: 'Write an engaging blog introduction about the latest gaming PC trends.' },
];

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const ContentGenerator: React.FC = () => {
  const [promptType, setPromptType] = useState(PROMPT_TEMPLATES[0].value);
  const [customParam1, setCustomParam1] = useState('');
  const [customParam2, setCustomParam2] = useState('');
  const [customParam3, setCustomParam3] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [performance, setPerformance] = useState<{ time?: number; tokens?: number }>({});

  const buildPrompt = () => {
    const template = PROMPT_TEMPLATES.find(t => t.value === promptType)?.template || '';
    return `${template}\nTarget Audience: ${customParam1}\nTone: ${customParam2}\nKey Features: ${customParam3}`;
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
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-content.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="content-generator-container">
      <h2>Custom Content Generator</h2>
      <form onSubmit={handleGenerate} className="content-generator-form">
        <label>
          Prompt Type:
          <select value={promptType} onChange={e => setPromptType(e.target.value)}>
            {PROMPT_TEMPLATES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </label>
        <label>
          Customization 1 (e.g., Target Audience):
          <input value={customParam1} onChange={e => setCustomParam1(e.target.value)} required />
        </label>
        <label>
          Customization 2 (e.g., Tone):
          <input value={customParam2} onChange={e => setCustomParam2(e.target.value)} required />
        </label>
        <label>
          Customization 3 (e.g., Key Features):
          <input value={customParam3} onChange={e => setCustomParam3(e.target.value)} required />
        </label>
        <button type="submit" disabled={loading} className="generate-button">Generate</button>
      </form>
      {loading && <p>Generating...</p>}
      {error && <p className="error">{error}</p>}
      {output && (
        <div className="output-section">
          <h3>Generated Content</h3>
          <pre>{output}</pre>
          <button onClick={handleExport} className="export-button">Export Result</button>
        </div>
      )}
      {performance.time && (
        <div className="performance">
          <p>Generation Time: {performance.time} ms</p>
          <p>Token Usage: {performance.tokens}</p>
        </div>
      )}
    </div>
  );
};

export default ContentGenerator; 