import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaProjectDiagram, FaCogs, FaCalendarAlt, FaPlusCircle, FaCheckCircle, FaTimesCircle, FaUpload, FaExclamationTriangle, FaInfoCircle, FaGithub, FaSpinner } from 'react-icons/fa';
import '../App.css';

const BASE_HIERARCHY_OPTIONS = ['Project', 'Machine', 'Event'];
const ADD_NEW_VALUE = 'AddNewHierarchy'; // Unique value for the "Add New" option

// List of blocked file extensions for security
const BLOCKED_EXTENSIONS = ['.exe', '.bat', '.cmd', '.sh', '.dll', '.msi', '.com', '.ps1', '.vbs', '.zip'];
// List of explicitly allowed multimedia extensions
const ALLOWED_MULTIMEDIA = ['.mp4', '.mp3', '.wav', '.avi', '.mov'];

function UploadForm({ user }) {
  // File and Form State
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedHierarchy, setSelectedHierarchy] = useState('');
  const [isAddingNewHierarchy, setIsAddingNewHierarchy] = useState(false);
  const [newHierarchyName, setNewHierarchyName] = useState('');
  const [newHierarchyType, setNewHierarchyType] = useState('Project');
  const [selectedType, setSelectedType] = useState('');
  const [selectedLicense, setSelectedLicense] = useState('');
  const [typeOptions, setTypeOptions] = useState([]);
  const [newFileName, setNewFileName] = useState('');
  const [showToast, setShowToast] = useState(null);
  const [showThankYou, setShowThankYou] = useState(false);

  // Existing hierarchies state
  const [existingHierarchies, setExistingHierarchies] = useState([]);
  const [loadingHierarchies, setLoadingHierarchies] = useState(true);
  const [hierarchyError, setHierarchyError] = useState(null);

  // Form Validation State
  const [formErrors, setFormErrors] = useState({});
  const [formTouched, setFormTouched] = useState({
    hierarchy: false,
    type: false,
    file: false,
    newHierarchyName: false,
    newFileName: false
  });

  // Confirmation Modal State
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationData, setConfirmationData] = useState(null);
  const dropRef = useRef(null);
  const licenseOptions = ['Open', 'Public', 'Private'];
  const owner = "CabernetOgygiaVillaBanquet";
  const repo = "team5-section005-finalproject";
  const branch = "main";
  const token = process.env.REACT_APP_GITHUB_TOKEN;

  // --- Function to fetch existing hierarchies from GitHub ---
  const fetchExistingHierarchies = async () => {
    try {
      setLoadingHierarchies(true);
      setHierarchyError(null);

      const response = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/contents?ref=${branch}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );      // Filter only directories and exclude common non-hierarchy folders
      const excludedFolders = ['.github', 'node_modules', '.git', 'dist', 'build', 'public', 'src', 'assets', 'backend', 'frontend'];
      const hierarchyFolders = response.data
        .filter(item => 
          item.type === 'dir' && 
          !excludedFolders.includes(item.name) &&
          !item.name.startsWith('.')
        )
        .map(item => item.name)
        .sort();

      setExistingHierarchies(hierarchyFolders);
    } catch (error) {
      console.error('Error fetching existing hierarchies:', error);
      setHierarchyError('Failed to load existing hierarchies');
      // Fallback to empty array if fetch fails
      setExistingHierarchies([]);
    } finally {
      setLoadingHierarchies(false);
    }
  };

  // --- Effect to fetch existing hierarchies on component mount ---
  useEffect(() => {
    fetchExistingHierarchies();
  }, []);

  // --- Helper function to format file size in MB ---
  const formatFileSize = (bytes) => {
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(2) + ' MB';
  };

  // --- Helper function to check if file type is allowed ---
  const isFileTypeAllowed = (fileName) => {
    const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
    return !BLOCKED_EXTENSIONS.includes(ext);
  };

  // --- Effects and Helper Functions (mostly unchanged) ---
  useEffect(() => {
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setPreviewURL(reader.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreviewURL(null);
    }
  }, [selectedFile]);
  const getTypeOptionsForHierarchy = (hierarchy) => {
    // Default hierarchies with their specific types
    if (hierarchy === 'Project') {
      return ['Conception File', 'Fabrication File', 'Recording', 'Report'];
    } else if (hierarchy === 'Machine') {
      return ['Written Protocol', 'Filmed Manipulation', 'Validated Fabrication File'];
    } else if (hierarchy === 'Event') {
      return ['Presentation', 'Recording', 'Picture'];
    } 
    // For existing hierarchies from repository, try to detect type based on name patterns
    else if (existingHierarchies.includes(hierarchy)) {
      const hierarchyLower = hierarchy.toLowerCase();
      
      // Try to detect if it's a project-like hierarchy
      if (hierarchyLower.includes('project') || hierarchyLower.includes('prototype') || 
          hierarchyLower.includes('design') || hierarchyLower.includes('build')) {
        return ['Conception File', 'Fabrication File', 'Recording', 'Report', 'Documentation', 'Schematic'];
      }
      // Try to detect if it's a machine-like hierarchy
      else if (hierarchyLower.includes('machine') || hierarchyLower.includes('device') || 
               hierarchyLower.includes('tool') || hierarchyLower.includes('equipment') ||
               hierarchyLower.includes('instrument') || hierarchyLower.includes('apparatus')) {
        return ['Written Protocol', 'Filmed Manipulation', 'Validated Fabrication File', 'Manual', 'Calibration'];
      }
      // Try to detect if it's an event-like hierarchy
      else if (hierarchyLower.includes('event') || hierarchyLower.includes('conference') || 
               hierarchyLower.includes('workshop') || hierarchyLower.includes('meeting') ||
               hierarchyLower.includes('seminar') || hierarchyLower.includes('presentation')) {
        return ['Presentation', 'Recording', 'Picture', 'Notes', 'Summary'];
      }
      // Default comprehensive options for any existing hierarchy
      else {
        return [
          'Documentation', 'Manual', 'Report', 'Recording', 'Picture', 
          'Presentation', 'Protocol', 'Schematic', 'Data File', 'Other'
        ];
      }
    } 
    // Fallback for unknown hierarchies
    else {
      return [];
    }
  };

  const handleHierarchyChange = (event) => {
    // ... (implementation unchanged)
    const selected = event.target.value;
    setSelectedType('');

    if (selected === ADD_NEW_VALUE) {
      setIsAddingNewHierarchy(true);
      setSelectedHierarchy(ADD_NEW_VALUE);
      setNewHierarchyName('');
      setTypeOptions(getTypeOptionsForHierarchy(newHierarchyType));
    } else {
      setIsAddingNewHierarchy(false);
      setSelectedHierarchy(selected);
      setNewHierarchyName('');
      setTypeOptions(getTypeOptionsForHierarchy(selected));
    }
  };

  useEffect(() => {
    if (isAddingNewHierarchy) {
      setTypeOptions(getTypeOptionsForHierarchy(newHierarchyType));
      setSelectedType('');
    }
  }, [newHierarchyType, isAddingNewHierarchy]);


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!isFileTypeAllowed(file.name)) {
        showMessage(`❌ File type not allowed for security reasons. Blocked file types: ${BLOCKED_EXTENSIONS.join(', ')}`, 'error');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      if (!isFileTypeAllowed(file.name)) {
        showMessage(`❌ File type not allowed for security reasons. Blocked file types: ${BLOCKED_EXTENSIONS.join(', ')}`, 'error');
        return;
      }
      setSelectedFile(file);
    }
    dropRef.current.classList.remove('drag-over');
  };

  const handleDragOver = (e) => {
    // ... (implementation unchanged)
      e.preventDefault();
      dropRef.current.classList.add('drag-over');
  };

  const handleDragLeave = () => {
    // ... (implementation unchanged)
      dropRef.current.classList.remove('drag-over');
  }

  const showMessage = (msg, type = 'success') => {
    // ... (implementation unchanged)
    setShowToast({ message: msg, type });
    setTimeout(() => setShowToast(null), 4000);
  };

  // --- Enhanced Form Validation ---
  const validateForm = () => {
    const errors = {};
    
    // Validate hierarchy
    if (isAddingNewHierarchy) {
      if (!newHierarchyName.trim()) {
        errors.newHierarchyName = 'Please enter a name for the new Project/Machine';
      } else if (/[\\/]/.test(newHierarchyName)) {
        errors.newHierarchyName = 'Name cannot contain slashes';
      } else if (newHierarchyName.length < 3) {
        errors.newHierarchyName = 'Name must be at least 3 characters';
      }
    } else if (!selectedHierarchy) {
      errors.hierarchy = 'Please select a hierarchy';
    }
    
    // Validate type
    if (!selectedType) {
      errors.type = 'Please select a type';
    }
    
    // Validate file
    if (!selectedFile) {
      errors.file = 'Please select a file to upload';
    } else if (selectedFile.size > 50 * 1024 * 1024) { // 50MB limit
      errors.file = 'File size exceeds 50MB limit';
    } else if (!isFileTypeAllowed(selectedFile.name)) {
      errors.file = `File type not allowed. Blocked file types: ${BLOCKED_EXTENSIONS.join(', ')}`;
    }
    
    // Validate filename if provided
    if (newFileName.trim() && /[\\/:*?"<>|]/.test(newFileName)) {
      errors.newFileName = 'Filename contains invalid characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // --- Function to Initiate Upload (Shows Modal) ---
  const handleInitiateUpload = (event) => {
    event.preventDefault();
    setFormTouched({ hierarchy: true, type: true, file: true, newHierarchyName: true, newFileName: true });
    
    if (!validateForm()) {
      showMessage('Please fix the errors in the form', 'error');
      return;
    }
    
    // Determine the final hierarchy name
    const finalHierarchyName = isAddingNewHierarchy ? newHierarchyName.trim() : selectedHierarchy;

    // Prepare data for the confirmation modal
    const finalFileName = newFileName.trim() || selectedFile.name;
    const data = {
        isNew: isAddingNewHierarchy,
        hierarchyName: finalHierarchyName,
        hierarchyType: isAddingNewHierarchy ? newHierarchyType : selectedHierarchy,
        fileType: selectedType,
        license: selectedLicense || 'None',
        originalFileName: selectedFile.name,
        finalFileName: finalFileName,
        fileSize: formatFileSize(selectedFile.size),
        user: user?.isLocal 
          ? (user?.name || user?.username || 'Local User') 
          : (user?.name || user?.login || 'GitHub User'),
        email: user?.email || 'N/A',
        isLocalUser: user?.isLocal || false
    };

    setConfirmationData(data); // Store data
    setShowConfirmationModal(true); // Show the modal
  };

  // --- RENAMED: Function to Handle Actual Upload (Called from Modal) ---
  const handleConfirmUpload = async () => {
    setShowConfirmationModal(false); // Hide modal first
    if (!selectedFile || !confirmationData) return; // Safety check

    setUploading(true);
    setShowThankYou(false);

    const { hierarchyName, fileType, finalFileName, isNew, hierarchyType, isLocalUser } = confirmationData; // Use data from confirmation

    const reader = new FileReader();
    reader.readAsDataURL(selectedFile); // Read the file *after* confirmation

    reader.onload = async () => {
      const base64Content = reader.result.split(',')[1];
      const filePath = `${hierarchyName}/${fileType}/${finalFileName}`;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const branchAction = isNew ? 'create' : 'upload';
      // Use correct type for branch name if new
      const branchHierarchyType = isNew ? hierarchyType : hierarchyName;
      const branchName = `${branchAction}-${branchHierarchyType.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${timestamp}`;

      const commitMessage = `[LabCyber Docs] ${isNew ? 'Create '+hierarchyType+' '+hierarchyName+' and upload' : 'Upload'} ${finalFileName} to ${hierarchyName}/${fileType}`;
      const prTitle = `[LabCyber Docs] ${isNew ? 'Add '+hierarchyType+' '+hierarchyName : `${finalFileName} for ${hierarchyName}`}`;
      const prBody = `Documentation ${isNew ? 'creation and ' : ''}upload for:\n- Hierarchy: ${hierarchyName} ${isNew ? '('+hierarchyType+')' : ''}\n- Type: ${fileType}\n- License: ${selectedLicense || 'None'}\n\n_Automated upload via LabCyber Docs App_`;

      try {
        // ... (GitHub API calls - unchanged logic, using confirmed data) ...
        console.log(`Attempting to get ref for branch: ${branch}`);
        const refRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${branch}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const mainSha = refRes.data.object.sha;

        console.log(`Creating new branch: ${branchName}`);
        await axios.post(`https://api.github.com/repos/${owner}/${repo}/git/refs`, { ref: `refs/heads/${branchName}`, sha: mainSha }, { headers: { Authorization: `Bearer ${token}` } });

        console.log(`Uploading file to: ${filePath} on branch ${branchName}`);
        await axios.put(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, { message: commitMessage, content: base64Content, branch: branchName }, { headers: { Authorization: `Bearer ${token}` } });

        console.log(`Creating Pull Request from ${branchName} to ${branch}`);
        const prRes = await axios.post(`https://api.github.com/repos/${owner}/${repo}/pulls`, { title: prTitle, head: branchName, base: branch, body: prBody }, { headers: { Authorization: `Bearer ${token}` } });
        const prUrl = prRes.data.html_url;

        console.log(`Pull Request created: ${prUrl}`);
        showMessage(`✅ Pull Request Created: ${prUrl}`);

        console.log("Notifying admin...");
        await axios.post('http://localhost:3001/notify-admin', {
          fileName: finalFileName,
          hierarchy: hierarchyName,
          type: fileType,
          prUrl,
          username: user?.isLocal 
            ? (user?.name || user?.username || 'Local User') 
            : (user?.login || user?.name || user?.username || 'GitHub User'),
          email: user?.email || 'N/A',
          isNewHierarchy: isNew,
          newHierarchyType: isNew ? hierarchyType : null,
          isGithubUser: !isLocalUser // true for GitHub users, false for local users
        });
        console.log("Admin notified.");

        // Reset form state
        setSelectedFile(null);
        setNewFileName('');
        setSelectedLicense('');
        setSelectedType('');
        setSelectedHierarchy('');
        setIsAddingNewHierarchy(false);
        setNewHierarchyName('');
        setNewHierarchyType('Project');
        setTypeOptions([]);
        setPreviewURL(null);
        setConfirmationData(null); // Clear confirmation data
        setShowThankYou(true);

      } catch (error) {
        console.error("GitHub API Error:", error.response?.data || error.message);
        showMessage(`❌ Upload failed. ${error.response?.data?.message || error.message}`, 'error');
        setConfirmationData(null); // Clear confirmation data on error too
      } finally {
        setUploading(false);
      }
    };

    reader.onerror = (error) => {
      console.error("FileReader Error:", error);
      showMessage('❌ Failed to read file.', 'error');
      setUploading(false);
      setConfirmationData(null); // Clear confirmation data
    };
  };

  // --- Render Function ---
  return (
    // Pass handleInitiateUpload to the form's onSubmit
    <form className="upload-form" onSubmit={handleInitiateUpload}>
      {showToast && <div className={`toast ${showToast.type}`}>{showToast.message}</div>}      {/* --- Form Fields (updated to include existing hierarchies) --- */}
      <div className={`form-group ${formErrors.hierarchy ? 'error' : ''}`}>
        <label><FaProjectDiagram /> Hierarchy:</label>
        {loadingHierarchies ? (
          <div className="loading-hierarchies">
            <FaSpinner className="spinner" /> Loading existing hierarchies...
          </div>
        ) : (
          <select 
            value={selectedHierarchy} 
            onChange={(e) => {
              handleHierarchyChange(e);
              setFormTouched({...formTouched, hierarchy: true});
            }} 
            className={formErrors.hierarchy && formTouched.hierarchy ? 'error-input' : ''}
            required={!isAddingNewHierarchy}
          >
            <option value="" disabled>Select a hierarchy or add new</option>
            
            {/* Default hierarchy options */}
            <optgroup label="Default Hierarchies">
              {BASE_HIERARCHY_OPTIONS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </optgroup>
            
            {/* Existing hierarchies from repository */}
            {existingHierarchies.length > 0 && (
              <optgroup label="Existing Hierarchies">
                {existingHierarchies.map(hierarchy => (
                  <option key={hierarchy} value={hierarchy}>{hierarchy}</option>
                ))}
              </optgroup>
            )}
            
            <optgroup label="Create New">
              <option value={ADD_NEW_VALUE}>+ Add New Project/Machine...</option>
            </optgroup>
          </select>
        )}
        
        {hierarchyError && (
          <div className="error-message">
            <FaExclamationTriangle /> {hierarchyError}
            <button 
              type="button" 
              onClick={fetchExistingHierarchies}
              className="retry-button"
              style={{ marginLeft: '10px', fontSize: '12px', padding: '2px 6px' }}
            >
              Retry
            </button>
          </div>
        )}
        
        {formErrors.hierarchy && formTouched.hierarchy && (
          <div className="error-message"><FaExclamationTriangle /> {formErrors.hierarchy}</div>
        )}
      </div>

      {isAddingNewHierarchy && (
        <div className="form-group fade-in">
          <label htmlFor="newHierarchyType"><FaPlusCircle/> New Hierarchy Type:</label>
          <select 
            id="newHierarchyType" 
            value={newHierarchyType} 
            onChange={(e) => setNewHierarchyType(e.target.value)}
            className="enhanced-select"
          >
            <option value="Project">Project</option>
            <option value="Machine">Machine</option>
          </select>

          <label htmlFor="newHierarchyName" style={{marginTop: '10px'}}>
            <FaPlusCircle /> New {newHierarchyType} Name:
          </label>
          <input 
            type="text" 
            id="newHierarchyName" 
            placeholder={`Enter name for the new ${newHierarchyType}`} 
            value={newHierarchyName} 
            onChange={(e) => {
              setNewHierarchyName(e.target.value.replace(/ /g, '-'));
              setFormTouched({...formTouched, newHierarchyName: true});
            }} 
            className={formErrors.newHierarchyName && formTouched.newHierarchyName ? 'error-input' : ''}
            required={isAddingNewHierarchy} 
          />
          {formErrors.newHierarchyName && formTouched.newHierarchyName && (
            <div className="error-message"><FaExclamationTriangle /> {formErrors.newHierarchyName}</div>
          )}
          <div className="field-hint">
            <FaInfoCircle /> Name will be used as a folder in the repository
          </div>
        </div>
      )}

      {(selectedHierarchy && selectedHierarchy !== ADD_NEW_VALUE || isAddingNewHierarchy) && (
        <div className={`form-group fade-in ${formErrors.type ? 'error' : ''}`}>
          <label><FaCogs /> Type:</label>
          <select 
            value={selectedType} 
            onChange={(e) => {
              setSelectedType(e.target.value);
              setFormTouched({...formTouched, type: true});
            }} 
            className={formErrors.type && formTouched.type ? 'error-input' : ''}
            required
          >
            <option value="" disabled>Select a type</option>
            {typeOptions.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
          {formErrors.type && formTouched.type && (
            <div className="error-message"><FaExclamationTriangle /> {formErrors.type}</div>
          )}
          <div className="field-hint">
            <FaInfoCircle /> Type determines the subfolder for your file
          </div>
        </div>
      )}

      <div className="form-group fade-in">
        <label><FaCalendarAlt /> License:</label>
        <select value={selectedLicense} onChange={(e) => setSelectedLicense(e.target.value)}>
           {/* Options... */}
           <option value="">Select a license (Optional)</option>
           {licenseOptions.map((license) => (<option key={license} value={license}>{license}</option>))}
        </select>
      </div>

      <div 
        className={`drop-zone ${selectedFile ? 'has-file' : ''} ${formErrors.file ? 'error-border' : ''}`} 
        ref={dropRef} 
        onDrop={handleDrop} 
        onDragOver={handleDragOver} 
        onDragLeave={handleDragLeave} 
        onClick={() => dropRef.current.querySelector('input[type="file"]').click()}
      >
        <input type="file" onChange={handleFileChange} style={{ display: 'none' }} />
        {selectedFile ? (
          <div className="file-selected">
            <FaCheckCircle size={24} color="#4CAF50" />
            <p><strong>{selectedFile.name}</strong></p>
            <small>Drag & drop or click to change</small>
            <div className="file-user-info">
              <span className={`file-user ${user?.isLocal ? 'local-user' : 'github-user'}`}>
                {user?.isLocal ? '👤' : <FaGithub />} Submitted by: {
                  user?.isLocal 
                    ? (user?.name || user?.username || 'Local User') 
                    : (user?.login || user?.name || user?.username || 'GitHub User')
                }
              </span>
            </div>
          </div>
        ) : (
          <div className="file-upload-prompt">
            <FaUpload size={32} color="#2196F3" />
            <p><strong>Drag & Drop file here</strong></p>
            <small>or Click to Upload</small>
            {formErrors.file && <p className="error-text"><FaExclamationTriangle /> {formErrors.file}</p>}
          </div>
        )}
      </div>

      {/* Add file size limit notice */}
      <div className="file-size-notice">
        <FaInfoCircle /> <strong>Note:</strong> Files larger than 25 MB (Machine Manipulation Videos) should be uploaded to the <a href="https://makertube.net/a/labcyber_docs/video-channels" target="_blank" rel="noopener noreferrer">LabCyber Docs channel</a> instead.
      </div>

      {selectedFile && (
        <div className="preview-card fade-in">
           {/* Preview content... */}
           {previewURL && <img src={previewURL} alt="preview" className="preview-image" />}
           <p><strong>Name:</strong> {selectedFile.name}</p>
           <p><strong>Size:</strong> {formatFileSize(selectedFile.size)}</p>
           <p><strong>Type:</strong> {selectedFile.type || 'N/A'}</p>
        </div>
      )}

      <div className={`form-group fade-in ${formErrors.newFileName ? 'error' : ''}`}>
        <label htmlFor="renameFile">Rename File (Optional):</label>
        <input 
          id="renameFile" 
          type="text" 
          placeholder={`Defaults to "${selectedFile ? selectedFile.name : 'original name'}"`} 
          value={newFileName} 
          onChange={(e) => {
            setNewFileName(e.target.value);
            setFormTouched({...formTouched, newFileName: true});
          }} 
          className={formErrors.newFileName && formTouched.newFileName ? 'error-input' : ''}
          disabled={!selectedFile} 
        />
        {formErrors.newFileName && formTouched.newFileName && (
          <div className="error-message"><FaExclamationTriangle /> {formErrors.newFileName}</div>
        )}
        {newFileName && (
          <div className="field-hint success">
            <FaCheckCircle /> Final name will be: <strong>{newFileName.trim() || (selectedFile ? selectedFile.name : '')}</strong>
          </div>
        )}
      </div>

      {/* --- Submit Button (Triggers Modal via onSubmit) --- */}
      <button
        type="submit"
        className="hatom-button submit-button"
        disabled={uploading || !selectedFile || (!selectedHierarchy && !isAddingNewHierarchy) || (isAddingNewHierarchy && !newHierarchyName.trim()) || !selectedType}
      >
        {uploading ? (
          <span className="button-content">
            <span className="spinner"></span> Processing...
          </span>
        ) : (
          <span className="button-content">
            {isAddingNewHierarchy ? (
              <><FaPlusCircle className="button-icon" /> Create & Upload</>
            ) : (
              <><FaUpload className="button-icon" /> Upload File</>
            )}
          </span>
        )}
      </button>

      {showThankYou && (
         // Thank you message...
         <div className="thank-you fade-in"> 🎉 <strong>Thank you</strong> for contributing to the LabCyber documentation!<br /> Your effort is appreciated and helps the whole community 🌱 <br/> The Pull Request needs to be reviewed and merged by an administrator. </div>
      )}

      {/* --- NEW: Confirmation Modal --- */}
      {showConfirmationModal && confirmationData && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>Confirm Upload Details</h3>
            <hr />
            {confirmationData.isNew ? (
              <p><strong>Action:</strong> Create New {confirmationData.hierarchyType}</p>
            ) : (
              <p><strong>Action:</strong> Upload to Existing Hierarchy</p>
            )}
            <p><strong>Hierarchy:</strong> {confirmationData.hierarchyName} {confirmationData.isNew ? `(${confirmationData.hierarchyType})` : ''}</p>
            <p><strong>File Type:</strong> {confirmationData.fileType}</p>
            <p><strong>License:</strong> {confirmationData.license}</p>
            <p><strong>File:</strong> {confirmationData.finalFileName}</p>
            <p><strong>Size:</strong> {confirmationData.fileSize}</p>
            <p><strong>User:</strong> {confirmationData.user}</p>
            
            <div className="modal-actions">
              <button 
                className="hatom-button cancel-button" 
                onClick={() => setShowConfirmationModal(false)}
              >
                <FaTimesCircle /> Cancel
              </button>
              <button 
                className="hatom-button confirm-button" 
                onClick={handleConfirmUpload}
                disabled={uploading}
              >
                {uploading ? (
                  <><span className="spinner"></span> Processing...</>
                ) : (
                  <><FaCheckCircle /> Confirm Upload</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

export default UploadForm;