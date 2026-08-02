import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { createForm } from '@/lib/pdf/processors/form-creator';

async function createBlankFile(): Promise<File> {
  const pdf = await PDFDocument.create();
  pdf.addPage([612, 792]);
  const bytes = await pdf.save();
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  const file = new File([buffer], 'blank.pdf', { type: 'application/pdf' });
  if (typeof file.arrayBuffer !== 'function') {
    Object.defineProperty(file, 'arrayBuffer', { value: async () => buffer });
  }
  return file;
}

describe('PDF form creator', () => {
  it('writes required and multiline field properties into the PDF', async () => {
    const output = await createForm(await createBlankFile(), {
      fields: [{
        type: 'text',
        name: 'details',
        pageNumber: 1,
        x: 40,
        y: 650,
        width: 240,
        height: 80,
        required: true,
        multiline: true,
      }],
    });

    expect(output.success).toBe(true);
    const result = output.result as Blob;
    const buffer = await blobToArrayBuffer(result);
    const pdf = await PDFDocument.load(buffer);
    const field = pdf.getForm().getTextField('details');
    expect(field.isRequired()).toBe(true);
    expect(field.isMultiline()).toBe(true);
  });
});

function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  if (typeof blob.arrayBuffer === 'function') return blob.arrayBuffer();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.readAsArrayBuffer(blob);
  });
}
