//Dependencies
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mysql = require('mysql');

//DATABASE CONNECTION CONFIG
var vibhu = mysql.createConnection({
  host: '139.59.66.232',
  user: 'harsh',
  password: 'bjn721',
  database: 'vibhu'
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
  res.render('home.ejs');
})

//Menu Route
app.get('/menu', function(req, res){
  res.send("This is Menu page");
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



/* Routes End */


//Listen to port 3000
app.listen(port, function(){
  console.log("Server is LIVE at port "+port);
});
