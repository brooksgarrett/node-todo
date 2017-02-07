const {ObjectID} = require('mongodb');
const {Todo} = require('../../models/todo');
const {User} = require('../../models/user');
const jwt = require('jsonwebtoken');

const userOneID = new ObjectID();
const userTwoID = new ObjectID();

const users = [{
    _id: userOneID,
    email: 'brooks@brooksgarrett.com',
    password: 'userOnePass',
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userOneID, access: 'auth'}, 'abc123').toString()
    }]
}, {
    _id: userTwoID,
    email: 'brooks2@brooksgarrett.com',
    password: 'userTwoPass',
    tokens: []
}];

const todos = [{
    _id: new ObjectID(),
    text: 'First todo',
    _creator: userOneID
}, {
    _id: new ObjectID(),
    text: 'Second todo',
    completed: true,
    completedAt: 100,
    _creator: userTwoID
}];

const populateTodos = (done) => {
    Todo.remove({}).then(() => {
        Todo.insertMany(todos);
        done(); 
    });
};

const populateUsers = (done) => {
    User.remove({}).then(() => {
        var userOne = new User(users[0]).save();
        var userTwo = new User(users[1]).save();

        return Promise.all([userOne, userTwo]);
    }).then(() => done());
};

module.exports = {todos, populateTodos, users, populateUsers};