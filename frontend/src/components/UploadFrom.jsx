import React, { useState } from 'react';
import axios from 'axios';
import '../App.css';

function UploadForm() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedMachine, setSelectedMachine] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');

  const owner = "CabernetOgygiaVillaBanquet";
  const repo = "LabCyber-Machine-Protocol-Application";
  const branch = "main";
  const token = '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';

  const projects = ['ProjectA', 'ProjectB', 'ProjectC'];
  const machines = ['MachineA', 'MachineB', 'MachineC'];
  const events = ['Load', 'Type', 'Record'];

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleProjectChange = (event) => {
    setSelectedProject(event.target.value);
  };

  const handleMachineChange = (event) => {
    setSelectedMachine(event.target.value);
  };

  const handleEventChange = (event) => {
    setSelectedEvent(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setUploading(true);

    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onload = async () => {
      const base64Content = reader.result.split(',')[1];
      const filePath = `${selectedProject}/${selectedMachine}/${selectedEvent}/${selectedFile.name}`;

      try {
        console.log('Uploading to path:', filePath);
        console.log('Base64 content:', base64Content);

        const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
        console.log('GitHub API URL:', url);

        const data = {
          message: `Uploading ${selectedFile.name}`,
          content: base64Content,
          branch: branch,
        };

        const response = await axios.put(url, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("File uploaded successfully!", response.data);
        alert('File uploaded successfully. Awaiting admin validation.');

        // Trigger an issue creation for manual approval
        const issueUrl = `https://api.github.com/repos/${owner}/${repo}/issues`;
        const issueData = {
          title: `Approval required for file upload: ${selectedFile.name}`,
          body: `A new file has been uploaded to the path: ${filePath}. Please review and approve.`,
        };

        await axios.post(issueUrl, issueData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("Issue created successfully!");
      } catch (error) {
        console.error("Error uploading file:", error.message);
        if (error.response) {
          console.error('Error response:', error.response);
        }
        if (error.response && error.response.status === 401) {
          alert('Error uploading file: Unauthorized. Please check your token.');
        } else if (error.response && error.response.status === 404) {
          alert('Error uploading file: Not Found. Please check the repository and path.');
        } else {
          alert('Error uploading file');
        }
      } finally {
        setUploading(false);
      }
    };
  };

  return (
    <form onSubmit={handleSubmit} className="upload-form">
      <label>
        Select Project:
        <select value={selectedProject} onChange={handleProjectChange} required>
          <option value="" disabled>Select a project</option>
          {projects.map((project) => (
            <option key={project} value={project}>{project}</option>
          ))}
        </select>
      </label>
      <label>
        Select Machine:
        <select value={selectedMachine} onChange={handleMachineChange} required>
          <option value="" disabled>Select a machine</option>
          {machines.map((machine) => (
            <option key={machine} value={machine}>{machine}</option>
          ))}
        </select>
      </label>
      <label>
        Select Event:
        <select value={selectedEvent} onChange={handleEventChange} required>
          <option value="" disabled>Select an event</option>
          {events.map((event) => (
            <option key={event} value={event}>{event}</option>
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