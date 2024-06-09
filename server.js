const students = [
    { name: 'A', email: 'A@example.com', age: 20, major: 'Computer Science' },
    { name: 'B', email: 'B@example.com', age: 21, major: 'Mathematics' },
    { name: 'C', email: 'C@example.com', age: 21, major: 'Information Technology' },
    // Add more student objects as needed
];const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;

// Kết nối MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'abc123!',
    database: 'student_management'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL');
});

// Middleware
app.use(bodyParser.json());
// Route GET đến "/"
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Đăng ký người dùng mới
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err, result) => {
        if (err) throw err;
        res.status(201).send('User registered');
    });
});

// Đăng nhập người dùng
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            const user = results[0];
            if (await bcrypt.compare(password, user.password)) {
                res.status(200).send('Login successful');
            } else {
                res.status(401).send('Invalid credentials');
            }
        } else {
            res.status(401).send('Invalid credentials');
        }
    });
});

// Lấy danh sách sinh viên
app.get('/students', (req, res) => {
    db.query('SELECT * FROM students', (err, results) => {
        if (err) throw err;
        res.status(200).json(results);
    });
});

// Thêm sinh viên mới
app.post('/students', (req, res) => {
    const { name, email, age, major } = req.body;
    db.query('INSERT INTO students (name, email, age, major) VALUES (?, ?, ?, ?)', [name, email, age, major], (err, result) => {
        if (err) throw err;
        res.status(201).send('Student added');
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
