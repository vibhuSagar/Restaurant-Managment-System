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
  //sql += 'select c.name, o.item from customer c, order_details o where c.cid=o.cid'
  sql += 'select distinct c.name,d.item from customer c,order_details d, ongoing_orders o where o.cid=d.cid and c.cid=o.cid and d.status="ongoing";'
  sql += 'select distinct c.name,d.item from customer c,order_details d, completed_orders o where o.cid=d.cid and c.cid=o.cid and d.status="completed";'

  vibhu.query(sql, (err, success) => {
    if(err)
      console.log(err)
    else {
      var ongoing_orders = [], completed_orders=[], items=[], item=[];

      //console.log(success[2])
      var name = controller.getDifferentTypes(success[2], 'name')
      //console.log(name)
      for(var i=0;i<name.length;i++){
        item = []
        for(var j=0;j<success[2].length;j++)
          if(name[i] == success[2][j].name)
            item.push(success[2][j].item)

        items.push(item)
      }
      //console.log(items)

      for(var i=0;i<name.length;i++)
        ongoing_orders.push({name: name[i], items: items[i]})
      //console.log(ongoing_orders)

      var name2 = controller.getDifferentTypes(success[3], 'name')
      var item2 = [], items2 = []
      for(var i=0;i<name2.length;i++){
        item2 = []
        for(var j=0;j<success[3].length;j++)
          if(name2[i] == success[3][j].name)
            item2.push(success[3][j].item)

        items2.push(item2)
      }
      //console.log(items)

      for(var i=0;i<name2.length;i++)
        completed_orders.push({name: name2[i], items: items2[i]})

      console.log(completed_orders)

      res.render('home.ejs',
        {
          emp: success[0],
          customer: success[1],
          ongoing_orders: ongoing_orders,
          completed_orders: completed_orders
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
      res.render("menu.ejs", {menu: controller.groupData(success), msg:''});
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
      res.redirect('/menu');
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

app.get('/view-menu', (req, res) => {

  var customer = req.query.customer;
  //console.log(customer);
  var sql = 'select * from menu';

  vibhu.query(sql, (err, success) => {
    if(err)
      console.log(err)
    else{
      //console.log(success);

      res.render("viewMenu.ejs", {menu: controller.groupData(success), customer:customer});
    }
  })
})

app.post('/order', (req, res) => {
  var customer = req.body.customer;

  var query = `select distinct cid from customer where name='${customer}'`

  vibhu.query(query, (err, success) => {
    if(err)
      res.send(err)
    else{
      var cid = success[0].cid;
      var len = parseInt((Object.keys(req.body).length)/2)
      //console.log(cid)
      names = [], price = []

      for(var i=0;i<len;i++)
        names.push(req.body['item'+i])

      for(var i=0;i<len;i++)
        price.push(req.body['price'+i])

      //console.log(names)
      //console.log(price)
      sql = '';
      for(var i=0;i<len;i++)
        sql += `insert into order_details(cid, item, price, status) values (${cid}, '${names[i]}', ${price[i]}, 'ongoing');`

      sql += `insert into ongoing_orders(cid) values (${cid});`
      vibhu.query(sql, (err, success) => {
        if(err)
          res.send(err)
        else {
          res.redirect('/home')
        }
      })

    }
  })
})


app.post('/complete-order', function(req, res){
  var cname = req.body.cname;
  console.log(cname)
  var sql = `select cid from customer where name='${cname}'`

  vibhu.query(sql, function(err, success){
    if(err)
      res.send(err)
    else{
      var cid = success[0].cid;

      var query = `delete from ongoing_orders where cid=${cid};`;
      query += `insert into completed_orders(cid) values (${cid});`
      query += `update order_details set status='completed' where cid=${cid};`

      vibhu.query(query, (err, success2) => {
        if(err)
          res.send(err)
        else {
          console.log(success2);
          res.send('done')
        }
      })
    }
  })
})



app.post("/emp", function(req, res){
  var sql =`insert into emp(name, address, phone, salary, gender) values('${req.body.emp}','${req.body.address}','${req.body.phone}', '${req.body.salary}','${req.body.gender}')`

  vibhu.query(sql, (err, success) => {
    if(err)
      res.send(err)
    else{
      res.redirect('/home')
    }
  })


})


/* Routes End */


//Listen to port 3000
app.listen(port, function(){
  console.log("Server is LIVE at port "+port);
});
