import { Editor } from '@/components/editor/Editor';
import { Toaster } from '@/components/ui/Toaster';

function App() {
  return (
    <>
      <Editor />

      <Toaster
        position="bottom-right"
        offset={{ bottom: 64, right: 16 }}
      />
    </>
  );
}

export default App;
