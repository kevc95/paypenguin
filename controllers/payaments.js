exports.payaments_getsendmoney = (req, res) =>{
    var email = req.session.email;
    if(email){

        db.query('SELECT saldo FROM account WHERE account.email = ?; SELECT codice, metodo_pagamento FROM metodo WHERE metodo.ref_email = ? ORDER BY preferito DESC; ', [email, email], function (error, results, fields){
          
          var cart = [];

    
            if(results.length >=2){
          for(var i = 0; i<results[1].length; i++) {
                cart[i]= results[1][i].metodo_pagamento + ' ending with ' + results[1][i].codice.substr(-4);
          
            } 
         }

          res.render('invio_denaro.ejs', {saldo: results[0][0].saldo, cart: cart});
        });

    }else{
        res.redirect('/home');
    }
}

exports.payaments_postsendmoney = (req,res)=>{
    var email = req.session.email;
    if(email){

        var emaildest = req.body.dest;
        if(!emaildest || emaildest == email || req.body.amount == ""){
            res.redirect('/myaccount/wrongtypemail.html');
            res.end();
        }else{
        var amount = req.body.amount;
        var method = req.body.selection;
        var today = new Date();
        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        
        db.query('SELECT saldo FROM account WHERE email = ?;SELECT email FROM account WHERE email = ?', [email, emaildest], function(error, results, fields){
         
          if(results[1] != ''){
              if(method == "saldo"){

                if(results[0][0].saldo >= amount){
                    db.query('UPDATE account SET saldo = saldo - "'+amount+'" WHERE email = ?; UPDATE account SET `saldo` = `saldo` + '+amount+' WHERE email = ?', [email, emaildest]); 
                     db.query('INSERT INTO transazione (ref_email1, ref_email2, ammontare, data, metodo_usato, descrizione, periodico, num_rate, confermato) VALUES ("'+email+'", "'+emaildest+'", '+amount+', "'+date+'", "Account balance", "Sent money", "0", "0", "1");');

                    res.redirect('/myaccount/transactionsucc.html');
                    res.end();
                }else{
                    res.redirect('/myaccount/balancerror.html');
                    res.end();
                }
              }else if(method != "saldo"){
                db.query('INSERT INTO transazione (ref_email1, ref_email2, ammontare, data, metodo_usato, descrizione, periodico, num_rate, confermato) VALUES ("'+email+'", "'+emaildest+'", '+amount+', "'+date+'", "'+method+'", "Sent money", "0", "0", "1");');
                db.query('UPDATE account SET `saldo` = `saldo` + '+amount+' WHERE email = ?', [emaildest]);
                res.redirect('/myaccount/transactionsucc.html');
                  res.end();
              }
          }else{
              
              if(method == "saldo" && results[0][0].saldo >= amount){
              db.query('INSERT INTO transazione (ref_email1, ref_email2, ammontare, data, metodo_usato, descrizione, periodico, num_rate, confermato) VALUES ("'+email+'", "'+emaildest+'", '+amount+', "'+date+'", "Account balance", "Sent money", "0", "0", "0");');
              db.query('UPDATE account SET `saldo` = `saldo` - '+amount+' WHERE email = ?', [email]);
              var mailOptions = {
                from: 'paypenguinuni@gmail.com',
                to: emaildest,
                subject: 'Someone sent you money!',
                html: 'Hi, '+email+' is trying to send you '+amount+'€, but unfortunately you are not signed up. Sign up in paypenguin <a href="http://localhost:5000/home/signup.html">here<a/>' 
              };
    
              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
              });
              res.redirect('/myaccount/sendmoneynoreg.html')
              res.end();
            }else if(method != "saldo"){
                db.query('INSERT INTO transazione (ref_email1, ref_email2, ammontare, data, metodo_usato, descrizione, periodico, num_rate, confermato) VALUES ("'+email+'", "'+emaildest+'", '+amount+', "'+date+'", "'+method+'", "Sent money", "0", "0", "0");');
                var mailOptions = {
                    from: 'paypenguinuni@gmail.com',
                    to: emaildest,
                    subject: 'Someone sent you money!',
                    html: 'Hi, '+email+' is trying to send you '+amount+'€, but unfortunately you are not signed up. Sign up in paypenguin <a href="http://localhost:5000/home/signup.html">here<a/>'
                  };
        
                  transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                      console.log(error);
                    } else {
                      console.log('Email sent: ' + info.response);
                    }
                  });
                res.redirect('/myaccount/sendmoneynoreg.html')
                res.end();
            }else{
                  res.redirect('/myaccount/balancerror.html');
                  res.end();
              }
            }

        });

    }

    }else {
        res.redirect('/home');
    }
}

