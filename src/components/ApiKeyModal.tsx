import React, { useState } from 'react';
import { Key, X, Cpu } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState<string>(
    (typeof window !== 'undefined' && window.localStorage?.getItem('lld_openai_api_key')) || ''
  );
  const [saved, setSaved] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('lld_openai_api_key', apiKey.trim());
    }
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  const handleClear = () => {
    setApiKey('');
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('lld_openai_api_key');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Key className="h-5 w-5 text-amber-400" />
            <h3 className="text-base font-bold text-slate-100">AI Evaluator Settings</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          The platform uses a hybrid evaluator. If no API key is provided, the platform runs a high-grade built-in offline intelligent reasoning engine out-of-the-box.
        </p>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">OpenAI API Key (Optional):</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-proj-..."
            className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 font-mono text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="rounded-lg border border-indigo-500/20 bg-indigo-950/20 p-3 flex items-start space-x-2 text-xs text-indigo-300">
          <Cpu className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
          <span>
            Current Evaluator Mode:{' '}
            <strong className="text-indigo-200">
              {apiKey.trim() ? 'Live OpenAI API (GPT-4o-mini)' : 'Offline Built-in Heuristic Reasoner'}
            </strong>
          </span>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleClear}
            className="text-xs text-rose-400 hover:underline"
          >
            Clear Stored Key
          </button>
          <button
            onClick={handleSave}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-600/30"
          >
            {saved ? 'Saved!' : 'Save & Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
