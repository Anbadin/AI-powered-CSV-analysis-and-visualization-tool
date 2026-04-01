'use client';
import Dashboard from './Dashboard';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import FilePreview from './FilePreview';

export default function FileUpload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError('');
    setPreview(null);
    setFile(null);

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
  };

  const [analysisResult, setAnalysisResult] = useState(null);

  const handleAnalyze = async () => {
    if (!file) return;
    
    setIsLoading(true);
    setError('');
    setAnalysisResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Analysis failed');
      }

      const data = await response.json();
      console.log('✅ Full Analysis Result:', data);
      
      // Save results to state
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
    <div>
      <AnimatePresence mode="wait">
        
        {/* Upload Box */}
        {!preview && !isLoading && !analysisResult && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-300 cursor-pointer group
                ${isDragActive ? 'border-blue-500 bg-blue-500/5 drag-active' : 'border-gray-700 hover:border-blue-500/50 hover:bg-gray-900/50'}`}
            >
              <input {...getInputProps()} />
              <div className="text-5xl mb-4">{isDragActive ? '🎯' : '📁'}</div>
              <p className="text-xl text-gray-300 mb-2">
                {isDragActive ? 'Drop it right here!' : 'Drag & Drop your CSV file here'}
              </p>
              <p className="text-gray-500">or <span className="text-blue-400 underline">click to browse</span></p>
            </div>
          </motion.div>
        )}

        {/* Loading */}
        {isLoading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="animate-spin text-4xl mb-4">⚙️</div>
            <p className="text-gray-300">Running ML analysis...</p>
            <p className="text-gray-500 text-sm mt-2">Detecting patterns, anomalies & trends</p>
          </motion.div>
        )}

        {/* Preview (before analysis) */}
        {preview && !analysisResult && (
          <motion.div key="preview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <FilePreview preview={preview} onRemove={removeFile} onAnalyze={handleAnalyze} />
          </motion.div>
        )}

        {/* DASHBOARD (after analysis) */}
        {analysisResult && (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Dashboard analysis={analysisResult} />
            <button
              onClick={removeFile}
              className="mt-6 w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl transition"
            >
              🔄 Analyze Another File
            </button>
          </motion.div>
        )}

      </AnimatePresence>

      {error && (
        <div className="mt-4 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl flex items-center gap-2">
          ⚠️ {error}
        </div>
      )}
    </div>
  ); 
}   