import { useRef, useState } from 'react';

interface ImportWorkbookScreenProps {
  onFileSelected: (file: File) => Promise<void>;
  busy: boolean;
  error?: string;
  isReimport?: boolean;
}

/** First-run curriculum import, and the explicit "Refresh curriculum" action. */
export function ImportWorkbookScreen({ onFileSelected, busy, error, isReimport }: ImportWorkbookScreenProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  async function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) await onFileSelected(file);
  }

  return (
    <div className="card" style={{ maxWidth: 560, margin: '40px auto', textAlign: 'center' }}>
      <h1>{isReimport ? 'Refresh Master Curriculum' : 'Import Onboarding Curriculum'}</h1>
      <p>
        {isReimport
          ? 'Select the updated Training package_General_2026.xlsx to refresh the curriculum. Nothing is applied until you review the changes.'
          : 'Select Training package_General_2026.xlsx to build the DEFECT METROLOGY onboarding checklist. The file stays on this computer and is never uploaded anywhere.'}
      </p>
      <div
        role="button"
        tabIndex={0}
        aria-label="Drop the workbook file here, or press Enter to browse"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void handleFiles(e.dataTransfer.files);
        }}
        style={{
          border: `2px dashed ${dragOver ? '#0f6cbd' : '#c8c6c4'}`,
          borderRadius: 8,
          padding: 40,
          cursor: 'pointer',
          background: dragOver ? '#eff6fc' : 'transparent',
        }}
      >
        <p style={{ margin: 0 }}>{busy ? 'Importing…' : 'Click or drag the .xlsx file here'}</p>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx"
          className="visually-hidden"
          onChange={(e) => void handleFiles(e.target.files)}
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>
      {error && (
        <p role="alert" className="needs-clarification-note" style={{ marginTop: 12 }}>
          {error}
        </p>
      )}
    </div>
  );
}
