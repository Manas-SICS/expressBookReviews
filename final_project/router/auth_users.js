const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();
const session = require('express-session')


let users = [
	{
		username: 'user1',
		password: 'user1',
	},
	{
		username: 'user2',
		password: 'user2',
	},
	{
		username: 'user3',
		password: 'user3',
	},
	{
		username: 'ranoa',
		password: 'bakfiets',
	},
]


const isValid = (username)=>{ 
    const userMatches = users.filter(user => user.username === username)
	return userMatches.length > 0
}

const authenticatedUser = (username,password)=>{ 
    const matchingUsers = users.filter(
        user => user.username === username && user.password === password
    )
    return matchingUsers.length > 0
    }

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.authenticatedUser = authenticatedUser;