exports.payaments_getreceivemoney = (req, res) =>{
    var email = req.session.email;
    if(email){

        db.query('SELECT saldo FROM account WHERE account.email = ?;', [email], function (error, results, fields){
            res.render('richiesta_denaro.ejs', {saldo: results[0].saldo});
          });
  
          }else{
        res.redirect('/home');
    }
}

exports.payaments_postreceivemoney = (req, res)=>{

    var email = req.session.email;
    if(email){

        var emailmitt = req.body.mitt;
        
        if(emailmitt == "" || emailmitt == email || req.body.amount == ""){
            res.redirect('/myaccount/wrongtypemail.html');
            res.end();
        }else{
        var amount = req.body.amount;
        var today = new Date();
        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        
        db.query('SELECT email FROM account WHERE email = ?', [emailmitt], function(error, results, fields){
        
          if(results.length > 0){
               
                     db.query('INSERT INTO transazione (ref_email1, ref_email2, ammontare, data, metodo_usato, descrizione, periodico, num_rate, confermato) VALUES ("'+email+'", "'+emailmitt+'", '+amount+', "'+date+'", "", "Requested money", "0", "0", "0");');

                    res.redirect('/myaccount/mypage');
                    res.end();
                
          }else{
              db.query('INSERT INTO transazione (ref_email1, ref_email2, ammontare, data, metodo_usato, descrizione, periodico, num_rate, confermato) VALUES ("'+email+'", "'+emailmitt+'", '+amount+', "'+date+'", "", "Requested money", "0", "0", "0");');
              var mailOptions = {
                from: 'paypenguinuni@gmail.com',
                to: emailmitt,
                subject: 'Money request',
                html: '<p>Hi, '+email+' asked you to send him '+amount+'€ but you are not registered in paypenguin yet. Click <a href="http://localhost:5000/home">here</a> to sign up</p>'
              };
    
              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
              });
              res.redirect('/myaccount/sendmoneynoreg.html');
              res.end();
          }

        });

    }

    }else {
        res.redirect('/home');
    }

}

exports.payaments_getpayshop = (req, res) =>{
    var email = req.session.email;
    if(email){
        db.query('SELECT saldo FROM account WHERE account.email = ?; SELECT codice, metodo_pagamento FROM metodo WHERE metodo.ref_email = ? ORDER BY preferito DESC; ', [email, email], function (error, results, fields){
        
            var cart = [];
  
      
              if(results.length >=2){
            for(var i = 0; i<results[1].length; i++) {
                  cart[i]= results[1][i].metodo_pagamento + ' ending with ' + results[1][i].codice.substr(-4);
            
              } 
              
            }
  
            res.render('pagamento_esercizi.ejs', {cart: cart});
          });
    }else{
            res.redirect('/home');
        }
    
}

