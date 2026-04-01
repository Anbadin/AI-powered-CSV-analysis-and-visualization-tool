'use client';

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

    const handleAnalyze = async () => {
    if (!file) return;
    
    setIsLoading(true);
    setError('');

    try {
      // Step 1: Put the file in a FormData package
      const formData = new FormData();
      formData.append('file', file);

      // Step 2: Send it to our Python backend
      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });

      // Step 3: Check if the server returned an error
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Analysis failed');
      }

      // Step 4: Get the results
      const data = await response.json();
      console.log('Analysis Result:', data);
      
      // Show success (tomorrow we'll build a real dashboard!)
      alert(
        `✅ Analysis Complete!\n\n` +
        `📄 File: ${data.filename}\n` +
        `📏 Size: ${data.size}\n` +
        `📊 Rows: ${data.analysis.basic_info.total_rows}\n` +
        `📋 Columns: ${data.analysis.basic_info.total_columns}\n` +
        `❌ Missing Cells: ${data.analysis.basic_info.missing_cells}\n` +
        `📑 Duplicates: ${data.analysis.basic_info.duplicate_rows}\n\n` +
        `Column Types:\n` +
        Object.entries(data.analysis.column_types)
          .map(([col, type]) => `  ${col}: ${type}`)
          .join('\n') +
        `\n\nCheck browser console (F12) for full results!`
      );
      
    } catch (err) {
      console.error('Analysis Error:', err);
      setError(
        err.message || 'Failed to analyze file. Is the backend running on port 8000?'
      );
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
    <div className="mb-12">
      <AnimatePresence mode="wait">
        
        {/* ===== UPLOAD BOX ===== */}
        {!preview && !isLoading && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-16 
                         text-center transition-all duration-300 
                         cursor-pointer group
                         ${isDragActive 
                           ? 'border-blue-500 bg-blue-500/5 drag-active' 
                           : 'border-gray-700 hover:border-blue-500/50 hover:bg-gray-900/50'
                         }`}
            >
              <input {...getInputProps()} />
              
              <motion.div
                animate={isDragActive ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className={`inline-flex p-4 rounded-2xl mb-4 
                                ${isDragActive 
                                  ? 'bg-blue-500/20' 
                                  : 'bg-gray-800 group-hover:bg-gray-700'}`}
                >
                  {isDragActive 
                    ? <FileSpreadsheet size={40} className="text-blue-400" />
                    : <Upload size={40} className="text-gray-400 group-hover:text-blue-400 transition-colors" />
                  }
                </div>
              </motion.div>

              <p className="text-xl text-gray-300 mb-2 font-medium">
                {isDragActive
                  ? '🎯 Drop it right here!'
                  : 'Drag & Drop your CSV file here'}
              </p>
              <p className="text-gray-500 mb-4">
                or <span className="text-blue-400 underline">click to browse</span> files
              </p>
              <p className="text-gray-600 text-sm">
                Supports .csv files up to 10MB
              </p>
            </div>
          </motion.div>
        )}

        {/* ===== LOADING STATE ===== */}
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="border-2 border-gray-700 rounded-2xl p-16 text-center"
          >
            <div className="animate-spin text-4xl mb-4">⚙️</div>
            <p className="text-gray-300">Reading your file...</p>
          </motion.div>
        )}

        {/* ===== FILE PREVIEW ===== */}
        {preview && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <FilePreview 
              preview={preview} 
              onRemove={removeFile} 
              onAnalyze={handleAnalyze} 
            />
          </motion.div>
        )}

      </AnimatePresence>

      {/* ===== ERROR MESSAGE ===== */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 bg-red-500/10 border border-red-500/30 
                       text-red-400 px-4 py-3 rounded-xl 
                       flex items-center gap-2"
          >
            <AlertCircle size={18} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );   
}