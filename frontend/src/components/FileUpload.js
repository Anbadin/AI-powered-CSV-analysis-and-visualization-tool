'use client';
import SampleData from './SampleData';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileSpreadsheet, AlertCircle, Loader2 } from 'lucide-react';
import FilePreview from './FilePreview';
import Dashboard from './Dashboard';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://safinia-api.onrender.com';

export default function FileUpload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError('');
    setPreview(null);
    setFile(null);
    setAnalysisResult(null);

    if (rejectedFiles && rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError('File is too large. Maximum size is 10MB.');
      } else {
        setError('Please upload a valid CSV file.');
      }
      return;
    }

    if (!acceptedFiles || acceptedFiles.length === 0) return;

    const uploadedFile = acceptedFiles[0];

    if (!uploadedFile.name.toLowerCase().endsWith('.csv')) {
      setError('Only .csv files are allowed.');
      return;
    }

    setIsLoading(true);
    setFile(uploadedFile);

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const allLines = text.split('\n').filter(line => line.trim() !== '');
        
        if (allLines.length < 2) {
          setError('CSV file must have at least a header row and one data row.');
          setIsLoading(false);
          return;
        }

        const headers = allLines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const dataLines = allLines.slice(1);
        const sampleRows = dataLines.slice(0, 5).map(line => 
          line.split(',').map(cell => cell.trim().replace(/"/g, ''))
        );

        setPreview({
          fileName: uploadedFile.name,
          fileSize: formatFileSize(uploadedFile.size),
          totalRows: dataLines.length,
          totalColumns: headers.length,
          headers: headers,
          sampleRows: sampleRows,
          rawFile: uploadedFile,
        });
      } catch (err) {
        setError('Failed to parse CSV file. Please check the format.');
      }
      setIsLoading(false);
    };

    reader.onerror = () => {
      setError('Failed to read the file. Please try again.');
      setIsLoading(false);
    };

    reader.readAsText(uploadedFile);
  }, []);

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    setError('');
    setAnalysisResult(null);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    
    setIsLoading(true);
    setError('');
    setAnalysisResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/upload`,  {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Analysis failed');
      }

      const data = await response.json();
      setAnalysisResult(data.analysis);
      
    } catch (err) {
      console.error('Analysis Error:', err);
      setError(err.message || 'Failed to analyze file. Is backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  return (
    <div className="mb-20 max-w-5xl mx-auto px-4">
      <AnimatePresence mode="wait">
        
        {/* ===== INVERSE PREMIUM UPLOAD BOX ===== */}
        {!preview && !isLoading && !analysisResult && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
          >
            <div
              {...getRootProps()}
              className={`relative border-2 border-dashed rounded-[2.5rem] p-16 
                         text-center transition-all duration-500 cursor-pointer group shadow-2xl
                         bg-[#2C2E39] 
                         ${isDragActive 
                           ? 'border-white scale-[1.02] drag-active' 
                           : 'border-fuchsia-500 hover:border-white hover:bg-[#343744]'
                         }`}
            >
              <input {...getInputProps()} />
              
              <div className="flex flex-col items-center">
                {/* Cream Icon Box */}
                <motion.div 
                  animate={isDragActive ? { y: -10 } : { y: 0 }}
                  className="bg-[#FFFDF2] p-6 rounded-[1.5rem] mb-8 shadow-xl"
                >
                  {isDragActive 
                    ? <FileSpreadsheet size={48} className="text-fuchsia-600 animate-bounce" />
                    : <Upload size={48} className="text-fuchsia-600 transition-transform group-hover:-translate-y-1" />
                  }
                </motion.div>

                <h3 className="text-3xl font-black text-white mb-4 tracking-tight">
                  {isDragActive ? '🎯 Release to Start' : 'Drag & Drop your CSV file here'}
                </h3>
                
                <p className="text-gray-300 text-lg mb-8 font-medium">
                  or <span className="text-fuchsia-400 underline underline-offset-8 decoration-2 hover:text-white transition-colors">click to browse</span> files
                </p>

                <div className="flex gap-6 text-[11px] uppercase tracking-[0.3em] font-bold text-gray-500">
                  <span className="flex items-center gap-2">Max: 10MB</span>
                  <span className="text-fuchsia-500/50">•</span>
                  <span className="flex items-center gap-2">Format: CSV</span>
                </div>
              </div>
            </div>

            {/* ===== SAMPLE DATA BUTTON (NEW! 👇) ===== */}
            <SampleData onLoadSample={(sampleFile) => {
              setFile(sampleFile);
              const reader = new FileReader();
              reader.onload = (e) => {
                const text = e.target.result;
                const allLines = text.split('\n').filter(line => line.trim() !== '');
                const headers = allLines[0].split(',').map(h => h.trim().replace(/"/g, ''));
                const dataLines = allLines.slice(1);
                const sampleRows = dataLines.slice(0, 5).map(line =>
                  line.split(',').map(cell => cell.trim().replace(/"/g, ''))
                );
                setPreview({
                  fileName: sampleFile.name,
                  fileSize: (sampleFile.size / 1024).toFixed(1) + ' KB',
                  totalRows: dataLines.length,
                  totalColumns: headers.length,
                  headers,
                  sampleRows,
                  rawFile: sampleFile,
                });
              };
              reader.readAsText(sampleFile);
            }} />

          </motion.div>
        )}

        {/* ===== LOADING STATE ===== */}
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-32 bg-[#2C2E39] rounded-[2.5rem] border border-fuchsia-500/20"
          >
            <Loader2 className="w-16 h-16 text-fuchsia-500 animate-spin mb-6" />
            <h3 className="text-2xl font-bold text-white">AI Analyzing...</h3>
            <p className="text-gray-400 mt-2">Turning rows into narratives</p>
          </motion.div>
        )}

        {/* ===== FILE PREVIEW ===== */}
        {preview && !analysisResult && !isLoading && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <FilePreview 
              preview={preview} 
              onRemove={removeFile} 
              onAnalyze={handleAnalyze} 
            />
          </motion.div>
        )}

        {/* ===== DASHBOARD ===== */}
        {analysisResult && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Dashboard analysis={analysisResult} />
            <button
              onClick={removeFile}
              className="mt-12 w-full bg-[#2C2E39] hover:bg-[#343744] text-white py-5 
                         rounded-2xl font-bold transition-all duration-300
                         border-2 border-fuchsia-500 shadow-xl uppercase tracking-widest text-xs
                         hover:shadow-fuchsia-500/20 active:scale-[0.98]"
            >
              🔄 Analyze Another File
            </button>
          </motion.div>
        )}

      </AnimatePresence>

      {/* ===== ERROR MESSAGE ===== */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 bg-red-500/10 border-2 border-red-500/50 
                       text-red-400 px-6 py-4 rounded-2xl 
                       flex items-center gap-3 font-bold"
          >
            <AlertCircle size={20} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}