const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const session = require('express-session'); // <<< CORRECTED LINE
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = 3001;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// Session configuration
app.use(session({ // <<< Now this will work correctly
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Adjust for production (true) if using HTTPS
    httpOnly: true,
    sameSite: 'lax' // Or 'strict'
  }
}));

// Passport GitHub OAuth
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL, // e.g., http://localhost:3001/auth/github/callback
},
(accessToken, refreshToken, profile, done) => {
  // You might want to select specific profile fields here
  // Or fetch user details from your DB if needed
  return done(null, profile); // Pass GitHub profile directly
}));

// Multer upload (Kept as in original code)
// Multer upload with file type filtering
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
  filename: (req, file, cb) => cb(null, file.originalname)
});

// File filter to block dangerous file types
const fileFilter = (req, file, cb) => {
  // List of blocked file extensions
  const blockedExtensions = [
    '.exe', '.bat', '.cmd', '.sh', '.dll', '.msi', 
    '.com', '.ps1', '.vbs', '.zip'
  ];
  
  // List of allowed file extensions (explicitly allow multimedia)
  const allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/svg+xml',
    'application/pdf', 'text/plain', 'text/markdown',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'video/mp4', 'audio/mpeg', 'audio/mp3' // Explicitly allow multimedia files
  ];
  
  // Get file extension
  const ext = path.extname(file.originalname).toLowerCase();
  
  // Check if file extension is in the blocked list
  if (blockedExtensions.includes(ext)) {
    return cb(new Error('File type not allowed for security reasons'), false);
  }
  
  // Additional check for mime type (when available)
  if (file.mimetype && !allowedMimeTypes.includes(file.mimetype)) {
    // For files without a recognized mime type, check extension
    const isAllowedExtension = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.pdf', '.txt', '.md', 
                               '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.mp4', '.mp3']
                               .includes(ext);
    
    if (!isAllowedExtension) {
      return cb(new Error('File type not allowed'), false);
    }
  }
  
  // File passed all checks
  cb(null, true);
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB file size limit
  }
});

// Error handling middleware for file upload errors
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 25MB.' });
    }
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded.');
  
  // Convert file size to MB for the response
  const fileSizeInMB = (req.file.size / (1024 * 1024)).toFixed(2);
  
  res.json({
    message: 'File uploaded successfully. Awaiting admin validation.',
    file: {
      name: req.file.originalname,
      size: `${fileSizeInMB} MB`,
      type: req.file.mimetype
    }
  });
});

// GitHub Auth routes (Kept as in original code)
app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] })); // Added email scope
app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: 'http://localhost:3000/login' }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('http://localhost:3000/');
  }
);

app.get('/logout', (req, res, next) => { // Changed to POST potentially later, keeping GET for now as per original
  req.logout((err) => {
    if (err) { return next(err); }
    req.session.destroy((err) => {
      if (err) { return next(err); }
      res.clearCookie('connect.sid', { path: '/' });
      res.status(200).send('Logged out'); // Send JSON confirmation if preferred by frontend
    });
  });
});

app.get('/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.send(req.user);
  } else {
    res.status(401).send('Unauthorized');
  }
});


// 📩 Route to notify admin via email after upload (MODIFIED)
app.post('/notify-admin', async (req, res) => {
  // Destructure all expected fields, including the new ones
  const {
      fileName,
      hierarchy, // This is the name of the project/machine/event (new or existing)
      type,
      prUrl,
      username,
      email,
      isNewHierarchy,   // <<< New field (boolean)
      newHierarchyType, // <<< New field (string: 'Project' or 'Machine'), present if isNewHierarchy=true
      isGithubUser      // <<< New field (boolean) to identify if user is from GitHub or local
    } = req.body;

  // Basic validation - check essential fields
  if (!fileName || !hierarchy || !type || !prUrl || !username) {
      console.error('Missing required fields for notification:', req.body);
      return res.status(400).json({ error: 'Missing required notification details.' });
  }


  const transporter = nodemailer.createTransport({
    service: 'gmail', // Or your preferred service
    auth: {
      user: process.env.SMTP_EMAIL, // Ensure these are in your .env
      pass: process.env.SMTP_PASS
    }
  });

  // --- Construct Email Subject and Body Conditionally ---
  let emailSubject = '';
  let emailHtmlBody = '';
  const userType = isGithubUser ? 'GitHub User' : 'Local User';
  const displayUser = `${username} (${email || 'No email provided'}) - ${userType}`;

  if (isNewHierarchy) {
      // ** Email for NEW Project/Machine creation + upload **
      emailSubject = `✨ New ${newHierarchyType} & Upload: ${fileName} for "${hierarchy}"`; // More specific subject
      emailHtmlBody = `
        <h3>✨ New ${newHierarchyType} Created & File Uploaded</h3>
        <p>A new ${newHierarchyType ? newHierarchyType.toLowerCase() : 'item'} has been proposed along with an initial file.</p>
        <hr>
        <p><strong>User:</strong> ${displayUser}</p>
        <p><strong>Proposed New ${newHierarchyType || 'Hierarchy'} Name:</strong> ${hierarchy}</p>
        <p><strong>File Type:</strong> ${type}</p>
        <p><strong>Uploaded File:</strong> ${fileName}</p>
        <hr>
        <p><a href="${prUrl}" style="font-weight: bold;">🔗 Review Pull Request & New Hierarchy</a></p>
        <p>Please review the proposed <strong>${newHierarchyType ? newHierarchyType.toLowerCase() : 'hierarchy'}</strong> and the uploaded file via the Pull Request.</p>
      `;
  } else {
      // ** Email for REGULAR upload to existing hierarchy **
      emailSubject = `📥 New Upload: ${fileName} for "${hierarchy}"`; // Original subject idea
      emailHtmlBody = `
        <h3>📁 New Documentation Upload Submitted</h3>
        <p>A file has been uploaded to an existing documentation hierarchy.</p>
        <hr>
        <p><strong>User:</strong> ${displayUser}</p>
        <p><strong>Hierarchy:</strong> ${hierarchy}</p>
        <p><strong>Type:</strong> ${type}</p>
        <p><strong>File:</strong> ${fileName}</p>
        <hr>
        <p><a href="${prUrl}" style="font-weight: bold;">🔗 View Pull Request</a></p>
        <p>Please review the uploaded file via the Pull Request.</p>
      `;
  }


  const mailOptions = {
    from: `"LabCyber Docs" <${process.env.SMTP_EMAIL}>`,
    to: process.env.ADMIN_EMAIL || 'nicolas.cholin@edu.devinci.fr', // Use env var or fallback
    subject: emailSubject, // Use the dynamically set subject
    html: emailHtmlBody   // Use the dynamically set HTML body
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Notification email sent for ${fileName} (PR: ${prUrl})`);
    res.status(200).json({ message: 'Notification sent' });
  } catch (err) {
    console.error('Email send error:', err);
    res.status(500).json({ error: 'Failed to send email notification' }); // More specific error
  }
});

// Error handling (Kept as in original code)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});