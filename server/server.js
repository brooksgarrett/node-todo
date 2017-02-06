// Do config based on environment
require('../config/config');

// Package imports
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const _ = require('lodash');
const jwt = require('jsonwebtoken');

// Local imports
var mongoose = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');


var app = express();
const port = process.env.PORT;
app.use(bodyParser.json());

app.post('/api/v1/todos/', (req, res) => {
    var todo = new Todo({
        text: req.body.text
    });

    todo.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400);
        res.send(e);
    })
});

app.get('/api/v1/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.send({todos});
    }, (e) => {
        res.status(400);
        res.send(e);
    });
});

app.get('/api/v1/todos/:id', (req, res) => {
    if (!ObjectID.isValid(req.params.id)) {
        return res.status(400)
            .send({error: `${req.params.id} is not valid`});
    }
    Todo.findById(req.params.id).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }
        res.send({todo});
    }, (e) => {
        res.status(400).send(e);
    });
});

app.delete('/api/v1/todos/:id', (req, res) => {
    if (!ObjectID.isValid(req.params.id)) {
        return res.status(400)
            .send({error: `${req.params.id} is not valid`});
    }
    Todo.findByIdAndRemove(req.params.id).then((todo) => {
        if (!todo) {
            return res.status(404).send();
        }
        res.send({todo});
    }, (e) => {
        res.status(400).send(e);
    });
});

app.patch('/api/v1/todos/:id', (req, res) => {
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

    Todo.findByIdAndUpdate(id, {
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

app.post('/api/v1/users/', (req, res) => {
    var body = _.pick(req.body, [
        'user', 
        'password'
    ]);

    var user = new User(body);

    user.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400);
        res.send(e);
    })
});

app.listen(port, () => {
    console.log(`Server up on ${port}`);
});



module.exports = {app};