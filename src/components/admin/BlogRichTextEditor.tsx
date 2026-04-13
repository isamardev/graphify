import { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

type BlogRichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

export const BlogRichTextEditor = ({
  value,
  onChange,
  disabled,
  placeholder = 'Write your article… Use the toolbar for headings, lists, and links.',
}: BlogRichTextEditorProps) => {
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],
        ['blockquote', 'code-block'],
        ['link'],
        ['clean'],
      ],
    }),
    []
  );

  const formats = useMemo(
    () => [
      'header',
      'bold',
      'italic',
      'underline',
      'strike',
      'list',
      'bullet',
      'indent',
      'blockquote',
      'code-block',
      'link',
    ],
    []
  );

  return (
    <div className="blog-rich-text-editor rounded-xl overflow-hidden border border-white/10 bg-white/5 focus-within:ring-2 focus-within:ring-[#3584DE]/40">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        readOnly={disabled}
        placeholder={placeholder}
      />
    </div>
  );
};
