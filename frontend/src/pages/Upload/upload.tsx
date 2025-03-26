import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './upload.css';

interface UploadFormData {
  title: string;
  artist: string;
  duration: number;
  release_date: string;
  file_url: string;
  lyrics: string;
}

interface TempFileInfo {
  session_id: string;
  original_filename: string;
  temp_path: string;
}

const Upload: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<UploadFormData>({
    title: '',
    artist: '',
    duration: 0,
    release_date: new Date().toISOString().split('T')[0],
    file_url: '',
    lyrics: ''
  });
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [fileUploading, setFileUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [tempFileInfo, setTempFileInfo] = useState<TempFileInfo | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  
  const token = localStorage.getItem('token');

  const cleanupTempFile = async () => {
    if (tempFileInfo) {
      try {
        console.log('Cleaning up temporary file:', tempFileInfo.session_id);
        await fetch('http://127.0.0.1:8000/api/player/delete-temp-file/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            session_id: tempFileInfo.session_id
          }),
        });
        return true;
      } catch (err) {
        console.error('Failed to clean up temporary file:', err);
        return false;
      }
    }
    return false;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (error) setError(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/ogg'];
    const isValidType = validTypes.some(type => 
      file.type.includes(type) || file.name.toLowerCase().endsWith(type.split('/')[1])
    );
    
    if (!isValidType) {
      setError('Invalid file type. Please upload MP3, WAV or OGG files.');
      return;
    }

    // Check file size
    const MAX_FILE_SIZE_MB = 10;
    const fileSizeMB = file.size / (1024 * 1024);

    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      setError(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit. Please select a smaller file.`);
      return;
    }

    try {
        setFileUploading(true);
        setUploadProgress(0);

        if (tempFileInfo) {
            try {
              console.log('Removing previous temporary file:', tempFileInfo.session_id);
              await fetch('http://127.0.0.1:8000/api/player/delete-temp-file/', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                  session_id: tempFileInfo.session_id
                }),
              });
            } catch (cleanupErr) {
              // Just log the error but continue with the new upload
              console.error('Failed to clean up previous temp file:', cleanupErr);
            }
        }
        
        // Create form data for upload
        const formData = new FormData();
        formData.append('file', file);
        
        // Start progress simulation
        const progressInterval = setInterval(() => {
            setUploadProgress(prev => {
            const newProgress = prev + 5;
            return newProgress <= 90 ? newProgress : 90;
            });
        }, 200);

        const objectUrl = URL.createObjectURL(file);
        setAudioPreview(objectUrl);
        
        // Extract duration from audio file
        const audio = new Audio(objectUrl);
        audio.addEventListener('loadedmetadata', () => {
        if (audio.duration && audio.duration !== Infinity) {
            console.log('Detected audio duration:', audio.duration);
            setFormData(prevState => ({
            ...prevState,
            duration: Math.round(audio.duration)
            }));
        }
        });
      
      // Upload file to temporary location
      const response = await fetch('http://127.0.0.1:8000/api/player/upload-temp-file/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });
      
      // Stop progress simulation
      clearInterval(progressInterval);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'File upload failed');
      }
      
      const data = await response.json();
      console.log('data after upload temp: ', data);
      
      // Complete progress
      setUploadProgress(100);
      
      // Store the temporary file info
      setTempFileInfo(data.data);
      
      // Update form with temporary path for preview
      setFormData(prevState => ({
        ...prevState,
        file_url: data.data.temp_path
      }));
                  
      setTimeout(() => {
        setFileUploading(false);
        setUploadProgress(0);
      }, 500);
      
    } catch (err) {
      console.error('File upload error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during file upload');
      setFileUploading(false);
    }
  };

  // Step 2: Commit the file and submit the form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || !formData.artist || !tempFileInfo) {
      setError('Please fill in all required fields and upload a file.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Committing file with session ID:', tempFileInfo.session_id);

      // Step 2a: Commit the uploaded file from temp to permanent location
      const commitResponse = await fetch('http://127.0.0.1:8000/api/player/commit-file/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          session_id: tempFileInfo.session_id,
          original_filename: tempFileInfo.original_filename
        }),
      });
      
      if (!commitResponse.ok) {
        const errorText = await commitResponse.text();
        console.error('Commit response error:', errorText);
        throw new Error(`Failed to commit file: ${commitResponse.status}`);
      }
      
      const commitData = await commitResponse.json();
      console.log('File commit response:', commitData);
      
      if (commitData.status !== 'success' || !commitData.data?.file_url) {
        throw new Error('Invalid commit response format');
      }
      
      // Update the file_url with the permanent path
      const updatedFormData = {
        ...formData,
        file_url: commitData.data.file_url
      };
      
      console.log('Creating song with data:', updatedFormData);
      
      
      // Step 2b: Create the song with the permanent file path
      const songResponse = await fetch('http://127.0.0.1:8000/api/player/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedFormData),
      });

      if (!songResponse.ok) {
        const errorData = await songResponse.json();
        throw new Error(errorData.detail || 'Failed to upload song');
      }
      
      const songData = await songResponse.json();
      console.log('Song created successfully:', songData);
      
      // Upload successful
      setSuccess(true);
      
      // Reset form after 3 seconds and redirect
      setTimeout(() => {
        setSuccess(false);
        navigate('/myplayers'); // Navigate to user's songs
      }, 500);
      
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during upload');
    } finally {
      setLoading(false);
    }
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (audioPreview) {
        URL.revokeObjectURL(audioPreview);
      }
    };
  }, [audioPreview]);

  // Format seconds to mm:ss for displaying duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="upload-page">      
      <div className="upload-container">
        <div className="upload-header">
          <h1>Upload Song</h1>
          <p className="upload-subtitle">Share your music with the world</p>
        </div>

        {error && (
          <div className="upload-alert error">
            <span className="alert-icon">!</span>
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="upload-alert success">
            <span className="alert-icon">✓</span>
            <span>Song uploaded successfully!</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-grid">
            <div className="form-column">
              <div className="form-group">
                <label htmlFor="title">Song Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter song title"
                  required
                  className="input-field"
                />
              </div>

              <div className="form-group">
                <label htmlFor="artist">Artist *</label>
                <input
                  type="text"
                  id="artist"
                  name="artist"
                  value={formData.artist}
                  onChange={handleChange}
                  placeholder="Enter artist name"
                  required
                  className="input-field"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="duration">Duration (mm:ss) *</label>
                  <input
                    type="text"
                    id="duration"
                    name="duration"
                    value={formData.duration ? formatDuration(formData.duration) : '--:--'}
                    readOnly
                    className="input-field input-readonly"
                    title="Duration is automatically detected from the audio file"
                    />
                </div>

                <div className="form-group">
                  <label htmlFor="release_date">Release Date</label>
                  <input
                    type="date"
                    id="release_date"
                    name="release_date"
                    value={formData.release_date}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="song_file">Audio File *</label>
                <div className="file-upload-area">
                  <label htmlFor="song_file" className="file-upload-button">
                    {tempFileInfo ? 'Change File' : 'Choose File'}
                  </label>
                  <input
                    type="file"
                    id="song_file"
                    onChange={handleFileUpload}
                    accept=".mp3,.wav,.ogg"
                    className="file-input"
                  />
                  <span className="selected-file">
                    {tempFileInfo ? tempFileInfo.original_filename : 'No file selected'}
                  </span>
                </div>
                
                {fileUploading && (
                  <div className="upload-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{uploadProgress}%</span>
                  </div>
                )}
              </div>
            </div>

            <div className="form-column">
              <div className="form-group lyrics-group">
                <label htmlFor="lyrics">Lyrics</label>
                <textarea
                  id="lyrics"
                  name="lyrics"
                  value={formData.lyrics}
                  onChange={handleChange}
                  placeholder="Enter song lyrics (optional)"
                  rows={10}
                  className="input-field lyrics-field"
                ></textarea>
                {/* <p className="lyrics-tip">
                  Tip: Enter each line of the lyrics on a new line
                </p> */}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-button"
              onClick={async () => {
                // Clean up temp file if exists
                if (tempFileInfo) {
                  await cleanupTempFile();
                }
                // Navigate away
                navigate('/myplayers');
              }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-button"
              disabled={loading || fileUploading || !tempFileInfo}
            >
              {loading ? 'Uploading...' : 'Upload Song'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Upload;