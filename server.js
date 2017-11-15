//Dependencies
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var controller = require('./api/controllers/mainController');


//DATABASE CONNECTION CONFIG
var vibhu = mysql.createConnection({
  host: '139.59.66.232',
  user: 'harsh',
  password: 'bjn721',
  database: 'vibhu',
  multipleStatements: true
})

vibhu.connect(function(err){
  if(err)
    console.log(err)
  else {
    console.log("DATABASE CONNECTED");
  }
});

var port = process.env.PORT || 3000

//App Initialization
var app = express();

//middleware
app.set('views', __dirname+'/src');
app.set('view engine', 'ejs');

//Set static data directory
app.use(express.static(__dirname+'/src'))

//bodyParser middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

/* Routes Begin */
//Home Route
app.get('/', function(req, res){
  res.render('index.ejs', {msg: ""});
});

app.get('/home', function(req, res){

  var sql = 'select * from emp;';
  sql += 'select * from customer;';

  vibhu.query(sql, (err, success) => {
    if(err)
      console.log(err)
    else {

      //console.log(success[0])
      //console.log(success[1])

        res.render('home.ejs',
        {
          emp: success[0],
          customer: success[1]
        })
    }
  })
})

//Menu Route
app.get('/menu', function(req, res){

  var sql = 'select * from menu';

  vibhu.query(sql, (err, success) => {
    if(err)
      console.log(err)
    else{
      //console.log(success);
      res.render("menu.ejs", {menu: controller.groupData(success)});
    }
  })

})

//add new menu Item
app.post('/menu', (req, res) => {
  var item = req.body.item;
  var price = req.body.price;
  var type = req.body.type;

  var sql = `insert into menu(name, price, type) values( '${item}', ${price}, '${type}')`;

  vibhu.query(sql, (err, success) => {
    if(err)
      res.send(err)
    else {
      res.redirect('/menu')
    }
  })
})

app.post('/login', function(req, res){
  var password = req.body.password;

  if(password == '1234'){
    res.redirect('/home')
  }
  else {
    res.render('index.ejs', {msg: "Invalid Password"});
  }
})

app.post('/delete-item', (req, res) => {
  var item = req.body.itemName;

  var sql = `delete from menu where name='${item}'`;

  vibhu.query(sql, function(err, succcess){
    if(err){
      console.log(err)
      res.send(err)
    }
    else {
      console.log("Deleted")
      res.send('/menu');
    }
  })
})

app.post('/customer', (req, res) => {
  var name = req.body.customer;
  var address = req.body.address;
  var phone = req.body.phone;

  var sql = `insert into customer(name, address, phone) values('${name}', '${address}', '${phone}')`

  vibhu.query(sql, function(err, success){
    if(err){
      console.log(err)

    }else{
      console.log("Added Customer");

      res.redirect('/home')
    }
  })
})

/* Routes End */


//Listen to port 3000
app.listen(port, function(){
  console.log("Server is LIVE at port "+port);
});
