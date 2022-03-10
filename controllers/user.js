exports.user_signup = (req, res) =>{
    var nome = req.body.nome;
    var cognome = req.body.cognome;
    var email = req.body.email;
    var password = req.body.password;
    var confpassword = req.body.confpassword;
    var stato = req.body.nationality;
    var citta = req.body.citta;
    var indirizzo = req.body.indirizzo;
    var tel = req.body.tel;
    var data_nascita = req.body.data;
    var saldo = '0';
    var carta = '';
    var today = new Date();
    var datareg = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    var passRagexp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/ // 6 LETTERE, 1 MASC, 1 MIN , ALMENO 1 NUM


    if (emailRegexp.test(email) && passRagexp.test(password)){
        db.query("INSERT INTO account(email, password, saldo, data_registrazione) VALUES ('"+email+"','"+password+"','"+saldo+"', '"+datareg+"')"); 
        db.query("INSERT INTO utente(nome, cognome, indirizzo, citta, data_nascita, cellulare, stato, ref_email) VALUES ('"+nome+"','"+cognome+"','"+indirizzo+"','"+citta+"','"+data_nascita+"','"+tel+"','"+stato+"','"+email+"')");
        db.query('SELECT transazione.ref_email1, account.saldo, transazione.ammontare, transazione.id FROM transazione, account WHERE ref_email2 = "'+email+'" and transazione.ref_email1 = account.email and descrizione = "Sent money" and confermato = 0', function(error, results, fields){

            if(results != ''){
                for(var i=0; i<results.length; i++){

                    var amount = results[i].ammontare;
                    var emailmitt = results[i].ref_email1;
                    var id = results[i].id;
                    var saldomitt = results[i].saldo;
                    if(results[i].metodo_usato == "Account balance"){
                        if(saldomitt < amount){
                            db.query('DELETE FROM transazione WHERE transazione.id = "'+id+'"');

                        }
                        db.query('UPDATE account SET saldo = saldo - "'+amount+'" WHERE email ="'+emailmitt+'"');
                        db.query('UPDATE account SET saldo = saldo + "'+amount+'" WHERE email ="'+email+'"');
                        db.query('UPDATE transazione SET confermato = 1 WHERE id ="'+id+'"');
                        }
                
               
            }
        }
        })
        var mailOptions = {
            from: 'paypenguinuni@gmail.com',
            to: email,
            subject: 'Welcome to PayPenguin!',
            text: 'Hello, ' + nome + ' you successfully registered to our site!'
          };

          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });

        res.redirect('/home/login.html');
    }else{
        res.redirect('/home/wrongformat.html');
    };


}

exports.user_login = (req, res) =>{
    var email = req.body.email;
    var password = req.body.password;
 if (email && password) {

  db.query('SELECT * FROM account WHERE email = ? AND password = ?', [email, password], function(error, results, fields) {
            
            if (results.length > 0) {

    req.session.loggedin = true;
                req.session.email = email;
                res.redirect('/myaccount/mypage');
                
   } else {
                res.redirect('/home/emailpswrong.html');
   }   
   res.end();
  });
 } else {
  res.redirect('/myaccount/missingdata.html');
  res.end();
 }
}


exports.user_psw = (req, res)=>{
    var email = req.body.email;
   
    db.query('SELECT email FROM account WHERE email = ?', [email], function(error, results, fields) {

        
    if(results.length > 0){

        var password = generator.generate({
            length: 10,
            numbers: true
        });

       
        db.query("UPDATE `account` SET `password` = '"+password+"' WHERE email = ?", [results[0].email] );

        var mailOptions = {
            from: 'paypenguinuni@gmail.com',
            to: results[0].email,
            subject: 'New Paypenguin password',
            text:'Here\'s your new password: ' + password
          };

          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });

        res.redirect('/home/login.html');
        res.end();

    }
    else{
        res.redirect('/home/emailwrong.html');
        res.end();
    }
    });

}

exports.user_logout = (req, res)=>{
    req.session.destroy(function(err){
        if(err){
            console.log(err);
        } else{
            
            res.redirect('/home');
        }
    });
}

