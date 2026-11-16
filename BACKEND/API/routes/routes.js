const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const modeloTarefa = require('../models/tarefa');
const userModel = require('../models/user');
var jwt = require('jsonwebtoken');

router.post('/post', verificaJWT, async(req, res) => {
    const objetoTarefa = new modeloTarefa({
        descricao: req.body.descricao,
        statusRealizada: req.body.statusRealizada
    })
    try {
        const tarefaSalva = await objetoTarefa.save();
        res.status(200).json(tarefaSalva);
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})

router.get('/getAll', verificaJWT, async(req, res, next) => {
    try {
        const tarefas = await modeloTarefa.find();
        res.status(200).json(tarefas);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
})

router.delete('/delete/:id', verificaJWT, async(req, res) => {
    try {
        const resultado = await modeloTarefa.findByIdAndDelete(req.params.id)
        res.json(resultado)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})

router.patch('/update/:id', verificaJWT, async(req, res) => {
    try {
        const id = req.params.id;
        const novaTarefa = req.body;
        const options = { new: true };
        const result = await modeloTarefa.findByIdAndUpdate(
            id, novaTarefa, options
        )
        res.json(result)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})

router.post('/login', async (req, res) => {
    try {
        const nomeBusca = req.body.nome ? req.body.nome.trim() : '';
        const regexNome = new RegExp(`^${nomeBusca}$`, 'i');

        // 1. Tenta buscar na conexao ativa
        let data = await userModel.findOne({ 'nome': regexNome });

        // 2. Se nao encontrou, tenta explicitamente no banco tasksDB
        if (!data) {
            try {
                const tasksDb = mongoose.connection.useDb('tasksDB', { useCache: true });
                const userModelTasksDb = tasksDb.models.User || tasksDb.model('User', userModel.schema, 'users');
                data = await userModelTasksDb.findOne({ 'nome': regexNome });
            } catch (err) {
                console.error('Erro ao buscar no tasksDB:', err);
            }
        }

        // 3. Se ainda nao encontrou, tenta no banco test
        if (!data) {
            try {
                const testDb = mongoose.connection.useDb('test', { useCache: true });
                const userModelTestDb = testDb.models.User || testDb.model('User', userModel.schema, 'users');
                data = await userModelTestDb.findOne({ 'nome': regexNome });
            } catch (err) {
                console.error('Erro ao buscar no test:', err);
            }
        }

        if (!data) {
            return res.status(500).json({ 
                message: 'Login invalido!',
                motivo: `Usuario '${req.body.nome}' nao encontrado no banco de dados (verificado em ${mongoose.connection.name}, tasksDB e test).`
            });
        }

        if (validPassword(req.body.senha, data.hash, data.salt)) {
            const token = jwt.sign({ id: data.nome || req.body.nome || req.body.user }, 'segredo',
                { expiresIn: 300 });
            return res.json({ auth: true, token: token });
        }

        const hashCalculado = createHash('sha256').update(String(req.body.senha || '') + String(data.salt || '').trim()).digest('hex');
        return res.status(500).json({ 
            message: 'Login invalido!',
            motivo: 'Senha incorreta.',
            detalhes: {
                usuarioEncontrado: data.nome,
                saltNoBanco: data.salt,
                hashNoBanco: data.hash,
                hashCalculado: hashCalculado
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

function verificaJWT(req, res, next) {
    const token = req.headers['id-token'];
    if (!token) return res.status(401).json({
     auth: false, message: 'Token nao fornecido'
    });
    
    jwt.verify(token,'segredo', function (err, decoded) {
    if (err) return res.status(500).json({ auth: false, message: 'Falha !' });
    next();
    });
}

var { createHash } = require('crypto');
function validPassword (senha, hashBD, saltBD) {
    if (!senha || !hashBD || !saltBD) return false;
    const hashCalculado = createHash('sha256').update(String(senha) + String(saltBD).trim()).digest('hex');
    return hashCalculado.toLowerCase() === String(hashBD).trim().toLowerCase();
};

module.exports = router;
