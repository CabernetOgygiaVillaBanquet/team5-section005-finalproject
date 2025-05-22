# LabCyber-Machine-Protocol-Application

Welcome to the **LabCyber-Machine-Protocol-Application** repository! This project serves as a testing environment for our client’s application, allowing us to make adjustments and improvements before integrating actual data. 

## Purpose
The primary goal of this repository is to:
- Test the application thoroughly.
- Identify and resolve potential issues.
- Implement necessary modifications.
- Ensure seamless integration with the client’s data.

## Technologies Used
- **JavaScript**: Backend logic and functionality.
- **CSS**: Styling and layout.
- **HTML**: Structure and content.

## Project Structure
```
LabCyber-Machine-Protocol-Application/
├── .github/ (GitHub-specific files and workflows)
├── backend/ (Server-side code)
├── frontend/ (Client-side code)
├── node_modules/ (Dependencies)
├── .gitignore (Files and directories to ignore in Git)
├── README.md (Project documentation)
└── package.json (Project metadata and dependencies)
```
This application provides a platform for documenting machine protocols, projects, and events. Users can upload files to contribute to the documentation repository, while administrators can review and manage these contributions.

## Getting Started
Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager
- GitHub account (optional)

## Installation
1) Clone the repository:
git clone https://github.com/CabernetOgygiaVillaBanquet/LabCyber-Machine-Protocol-Application.git
cd LabCyber-Machine-Protocol-Application

2) Install dependencies for both frontend and backend:
cd backend
npm install
cd ../frontend
npm install

3) Configure environment variables:

Create a .env file in the backend directory with:
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:3001/auth/github/callback
SESSION_SECRET=your_session_secret
SMTP_EMAIL=your_notification_email
SMTP_PASS=your_email_password
ADMIN_EMAIL=admin_notification_recipient

Create a .env file in the frontend directory with:
REACT_APP_GITHUB_TOKEN=your_github_personal_access_token

Start the servers:
- In the backend directory: npm start
- In the frontend directory: npm start

## User Guide
Logging In
Users have two login options:

GitHub Login: Click "Login with GitHub" to authenticate using your GitHub account
Local Login: Use email and password to log in with a local account
New users can create an account by clicking "Create an account"
Password reset is available via "Forgot password?"
Uploading Documentation
After logging in, you'll be directed to the upload dashboard
Select a hierarchy (Project, Machine, Event) or create a new one
Choose the appropriate file type for your document
Drag and drop your file or click to upload (max 25MB)
Optionally rename your file and select a license
Click "Upload File" or "Create & Upload"
Review the details in the confirmation modal and click "Confirm Upload"
The system will create a pull request in the GitHub repository
You'll receive a confirmation message when complete
File Requirements
Maximum file size: 25MB
Blocked file extensions: .exe, .bat, .cmd, .sh, .dll, .msi, .com, .ps1, .vbs, .zip
For larger video files, use the LabCyber Docs channel on MakerTube
Administrator Guide
Accessing Admin Dashboard
Navigate to /admin in the application
Enter the admin password (default: labcyber2025)
Managing Pull Requests
The admin dashboard provides:

Statistics on uploads (total, by hierarchy, by type)
Open pull requests awaiting review
Closed/processed pull requests
Search and filtering capabilities

To review a pull request:
- View the file information, including hierarchy, type, and submitter
- Click "Approve" to merge the changes into the main branch
- Click "Reject" to close the pull request without merging

### Email Notifications
Administrators receive email notifications when:
- A new hierarchy (Project/Machine) is created
- A new file is uploaded to an existing hierarchy

## Troubleshooting
### Common Issues
- **Upload Fails**: Check file size and extension compatibility
- **GitHub Authentication Error**: Verify GitHub tokens and permissions
- **Admin Access Denied**: Ensure you're using the correct admin password
- **Email Notifications Not Received**: Check SMTP settings in backend .env file

### Support
For additional assistance, contact the system administrator or create an issue in the GitHub repository.

## Contributing
We welcome contributions! Feel free to open issues or submit pull requests.

## License
This project is licensed under the MIT License.