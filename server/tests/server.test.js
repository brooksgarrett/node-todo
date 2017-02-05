const request = require('supertest');
const expect = require('expect');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todos = [{
    _id: new ObjectID(),
    text: 'First todo'
}, {
    _id: new ObjectID(),
    text: 'Second todo',
    completed: true,
    completedAt: 100
}];
const hexID = '58953d71340d3e460b069197';

beforeEach((done) => {
    Todo.remove({}).then(() => {
        Todo.insertMany(todos);
        done(); 
    });
});

describe('POST /api/v1/todos', () => {
    it('should create a new todo', (done) => {
        var text = 'Walk the dog';

        request(app)
            .post('/api/v1/todos')
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
    it('should get all todos', (done) => {
        request(app)
            .get('/api/v1/todos')
            .expect(200)
            .expect((res) => {
                expect(res.body.todos.length).toBe(2);
            })
            .end(done);
    });
});

describe('GET /api/v1/todos/:id', () => {
    it('should return one todo for a valid ID', (done) => {
        request(app)
            .get(`/api/v1/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toEqual(todos[0].text);
            })
            .end(done);
    });
    it('should return 400 for an invalid ID', (done) => {
        request(app)
            .get(`/api/v1/todos/a`)
            .expect(400)
            .expect((res) => {
                expect(res.body.error).toEqual('a is not valid');
            })
            .end(done);
    });
    it('should return 404 for a valid id that isn\'t in the collection', (done) => {
        request(app)
            .get(`/api/v1/todos/${hexID}`)
            .expect(404)
            .end(done);
    });
   
    
});

describe('DELETE /api/v1/todos/:id', () => {
    it('should delete a todo when given an id', (done) => {
        request(app)
            .delete(`/api/v1/todos/${todos[0]._id.toHexString()}`)
            .send()
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find({}).then((todos) => {
                    expect(todos.length).toBe(1);
                    done();
                }).catch((e) => done(e));
            });
    });
    it('should return 400 for an invalid ID', (done) => {
        request(app)
            .delete(`/api/v1/todos/a`)
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
            .send()
            .expect(404)
            .end(done);
    });
});

describe('PATCH /api/v1/todos/:id', () => {
    it('should update a todo with a valid id', (done) => {        
        var id = todos[0]._id.toHexString();
        var text = 'Go for a swim';
        var completed = true;

        request(app)
            .patch(`/api/v1/todos/${id}`)
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
            .end(done);
    });
    it('should clear completed when todo is not completed', (done) => {
        var id = todos[1]._id.toHexString();
        var completed = false;
        
        request(app)
            .patch(`/api/v1/todos/${id}`)
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