exports.payaments_postpayshop =  (req, res) =>{
    var email = req.session.email;
    if(email){
		if ((req.body.periodico != "true" && (req.body.amount ==  "" || req.body.esercizio == "" )) || (req.body.periodico == "true" &&(req.body.amount ==  "" || req.body.esercizio == "" || req.body.rate == "" || req.body.start == ""))){
		    res.redirect('/myaccount/missingdata.html');
            res.end();
		}else{
        var method = req.body.selection;
        var amount = req.body.amount;
        var periodico = req.body.periodico;
        var esercizio = req.body.esercizio;
        var rate = req.body.rate;
        var start = req.body.start;
        var today = new Date();
        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        
        if(periodico != "true"){
            if(method == "saldo"){
                db.query('SELECT saldo FROM account WHERE email = "'+email+'"', function(error, results, fields){
                    if(results[0].saldo >= amount){
                        db.query('INSERT INTO transazione (ref_email1, ref_email2, ammontare, data, metodo_usato, descrizione, periodico, num_rate, confermato) VALUES ("'+email+'", "'+esercizio+'", '+amount+', "'+date+'", "Account balance", "Shop payament", "0", "0", "1");');
                        db.query('UPDATE account SET saldo = saldo - "'+amount+'" WHERE email = ?', [email]);
                        res.redirect('/myaccount/transactionsucc.html');
                        res.end();
                    }else {
                        res.redirect('/myaccount/balancerror.html');
                        res.end();
                    
                    }
                });
            }else{
                db.query('INSERT INTO transazione (ref_email1, ref_email2, ammontare, data, metodo_usato, descrizione, periodico, num_rate, confermato) VALUES ("'+email+'", "'+esercizio+'", '+amount+', "'+date+'", "'+method+'", "Shop payament", "0", "0", "1");');
                res.redirect('/myaccount/transactionsucc.html');
                res.end();
            }
        }else{
            var date2 = today.getFullYear()+'-0'+(today.getMonth()+1)+'-'+today.getDate();
            var descrizione = 'Instalment';
            
            if(rate == 0){
                end = (today.getFullYear()+400)+'-'+(today.getMonth())+'-'+today.getDate();
                descrizione = "Subscription";
            }
            if(method == "saldo"){
                db.query('SELECT saldo FROM account WHERE email = "'+email+'"', function(error, results, fields){
                var num = amount;
                if(results[0].saldo < num){
                    res.redirect('/myaccount/balancerror.html');
                }else{
                    if ( start == date2){
                        db.query('INSERT INTO transazione (ref_email1, ref_email2, ammontare, data, metodo_usato, descrizione, periodico, num_rate, confermato) VALUES ("'+email+'", "'+esercizio+'", '+amount+', "'+start+'", "Account balance", "'+descrizione+'", "1", "'+rate+'", "1");');
                        db.query('UPDATE account SET saldo = saldo - "'+amount+'" WHERE email = ?', [email]);
                    }
                    
                    res.redirect('/myaccount/transactionsucc.html');
                    res.end();
                }
                });
            }else{
               
                if ( start == date2){
                db.query('INSERT INTO transazione (ref_email1, ref_email2, ammontare, data, metodo_usato, descrizione, periodico, num_rate, confermato) VALUES ("'+email+'", "'+esercizio+'", '+amount+', "'+start+'", "'+method+'", "'+descrizione+'", "1", "'+rate+'", "1");');
                }
                res.redirect('/myaccount/transactionsucc.html');
                res.end();
            }

        }
	  }
    }else{
        res.redirect('/home');
    }
}

exports.payaments_gettopup = (req, res)=>{
    var email = req.session.email;

   
    if(email){

        db.query('SELECT codice, metodo_pagamento FROM metodo WHERE metodo.ref_email = ? ORDER BY preferito DESC; ', [email], function (error, results, fields){
            
            var cart = [];
            
            
              if(results.length >0){
            for(var i = 0; i<results.length; i++) {
                  cart[i] = results[i].metodo_pagamento + ' ending with ' + results[i].codice.substr(-4);
            
              } 
             
              }
  
            res.render('topup.ejs', {cart: cart});
          });
    }else{
        res.redirect('/home');
    }
}

exports.payaments_posttoptup = function(req, res){
    var email = req.session.email;
   
    if(email){
       
        var amount = req.body.amount;
        var method = req.body.selection;
        var today = new Date();
        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        var dest ='';

        db.query('UPDATE account SET saldo = saldo + '+amount+' WHERE email = ?', [email]); 
        db.query('INSERT INTO transazione (ref_email1, ref_email2, ammontare, data, metodo_usato, descrizione, periodico, num_rate, confermato) VALUES ("'+email+'", "'+dest+'", "'+amount+'", "'+date+'", "'+method+'", "Top up", "0", "0", "1")');

         res.redirect('/myaccount/mypage');
         res.end();

        
    }else{

    res.redirect('/home');
    }

}

exports.payaments_getrequests = (req, res) =>{
    var email = req.session.email;

    if(email){

        db.query('SELECT id, data, ref_email2, ammontare, descrizione FROM transazione WHERE ref_email1 = ? and confermato = 0 and periodico = 0; SELECT id, data, ref_email1, ammontare, descrizione FROM transazione WHERE ref_email2 = ? and confermato = 0; SELECT metodo_pagamento, codice FROM metodo WHERE ref_email = ?', [email, email, email], function( error, results, fields){

           
            var cart = [];
            var resultstra = new Array();

            resultstra[0] = new Array();
            resultstra[1] = new Array();

            if(results[0]=='' && results[1] ==''){
                res.render('request.ejs', {cart:  cart, resultstra: resultstra, confirm: 'none', testo: 'visible', testo2: 'visible', descrizionenull: 'You haven\'t sent any requests yet', descrizionenull2: 'You have no user\'s requests'});

            }else if(results[0] == '' && results[1] != ''){
                resultstra[1] = results[1];
                for(var i = 0; i<results[2].length; i++) {
                    cart[i]= results[2][i].metodo_pagamento + ' ending with ' + results[2][i].codice.substr(-4);
                } 
                res.render('request.ejs', {cart:  cart, resultstra: resultstra, confirm: 'inline', testo: 'visible', testo2: 'hidden', descrizionenull: 'You haven\'t sent any requests yet', descrizionenull2: 'You have no user\'s requests'});
            }else if(results[0] != '' && results[1] == ''){
                resultstra[0] = results[0];
                res.render('request.ejs', {cart:  cart, resultstra: resultstra, confirm: 'none', testo: 'hidden', testo2: 'visible', descrizionenull: 'You haven\'t sent any requests yet', descrizionenull2: 'You have no user\'s requests'});
            }else{
                resultstra = results;
                for(var i = 0; i<results[2].length; i++) {
                    cart[i]= results[2][i].metodo_pagamento + ' ending with ' + results[2][i].codice.substr(-4);
              
                } 
                res.render('request.ejs', {cart: cart, resultstra: resultstra, confirm: 'inline', testo: 'hidden',testo2: 'hidden', descrizionenull: 'You haven\'t sent any requests yet', descrizionenull2: 'You have no user\'s requests'});
            }

        });

    }else{
        res.redirect('/home');
    }

}

