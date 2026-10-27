const express = require('express');
const mongoose = require('mongoose');
const routes = require('./routes/routes');

const app = express();

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader('Access-Control-Allow-Methods', 'HEAD, GET, POST, PATCH, DELETE');
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});
app.use(express.json());
app.use('/api', routes);

// Configurando a conexao com o Banco de Dados
const userArgs = process.argv.slice(2);
const defaultMongoURL = 'mongodb+srv://vinicius_db:Database123@cluster-database01.d4dt6oi.mongodb.net/?appName=cluster-database01';
const mongoURL = process.env.MONGODB_URI || process.env.MONGO_URL || userArgs[0] || defaultMongoURL;

if (mongoURL) {
    mongoose.connect(mongoURL);
    mongoose.Promise = global.Promise;
    const db = mongoose.connection;
    db.on('error', (error) => {
        console.error('Database Connection Error:', error);
    });
    db.once('connected', () => {
        console.log('Database Connected');
    });
} else {
    console.warn('MongoDB URL not provided. Please set MONGODB_URI or pass as argument.');
}

const PORT = process.env.PORT || 3000;
if (require.main === module || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server Started at ${PORT}`);
    });
}

module.exports = app;
