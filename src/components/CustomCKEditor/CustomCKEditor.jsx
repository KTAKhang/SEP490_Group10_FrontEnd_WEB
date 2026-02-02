import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const CustomCKEditor = ({ config, data, onChange, onReady, onError }) => {
  return (
    <div style={{ width: '100%' }}>
      <CKEditor
        editor={ClassicEditor}
        data={data || ''}
        config={{
          placeholder: 'Nhập nội dung...',
          ...config,
        }}
        onReady={(editor) => {
          console.log('CKEditor ready');
          if (onReady) onReady(editor);
        }}
        onChange={(event, editor) => {
          // Truyền đúng format (event, editor) như CKEditor React wrapper
          if (onChange) {
            onChange(event, editor);
          }
        }}
        onError={(error, { willEditorRestart }) => {
          console.error('CKEditor error:', error);
          if (onError) {
            onError(error, { willEditorRestart });
          }
        }}
      />
    </div>
  );
};

export default CustomCKEditor;
