const express = require ('express');
const mysql = require ('mysql');
var pdfMake = require('pdfmake/build/pdfmake.min.js');
const vfsFonts = require('pdfmake/build/vfs_fonts.js');
pdfMake.vfs = vfsFonts.pdfMake.vfs;
var bodyParser = require ("body-parser");
var session = require ('express-session');
var fs = require('fs');
const userController = require('./controllers/user');
const payamentsController = require('./controllers/payaments');
const downloadController = require('./controllers/download');
const userInterfaceController = require('./controllers/userInterface');

// CONNECTION MYSQL
global.db = mysql.createConnection({
    host : 'localhost',
    user : 'vagrantdb',
    password : 'vagrantdb',
    database : 'paypenguin',
    multipleStatements: true
});

const path = require('path');
const app = express();


// CONNECt DB

db.connect((err) => {
    if(err){
        throw err;
    }   
    console.log('Mysql connected');
})

// SETTINGS
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(session({
 secret: 'secret',
 resave: true,
 saveUninitialized: true
}));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));


var nodemailer = require('nodemailer');

global.transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
  service: 'gmail',
  port: 465,
  auth: {
    user: '',
    pass: ''
  },
  tls: {
      rejectUnauthorized: false
  },
});

var generator = require('generate-password');



app.get('/', function(req, res) {
    res.redirect('/home');
});

app.get('/login', function(req,res){
    if(req.session.email){
        res.redirect('/myaccount/mypage');
        res.end();
    }else {
        res.redirect('/home/login.html');
    }
});

app.post('/signup', userController.user_signup);

app.post('/login', userController.user_login);

app.get('/home/problemi-accesso', function(req, res){
    res.redirect('/home/problemi_accesso.html');
});

app.post('/home/pswlost', userController.user_psw);

app.get('/logout', userController.user_logout);

app.get('/myaccount/sendmoney', payamentsController.payaments_getsendmoney );

app.get('/myaccount/subscription', payamentsController.payaments_getcancelsubscription );

app.post('/subscription/cancel', payamentsController.payaments_postcancelsubscription );


app.post('/send', payamentsController.payaments_postsendmoney);

app.get('/myaccount/receivemoney', payamentsController.payaments_getreceivemoney);

app.post('/receive', payamentsController.payaments_postreceivemoney);

app.get('/myaccount/payshop', payamentsController.payaments_getpayshop);

app.post('/myaccount/payshop', payamentsController.payaments_postpayshop);

app.get('/myaccount/topup', payamentsController.payaments_gettopup);

app.post('/topup', payamentsController.payaments_posttoptup);

app.get('/myaccount/requests', payamentsController.payaments_getrequests);

app.post('/requests/yes', payamentsController.payaments_postyes);

app.post('/requests/no', payamentsController.payaments_postno);

app.post('/requests/cancel', payamentsController.payaments_postcancel);

app.get('/myaccount/mypage', userInterfaceController.userInterface_getmypage);

app.get('/myaccount/profile', userInterfaceController.userInterface_getprofile);

app.get('/myaccount/mypayaments', userInterfaceController.userInterface_getmypayaments);

app.get('/myaccount/history', userInterfaceController.userInterface_gethistory);

app.post('/myaccount/gethistory', userInterfaceController.userInterface_posthistory)

app.get('/myaccount/download', downloadController.download_get);

app.post('/myaccount/sendpdf', downloadController.download_post);

app.post('/myaccount/downloadnow', downloadController.download_postnow);

app.get('/myaccount/changepsw', userInterfaceController.userInterface_getpsw);

app.post('/myaccount/setpsw', userInterfaceController.userInterface_postpsw);

app.get('/myaccount/changedata', userInterfaceController.userInterface_getchangedata);

app.post('/myaccount/setdata', userInterfaceController.userInterface_postchangedata);

app.get('/myaccount/linkcard', userInterfaceController.userInterface_getlinkcard);

app.post('/setcard', userInterfaceController.userInterface_postlinkcard);

app.get('/myaccount/linkbankacc', userInterfaceController.userInterface_getbankacc);

app.post('/myaccount/setbankacc', userInterfaceController.userInterface_postbankacc);

app.post('/setmethod',userInterfaceController.userInterface_postsetmethod);









