// index.js

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
// Mongoose va Express modullari chaqirilishi kerak

const app = express();
const PORT = process.env.PORT || 5000; 
const MONGODB_URI = process.env.MONGODB_URI;

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// Statik fayllar uchun papka (uploads)
// Bu kod loyiha ildizida turganini bildiradi.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Routes ---
const bookRoutes = require('./routes/books'); 
app.use('/api/books', bookRoutes);

// --- Asosiy yo'nalish (Serverning ishlashini tekshirish uchun) ---
app.get('/', (req, res) => {
    res.send('Kitoblar API serveri ishlamoqda!');
});

// --- Xatolar bilan ishlash middleware'i ---
app.use((err, req, res, next) => {
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).send({ message: 'Fayl hajmi 5MB dan oshmasligi kerak.' });
    }
    // Multer tomonidan yuborilgan boshqa xatolarni qayta ishlash
    if (err.message) {
        if (err.message.includes('ruxsat beriladi') || err.message.includes('File too large')) {
             return res.status(400).send({ message: err.message });
        }
    }
    
    console.error('Umumiy server xatosi:', err); 
    res.status(500).send('Serverda nomaʼlum xato yuz berdi!');
});

// --- Serverni ishga tushirish va MongoDBga ulanish ---
mongoose.connect(MONGODB_URI, {
    // 5 soniyadan keyin ulanishni to'xtatish (timeout)
    serverSelectionTimeoutMS: 5000, 
    // TLS/SSL ulanishini aniq talab qilish (ba'zi xatolarni yechadi)
    tls: true 
})
    .then(() => {
        console.log('✅ MongoDBga muvaffaqiyatli ulanildi.');
        app.listen(PORT, () => console.log(`🚀 Server http://localhost:${PORT} da ishga tushdi.`));
    })
    .catch(err => {
        // Agar ulanishda xato bo'lsa, xatoni to'liq ko'rsatish
        console.error('❌ MongoDB ulanish xatosi:', err.message);
        // Serverni ishga tushirishdan oldin jarayonni to'xtatish
        process.exit(1); 
    });