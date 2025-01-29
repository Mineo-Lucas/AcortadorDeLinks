const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const db = new sqlite3.Database('database.sqlite');

db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS links (id INTEGER PRIMARY KEY, original TEXT, short TEXT)');
});

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

function generateShortLink() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let shortLink = '';
    for (let i = 0; i < 6; i++) {
        shortLink += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return shortLink;
}

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/Logueo', (req, res) => {
    res.render('Logueo');
});

app.get('/Registro', (req, res) => {
    res.render('Registro');
});

app.post('/shorten', (req, res) => {
    const originalUrl = req.body.original_url;
    const shortUrl = generateShortLink();

    db.run('INSERT INTO links (original, short) VALUES (?, ?)', [originalUrl, shortUrl], (err) => {
        if (err) {
            return console.log(err.message);
        }
        res.send(`Short URL is: ${req.headers.host}/${shortUrl}`);
    });
});

app.get('/:shortUrl', (req, res) => {
    const shortUrl = req.params.shortUrl;

    db.get('SELECT original FROM links WHERE short = ?', [shortUrl], (err, row) => {
        if (err || !row) {
            return res.status(404).send('URL not found');
        }
        res.redirect(row.original);
    });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});

