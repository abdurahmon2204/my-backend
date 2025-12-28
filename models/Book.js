// models/Book.js

const mongoose = require('mongoose');

// Kitob ma'lumotlar sxemasi (schema)
const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true 
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  isbn: {
    type: String,
    required: true,
    unique: true // ISBN takrorlanmas bo'lishi kerak
  },
  price: {
    type: Number,
    required: true,
    default: 0
  },
  image: {
    type: String, // Rasm manzili: /uploads/filename.png
    default: null
  },
  publishedDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true }); 

module.exports = mongoose.model('Book', BookSchema);