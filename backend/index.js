const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const USERS_FILE = path.join(__dirname, 'users.json');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax'
  }
}));

function loadUsers() {
  if (!fs.existsSync(USERS_FILE)) return {};
  return JSON.parse(fs.readFileSync(USERS_FILE));
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function checkAuth(req, res, next) {
  if (req.session.username) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const users = loadUsers();

  if (users[username]) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const hashed = await bcrypt.hash(password, 10);
  users[username] = { password: hashed };
  saveUsers(users);

  res.json({ message: 'Registered successfully' });
});


app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const users = loadUsers();

  if (!users[username]) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }

  const match = await bcrypt.compare(password, users[username].password);
  if (!match) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }

  req.session.username = username;
  res.json({ message: 'Login successful' });
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
});


app.get('/profile', checkAuth, (req, res) => {
  res.json({ message: `Welcome, ${req.session.username}` });
});

const { isCacheValid, getCache, saveCache } = require('./cache');

app.get('/data', checkAuth, (req, res) => {
  if (isCacheValid()) {
    console.log('📦 Данные из кэша');
    return res.json({ cached: true, data: getCache() });
  }

  const newData = {
    timestamp: new Date().toISOString(),
    value: Math.floor(Math.random() * 1000)
  };

  saveCache(newData);
  console.log('🆕 Новые данные сгенерированы');
  res.json({ cached: false, data: newData });
});



app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
