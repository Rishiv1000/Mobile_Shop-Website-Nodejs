var express = require('express')
var ejs = require('ejs')
var bodyParser = require('body-parser')
var mysql = require('mysql')
var session = require('express-session')
const multer = require("multer");

const con =mysql.createConnection({
   host:"localhost",
   user: "root",
   password:"",
   database:"node_project"
})

//************************************************** */

const upload =multer({
   storage:multer.diskStorage({
      destination:function(req,file,cb){
         cb(null,"public/images")
      }
   }),
   filename: function(req,file,cb){
      cb(null,file.fieldname + ".jpg")
   }})

 //******************************************************** */

function isProductInCart(cart,id){
   for(let i=0;i<cart.length;i++){
      if(cart[i].id == id){
        return true;
      }
   }
   return false;
  }
  
  function calculateTotal(cart,req){
     total =0;
     for(let i=0;i<cart.length;i++){
        if(cart[i].sale_price){
           total =total + (cart[i].sale_price * cart[i].quantity)
        }
        else{
           total =total + (cart[i].price * cart[i].quantity)
        }
     }
     req.session.total = total; 
     return total;
  } 

  //************************************************** */



var app = express()
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(session({secret:"secret"}))

//********************************************* */

app.post("/upload", (req, res) => {
   res.send(" file uploaded successfully");  
 });
 

app.get('/admin', function(req,res){
   res.render('admin')
})

app.post('/admin',function(req,res){
  
      var name = req.body.na;
      var price = req.body.pr;
      var sale_price= req.body.sa;
      var quan = req.body.qu;
      var image = req.body.im;
      var sql = `INSERT INTO products(name,price,sale_price,quantity,image) VALUES ("${name}" ,"${price}","${sale_price}","${quan}" ,"${image}")`;
      con.query(sql,function(error,data){
         if(error){
            throw error;
         }else{
            console.log("ADDED")
            res.render('firsthome')
         }
      } )
      
})

app.get('/', function(req,res){
   res.render('firsthome')
 })

 app.get('/Ahome', function(req,res){
   res.render('firsthome')
 })

 app.get('/Aproducts', function(req,res){
   var db= mysql.createConnection({
      host:"localhost",
      user: "root",
      password:"",
      database:"node_project"
   })
   db.query("SELECT * FROM products",(err, element)=>{
      res.render('firstproducts',{result :element})
   })
 })

 app.get('/Acontact', function(req,res){
   res.render('firstcontact')
 })

 app.get('/Aabout', function(req,res){
   res.render('firstabout')
 })

 //********************************************************* */


 app.get('/login', function(req,res){
   res.render('login')
 })

 app.post('/logout', function(req,res){
   res.render('/');
})
app.get('/login', function(req,res){
res.render('login')
})
app.get('/logout', function(req,res){
res.render('login')
})


app.post('/login',function(req,res){
var username = req.body.username;
var password = req.body.password;
if(username && password){
   query =`SELECT * FROM login WHERE Email = ${username} `;
   res.render('home');
   console.log("Login")
      }
})

app.get('/signup', function(req,res){
res.render('signup');
})

app.post('/signup',function(req,res){
var username = req.body.username;
var pass = req.body.password;
var phone = req.body.phone;
var sql = `INSERT INTO login(email,password,phone) VALUES ("${username}" ,"${pass}","${phone}")`;
con.query(sql,function(error,data){
   if(error){
      throw error;
   }else{
      console.log("Sign Up")
      res.render('loginnext')
   }
} )
})

 //****************************************************************** */
 app.get('/home', function(req,res){
   res.render('home');
})

app.get('/about', function(req,res){
   res.render('about')
})

app.get('/contact', function(req,res){
   res.render('contact')
})


app.get('/products', function(req,res){
   var db= mysql.createConnection({
      host:"localhost",
      user: "root",
      password:"",
      database:"node_project"
   })
   db.query("SELECT * FROM products",(err, element)=>{
      res.render('products',{result :element})
   })
   
})


app.post('/add_to_cart', function(req ,res){
   var id  = req.body.id ;
   var name  = req.body.name ;
   var  price = req.body.price ;
   var sale_price  = req.body.sale_price ;
   var  quantity = req.body.quantity ;
   var image   = req.body.image;

   var product = [ {id:id,
      name:name,
      price:price,
      sale_price:sale_price,
      quantity:quantity,
      image:image}]
   
   if(req.session.cart){
      var cart = req.session.cart;

      if(!isProductInCart(cart,id)){
         cart.push(product);
      }
   }
   else{

      req.session.cart = product;
      var cart =req.session.cart; 
   }

   calculateTotal(cart,req);

   res.redirect("/cart");
})  

app.get('/cart',function(req,res){
    
    var cart = req.session.cart;
    var total = req.session.total;

    res.render('cart',{cart:cart,total:total});
});

app.post('/remove_product', function(req,res){
   var id = req.body.id;
   var cart = req.session.cart;

   for(let i = 0;i<cart.length ; i++){
      if(cart[i].id == id){

         cart.splice(cart.indexOf(i),1);
      }
   }
   calculateTotal(cart,req);
   res.redirect('/cart');
})

app.post('/edit_product_quantity', function(req, res){

   var id  = req.body.id ;
   var  quantity = req.body.quantity ;
   var increase_btn  = req.body.increase_product_quantity ;
   var  decrease_btn = req.body.decrease_product_quantity ;

   var cart  = req.session.cart ;

   if(increase_btn){
      for(let i =0; i<cart.length; i++){
         if(cart[i].id == id){
            if(cart[i].quantity > 0){
               cart[i].quantity = parseInt(cart[i].quantity)+1;
            }
         }
      }
   }
    
   if(decrease_btn){
      for(let i =0; i<cart.length; i++){
         if(cart[i].id == id){
            if(cart[i].quantity > 1){
               cart[i].quantity = parseInt(cart[i].quantity)-1;
            }
         }
      }
   }
   calculateTotal(cart,req);
   res.redirect('/cart')
})

