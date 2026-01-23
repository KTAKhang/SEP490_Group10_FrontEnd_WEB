import { CKEditor } from '@ckeditor/ckeditor5-react';
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';

const CustomCKEditor = ({ config, data, onChange, onReady, onError }) => {
  return (
    <div>
      <div id="toolbar-container"></div>
      <CKEditor
        editor={DecoupledEditor}
        config={config}
        data={data}
        onChange={onChange}
        onReady={(editor) => {
          // Mount toolbar
          const toolbarContainer = document.querySelector('#toolbar-container');
          toolbarContainer.appendChild(editor.ui.view.toolbar.element);
          
          if (onReady) onReady(editor);
        }}
        onError={onError}
      />
    </div>
  );
};

export default CustomCKEditor;