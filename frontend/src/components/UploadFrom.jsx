import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaProjectDiagram, FaCogs, FaCalendarAlt } from 'react-icons/fa';
import '../App.css';

function UploadForm() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedHierarchy, setSelectedHierarchy] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedLicense, setSelectedLicense] = useState('');
  const [typeOptions, setTypeOptions] = useState([]);
  const [newFileName, setNewFileName] = useState('');
  const [showToast, setShowToast] = useState(null);

  const dropRef = useRef(null);

  const licenseOptions = ['Open', 'Public', 'Private'];

  const owner = "CabernetOgygiaVillaBanquet";
  const repo = "LabCyber-Machine-Protocol-Application";
  const branch = "main";
  const token = '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';

  useEffect(() => {
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setPreviewURL(reader.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreviewURL(null);
    }
  }, [selectedFile]);

  const handleHierarchyChange = (event) => {
    const selected = event.target.value;
    setSelectedHierarchy(selected);
    setSelectedType('');
    if (selected === 'Project') {
      setTypeOptions(['Conception File', 'Fabrication File', 'Recording', 'Report']);
    } else if (selected === 'Machine') {
      setTypeOptions(['Written Protocol', 'Filmed Manipulation', 'Validated Fabrication File']);
    } else if (selected === 'Event') {
      setTypeOptions(['Presentation', 'Recording', 'Picture']);
    } else {
      setTypeOptions([]);
    }
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFileSelect(file);
  };

  const showMessage = (msg, type = 'success') => {
    setShowToast({ message: msg, type });
    setTimeout(() => setShowToast(null), 4000);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile || !selectedHierarchy || !selectedType) return;

    setUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onload = async () => {
      const base64Content = reader.result.split(',')[1];
      const fileName = newFileName || selectedFile.name;
      const filePath = `${selectedHierarchy}/${selectedType}/${fileName}`;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const branchName = `upload-${selectedHierarchy.toLowerCase()}-${timestamp}`;

      try {
        const refRes = await axios.get(
          `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${branch}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const mainSha = refRes.data.object.sha;

        await axios.post(
          `https://api.github.com/repos/${owner}/${repo}/git/refs`,
          {
            ref: `refs/heads/${branchName}`,
            sha: mainSha,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        await axios.put(
          `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
          {
            message: `[LabCyber Docs] Upload ${fileName} to ${selectedHierarchy}/${selectedType}`,
            content: base64Content,
            branch: branchName,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const prRes = await axios.post(
          `https://api.github.com/repos/${owner}/${repo}/pulls`,
          {
            title: `[LabCyber Docs] ${fileName} for ${selectedHierarchy}`,
            head: branchName,
            base: branch,
            body: `Documentation upload for:\n- Type: ${selectedType}\n- License: ${selectedLicense || 'None'}\n\n_Automated upload via LabCyber Docs App_`,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const prUrl = prRes.data.html_url;
        showMessage(`✅ Pull Request Created: ${prUrl}`);
        setSelectedFile(null);
        setNewFileName('');
        setSelectedLicense('');
      } catch (error) {
        console.error(error);
        showMessage('❌ Upload failed.', 'error');
      } finally {
        setUploading(false);
      }
    };
  };

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      {showToast && (
        <div className={`toast ${showToast.type}`}>{showToast.message}</div>
      )}

      <div className="form-group">
        <label><FaProjectDiagram /> Hierarchy:</label>
        <select value={selectedHierarchy} onChange={handleHierarchyChange} required>
          <option value="" disabled>Select a hierarchy</option>
          <option value="Project">Project</option>
          <option value="Machine">Machine</option>
          <option value="Event">Event</option>
        </select>
      </div>

      {selectedHierarchy && (
        <div className="form-group fade-in">
          <label><FaCogs /> Type:</label>
          <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} required>
            <option value="" disabled>Select a type</option>
            {typeOptions.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
      )}

      <div className="form-group fade-in">
        <label><FaCalendarAlt /> License:</label>
        <select value={selectedLicense} onChange={(e) => setSelectedLicense(e.target.value)}>
          <option value="" disabled>Select a license</option>
          {licenseOptions.map((license) => (
            <option key={license} value={license}>{license}</option>
          ))}
        </select>
      </div>

      <div
        className="drop-zone"
        ref={dropRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <p>{selectedFile ? '✅ File Selected!' : '📁 Drag & Drop or Click to Upload'}</p>
        <input type="file" onChange={handleFileChange} />
      </div>

      {selectedFile && (
        <div className="preview-card fade-in">
          {previewURL && <img src={previewURL} alt="preview" className="preview-image" />}
          <p><strong>Name:</strong> {selectedFile.name}</p>
          <p><strong>Size:</strong> {(selectedFile.size / 1024).toFixed(2)} KB</p>
          <p><strong>Type:</strong> {selectedFile.type}</p>
        </div>
      )}

      <div className="form-group fade-in">
        <label>Rename File:</label>
        <input type="text" placeholder="Optional file name" value={newFileName} onChange={(e) => setNewFileName(e.target.value)} />
      </div>

      <button type="submit" className="hatom-button" disabled={uploading || !selectedFile}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </form>
  );
}

export default UploadForm;
