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
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
  filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded.');
  // Note: This endpoint might not be used by the current frontend flow
  res.send('File uploaded successfully. Awaiting admin validation.');
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