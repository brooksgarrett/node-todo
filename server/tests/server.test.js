const request = require('supertest');
const expect = require('expect');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');
const {User} = require('../models/user');

const hexID = '58953d71340d3e460b069198';

beforeEach(populateTodos);
beforeEach(populateUsers);

describe('POST /api/v1/todos', () => {
    it('should be protected', (done) => {
        request(app)
            .post('/api/v1/todos')
            .send({})
            .expect(401)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch((e) => done(e));
            });
    });
    it('should create a new todo', (done) => {
        var text = 'Walk the dog';

        request(app)
            .post('/api/v1/todos')
            .set('x-auth', users[0].tokens[0].token)
            .send({text})
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find({text}).then((todos) => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch((e) => done(e));
            });
    });
    it('should not create a new todo with invalid body', (done) => {
        request(app)
            .post('/api/v1/todos')
            .set('x-auth', users[0].tokens[0].token)
            .send({})
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch((e) => done(e));
            });
    });
});

describe('GET /api/v1/todos', () => {
    it('should be protected', (done) => {
        request(app)
            .get('/api/v1/todos')
            .expect(401)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                done();
            });
    });
    it('should get all todos', (done) => {
        request(app)
            .get('/api/v1/todos')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(1);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                done();
            });
    });
});

