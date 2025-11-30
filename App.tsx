import React, { useState, useCallback, useRef } from 'react';
import { Upload, FileText, X, ArrowUp, ArrowDown, Download, Sparkles, CheckCircle } from 'lucide-react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Button } from './components/Button';
import { UploadedFile, AppState } from './types';
import { mergePdfs, extractMetadataForAI } from './services/pdfService';
import { generateSmartFilename } from './services/geminiService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [finalFileName, setFinalFileName] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- File Handling ---

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      addFiles(Array.from(event.target.files));
    }
    // Reset input value to allow selecting the same file again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addFiles = (newFiles: File[]) => {
    const validPdfFiles = newFiles.filter(file => file.type === 'application/pdf');
    
    if (validPdfFiles.length === 0) {
      alert("Please select PDF files only.");
      return;
    }

    const newUploadedFiles: UploadedFile[] = validPdfFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
    }));

    setFiles(prev => [...prev, ...newUploadedFiles]);
    setAppState(AppState.SELECTED);
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const remaining = prev.filter(f => f.id !== id);
      if (remaining.length === 0) setAppState(AppState.IDLE);
      return remaining;
    });
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === files.length - 1) return;

    setFiles(prev => {
      const newFiles = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]];
      return newFiles;
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // --- Merging Logic ---

  const handleMerge = async () => {
    if (files.length < 2) {
      alert("Please select at least 2 PDF files to merge.");
      return;
    }

    setAppState(AppState.PROCESSING);
    setStatusMessage("Merging your documents...");

    try {
      // 1. Client-side Merge (Privacy focused)
      const mergedBytes = await mergePdfs(files.map(f => f.file));
      const blob = new Blob([mergedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

      // 2. AI Filename Generation (Optional Smart Feature)
      setStatusMessage("Asking Gemini for a smart filename...");
      let suggestedName = "merged.pdf";
      try {
          const context = await extractMetadataForAI(files[0].file);
          suggestedName = await generateSmartFilename(context);
      } catch (err) {
          console.warn("AI Naming failed, using default", err);
      }
      setFinalFileName(suggestedName);

      setAppState(AppState.FINISHED);
    } catch (error) {
      console.error("Merge error:", error);
      setAppState(AppState.ERROR);
      alert("An error occurred while merging. Please try again.");
    }
  };

  // --- Render Sections ---

  const renderHero = () => (
    <div 
      className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-in fade-in zoom-in duration-500"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          Merge PDF files
        </h1>
        <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto">
          Combine PDFs in the order you want with the easiest PDF merger available. 
        </p>
      </div>

      <div className="bg-white p-10 rounded-2xl shadow-xl border-2 border-dashed border-gray-300 hover:border-[#E53935] hover:bg-red-50/30 transition-all duration-300 w-full max-w-lg cursor-pointer group"
           onClick={() => fileInputRef.current?.click()}>
        <div className="flex flex-col items-center gap-6">
           <div className="bg-[#E53935] p-6 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300">
             <Upload className="w-12 h-12 text-white" />
           </div>
           <div className="space-y-2">
             <Button size="xl" className="pointer-events-none">Select PDF files</Button>
             <p className="text-sm text-gray-500">or drop PDFs here</p>
           </div>
        </div>
      </div>
      <input 
        type="file" 
        multiple 
        accept=".pdf" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
      />
    </div>
  );

  const renderWorkspace = () => (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] bg-[#F3F4F6]">
      {/* File List Area */}
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-700">
              Selected Files <span className="text-[#E53935] bg-red-100 px-2 py-0.5 rounded-full text-sm">{files.length}</span>
            </h2>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="text-[#E53935] hover:bg-red-50 px-3 py-1.5 rounded-md font-medium text-sm transition"
            >
              + Add more files
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {files.map((file, index) => (
              <div key={file.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 relative group hover:shadow-md transition-all">
                {/* File Preview Visual */}
                <div className="aspect-[3/4] bg-gray-50 rounded border border-gray-100 flex items-center justify-center mb-3 group-hover:bg-red-50/20 transition-colors">
                  <FileText className="w-12 h-12 text-gray-300" />
                </div>
                
                {/* File Name */}
                <p className="text-sm font-medium text-gray-700 truncate mb-3" title={file.file.name}>
                  {file.file.name}
                </p>

                {/* Controls */}
                <div className="flex items-center justify-center gap-2">
                   {index > 0 && (
                     <button onClick={() => moveFile(index, 'up')} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded">
                       <ArrowUp className="w-4 h-4" />
                     </button>
                   )}
                   {index < files.length - 1 && (
                     <button onClick={() => moveFile(index, 'down')} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded">
                       <ArrowDown className="w-4 h-4" />
                     </button>
                   )}
                </div>

                {/* Remove Button (Absolute) */}
                <button 
                  onClick={() => removeFile(file.id)}
                  className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
                
                {/* Order Badge */}
                <div className="absolute top-2 left-2 w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
              </div>
            ))}
            
            {/* Add Card */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="aspect-[3/4] border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#E53935] hover:bg-red-50/50 transition-colors"
            >
              <div className="bg-[#E53935] rounded-full p-2 mb-2">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-500">Add File</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar / Action Area */}
      <div className="w-full lg:w-80 bg-white border-l border-gray-200 p-6 flex flex-col shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-10">
        <div className="mb-auto">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Merge PDF</h3>
          <p className="text-sm text-gray-500 mb-6">
            Combine PDFs in the order you want. Click and drag to reorder is not supported in this demo, please use arrows.
          </p>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
            <div className="flex items-start gap-3">
               <Sparkles className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
               <div className="text-sm">
                 <p className="font-semibold text-blue-800">AI Powered Naming</p>
                 <p className="text-blue-600/80 mt-1">
                   Gemini will analyze your first document to suggest a professional filename.
                 </p>
               </div>
            </div>
          </div>
        </div>

        <Button 
          size="lg" 
          onClick={handleMerge}
          disabled={files.length < 2}
          isLoading={appState === AppState.PROCESSING}
          className="w-full shadow-xl shadow-red-500/20"
        >
          {appState === AppState.PROCESSING ? 'Merging PDFs...' : 'Merge PDF ->'}
        </Button>
      </div>
      <input type="file" multiple accept=".pdf" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
    </div>
  );

  const renderSuccess = () => (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 animate-in fade-in zoom-in duration-500">
      <div className="bg-green-50 rounded-full p-6 mb-6">
        <CheckCircle className="w-16 h-16 text-green-500" />
      </div>
      <h2 className="text-3xl font-bold text-gray-800 mb-2">PDFs have been merged!</h2>
      <p className="text-gray-500 mb-8 max-w-md text-center">
        Your files have been successfully processed. The resulting file has been named intelligently by AI.
      </p>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 w-full max-w-md flex flex-col gap-4">
        <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Filename</label>
            <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-md border border-gray-200">
                <FileText className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-800">{finalFileName}</span>
            </div>
        </div>

        <a 
          href={downloadUrl!} 
          download={finalFileName}
          className="flex items-center justify-center gap-2 w-full bg-[#E53935] text-white font-bold text-lg py-4 rounded-lg hover:bg-[#D32F2F] transition-colors shadow-lg shadow-red-500/30"
        >
          <Download className="w-6 h-6" />
          Download Merged PDF
        </a>
      </div>

      <div className="mt-8 flex gap-4">
        <button 
          onClick={() => {
              setFiles([]);
              setAppState(AppState.IDLE);
              setDownloadUrl(null);
          }}
          className="text-gray-500 hover:text-gray-800 font-medium transition"
        >
          Merge more PDFs
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F4F6]">
      <Header />
      <main className="flex-grow">
        {appState === AppState.IDLE && renderHero()}
        {(appState === AppState.SELECTED || appState === AppState.PROCESSING) && renderWorkspace()}
        {appState === AppState.FINISHED && renderSuccess()}
        {appState === AppState.ERROR && (
           <div className="flex flex-col items-center justify-center h-full">
             <p className="text-red-500 text-xl font-bold">Something went wrong.</p>
             <Button variant="ghost" onClick={() => setAppState(AppState.SELECTED)} className="mt-4">Try Again</Button>
           </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default App;