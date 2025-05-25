# Welcome to the **team5-section005-finalproject** repository! This project serves as a testing environment for our client's application, allowing us to make adjustments and improvements before integrating actual data. eam5-section005-finalproject

Welcome to the **LabCyber-Machine-Protocol-Application** repository! This project serves as a testing environment for our client’s application, allowing us to make adjustments and improvements before integrating actual data. 

## Purpose
The primary goal of this repository is to:
- Test the application thoroughly.
- Identify and resolve potential issues.
- Implement necessary modifications.
- Ensure seamless integration with the client’s data.

## Technologies Used

- **JavaScript**: Backend logic and functionality
- **CSS**: Styling and layout
- **HTML**: Structure and content

## Project Structure
```
team5-section005-finalproject/
├── .github/                 # GitHub-specific files and workflows
├── backend/                 # Server-side code
├── frontend/                # Client-side code
├── node_modules/            # Dependencies
├── .gitignore              # Files and directories to ignore in Git
├── README.md               # Project documentation
└── package.json            # Project metadata and dependencies
```

This application provides a platform for documenting machine protocols, projects, and events. Users can upload files to contribute to the documentation repository, while administrators can review and manage these contributions.

# Members
1. Nicolas Cholin
2. Batex Bafika
3. Bekassyl Adenov
4. Rofig Ashumov
5. Ayman Saifan
 
# Problem Description: 
LabCyber requires an IT solution to streamline their documentation process, specifically for machine 
protocol documentation, and to seamlessly integrate with their Git repository.

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager
- GitHub account (optional)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/CabernetOgygiaVillaBanquet/team5-section005-finalproject.git
   cd team5-section005-finalproject
   ```

2. **Install dependencies for both frontend and backend:**
   ```bash
   cd backend
   npm install
   cd ../frontend
   npm install
   ```

3. **Configure environment variables:**

   Create a `.env` file in the backend directory with:
   ```env
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   GITHUB_CALLBACK_URL=http://localhost:3001/auth/github/callback
   SESSION_SECRET=your_session_secret
   SMTP_EMAIL=your_notification_email
   SMTP_PASS=your_email_password
   ADMIN_EMAIL=admin_notification_recipient
   ```

   Create a `.env` file in the frontend directory with:
   ```env
   REACT_APP_GITHUB_TOKEN=your_github_personal_access_token
   ```

4. **Start the servers:**
   ```bash
   # In the backend directory
   npm start
   
   # In the frontend directory (in a new terminal)
   npm start
   ```

## User Guide

### Logging In
Users have two login options:

- **GitHub Login**: Click "Login with GitHub" to authenticate using your GitHub account
- **Local Login**: Use email and password to log in with a local account
- New users can create an account by clicking "Create an account"
- Password reset is available via "Forgot password?"

### Uploading Documentation
After logging in, you'll be directed to the upload dashboard:

1. Select a hierarchy (Project, Machine, Event) or create a new one
2. Choose the appropriate file type for your document
3. Drag and drop your file or click to upload (max 25MB)
4. Optionally rename your file and select a license
5. Click "Upload File" or "Create & Upload"
6. Review the details in the confirmation modal and click "Confirm Upload"
7. The system will create a pull request in the GitHub repository
8. You'll receive a confirmation message when complete

### File Requirements
- **Maximum file size**: 25MB
- **Blocked file extensions**: `.exe`, `.bat`, `.cmd`, `.sh`, `.dll`, `.msi`, `.com`, `.ps1`, `.vbs`, `.zip`
- **For larger video files**: Use the LabCyber Docs channel on MakerTube

## Administrator Guide

### Prerequisites
- Admin password access (default: `labcyber2025`)
- SMTP configuration for email notifications
- GitHub repository permissions for pull request management

### Accessing Admin Dashboard
1. Navigate to `/admin` in the application URL
2. Enter the admin password when prompted
3. You'll be redirected to the admin dashboard overview

### Dashboard Overview
The admin dashboard provides comprehensive management tools:

#### Statistics Panel
- Total uploads across all categories
- Upload breakdown by hierarchy (Project/Machine/Event)
- Upload breakdown by file type
- Recent activity summary

#### Pull Request Management
- **Open Pull Requests**: Pending review and action
- **Closed Pull Requests**: Previously processed requests
- **Search & Filter**: Find specific requests by date, submitter, or hierarchy

### Managing Pull Requests

#### Reviewing Open Pull Requests
1. Navigate to the "Open Pull Requests" section
2. Each entry displays:
   - **File Information**: Name, size, type, and hierarchy
   - **Submitter Details**: Username and submission timestamp
   - **Preview**: File content preview (when applicable)
   - **Actions**: Approve or Reject buttons

#### Approving Pull Requests
1. Review the file content and metadata
2. Verify the file meets documentation standards
3. Click **"Approve"** to:
   - Merge changes into the main branch
   - Move the request to "Closed" status
   - Trigger automatic email notification to submitter

#### Rejecting Pull Requests
1. Identify issues with the submission
2. Click **"Reject"** to:
   - Close the pull request without merging
   - Add optional rejection reason
   - Notify submitter of rejection status

### Email Notification System

#### Automatic Notifications
Administrators receive email alerts for:
- **New Hierarchy Creation**: When users create new Project or Machine categories
- **File Uploads**: When files are uploaded to existing hierarchies
- **System Events**: Critical system notifications and errors

#### Notification Configuration
Email settings are configured in the backend `.env` file:
```env
SMTP_EMAIL=your_notification_email
SMTP_PASS=your_email_password
ADMIN_EMAIL=admin_notification_recipient
```

### Administrative Best Practices

#### Security Guidelines
- Change default admin password regularly
- Monitor failed login attempts
- Review user activity logs periodically
- Keep GitHub tokens secure and rotated

#### Content Management
- Establish clear documentation standards
- Create hierarchy naming conventions
- Regularly archive old or outdated content
- Monitor repository size and performance

#### User Support
- Respond to pull requests within 24-48 hours
- Provide clear rejection reasons when applicable
- Maintain communication with frequent contributors
- Update documentation based on user feedback

## Troubleshooting

### Common Issues
- **Upload Fails**: Check file size and extension compatibility
- **GitHub Authentication Error**: Verify GitHub tokens and permissions
- **Admin Access Denied**: Ensure you're using the correct admin password
- **Email Notifications Not Received**: Check SMTP settings in backend `.env` file

### Support
For additional assistance, contact the system administrator or create an issue in the GitHub repository.

## Contributing
We welcome contributions! Feel free to open issues or submit pull requests.

## License
This project is licensed under the MIT License.