app.get('/checkout',function(req,res){
   var total= req.session.total
   res.render('checkout',{total:total})
})

app.post('/place_order' ,function(req,res){
  
   var name  = req.body.name ;
   var  email = req.body.email ;
   var  phone = req.body.phone ;
   var  city= req.body.city ;
   var address  = req.body.address ;
   var cost = req.session.total ;
   var status  = "not paid";
   var date = new Date();
   var products_ids= "";

   var con = mysql.createConnection({
      host:"localhost",
      user: "root",
      password:"",
      database:"node_project"
   })

   var cart = req.session.cart;
   for(let i=0; i < cart.length ;i++){
      products_ids = products_ids + "," + cart[i].id;
   }

   con.connect((err)=>{
      if(err){
         console.log(err)
      }else{
         var query ="INSERT INTO orders(cost,name,email,status,city,address,phone,date,products_ids) VALUES ?";
         var values=[
         [cost,name,email,status,city,address,phone,date,products_ids]
         ];
         con.query(query,[values],(err,result)=>{
            res.redirect('/payment')
         })
      }
   })
})

//......................................... Payment JS.

const https = require("https");
const qs = require("querystring");

const checksum_lib = require("./Paytm/checksum");
const config = require("./Paytm/config");
const { connect } = require('http2')

const parseUrl = express.urlencoded({ extended: false });
const parseJson = express.json({ extended: false });

app.get("/payment", (req, res) => {
    res.render("payment");
  });
  
  app.post("/paynow", [parseUrl, parseJson], (req, res) => {
    // Route for making payment
  
    var paymentDetails = {
      amount: req.body.amount,
      customerId: req.body.name.replace(/\s/g,''),
      customerEmail: req.body.email,
      customerPhone: req.body.phone
  }
  if(!paymentDetails.amount || !paymentDetails.customerId || !paymentDetails.customerEmail || !paymentDetails.customerPhone) {
      res.status(400).send('Payment failed')
  } else {
      var params = {};
      params['MID'] = config.PaytmConfig.mid;
      params['WEBSITE'] = config.PaytmConfig.website;
      params['CHANNEL_ID'] = 'WEB';
      params['INDUSTRY_TYPE_ID'] = 'Retail';
      params['ORDER_ID'] = 'TEST_'  + new Date().getTime();
      params['CUST_ID'] = paymentDetails.customerId;
      params['TXN_AMOUNT'] = paymentDetails.amount;
      params['CALLBACK_URL'] = 'http://localhost:1234/callback';
      params['EMAIL'] = paymentDetails.customerEmail;
      params['MOBILE_NO'] = paymentDetails.customerPhone;
  
  
      checksum_lib.genchecksum(params, config.PaytmConfig.key, function (err, checksum) {
          var txn_url = "https://securegw-stage.paytm.in/theia/processTransaction"; // for staging
          // var txn_url = "https://securegw.paytm.in/theia/processTransaction"; // for production
  
          var form_fields = "";
          for (var x in params) {
              form_fields += "<input type='hidden' name='" + x + "' value='" + params[x] + "' >";
          }
          form_fields += "<input type='hidden' name='CHECKSUMHASH' value='" + checksum + "' >";
  
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.write('<html><head><title>Merchant Checkout Page</title></head><body><center><h1>Please do not refresh this page...</h1></center><form method="post" action="' + txn_url + '" name="f1">' + form_fields + '</form><script type="text/javascript">document.f1.submit();</script></body></html>');
          res.end();
      });
  }
  });
  app.post("/callback", (req, res) => {
    // Route for verifiying payment
  
    var body = '';
  
    req.on('data', function (data) {
       body += data;
    });
  
     req.on('end', function () {
       var html = "";
       var post_data = qs.parse(body);
  
       // received params in callback
       console.log('Callback Response: ', post_data, "\n");
  
  
       // verify the checksum
       var checksumhash = post_data.CHECKSUMHASH;
       // delete post_data.CHECKSUMHASH;
       var result = checksum_lib.verifychecksum(post_data, config.PaytmConfig.key, checksumhash);
       console.log("Checksum Result => ", result, "\n");
  
  
       // Send Server-to-Server request to verify Order Status
       var params = {"MID": config.PaytmConfig.mid, "ORDERID": post_data.ORDERID};
  
       checksum_lib.genchecksum(params, config.PaytmConfig.key, function (err, checksum) {
  
         params.CHECKSUMHASH = checksum;
         post_data = 'JsonData='+JSON.stringify(params);
  
         var options = {
           hostname: 'securegw-stage.paytm.in', // for staging
           // hostname: 'securegw.paytm.in', // for production
           port: 443,
           path: '/merchant-status/getTxnStatus',
           method: 'POST',
           headers: {
             'Content-Type': 'application/x-www-form-urlencoded',
             'Content-Length': post_data.length
           }
         };
  
  
         // Set up the request
         var response = "";
         var post_req = https.request(options, function(post_res) {
           post_res.on('data', function (chunk) {
             response += chunk;
           });
  
           post_res.on('end', function(){
             console.log('S2S Response: ', response, "\n");
  
             var _result = JSON.parse(response);
               if(_result.STATUS == 'TXN_SUCCESS') {
                   res.send('payment sucess')
               }else {
                   res.send('payment failed')
               }
             });
         });
  
         // post the data
         post_req.write(post_data);
         post_req.end();
        });
       });
  });
  
  module.exports= app;



app.listen(3000);