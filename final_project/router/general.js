const express = require('express')
let books = require('./booksdb.js')
let isValid = require('./auth_users.js').isValid
let users = require('./auth_users.js').users
const public_users = express.Router()
const jwt = require('jsonwebtoken')
const session = require('express-session')
const axios = require('axios')



public_users.post('/register', (req, res) => {
	const username = req.body.username
	const password = req.body.password

	if (username && password) {
		if (!isValid(username)) {
			users.push({username: username, password: password})
			return res.status(200).json({
				message: 'User successfully registered. Now you can login',
			})
		} else {
			return res.status(404).json({message: 'User already exists!'})
		}
	}
	return res.status(404).json({message: 'Unable to register user.'})
})

// Get the book list available in the shop
const bookList = async () => {
	try {
		const bookListPromise = await Promise.resolve(books)
		if (bookListPromise) {
			return bookListPromise
		} else {
			return Promise.reject(new Error('No books found.'))
		}
	} catch (err) {
		console.log(err)
	}
}

public_users.get('/', async function (req, res) {
	const list = await bookList()
	res.json(list)
})

// Get book details based on ISBN
const isbnList = async () => {
	try {
		const isbnPromise = await Promise.resolve(isbn)
		if (isbnPromise) {
			return Promise.resolve(isbn)
		} else {
			return Promise.reject(new Error('Book correesponding to ISBN not found.'))
		}
	} catch (err) {
		console.log(err)
	}
}

public_users.get('/isbn/:isbn', async function (req, res) {
	const isbn = req.params.isbn;
	const isbnData = await isbnList(isbn)
	res.send(books[isbnData])
 });
  
// Get book details based on author
const findAuthor = async author => {
	try {
		if (author) {
			const newAutArray = []
			Object.values(books).map(book => {
				if (book.author === author) {
					newAutArray.push(book)
				}
			})
			return Promise.resolve(newAutArray)
		} else {
			return Promise.reject(
				new Error('Books bby requested author not found.')
			)
		}
	} catch (error) {
		console.log(error)
	}
}

public_users.get('/author/:author', async (req, res) => {
	const author = req.params.author
	const authorList = await findAuthor(author)
	res.send(authorList)
})

// Get all books based on 
const findByTitle = async title => {
	try {
		if (title) {
			const newTitlesArray = []
			Object.values(books).map(book => {
				if (book.title === title) {
					newTitlesArray.push(book)
				}
			})
			return Promise.resolve(newTitlesArray)
		} else {
			return Promise.reject(
				new Error('Book with requested title not available.')
			)
		}
	} catch (error) {
		console.log(error)
	}
}

public_users.get('/title/:title',function (req, res) {
	const title = req.params.title
	const titlesList = await findByTitle(title)
	res.send(titlesList)
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
	const reviewISBN = req.params.isbn

	Object.entries(books).map(book => {
		if (book[0] === reviewISBN) {
			res.send(book[1].reviews)
		}
	})
})

module.exports.general = public_users;
