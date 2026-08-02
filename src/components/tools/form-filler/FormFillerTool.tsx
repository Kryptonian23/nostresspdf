'use client';

import React, { useState, useCallback, useRef } from 'react';
import { FileUploader } from '../FileUploader';
import { ProcessingProgress, ProcessingStatus } from '../ProcessingProgress';
import { DownloadButton } from '../DownloadButton';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  fillForm,
  getFormFields,
  type FormFieldDescriptor,
  type FormFieldValue,
} from '@/lib/pdf/processors/form-filler';
import type { ProcessOutput } from '@/types/pdf';

export interface FormFillerToolProps { className?: string; }

export function FormFillerTool({ className = '' }: FormFillerToolProps) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<FormFieldDescriptor[]>([]);
  const [flatten, setFlatten] = useState(false);
  const cancelledRef = useRef(false);

  const handleFilesSelected = useCallback(async (files: File[]) => {
    if (files.length > 0) {
      const selectedFile = files[0];
      setFile(selectedFile); setError(null); setResult(null);
      try {
        const formFields = await getFormFields(selectedFile);
        setFields(formFields);
      } catch (err) {
        setFields([]);
        setError(
          err instanceof Error && err.message === 'XFA_ONLY_FORM'
            ? 'This PDF uses an XFA form, which is not currently supported. Please use a standard AcroForm PDF.'
            : 'Failed to read form fields. This PDF may not contain a standard fillable AcroForm.'
        );
      }
    }
  }, []);

  const handleFieldChange = useCallback((index: number, value: string | boolean | string[]) => {
    setFields(prev => prev.map((f, i) => i === index ? { ...f, value } : f));
  }, []);

  const handleProcess = useCallback(async () => {
    if (!file) return;
    cancelledRef.current = false;
    setStatus('processing'); setProgress(0); setError(null); setResult(null);
    try {
      const fieldValues: FormFieldValue[] = fields
        .filter((field) => field.editable && !field.readOnly)
        .map((field) => ({ fieldName: field.name, value: field.value }));
      const output: ProcessOutput = await fillForm(file, { fields: fieldValues, flatten }, (prog) => { if (!cancelledRef.current) setProgress(prog); });
      if (output.success && output.result) { setResult(output.result as Blob); setStatus('complete'); }
      else { setError(output.error?.message || 'Failed.'); setStatus('error'); }
    } catch (err) { setError(err instanceof Error ? err.message : 'Error'); setStatus('error'); }
  }, [file, fields, flatten]);

  const isProcessing = status === 'processing';

  return (
    <div className={`space-y-6 ${className}`.trim()}>
      {!file && <FileUploader accept={['application/pdf', '.pdf']} multiple={false} maxFiles={1} onFilesSelected={handleFilesSelected} onError={setError} disabled={isProcessing} label="Upload PDF Form" description="Drag and drop a PDF form here." />}
      {error && <div className="p-4 rounded bg-red-50 border border-red-200 text-red-700"><p className="text-sm">{error}</p></div>}
      {file && (
        <>
          <Card variant="outlined"><div className="flex items-center justify-between"><p className="font-medium">{file.name}</p><Button variant="ghost" size="sm" onClick={() => { setFile(null); setResult(null); setFields([]); }} disabled={isProcessing}>Remove</Button></div></Card>
          {fields.length > 0 ? (
            <Card variant="outlined" size="lg">
              <h3 className="text-lg font-medium mb-4">Form Fields ({fields.length})</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {fields.map((field, idx) => {
                  const disabled = isProcessing || field.readOnly || !field.editable;
                  return (
                    <div key={field.name} className="grid gap-2 sm:grid-cols-[minmax(10rem,1fr)_2fr] sm:items-center">
                      <label className="text-sm font-medium break-words" title={field.name}>
                        {field.name}{field.required ? ' *' : ''}
                        <span className="ml-2 text-xs font-normal text-gray-500">{field.type}</span>
                      </label>
                      {field.type === 'checkbox' ? (
                        <label className="flex items-center gap-2">
                          <input type="checkbox" checked={Boolean(field.value)} onChange={(e) => handleFieldChange(idx, e.target.checked)} disabled={disabled} className="h-4 w-4" />
                          <span className="text-sm">Checked</span>
                        </label>
                      ) : field.type === 'dropdown' || field.type === 'listbox' ? (
                        <select
                          value={field.value as string | string[]}
                          multiple={field.multiSelect}
                          onChange={(e) => handleFieldChange(
                            idx,
                            field.multiSelect
                              ? Array.from(e.currentTarget.selectedOptions, option => option.value)
                              : e.currentTarget.value
                          )}
                          className="w-full rounded border px-3 py-2"
                          disabled={disabled}
                        >
                          {!field.multiSelect && <option value="">Select an option</option>}
                          {field.options?.map(option => <option key={option} value={option}>{option}</option>)}
                        </select>
                      ) : field.type === 'radio' ? (
                        <div className="flex flex-wrap gap-x-4 gap-y-2">
                          {field.options?.map(option => (
                            <label key={option} className="flex items-center gap-2 text-sm">
                              <input type="radio" name={`pdf-field-${idx}`} value={option} checked={field.value === option} onChange={() => handleFieldChange(idx, option)} disabled={disabled} />
                              {option}
                            </label>
                          ))}
                        </div>
                      ) : field.type === 'text' ? (
                        <input type="text" value={String(field.value)} onChange={(e) => handleFieldChange(idx, e.target.value)} placeholder="Enter text" className="w-full rounded border px-3 py-2" disabled={disabled} />
                      ) : (
                        <p className="text-sm text-amber-700">
                          {field.type === 'signature'
                            ? 'Existing digital signatures cannot be edited here.'
                            : 'This field is displayed for reference but cannot be edited.'}
                        </p>
                      )}
                      {field.readOnly && <p className="text-xs text-gray-500 sm:col-start-2">Read-only field</p>}
                    </div>
                  );
                })}
              </div>
              <label className="flex items-center gap-2 mt-4"><input type="checkbox" checked={flatten} onChange={(e) => setFlatten(e.target.checked)} disabled={isProcessing} className="w-4 h-4" /><span>Flatten form after filling (make non-editable)</span></label>
            </Card>
          ) : (
            <Card variant="outlined"><p className="text-gray-500">No fillable form fields found in this PDF.</p></Card>
          )}
        </>
      )}
      {isProcessing && <ProcessingProgress progress={progress} status={status} onCancel={() => { cancelledRef.current = true; setStatus('idle'); }} showPercentage />}
      {file && fields.length > 0 && <div className="flex flex-wrap items-center gap-4"><Button variant="primary" size="lg" onClick={handleProcess} disabled={!file || isProcessing} loading={isProcessing}>{isProcessing ? 'Processing...' : 'Fill Form'}</Button>{result && <DownloadButton file={result} filename={file.name.replace('.pdf', '_filled.pdf')} variant="secondary" size="lg" showFileSize />}</div>}
      {status === 'complete' && result && <div className="p-4 rounded bg-green-50 border border-green-200 text-green-700"><p className="text-sm font-medium">Form filled successfully!</p></div>}
    </div>
  );
}

export default FormFillerTool;
