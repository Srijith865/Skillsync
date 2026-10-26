import React, { useRef, useState } from 'react';
import { extractTextFromPdf, type ExtractedPdf } from '../lib/pdfParser';

interface PdfUploaderProps {
  onTextExtracted: (text: string, fileName: string) => void;
  onClear: () => void;
}

export const PdfUploader: React.FC<PdfUploaderProps> = ({ onTextExtracted, onClear }) => {
  const [dragActive, setDragActive] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [extractedInfo, setExtractedInfo] = useState<ExtractedPdf | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const processFile = async (file: File) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setParseError('Unsupported format. Please select a .pdf file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setParseError('File exceeds 10MB limit.');
      return;
    }
    setParseError(null);
    setParsing(true);
    try {
      const extracted = await extractTextFromPdf(file);
      setExtractedInfo(extracted);
      onTextExtracted(extracted.text, extracted.fileName);
    } catch (err: any) {
      setParseError(err.message || 'Failed to extract text from PDF file.');
    } finally {
      setParsing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  const handleReset = () => {
    setExtractedInfo(null);
    setParseError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClear();
  };

  return (
    <div className="space-y-2">
      {parseError && (
        <div
          className="flex items-center justify-between px-3 py-2 text-xs font-mono-ui"
          style={{
            background: 'rgba(255,69,69,0.08)',
            border: '1px solid rgba(255,69,69,0.3)',
            color: '#ff4545',
          }}
        >
          <span>⚠ {parseError}</span>
          <button type="button" onClick={() => setParseError(null)} className="ml-3 opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {extractedInfo ? (
        /* ── Extracted Card ── */
        <div
          className="flex items-center justify-between gap-3 px-4 py-3"
          style={{
            background: 'rgba(0,212,106,0.05)',
            border: '1px solid rgba(0,212,106,0.25)',
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="flex-shrink-0 w-9 h-9 flex items-center justify-center font-mono-ui text-xs font-bold"
              style={{
                background: 'rgba(0,212,106,0.12)',
                border: '1px solid rgba(0,212,106,0.3)',
                color: 'var(--green)',
              }}
            >
              PDF
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate" title={extractedInfo.fileName}>
                {extractedInfo.fileName}
                <span className="ml-2 font-mono-ui text-[10px]" style={{ color: 'var(--green)' }}>✓ PARSED</span>
              </div>
              <div className="font-mono-ui text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {extractedInfo.fileSizeKB} KB · {extractedInfo.wordCount} words extracted
              </div>
            </div>
          </div>
          <button type="button" onClick={handleReset} className="btn-ghost flex-shrink-0">
            Replace
          </button>
        </div>
      ) : (
        /* ── Drop Zone ── */
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`drop-zone cursor-pointer py-5 px-4 text-center transition-all ${dragActive ? 'drag-over' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={handleChange}
          />
          <div className="flex flex-col items-center gap-2.5 pointer-events-none">
            <div
              className="w-10 h-10 flex items-center justify-center"
              style={{ border: '1px solid var(--border-2)', background: 'var(--dark-3)' }}
            >
              {parsing ? (
                <div
                  className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: 'var(--cyan)', borderTopColor: 'transparent' }}
                />
              ) : (
                <span className="text-base" style={{ color: 'var(--cyan)' }}>↑</span>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-white">
                {parsing ? 'Parsing PDF…' : 'Drop resume PDF or click to browse'}
              </p>
              <p className="font-mono-ui text-[10px] mt-0.5 tracking-wider" style={{ color: 'var(--text-muted)' }}>
                CLIENT-SIDE · ZERO EGRESS · MAX 10MB
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
