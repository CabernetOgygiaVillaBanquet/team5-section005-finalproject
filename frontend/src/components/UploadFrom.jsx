import React, { useState } from 'react';
import axios from 'axios';
import '../App.css';

function UploadForm({ token }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [project, setProject] = useState('Project A');
  const [machine, setMachine] = useState('Machine A');
  const [event, setEvent] = useState('load');
  const [uploading, setUploading] = useState(false);

  // Define the project and machine paths
  const projectMachinePaths = {
    'Project A': {
      'Machine A': 'projectA/machineA',
      'Machine B': 'projectA/machineB',
      'Machine C': 'projectA/machineC',
    },
    'Project B': {
      'Machine A': 'projectB/machineA',
      'Machine B': 'projectB/machineB',
      'Machine C': 'projectB/machineC',
    },
    'Project C': {
      'Machine A': 'projectC/machineA',
      'Machine B': 'projectC/machineB',
      'Machine C': 'projectC/machineC',
    },
  };

  // Define the events
  const events = ['Load', 'Type', 'Record'];

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleProjectChange = (event) => {
    setProject(event.target.value);
    setMachine(Object.keys(projectMachinePaths[event.target.value])[0]); // Reset machine to first option of selected project
  };

  const handleMachineChange = (event) => {
    setMachine(event.target.value);
  };

  const handleEventChange = (event) => {
    setEvent(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('path', projectMachinePaths[project][machine]);
    formData.append('event', event);

    try {
      await axios.post('http://localhost:3001/upload', formData, {
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
        Select Project:
        <select value={project} onChange={handleProjectChange} required>
          {Object.keys(projectMachinePaths).map((proj) => (
            <option key={proj} value={proj}>{proj}</option>
          ))}
        </select>
      </label>
      <label>
        Select Machine:
        <select value={machine} onChange={handleMachineChange} required>
          {Object.keys(projectMachinePaths[project]).map((mach) => (
            <option key={mach} value={mach}>{mach}</option>
          ))}
        </select>
      </label>
      <label>
        Select Event:
        <select value={event} onChange={handleEventChange} required>
          {events.map((ev, index) => (
            <option key={index} value={ev}>{ev}</option>
          ))}
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