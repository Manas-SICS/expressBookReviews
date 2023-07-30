const express = require('express')
let books = require('./booksdb.js')
let isValid = require('./auth_users.js').isValid
let authenticatedUser = require('./auth_users.js').authenticatedUser
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


const isbnList = async isbn => {
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

public_users.get('/title/:title', async function (req, res) {
	const title = req.params.title
	const titlesList = await findByTitle(title)
	res.send(titlesList)
});


public_users.get('/review/:isbn', async function (req, res) {
	const isbn = req.params.isbn
    const isbnData = await isbnList(isbn)
	res.send(books[isbnData].reviews)

});

public_users.use(
	session({secret:"fingerpint"},resave=true,saveUninitialized=true)
)


public_users.post('/login', (req, res) => {
	const username = req.body.username
	const password = req.body.password

	if (!username || !password) {
		return res.status(404).json({message: 'Error logging in'})
	}

	if (authenticatedUser(username, password)) {
		let accessToken = jwt.sign(
			{
				data: password,
			},
			'access',
			{expiresIn: 60 * 60}
		)

		req.session.authorization = {
			accessToken,
			username,
		}
		return res.status(200).send('User successfully logged in')
	} else {
		return res
			.status(208)
			.json({message: 'Invalid Login. Check username and password'})
	}
});

public_users.put('/auth/review/:isbn', (req, res) => {

	const isbn = req.params.isbn
	const review = req.body.review
	const username = req.session.authorization.username
	if (books[isbn]) {
		let book = books[isbn]
		book.reviews[username] = review
		return res.status(200).send('Review successfully posted: '+ JSON.stringify(books[isbn]))
	} else {
		return res.status(404).json({message: `ISBN ${isbn} not found`})
	}
})

public_users.delete('/auth/review/:isbn', (req, res) => {
	const isbn = req.params.isbn
	const username = req.session.authorization.username
	if (books[isbn]) {
		let book = books[isbn]
		delete book.reviews[username]
		return res.status(200).send('Review successfully deleted: ' + JSON.stringify(books[isbn]))
	} else {
		return res.status(404).json({message: `ISBN ${isbn} not found`})
	}
})

module.exports.general = public_users;
