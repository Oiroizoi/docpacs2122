const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const app = express();
const port = 5600;
const fs = require('fs');
const path = require('path');

app.use(express.urlencoded({
  extended: true
}));
let db = new sqlite3.Database('data.db');
app.use( express.static( "public" ) );
app.use(express.static(path.join(__dirname, '/views')));
app.use('/images', express.static(__dirname + '/Images'));

app.set('view engine', 'ejs');
app.get('/',(req, res) => {
  res.render('index')
})
//404 Page
app.use((req, res) => {
  res.render('404.ejs');
})
app.get('/create',(req, res) => {
  res.render('create')
})
app.post('/create',(req, res) => {
  if (!req.body.date) {
    res.send("Error: No DocPac date");
  } else {
    let categories = ["changes", "events", "goals", "included", "required"];
    missingInfo = false;
    categories.forEach(category => {
      if (req.body[category + "Type"] && !req.body[category]) {
        missingInfo = true;
        res.send("Error: Not enough info");
      }
    });
    if (!missingInfo) {
      db.serialize(() => {
        if (req.body.changes) db.run(`INSERT INTO changes ("docPacDate", "text") VALUES ("${req.body.date}", "${req.body.changes}")`);
        if (req.body.events) db.run(`INSERT INTO events ("docPacDate", "eventDate", "type", "text") VALUES ("${req.body.date}", "${req.body.eventDate}", "${req.body.eventsType}", "${req.body.events}")`);
        if (req.body.goals) db.run(`INSERT INTO goals ("docPacDate", "goal") VALUES ("${req.body.date}", "${req.body.goals}")`);
        if (req.body.included) db.run(`INSERT INTO includedDocumentation ("docPacDate", "type", "assignmentName") VALUES ("${req.body.date}", "${req.body.includedType}", "${req.body.included}")`);
        if (req.body.required) db.run(`INSERT INTO requiredDocumentation ("docPacDate", "type", "name") VALUES ("${req.body.date}", "${req.body.requiredType}", "${req.body.required}")`);
      });
      res.send("Inserted into database.");
    }
  }
})
app.post('/search', (req, res) => {
  let tableName= req.body.category;
  db.all(`SELECT * from ${tableName}`, [], (err, rows) => {
    if (err) {
      throw err;
    } else {
      console.log(rows);
      res.render('search', {
        data: rows
      });
    }
  });
})









app.listen(port);