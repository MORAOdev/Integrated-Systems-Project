const mongoose = require('mongoose');
const schemaTarefa = new mongoose.Schema({
    descricao: {
        required: true,
        type: String
    },
    statusRealizada: {
        required: true,
        type: Boolean
    },
}, {
    versionKey: false,
    collection: 'tasks'
});
module.exports = mongoose.model('Tarefa', schemaTarefa, 'tasks');