exports.payaments_postyes = (req, res)=>{
    var email = req.session.email;
    if(email){
        var random = req.body.idd;
        var method = req.body.selection;
        
        if(method == "saldo"){
            db.query('SELECT saldo FROM account WHERE email = ?; SELECT ammontare, ref_email1 FROM transazione WHERE id = ?', [email, random], function(error, results, fields){
            
            var saldo = results[0][0].saldo;
            var amount = results[1][0].ammontare;
            var ref_email1 = results[1][0].ref_email1;
        
        
            if(saldo < amount){
                res.redirect('/myaccount/balancerror.html');
                res.end();
            }else{
                
                db.query('UPDATE transazione SET metodo_usato = "Account balance", confermato = 1 WHERE id = "'+random+'"'); 
                db.query('UPDATE account SET saldo = saldo + "'+amount+'" WHERE email = ?', [ref_email1]);
                db.query('UPDATE account SET saldo = saldo - "'+amount+'" WHERE email = ?', [email]);
                res.redirect('/myaccount/profile');
                
            }
           });

        } else{
            db.query('SELECT ammontare, ref_email1 FROM transazione WHERE id = ?', [random], function(error, results, fields){
            db.query('UPDATE account SET saldo = saldo + "'+results[0].ammontare+'" WHERE email = ?', [results[0].ref_email1]);
            db.query('UPDATE transazione SET metodo_usato = "'+method+'", confermato = 1 WHERE id = "'+random+'"');
            res.redirect('/myaccount/profile');
            });
        }
        
    }else{
        res.redirect('/home');
    }
}

exports.payaments_postno = (req, res) =>{
    var email = req.session.email;
    if(email){
        
        var random = req.body.no;
       db.query('DELETE FROM transazione where transazione.id = ?', [random]);
       res.redirect('back');
       res.end();

    }else{
        res.redirect('/home');
    }
}


exports.payaments_postcancel = (req, res)=>{
    var email = req.session.email;
    if(email){
        
        var random = req.body.checkboxCancel;
        db.query('SELECT ammontare FROM transazione WHERE id = "'+random+'"',function(error, results, fields){
       db.query('DELETE FROM transazione where transazione.id = ?', [random]);
       db.query('UPDATE account SET `saldo` = `saldo` + '+results[0].ammontare+' WHERE email = ?', [email]);
    })
       res.redirect('back');
       res.end();

    }else{
        res.redirect('/home');
    }

}

exports.payaments_getcancelsubscription = (req, res) =>{
    var email = req.session.email;
    if(email){
        db.query('SELECT id, data, ref_email2, ammontare, descrizione FROM transazione WHERE ref_email1 = ? and confermato = 0 and descrizione = "Subscription";', [email], function( error, results, fields){
           if(results == ''){
            res.render('cancel_subscription.ejs', {resultstra: results, testo: 'visible',  descrizionenull: 'You haven\'t any subscription'});
           }else{
            res.render('cancel_subscription.ejs', {resultstra: results, testo: 'hidden',  descrizionenull: ''});
           }
        });
    }else{
        res.redirect('/home');
    }
}

exports.payaments_postcancelsubscription = (req, res) =>{

    var email = req.session.email;
    if(email){
        
        var random = req.body.checkboxCancel;
        
       db.query('DELETE FROM transazione where transazione.id = ?', [random]);
       res.redirect('/myaccount/subscription');
       res.end();

    }else{
        res.redirect('/home');
    }

}