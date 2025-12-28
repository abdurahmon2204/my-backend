// routes/books.js

const express = require('express');
const router = express.Router();
const Book = require('../models/Book'); 
const fs = require('fs'); 
const path = require('path');

// Multer konfiguratsiyasini middleware papkasidan chaqiramiz.
const upload = require('../middleware/upload'); 


// --- Yordamchi Funksiya: Eski rasmni o'chirish (Lokal diskdan) ---
const deleteImage = (imagePath) => {
    if (imagePath && typeof imagePath === 'string') {
        if (!imagePath.startsWith('/uploads/')) {
            console.warn(`[FS Warning]: Rasmni o'chirishga urinish muvaffaqiyatsiz. Noto'g'ri manzil formati: ${imagePath}`);
            return;
        }

        const absolutePath = path.join(__dirname, '..', imagePath);
        
        try {
            if (fs.existsSync(absolutePath)) {
                fs.unlinkSync(absolutePath);
                console.log(`[FS Success]: Eski rasm o'chirildi: ${absolutePath}`);
            } else {
                console.warn(`[FS Warning]: O'chirish so'ralgan rasm topilmadi: ${absolutePath}`);
            }
        } catch (error) {
            console.error(`[FS ERROR]: Rasmni o'chirishda kutilmagan xato: ${error.message}`);
        }
    }
};


// 1. Barcha Kitoblarni Olish (GET /api/books)
router.get('/', async (req, res) => {
    try {
        const books = await Book.find();
        res.json(books);
    } catch (err) {
        res.status(500).json({ message: 'Server xatosi (GET ALL): ' + err.message });
    }
});

// 2. ID bo'yicha Bitta Kitobni Olish (GET /api/books/:id)
router.get('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: 'Kitob topilmadi' });
        res.json(book);
    } catch (err) {
        if (err.name === 'CastError') {
             return res.status(400).json({ message: 'Notoʻgʻri kitob ID formati.' });
        }
        res.status(500).json({ message: 'Kitobni olishda server xatosi: ' + err.message });
    }
});

// 3. Yangi Kitob Yaratish (POST /api/books)
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { title, author, isbn, price } = req.body;

        const book = new Book({
            title,
            author,
            isbn,
            price,
            image: req.file ? `/uploads/${req.file.filename}` : null
        });

        await book.save();
        res.status(201).json(book);
    } catch (err) {
        if (req.file) {
            deleteImage(`/uploads/${req.file.filename}`); 
        }
        res.status(400).json({ message: 'Kitob yaratishda xato: ' + err.message });
    }
});

// 4. Kitobni Yangilash (PUT /api/books/:id)
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        
        if (!book) {
            if (req.file) deleteImage(`/uploads/${req.file.filename}`);
            return res.status(404).json({ message: 'Kitob topilmadi' });
        }
        
        const oldImage = book.image; 

        const { title, author, isbn, price } = req.body;

        book.title = title || book.title;
        book.author = author || book.author;
        book.isbn = isbn || book.isbn;
        book.price = price || book.price;
        
        if (req.file) {
            book.image = `/uploads/${req.file.filename}`;
            deleteImage(oldImage); 
        }

        await book.save();
        res.json(book);
    } catch (err) {
        if (req.file) deleteImage(`/uploads/${req.file.filename}`); 
        if (err.name === 'CastError') {
             return res.status(400).json({ message: 'Notoʻgʻri kitob ID formati.' });
        }
        res.status(400).json({ message: 'Kitobni yangilashda xato: ' + err.message });
    }
});

// 5. Kitobni O'chirish (DELETE /api/books/:id)
router.delete('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: 'Kitob topilmadi' });

        deleteImage(book.image); 

        await Book.deleteOne({ _id: req.params.id }); 

        res.json({ message: 'Kitob muvaffaqiyatli oʻchirildi' });
    } catch (err) {
        if (err.name === 'CastError') {
             return res.status(400).json({ message: 'Notoʻgʻri kitob ID formati.' });
        }
        res.status(500).json({ message: 'Oʻchirishda server xatosi: ' + err.message });
    }
});

module.exports = router;