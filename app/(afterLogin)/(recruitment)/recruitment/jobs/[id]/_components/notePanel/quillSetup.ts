import type QuillType from 'quill';

let configured = false;

export function configureNotePanelQuill(Quill: typeof QuillType) {
  if (configured) return;

  const SizeStyle: any = Quill.import('attributors/style/size') as {
    whitelist: string[];
  };
  SizeStyle.whitelist = ['12px', '14px', '16px', '18px', '20px', '24px'];
  Quill.register(SizeStyle, true);
  Quill.register('formats/size', SizeStyle, true);

  const FontClass: any = Quill.import('formats/font') as {
    whitelist: string[];
  };
  FontClass.whitelist = ['times-new-roman', 'arial', 'calibre'];
  Quill.register(FontClass, true);

  configured = true;
}

export const NOTE_PANEL_FONT_OPTIONS = [
  'times-new-roman',
  'arial',
  'calibre',
] as const;

export const NOTE_PANEL_SIZE_OPTIONS = [
  '12px',
  '14px',
  '16px',
  '18px',
  '20px',
  '24px',
] as const;

export const NOTE_PANEL_EDITOR_FORMATS = [
  'font',
  'size',
  'bold',
  'italic',
  'underline',
  'align',
];
