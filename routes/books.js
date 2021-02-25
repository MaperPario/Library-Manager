var express = require('express');
var router = express.Router();
const Book = require('../models').Book;

/* Handler function to wrap each route. */
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error){
      next(error);
    }
  }
}

//GET Home Page
router.get('/', asyncHandler(async (req, res) => {
  const books = await Book.findAll();
  console.log(books);
  res.render("index", { books, title: "Books" });
}));

//GET Book Form
router.get('/new', asyncHandler(async (req, res) => {
  res.render("new-book", { book: {}, title: "New Book" });
}));

//POST New Book, Store in DB and Display on Home Page
router.post('/', asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.create(req.body);
    res.redirect("/");
  } catch (error) {
    if(error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      res.render("new-book", { book, errors: error.errors, title: "New Book" })
    } else {
      throw error;
    }  
  }
}));

//GET Update Form
router.get('/:id', asyncHandler(async(req, res, next) => {
  const book = await Book.findByPk(req.params.id);
  if(book) {
    res.render("update-book", { book, title: "Update Book" });
  } else {
    const err = new Error();
    res.status(404);
    err.header = "Book Not Found"
    err.message = "Sorry! We couldn't find the book you were looking for!";
    res.render('page-not-found', { err });
  }
}));

//POST Update Book
router.post('/:id', asyncHandler(async (req, res) => {
  let book = await Book.findByPk(req.params.id);
  try {
    if(book) {
      console.log(req.body);
      await book.update(req.body);
      res.redirect('/');
    }
  } catch (error) {
    if(error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      book.id = req.params.id; // make sure correct article gets updated
      res.render("update-book", { book, errors: error.errors, title: "Update Book" })
    } else {
      throw error;
    }
  }
}));

//POST Delete Book
router.post('/:id/delete', asyncHandler(async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if(book) {
    await book.destroy();
    res.redirect("/");
  } else {
    res.sendStatus(404);
  }
}));

module.exports = router;