describe('GET /api/v1/todos/:id', () => {
    it('should be protected', (done) => {
        request(app)
            .get(`/api/v1/todos/${todos[0]._id.toHexString()}`)
            .expect(401)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                done();
            });
    });
    it('should return one todo for a valid ID', (done) => {
        request(app)
            .get(`/api/v1/todos/${todos[0]._id.toHexString()}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toEqual(todos[0].text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                done();
            });
    });
    it('should return 400 for an invalid ID', (done) => {
        request(app)
            .get(`/api/v1/todos/a`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(400)
            .expect((res) => {
                expect(res.body.error).toEqual('a is not valid');
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                done();
            });
    });
    it('should return 404 for a valid id that isn\'t in the collection', (done) => {
        request(app)
            .get(`/api/v1/todos/${hexID}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                done();
            });
    });
    it('should not return a todo created by a different user', (done) => {
        request(app)
            .get(`/api/v1/todos/${todos[1]._id.toHexString()}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                done();
            });
    });
   
    
});

describe('DELETE /api/v1/todos/:id', () => {
    it('should be protected', (done) => {
        let hexID = todos[0]._id.toHexString();
        request(app)
            .delete(`/api/v1/todos/${hexID}`)
            .send()
            .expect(401)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                done();
            });
    });
    it('should delete a todo when given an id', (done) => {
        let hexID = todos[0]._id.toHexString();
        request(app)
            .delete(`/api/v1/todos/${hexID}`)
            .send()
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.findById(hexID).then((todo) => {
                    expect(todo).toNotExist();
                    done();
                }).catch((e) => done(e));
            });
    });
    it('should not delete a different users todo', (done) => {
        let hexID = todos[1]._id.toHexString();
        request(app)
            .delete(`/api/v1/todos/${hexID}`)
            .send()
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.findById(hexID).then((todo) => {
                    expect(todo).toExist();
                    done();
                }).catch((e) => done(e));
            });
    });
    it('should return 400 for an invalid ID', (done) => {
        request(app)
            .delete(`/api/v1/todos/a`)
            .set('x-auth', users[0].tokens[0].token)
            .send()
            .expect(400)
            .expect((res) => {
                expect(res.body.error).toEqual('a is not valid');
            })
            .end(done);
    });
    it('should return 404 for a valid id that isn\'t in the collection', (done) => {
        request(app)
            .delete(`/api/v1/todos/${hexID}`)
            .set('x-auth', users[0].tokens[0].token)
            .send()
            .expect(404)
            .end(done);
    });
});

describe('PATCH /api/v1/todos/:id', () => {
    it('should be protected', (done) => {
        var id = todos[0]._id.toHexString();
        var text = 'Go for a swim';
        var completed = true;

        request(app)
            .patch(`/api/v1/todos/${id}`)
            .send({
                text,
                completed
            })
            .expect(401)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                done();
            });
    });
    it('should update a todo with a valid id', (done) => {        
        var id = todos[0]._id.toHexString();
        var text = 'Go for a swim';
        var completed = true;

        request(app)
            .patch(`/api/v1/todos/${id}`)
            .set('x-auth', users[0].tokens[0].token)
            .send({
                text,
                completed
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(text);
                expect(res.body.todo.completed).toBe(true);
                expect(res.body.todo.completedAt).toBeA('number');
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                done();
            });
    });
        it('should not update a todo for a different user', (done) => {        
        var id = todos[1]._id.toHexString();
        var text = 'Go for a swim';
        var completed = true;

        request(app)
            .patch(`/api/v1/todos/${id}`)
            .set('x-auth', users[0].tokens[0].token)
            .send({
                text,
                completed
            })
            .expect(404)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                done();
            });
    });
    it('should clear completed when todo is not completed', (done) => {
        var id = todos[0]._id.toHexString();
        var completed = false;
        
        request(app)
            .patch(`/api/v1/todos/${id}`)
            .set('x-auth', users[0].tokens[0].token)
            .send({
                completed
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.completed).toBe(false);
                expect(res.body.todo.completedAt).toBe(null);
            })
            .end(done);
    });
});

describe('GET /api/v1/users/me', () => {
    it('should return a user if authenticated', (done) => {
        request(app)
            .get('/api/v1/users/me')
            .set('X-AUTH', users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body._id).toBe(users[0]._id.toHexString());
                expect(res.body.email).toBe(users[0].email);
            }).end(done);
    });
    it('should return a 401 if unauthenticated', (done) => {
        request(app)
            .get('/api/v1/users/me')
            .expect(401)
            .expect((res) => {
                expect(res.body).toEqual({});
            })
            .end(done);
    });
});

describe('POST /api/v1/users', () => {
    it('should create a new user', (done) => {
        var email = 'user@example.com';
        var password = 'abc123!';

        request(app)
            .post('/api/v1/users')
            .send({email, password})
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toExist();
                expect(res.body._id).toExist();
                expect(res.body.email).toBe(email);
            })
            .end((err) => {
                if (err) {
                    return done(err);
                }

                User.findOne({email}).then((user) => {
                    expect(user).toExist();
                    expect(user.password).toNotBe(password);
                    done();
                })
            });
    });
    it('should return validation errors for invalid data', (done) => {
        var email = 'user@example';
        var password = 'a';

        request(app)
            .post('/api/v1/users')
            .send({email, password})
            .expect(400)
            .expect((res) => {
                expect(res.headers['x-auth']).toNotExist();
                expect(res.body.errors.email.name).toBe('ValidatorError');
            })
            .end(done);
    });
    it('should not create a duplicate user', (done) => {
        var email = users[0].email;
        var password = 'abc123!';

        request(app)
            .post('/api/v1/users')
            .send({email, password})
            .expect(400)
            .expect((res) => {
                expect(res.headers['x-auth']).toNotExist();
                expect(res.body.code).toBe(11000);
            })
            .end(done);
    });
});

describe('POST /api/v1/users/login', () => {
    it('should login the user and return an auth token', (done) => {
        let userLocal = users[1];

        request(app)
            .post('/api/v1/users/login')
            .send({
                email: userLocal.email, 
                password: userLocal.password
            })
            .expect(200)
            .expect((res) => {
                expect(res.headers['x-auth']).toBeA('string');
                expect(res.body).toInclude({
                    email: userLocal.email,
                    _id: userLocal._id
                });
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                User.findById(userLocal._id).then((userDB) => {
                    expect(userDB.tokens[0]).toInclude({
                        access: 'auth',
                        token: res.headers['x-auth']
                    });
                    done();
                }).catch((e) => done(e));
            });
    });

    it('should reject an invalid login (bad email)', (done) => {
        let userLocal = users[1];

        request(app)
            .post('/api/v1/users/login')
            .send({
                email: 'not-a-user@example.com', 
                password: userLocal.password
            })
            .expect(401)
            .expect((res) => {
                expect(res.headers['x-auth']).toNotExist();
                expect(res.body.email).toNotExist();
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                User.findById(userLocal._id).then((userDB) => {
                    expect(userDB.tokens.length).toBe(0);
                    done();
                }).catch((e) => done(e));
            });
    });

    it('should reject an invalid login (bad password)', (done) => {
        let userLocal = users[1];

        request(app)
            .post('/api/v1/users/login')
            .send({
                email: userLocal.email, 
                password: 'notmypassword'
            })
            .expect(401)
            .expect((res) => {
                expect(res.headers['x-auth']).toNotExist();
                expect(res.body.email).toNotExist();
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                User.findById(userLocal._id).then((userDB) => {
                    expect(userDB.tokens.length).toBe(0);
                    done();
                }).catch((e) => done(e));
            });
    });
});

describe('DELETE /api/v1/users/me/token', () => {
    it('should be protected', (done) => {
        request(app)
            .delete('/api/v1/users/me/token')
            .send()
            .expect(401)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                done();
            });
    });
    it('should remove token on logout', (done) => {
        request(app)
            .delete('/api/v1/users/me/token')
            .set('x-auth', users[0].tokens[0].token)
            .send()
            .expect(200)
            .expect((res) => {
                User.findById(users[0]._id).then((user) => {
                    debugger;
                    expect(user.tokens.length).toBe(0);
                }).catch((e) => done(e));
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                done();
            });
    });
});