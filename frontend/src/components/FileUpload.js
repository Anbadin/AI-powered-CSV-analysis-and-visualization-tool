'use client';
import SampleData from './SampleData';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileSpreadsheet, AlertCircle, Loader2 } from 'lucide-react';
import FilePreview from './FilePreview';
import Dashboard from './Dashboard';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://safinia-api.onrender.com').trim();

export default function FileUpload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isWaking, setIsWaking] = useState(false);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError('');
    setPreview(null);
    setFile(null);
    setAnalysisResult(null);

    if (rejectedFiles?.length > 0) {
      setError(rejectedFiles[0].errors[0]?.code === 'file-too-large' ? 'Max size is 10MB.' : 'Invalid CSV file.');
      return;
    }

    if (!acceptedFiles?.length) return;
    const uploadedFile = acceptedFiles[0];

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const allLines = text.split('\n').filter(line => line.trim() !== '');
        if (allLines.length < 2) throw new Error('CSV is empty');

        const headers = allLines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        setPreview({
          fileName: uploadedFile.name,
          fileSize: uploadedFile.size > 1024 * 1024 ? (uploadedFile.size / (1024 * 1024)).toFixed(1) + ' MB' : (uploadedFile.size / 1024).toFixed(1) + ' KB',
          totalRows: allLines.length - 1,
          totalColumns: headers.length,
          headers,
          sampleRows: allLines.slice(1, 6).map(line => line.split(',')),
          rawFile: uploadedFile,
        });
        setFile(uploadedFile);
      } catch (err) { setError('Failed to parse CSV.'); }
      setIsLoading(false);
    };
    reader.readAsText(uploadedFile);
  }, []);

  const handleAnalyze = async () => {
    if (!file) return;
    setIsLoading(true);
    setError('');
    const wakeTimer = setTimeout(() => setIsWaking(true), 7000);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`${API_URL}/upload`, { method: 'POST', body: formData });
      if (!response.ok) throw new Error((await response.json()).detail || 'Analysis failed');
      const data = await response.json();
      setAnalysisResult(data.analysis);
    } catch (err) {
      setError(err.message.includes('fetch') ? 'Server waking up... Try again in 30s.' : err.message);
    } finally {
      clearTimeout(wakeTimer);
      setIsLoading(false);
      setIsWaking(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'text/csv': ['.csv'] }, maxFiles: 1, maxSize: 10 * 1024 * 1024 });

  return (
    <div className="mb-20 max-w-5xl mx-auto px-4">
      <AnimatePresence mode="wait">
        {!preview && !isLoading && !analysisResult && (
          <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div {...getRootProps()} className={`relative border-2 border-dashed rounded-[2.5rem] p-16 text-center cursor-pointer transition-all bg-[#2C2E39] ${isDragActive ? 'border-white scale-[1.02]' : 'border-fuchsia-500 hover:border-white'}`}>
              <input {...getInputProps()} />
              <div className="bg-[#FFFDF2] p-6 inline-block rounded-2xl mb-8 shadow-xl"><Upload size={48} className="text-fuchsia-600" /></div>
              <h3 className="text-3xl font-black text-white mb-4">Drag & Drop CSV</h3>
              <p className="text-gray-300 text-lg">or <span className="text-fuchsia-400 underline">browse files</span></p>
            </div>
            <SampleData onLoadSample={(f) => onDrop([f])} />
          </motion.div>
        )}

        {isLoading && (
          <motion.div key="loading" className="flex flex-col items-center justify-center py-32 bg-[#2C2E39] rounded-[2.5rem] border border-fuchsia-500/20">
            <Loader2 className="w-16 h-16 text-fuchsia-500 animate-spin mb-6" />
            <h3 className="text-2xl font-bold text-white">{isWaking ? 'Server is waking up...' : 'AI Analyzing...'}</h3>
            <p className="text-gray-400 mt-2">{isWaking ? 'Render free tier takes ~30s to start' : 'Turning rows into narratives'}</p>
          </motion.div>
        )}

        {preview && !analysisResult && !isLoading && (
          <FilePreview preview={preview} onRemove={() => {setFile(null); setPreview(null);}} onAnalyze={handleAnalyze} />
        )}

        {analysisResult && (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Dashboard analysis={analysisResult} />
            <button onClick={() => {setFile(null); setPreview(null); setAnalysisResult(null);}} className="mt-12 w-full bg-[#2C2E39] hover:bg-[#343744] text-white py-5 rounded-2xl font-bold border-2 border-fuchsia-500 shadow-xl uppercase tracking-widest text-xs">Analyze Another File</button>
          </motion.div>
        )}
      </AnimatePresence>
      {error && <motion.div className="mt-6 bg-red-500/10 border-2 border-red-500/50 text-red-400 px-6 py-4 rounded-2xl flex items-center gap-3 font-bold"><AlertCircle size={20} />{error}</motion.div>}
    </div>
  );
}