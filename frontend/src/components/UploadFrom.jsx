import React, { useState } from 'react';
import axios from 'axios';
import '../App.css';

function UploadForm({ token }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [machine, setMachine] = useState('Machine A');
  const [uploading, setUploading] = useState(false);

  // Define the machine paths
  const machinePaths = {
    'Machine A': 'Machines/MachineA',
    'Machine B': 'Machines/MachineB',
    'Machine C': 'Machines/MachineC',
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleMachineChange = (event) => {
    setMachine(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('machinePath', machinePaths[machine]);

    try {
      await axios.post('/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert('File uploaded successfully');
    } catch (error) {
      console.error('Error uploading file', error);
      alert('Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="upload-form">
      <label>
        Select Machine:
        <select value={machine} onChange={handleMachineChange} required>
          <option value="Machine A">Machine A</option>
          <option value="Machine B">Machine B</option>
          <option value="Machine C">Machine C</option>
        </select>
      </label>
      <label>
        Upload File:
        <input type="file" onChange={handleFileChange} required />
      </label>
      <button type="submit" disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </form>
  );
}

export default UploadForm;