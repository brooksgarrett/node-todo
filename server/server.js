// Do config based on environment
require('../config/config');

// Package imports
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Local imports
var mongoose = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
const {authenticate} = require('./middleware/authenticate');


var app = express();
const port = process.env.PORT;
app.use(bodyParser.json());

app.post('/api/v1/todos/', authenticate, (req, res) => {
    var todo = new Todo({
        text: req.body.text,
        _creator: req.user._id
    });

    todo.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send();
    });
});

app.get('/api/v1/todos', authenticate, (req, res) => {
    Todo.find({_creator: req.user._id}).then((todos) => {
        res.send({todos});
    }, (e) => {
        res.status(400);
        res.send(e);
    });
});

app.get('/api/v1/todos/:id', authenticate, (req, res) => {
    var id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(400)
            .send({error: `${id} is not valid`});
    }
    Todo.findOne({
        _id: id,
        _creator: req.user._id
        }).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }
        res.send({todo});
    }, (e) => {
        res.status(400).send(e);
    });
});

app.delete('/api/v1/todos/:id', authenticate, (req, res) => {
    var id = req.params.id;
    if (!ObjectID.isValid(id)) {
        return res.status(400)
            .send({error: `${id} is not valid`});
    }
    Todo.findOneAndRemove({
        _id: id,
        _creator: req.user._id
    }).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }
        res.send({todo});
    }, (e) => {
        res.status(400).send(e);
    });
});

app.patch('/api/v1/todos/:id', authenticate, (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, [
        'text',
        'completed'
    ]);

    if (!ObjectID.isValid(id)) {
        return res.status(400)
            .send({error: `${id} is not valid`});
    }

    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findOneAndUpdate({_id: id, _creator: req.user._id}, {
        $set: body
    }, {
        new: true
    }).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }

        res.send({todo});
    }).catch((e) => {
        res.status(400).send();
    });

});

app.post('/api/v1/users', (req, res) => {
    var body = _.pick(req.body, [
        'email', 
        'password'
    ]);

    var user = new User(body);

    user.save()
        .then(() => {
            return user.generateAuthToken();
        }).then((token) => {
            res.header('x-auth', token).send(user);
        }).catch((e) => {
            res.status(400);
            res.send(e);
        });
});

app.post('/api/v1/users/login', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);

    User.findByCredentials(body.email, body.password).then((user) => {
        token = user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(user);
        });
    }).catch(() => {
        res.status(401).send();
    });
});

app.delete('/api/v1/users/me/token', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }, () => {
        res.status(400).send();
    });

});


app.get('/api/v1/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

app.listen(port, () => {
    console.log(`Server up on ${port}`);
});



module.exports = {app};