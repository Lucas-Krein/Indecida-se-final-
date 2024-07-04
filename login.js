const mysql = require('mysql2');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Configuração do body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Conexão com o banco de dados
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'perfil'
});

connection.connect(function (err) {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
        return;
    }
    console.log("Conexão com o banco de dados estabelecida com sucesso");
});

// Rota para a página inicial
app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, "/index.html"));
});

// Rota para a página de cadastro
app.get("/cadastrar", function (req, res) {
    res.sendFile(path.join(__dirname, "/cadastro.html"));
});

// Rota para cadastrar usuários
app.post('/cadastrar', function(req, res) {
    const username = req.body.username;
    const email = req.body.email;
    const senha = req.body.senha;

  

    const values = [username, email, senha];
    const insert = "INSERT INTO user(username, email, senha) VALUES (?, ?, ?)";

    connection.query(insert, values, function(err, result) {
        if (!err) {
            console.log("Dados inseridos com sucesso!");
            res.redirect('/listar'); // Redireciona após o cadastro ser feito com sucesso
        } else {
            console.log("Não foi possível inserir os dados: ", err);
            res.status(500).send("Erro interno ao tentar cadastrar usuário.");
        }
    });
});

// Rota para listar usuários
app.get('/listar', function (req, res) {
    const listar = "SELECT * FROM user";

    connection.query(listar, function (err, rows) {
        if (!err) {
            console.log("Consulta realizada com sucesso!");
            res.send(`
            <html>
                <head>
                    <title>Perfil</title>
                    <style>
                        table {
                            width: 50%;
                            margin: auto;
                            border-collapse: collapse;
                        }
                        th, td {
                            border: 1px solid #ddd;
                            padding: 8px;
                        }
                        th {
                            padding-top: 12px;
                            padding-bottom: 12px;
                            text-align: left;
                            background-color: #f2f2f2;
                        }
                    </style>
                </head>
                <body>  
                    <h1>Seu perfil</h1>
                    <table>
                        <tr>
                            <th>Nick</th>
                            <th>Email</th>
                            <th>Ações</th>
                        </tr>
                        ${rows.map(row => `
                        <tr>
                            <td>${escapeHtml(row.username)}</td>
                            <td>${escapeHtml(row.email)}</td>
                            <td><a href="/editar/${row.id}">Editar</a></td>
                            <td><a href="/excluir/${row.id}">Excluir</a></td>
                        </tr>
                        `).join('')}
                    </table>
                </body>
            </html>
            `);
        } else {
            console.log("Erro ao realizar a consulta", err);
            res.status(500).send("Erro ao listar os usuários.");
        }
    });
});

// Rota para excluir usuário
app.get('/excluir/:id', function (req, res) {
    const id = req.params.id;
    const excluir = "DELETE FROM user WHERE id = ?";

    connection.query(excluir, [id], function (err, result) {
        if (!err) {
            console.log("Usuário deletado!");
            res.redirect('/listar');
        } else {
            console.log("Erro ao deletar usuário", err);
            res.status(500).send("Erro ao deletar usuário.");
        }
    });
});

// Rota para editar usuário
app.get('/editar/:id', function (req, res) {
    const id = req.params.id;

    connection.query('SELECT * FROM user WHERE id = ?', [id], function (err, results) {
        if (err) {
            console.error('Erro ao buscar usuário por ID', err);
            res.status(500).send('Erro interno ao buscar usuário');
            return;
        }
        if (results.length === 0) {
            console.log("Usuário não encontrado");
            res.status(404).send("Usuário não encontrado");
            return;
        }

        const usuario = results[0];

        res.send(`
        <!DOCTYPE html>
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Editar usuário</title>
            <link rel="stylesheet" href="/styles.css">
        </head>
        <body>
            <h1>Editar usuário</h1>
            <form action="/editar/${id}" method="POST">
                <label for="novoUsername">Username:</label>
                <input type="text" id="novoUsername" name="novoUsername" value="${escapeHtml(usuario.username)}">

                <label for="novoEmail">Email:</label>
                <input type="text" id="novoEmail" name="novoEmail" value="${escapeHtml(usuario.email)}"> <br>
                
                <label for="novaSenha">Senha:</label>
                <input type="password" id="novaSenha" name="novaSenha" value="${escapeHtml(usuario.senha)}"> <br>
                
                <button type="submit">Salvar</button>
            </form>
        </body>
        </html>
        `);
    });
});

// Rota para atualizar usuário
app.post('/editar/:id', function (req, res) {
    const id = req.params.id;
    const novoUsername = req.body.novoUsername;
    const novoEmail = req.body.novoEmail;
    const novaSenha = req.body.novaSenha;

    connection.query('UPDATE user SET username = ?, email = ?, senha = ? WHERE id = ?', [novoUsername, novoEmail, novaSenha, id], function (err, result) {
        if (err) {
            console.error('Erro ao atualizar usuário', err);
            res.status(500).send('Erro interno ao atualizar usuário');
            return;
        }
        if (result.affectedRows === 0) {
            console.log('Usuário não encontrado');
            res.status(404).send('Usuário não encontrado');
            return;
        }
        console.log("Usuário atualizado com sucesso!");
        res.redirect('/listar');
    });
});

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

app.listen(8083, function () {
    console.log("Servidor rodando na url http://localhost:8083");
});
