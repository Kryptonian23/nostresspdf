import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { fillForm, getFormFields } from '@/lib/pdf/processors/form-filler';

async function createFormFile(): Promise<File> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]);
  const form = pdf.getForm();

  const name = form.createTextField('fullName');
  name.setText('Existing name');
  name.enableRequired();
  name.addToPage(page, { x: 40, y: 700, width: 200, height: 24 });

  const subscribed = form.createCheckBox('subscribed');
  subscribed.check();
  subscribed.addToPage(page, { x: 40, y: 660, width: 18, height: 18 });

  const country = form.createDropdown('country');
  country.addOptions(['Canada', 'United States']);
  country.select('Canada');
  country.addToPage(page, { x: 40, y: 620, width: 160, height: 24 });

  const contact = form.createRadioGroup('contactMethod');
  contact.addOptionToPage('Email', page, { x: 40, y: 580, width: 18, height: 18 });
  contact.addOptionToPage('Phone', page, { x: 100, y: 580, width: 18, height: 18 });
  contact.select('Email');

  const interests = form.createOptionList('interests');
  interests.addOptions(['Privacy', 'Forms', 'Automation']);
  interests.enableMultiselect();
  interests.select(['Privacy']);
  interests.addToPage(page, { x: 40, y: 460, width: 180, height: 90 });

  const bytes = await pdf.save();
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  const file = new File([buffer], 'form.pdf', { type: 'application/pdf' });
  if (typeof file.arrayBuffer !== 'function') {
    Object.defineProperty(file, 'arrayBuffer', { value: async () => buffer });
  }
  return file;
}

async function loadResult(result: Blob): Promise<PDFDocument> {
  const buffer = await blobToArrayBuffer(result);
  return PDFDocument.load(buffer);
}

function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  if (typeof blob.arrayBuffer === 'function') return blob.arrayBuffer();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.readAsArrayBuffer(blob);
  });
}

describe('PDF form filler', () => {
  it('describes AcroForm field types, options, requirements, and existing values', async () => {
    const file = await createFormFile();
    const fields = await getFormFields(file);

    expect(fields).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'fullName', type: 'text', value: 'Existing name', required: true }),
      expect.objectContaining({ name: 'subscribed', type: 'checkbox', value: true }),
      expect.objectContaining({ name: 'country', type: 'dropdown', value: 'Canada', options: ['Canada', 'United States'] }),
      expect.objectContaining({ name: 'contactMethod', type: 'radio', value: 'Email', options: ['Email', 'Phone'] }),
      expect.objectContaining({ name: 'interests', type: 'listbox', value: ['Privacy'], multiSelect: true }),
    ]));
  });

  it('fills and clears every supported field type without flattening', async () => {
    const file = await createFormFile();
    const output = await fillForm(file, {
      fields: [
        { fieldName: 'fullName', value: '' },
        { fieldName: 'subscribed', value: false },
        { fieldName: 'country', value: 'United States' },
        { fieldName: 'contactMethod', value: 'Phone' },
        { fieldName: 'interests', value: ['Forms', 'Automation'] },
      ],
    });

    expect(output.success).toBe(true);
    expect(output.metadata?.filledFields).toBe(5);

    const pdf = await loadResult(output.result as Blob);
    const form = pdf.getForm();
    expect(form.getTextField('fullName').getText()).toBeUndefined();
    expect(form.getCheckBox('subscribed').isChecked()).toBe(false);
    expect(form.getDropdown('country').getSelected()).toEqual(['United States']);
    expect(form.getRadioGroup('contactMethod').getSelected()).toBe('Phone');
    expect(form.getOptionList('interests').getSelected()).toEqual(['Forms', 'Automation']);
  });
});
