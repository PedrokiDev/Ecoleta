const express = require("express");
const server = express();
const db = require("./database/db");

//configurar pasta publica
server.use(express.static("public"));

//habilitar o uso do req.body na nossa aplicação - por padrão, o req.body não vem habilitado no express
server.use(express.urlencoded({ extended: true }));

//utilizando template engine
const nunjucks = require("nunjucks");
nunjucks.configure("src/view", {
  express: server,
  noCache: true,
});

//configurar caminhos da minha aplicação
//página inicial
server.get("/", (req, res) => {
  return res.render("index.html");
});

server.get("/cadastro", (req, res) => {
  //req.query: Query Strings da nossa url
  console.log(req.query); // aparece no terminal do vs(bash)

  return res.render("cadastro.html");
});

server.post("/savepoint", (req, res) => {
  // req.body: o corpo do nosso formulário
  // console.log(req.body)

  //inserir dados no banco de dados

  const query = `
    INSERT INTO places (
        image,
        name,
        address,
        address2,
        state,
        city,
        items
    ) VALUES (?,?,?,?,?,?,?);`;

  const values = [
        req.body.image,
        req.body.name,
        req.body.address,
        req.body.address2,
        req.body.state,
        req.body.city,
        req.body.items,
    ]

  function afterInsertData(err) {
    if (err) {
      console.log(err);
      return res.send("Erro no cadastro!!")
    }

    console.log("Cadastro feito com sucesso");
    console.log(this);

    return res.render("cadastro.html", {saved: true});
  }

  db.run(query, values, afterInsertData);
  
});

server.get("/search", (req, res) => {

    const search = req.query.search

    // para a pesquisa não achar item nenhum quando clicado na bussola sem conteudo na pesquisa
    // if(search == "") {
    //     //pesquisa vazia 
    //     return res.render("search-results.html", {total: 0})
    // }
    
  // pegar os dados do banco de dados
  db.all(`SELECT * FROM places WHERE city LIKE '%${search}%'`, function (err, rows) {
    if (err) {
      return console.log(err);
    }

    const total = rows.length;

    //mostra a página html com os dados do banco de dados
    return res.render("search-results.html", { places: rows, total: total });
  });
});

// ligar o servidor
server.listen(3000);
