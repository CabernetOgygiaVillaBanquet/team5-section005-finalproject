const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const session = require('express-session');
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
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    sameSite: 'lax'
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
  callbackURL: process.env.GITHUB_CALLBACK_URL,
},
(accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

// Multer upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
  filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded.');
  res.send('File uploaded successfully. Awaiting admin validation.');
});

// GitHub Auth routes
app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));
app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: 'http://localhost:3000/login' }),
  (req, res) => res.redirect('http://localhost:3000/')
);

app.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy((err) => {
      if (err) return next(err);
      res.clearCookie('connect.sid', { path: '/' });
      res.status(200).send('Logged out');
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

// 📩 Route to notify admin via email after upload
app.post('/notify-admin', async (req, res) => {
  const { fileName, hierarchy, type, prUrl, username, email } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASS
    }
  });

  const mailOptions = {
    from: `"LabCyber Docs" <${process.env.SMTP_EMAIL}>`,
    to: 'nicolas.cholin@edu.devinci.fr',
    subject: `📥 New Upload: ${fileName}`,
    html: `
      <h3>📁 New Documentation Upload Submitted</h3>
      <p><strong>User:</strong> ${username} (${email})</p>
      <p><strong>Hierarchy:</strong> ${hierarchy}</p>
      <p><strong>Type:</strong> ${type}</p>
      <p><strong>File:</strong> ${fileName}</p>
      <p><a href="${prUrl}">🔗 View Pull Request</a></p>
      <p>🛂 Please validate this addition via the <strong>admin dashboard</strong>.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Notification sent' });
  } catch (err) {
    console.error('Email send error:', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
