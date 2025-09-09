import React, { useState, useRef } from 'react';
import {
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material';
import { PIPELINE_IMPORT } from '../../../../utils/apiEndpoints';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';



const ImportPipelineZip = () => {

  const fileInputRef = useRef(null); 
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle'); 
  const [uploadMessage, setUploadMessage] = useState('');
  const [submitStatus, setSubmitStatus] = useState('idle'); 
  const [submitMessage, setSubmitMessage] = useState('');

  // Handles file selection from the hidden input
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.name.endsWith('.zip')) {
        setSelectedFile(file);
        setUploadStatus('selected');
        setUploadMessage(`File selected: ${file.name}`);
      
        setSubmitStatus('idle');
        setSubmitMessage('');
      } else {
        setSelectedFile(null);
        setUploadStatus('error');
        setUploadMessage('Invalid file type. Please select a .zip file.');
      }
    } else {
      setSelectedFile(null);
      setUploadStatus('idle');
      setUploadMessage('');
    }
    
    event.target.value = null;
  };


  const handleUploadButtonClick = () => {
    fileInputRef.current.click();
  };

  // Simulates the file upload process
  const handleUploadFile = async () => {
    if (!selectedFile) {
      setUploadStatus('error');
      setUploadMessage('No file selected to upload.');
      return;
    }

    setUploadStatus('uploading');
    setUploadMessage('Uploading file...');
    setSubmitStatus('idle'); 

     try {

            const formData = new FormData();
            formData.append('file', selectedFile); 

            const response = await fetch(PIPELINE_IMPORT, {
                method: 'POST',
                body: formData
             });

            if (!response.ok) {
            
            const errorData = await response.json(); 
            throw new Error(errorData.detail || 'Upload failed on server.');
            }

            const result = await response.json(); 
            console.log('Upload successful:', result);

            setUploadStatus('success');
            setUploadMessage(`"${selectedFile.name}" uploaded successfully!`);
            
        } catch (error) {
            setUploadStatus('error');
            setUploadMessage(`Upload failed: ${error.message}`);
        }
  };


  return (
    <Box
      sx={{
        p: 3,
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        maxWidth: 500,
        margin: '20px auto',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        bgcolor: 'background.paper',
      }}
    >
      <Typography variant="h5" component="h2" gutterBottom align="center">
        Upload Pipeline from ZIP
      </Typography>

      <Stack spacing={2} sx={{ mt: 3 }}>
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".zip" // Only accept ZIP files
          style={{ display: 'none' }}
        />

        {/* Button to trigger file selection */}
        <Button
          variant="outlined"
          component="label" // Use label to associate with hidden input for accessibility
          startIcon={<CloudUploadIcon />}
          onClick={handleUploadButtonClick}
          fullWidth
        >
          Select ZIP File
        </Button>

        {/* Display selected file name */}
        {selectedFile && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            {selectedFile.name}
          </Typography>
        )}

        {/* Upload Button (active after file selection) */}
        <Button
          variant="contained"
          color="primary"
          startIcon={uploadStatus === 'uploading' ? <CircularProgress size={20} color="inherit" /> : null}
          onClick={handleUploadFile}
          disabled={!selectedFile || uploadStatus === 'uploading' || uploadStatus === 'success'}
          fullWidth
        >
          {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload ZIP'}
        </Button>

        {/* Upload Status Feedback */}
        {uploadMessage && (
          <Alert
            severity={
              uploadStatus === 'success' ? 'success' : uploadStatus === 'error' ? 'error' : 'info'
            }
            iconMapping={{
              success: <CheckCircleOutlineIcon fontSize="inherit" />,
              error: <ErrorOutlineIcon fontSize="inherit" />,
            }}
          >
            {uploadMessage}
          </Alert>
        )}

        {/* Submit Status Feedback */}
        {submitMessage && (
          <Alert
            severity={
              submitStatus === 'success' ? 'success' : submitStatus === 'error' ? 'error' : 'info'
            }
            iconMapping={{
              success: <CheckCircleOutlineIcon fontSize="inherit" />,
              error: <ErrorOutlineIcon fontSize="inherit" />,
            }}
          >
            {submitMessage}
          </Alert>
        )}
      </Stack>
    </Box>
  );
};

export default ImportPipelineZip;