const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const users = []; // In-memory user store, replace with a database in production

const secretKey = 'your-secret-key';

module.exports = {
  register: (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);
    users.push({ username, password: hashedPassword });
    res.status(201).send({ message: 'User registered successfully' });
  },

  login: (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).send({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });
    res.send({ token });
  },

  authenticate: (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).send({ message: 'No token provided' });

    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) return res.status(500).send({ message: 'Failed to authenticate token' });
      req.user = decoded;
      next();
    });
  }
};