const fs = require('fs').promises; 
const express = require('express'); 
const app = express(); 

app.use(express.json()); 

let usersCache = null; // Variável de cache

// Função assíncrona para ler o arquivo JSON, ou utilizar o cache se já carregado
const loadCache = async () => {
    if (!usersCache) { // Se o cache estiver vazio, carrega os dados do arquivo JSON
        const data = await fs.readFile('data.json', 'utf-8'); // Lê o arquivo como string
        usersCache = JSON.parse(data).users; // Carrega os usuários do JSON para o cache
    }
    return usersCache; // Retorna os usuários do cache
};

// Função assíncrona para escrever dados no arquivo JSON e atualizar o cache
const saveCache = async (newData) => {
    usersCache = newData; // Atualiza o cache
    await fs.writeFile('data.json', JSON.stringify({ users: usersCache }, null, 2)); // Escreve no arquivo
};

// Rota para criar um novo usuário
app.post('/users', async (req, res) => {
    try {
        const users = await loadCache(); // Carrega os usuários do cache
        const newUser = {
            id: Date.now(), // Gera um ID único com base no timestamp
            name: req.body.name, // Nome do usuário vindo do corpo da requisição
            age: req.body.age, // Idade do usuário
            email: req.body.email // Email do usuário
        };
        users.push(newUser); // Adiciona o novo usuário ao cache
        await saveCache(users); // Salva o cache no arquivo JSON
        res.status(201).json(newUser); // Retorna o novo usuário criado
    } catch (error) {
        res.status(500).json({ message: 'Error writing data' }); // Lida com erros
    }
});

// Rota para buscar todos usuários
app.get('/users', async (req, res) => {
    try {
        const users = await loadCache(); // Carrega os usuários do cache
        res.json(users); // Retorna a lista de usuários
    } catch (error) {
        res.status(500).json({ message: 'Error reading data' }); // Lida com erros
    }
});

// Rota para atualizar um usuário
app.put('/users/:id', async (req, res) => {
    try {
        const { id } = req.params; // Pega o ID do usuário a ser atualizado
        const { name, age, email } = req.body; // Pega o nome, idade e email do corpo da requisição
        const users = await loadCache(); // Carrega os usuários do cache
        const userIndex = users.findIndex(user => user.id == id); // Encontra o índice do usuário pelo ID

        if (userIndex !== -1) {
            // Atualiza os campos do usuário
            users[userIndex].name = name;
            users[userIndex].age = age;
            users[userIndex].email = email;
            await saveCache(users); // Escreve os dados atualizados no cache e arquivo JSON
            res.json(users[userIndex]); // Retorna o usuário atualizado
        } else {
            res.status(404).json({ message: 'User not found' }); // Se o usuário não for encontrado
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating data' }); // Lida com erros
    }
});

// Rota para deletar um usuário
app.delete('/users/:id', async (req, res) => {
    try {
        const { id } = req.params; // Pega o ID do usuário a ser deletado
        const users = await loadCache(); // Carrega os usuários do cache
        const updatedUsers = users.filter(user => user.id != id); // Filtra e remove o usuário com o ID

        if (updatedUsers.length !== users.length) {
            await saveCache(updatedUsers); // Escreve os dados sem o usuário deletado
            res.json({ message: `User ${id} deleted` }); // Retorna mensagem de sucesso
        } else {
            res.status(404).json({ message: 'User not found' }); // Se o usuário não for encontrado
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting data' }); // Lida com erros
    }
});

// Inicializa o servidor na porta 3000
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
