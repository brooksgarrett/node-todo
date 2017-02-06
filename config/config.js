var env = process.env.NODE_ENV || 'development';
console.log(`Running in ${env}`);

switch (env) {
    case 'development':
        process.env.PORT = 3000;
        process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoApp';
        process.env.JWT_SECRET = 'abc123';
        break;
    case 'test':
        process.env.PORT = 3000;
        process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoAppTest';
        process.env.JWT_SECRET = 'abc123';
        break;
    case 'production':
        break;
}