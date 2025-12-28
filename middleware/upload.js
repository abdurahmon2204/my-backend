// middleware/upload.js

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Yuklash papkasini tekshirish. Agar mavjud bo'lmasa, yaratish.
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Fayllarni saqlash joyini va nomini belgilaymiz (diskStorage)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Ildiz katalogdagi 'uploads' papkasiga saqlaydi
        cb(null, uploadDir); 
    },
    filename: (req, file, cb) => {
        // Fayl nomini noyob qilib yaratish
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Multer o'rnatmasi
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB fayl hajmi cheklovi
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            // Ruxsat etilmagan fayl turi bo'lsa xato berish
            cb(new Error('Faqat JPG, JPEG va PNG rasm fayllariga ruxsat beriladi.'), false);
        }
    }
});

module.exports = upload;