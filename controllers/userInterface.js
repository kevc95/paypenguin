exports.userInterface_getmypage = (req, res)=>{
    var email = req.session.email;
    if(email){

        db.query('SELECT * FROM account, utente WHERE account.email = utente.ref_email and account.email = ?; SELECT * FROM metodo WHERE metodo.ref_email = ? and preferito = 1; SELECT ref_email1, ref_email2, ammontare, data, descrizione FROM account, transazione WHERE (account.email = transazione.ref_email1 or account.email = transazione.ref_email2) and transazione.confermato = 1 and account.email = ? ORDER BY id DESC; ', [email, email, email], function (error, results, fields){
            var cart = '';
            var ref_email2;

           if(results[1][0]){
            cart= results[1][0].metodo_pagamento + ' ending with ' + results[1][0].codice.substr(-4);
               
               
            }else{

                cart= ' Not set yet'
            }

            var resultstra = [];

           if(results[2] == ''){
                res.render('mypage.ejs', {accname: results[0][0].nome, accsaldo: results[0][0].saldo.toFixed(2), accmethod1: cart, resultstra: resultstra , descrizionenull: 'No transactions', testo: 'visible' })
                res.end();
            } else {

                resultstra = results[2];

                for(var i=0; i<resultstra.length && i<2; i++){
                    ref_email2 = resultstra[i].ref_email2;
                    if(ref_email2 == email){
                        resultstra[i].ref_email2 = resultstra[i].ref_email1;
                        if (resultstra[i].descrizione == "Received money" || resultstra[i].descrizione == "Requested money" ){
                            resultstra[i].descrizione = "Sent money";
                        }else if(resultstra[i].descrizione == "Sent money"){
                            resultstra[i].descrizione = "Received money";
                        }
                        
                    }else if(email == resultstra[i].ref_email1 && resultstra[i].descrizione == "Requested money" ){
                        resultstra[i].descrizione = "Received money";
                    }
                }

                res.render('mypage.ejs', {accname: results[0][0].nome, accsaldo: results[0][0].saldo.toFixed(2), accmethod1: cart, resultstra: resultstra, descrizionenull: '', testo: 'hidden'});
                res.end();
            }
        });
        return;

    } else {
        res.redirect('/home');
    }
    res.end();
}

exports.userInterface_getprofile = function(req, res){

    var email = req.session.email;

    if(email){
        db.query('SELECT * FROM utente WHERE utente.ref_email = ?', [email], function(error, results, fields){

            res.render('profile.ejs', {data: results[0]});

        });

    }else{
        res.redirect('/home');
        res.end();
    }

}

exports.userInterface_getmypayaments = function(req, res){
    var email = req.session.email;
    if(email){
        db.query('SELECT metodo_pagamento, codice FROM metodo WHERE ref_email = ? ', [email], function(error, results, fields){
            var codice = [];
                for(var  i=0; i<results.length; i++){
                    codice[i] = results[i].codice.substr(-4);
               
                }

                if(results.length<1){
                    res.render('mypayaments.ejs', {results, metodo_pagamento: 'vuoto'});
                    res.end();
                }
                else{
                    res.render('mypayaments.ejs', {results, codice: codice});
                    res.end();
                }
        });
    }else{
        res.redirect('/home');
    }

}

exports.userInterface_gethistory = (req, res) =>{
    var email = req.session.email;
    if(email){
        var today = new Date();
        var dd = today.getDate();
        if(dd < 10){
            dd = '0' + dd;
        }

        var mm = today.getMonth()+1;

        if(mm < 10){
            mm = '0' + mm;
        }
        var date = today.getFullYear()+'-'+ mm +'-'+ dd;
        var past = new Date();

        var dd1 = past.getDate();
        if(dd1 < 10){
            dd1 = '0' + dd1;
        }

        var mm1 = past.getMonth();

        if(mm1 < 10){
            mm1 = '0' + mm1;
        }

        var yy = past.getFullYear();
        if( mm1 = "00"){
            mm1 = "12";
            yy = yy -1;

        }
        var date2 = yy +'-'+ mm1 +'-'+ dd1;
        var resultstra =  [];
        console.log(date);
        console.log(date2);

        db.query('SELECT ref_email1, ref_email2, ammontare, data, descrizione FROM transazione WHERE (transazione.ref_email1 = ? or transazione.ref_email2 = ?) and confermato = 1 and transazione.data BETWEEN "'+date2+'" and "'+date+'" ORDER BY data ASC ', [email, email], function(error, results, fields){
    
            if(results != ''){

                resultstra = results;

                for(var i=0; i<resultstra.length; i++){
                    ref_email2 = resultstra[i].ref_email2;
                    if(ref_email2 == email){
                        resultstra[i].ref_email2 = resultstra[i].ref_email1;
                        if (resultstra[i].descrizione == "Received money" || resultstra[i].descrizione == "Requested money" ){
                            resultstra[i].descrizione = "Sent money";
                        }else if(resultstra[i].descrizione == "Sent money"){
                            resultstra[i].descrizione = "Received money";
                        }
                        
                    }else if(email == resultstra[i].ref_email1 && resultstra[i].descrizione == "Requested money" ){
                        resultstra[i].descrizione = "Received money";
                    }
                }

                res.render('attività_recenti.ejs', {resultstra: resultstra, descrizionenull: '', date: date2, date2: date, testo: 'hidden'});
            }else{
                res.render('attività_recenti.ejs', {resultstra: resultstra, descrizionenull: 'No transaction this month ', date: date2, date2: date, testo: 'visible'});
            }

        });
        
    }else{
        res.redirect('/home');
    }

}

exports.userInterface_posthistory = (req, res)=>{
    var email = req.session.email;
    if (email){
        date = req.body.datetimestart;
        date2 = req.body.datetimefine;
        console.log(req.body.datetimestart);
        var resultstra =  [];

        db.query('SELECT ref_email1, ref_email2, ammontare, data, descrizione FROM transazione WHERE (transazione.ref_email1 = ? or transazione.ref_email2 = ?) and confermato = 1 and transazione.data BETWEEN "'+date+'" and "'+date2+'" ORDER BY data ASC ', [email, email], function(error, results, fields){
            console.log(results);
            if(results != ''){

                resultstra = results;

                for(var i=0; i<resultstra.length; i++){
                    ref_email2 = resultstra[i].ref_email2;
                    if(ref_email2 == email){
                        resultstra[i].ref_email2 = resultstra[i].ref_email1;
                        if (resultstra[i].descrizione == "Received money" || resultstra[i].descrizione == "Requested money" ){
                            resultstra[i].descrizione = "Sent money";
                        }else if(resultstra[i].descrizione == "Sent money"){
                            resultstra[i].descrizione = "Received money";
                        }
                        
                    }else if(email == resultstra[i].ref_email1 && resultstra[i].descrizione == "Requested money" ){
                        resultstra[i].descrizione = "Received money";
                    }
                }

                res.render('attività_recenti.ejs', {resultstra: resultstra, date: date, date2: date2, descrizionenull: '', testo: 'hidden'});
            }else{
                res.render('attività_recenti.ejs', {resultstra: resultstra, descrizionenull: 'No transaction in this period', date: date, date2: date2, testo: 'visible'});
            }

        });


    }else{
        res.redirect('/home');
    }
}

exports.userInterface_getpsw = (req, res)=>{

    var email = req.session.email;
   
    if(email){
        res.redirect('/myaccount/change_psw.html');
        res.end();
    }else{
        res.redirect('/home');
    }

}

exports.userInterface_postpsw = (req, res)=>{

    var email = req.session.email;
    if(email){

        var passRegexp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/
        var oldpassword = req.body.oldpassword;
        var newpassword = req.body.password;

        db.query('SELECT password FROM account WHERE email = ?', [email], function(error, results, fields){

        if(results[0].password == oldpassword ){
        
           if(passRegexp.test(newpassword)){
                db.query("UPDATE `account` SET `password` = '"+newpassword+"' WHERE email = ? and password = '"+oldpassword+"'", [email]);
                res.redirect('/myaccount/profile');
        }
    }else{
        res.redirect('/myaccount/passwordmatch.html');
        res.end();
     }
    })

    }else{
        res.redirect('/home');
        res.end();
    }


}

exports.userInterface_getchangedata = (req, res) =>{

    var email = req.session.email;
   
    if(email){
        res.redirect('/myaccount/cambio_dati.html');
        res.end();
    }else{
        res.redirect('/home');
    }

}

exports.userInterface_postchangedata = (req, res)=>{

    var email = req.session.email;
    var nome = req.body.firstname;
    var cognome = req.body.lastname;

    if(nome && cognome){
    db.query("UPDATE `utente` SET `nome` = '"+nome+"', `cognome` = '"+cognome+"' WHERE ref_email = ?", [email] );
    res.redirect('/myaccount/profile');
    res.end();
    }else{
        res.redirect('/myaccount/missingdata.html');
    }
}

exports.userInterface_getlinkcard = (req, res)=>{
    var email = req.session.email;
    if(email){
        res.redirect('/myaccount/linkcard.html');
    }else{
        res.redirect('/home');
    }

}

exports.userInterface_postlinkcard = (req, res)=>{
    var email = req.session.email;
    if(email){
        var carta = req.body.tipocarta;
        var codice = req.body.codice;
        var scadenza = req.body.scadenza;
        var cvv = req.body.cvv;
        var cardRegexp = /^\d{16}$/;
        var expdateRegexp = /^(0[1-9]|1[0-2])\/?([0-9]{4}|[0-9]{2})$/; //data del tipo mm/yy
        var cvvRegexp = /^[0-9]{3,4}$/; // cvv a 3 o 4 cifre
        console.log(req.body);
       
        if(carta && codice && scadenza && cvv){
           if(cardRegexp.test(codice) && expdateRegexp.test(scadenza) && cvvRegexp.test(cvv)){

             db.query("INSERT INTO metodo (`ref_email`, metodo_pagamento, codice, scadenza, `cvv`) VALUES ('"+email+"', '"+carta+"', '"+codice+"', '"+scadenza+"', '"+cvv+"')", function(error, results){
            if(error){
                res.redirect('/myaccount/carderror.html');
                res.end();
            }else{
             console.log("webbe");
             res.redirect('/myaccount/mypayaments');
            }
            });
           }else{
                res.redirect('/myaccount/carderror.html');
                res.end();

             }
        }else{
            res.redirect('/myaccount/missingdata.html');
            res.end();
        }
    } else{
        res.redirect('/home');
    }
}

exports.userInterface_getbankacc = (req, res)=>{
    var email = req.session.email;
    if(email){
        res.redirect('/myaccount/linkbankaccount.html');
     } else{
        res.redirect('/home');
      }
}

exports.userInterface_postbankacc = (req, res)=>{
    var email = req.session.email;
    if(email){
        var bankacc = req.body.bankacc;
        var bankname = req.body.bankname;
        var bankaccregex = /^IT\d{2}[a-zA-Z]\d{3}\d{4}\d{4}\d{4}\d{4}\d{3}|\d{2}[a-zA-Z]\d{22}$/;
        if(bankacc && bankname){
            if(bankaccregex.test(bankacc)){
            db.query("INSERT INTO metodo (`ref_email`, metodo_pagamento, codice, scadenza, `cvv`) VALUES ('"+email+"', '"+bankname+"', '"+bankacc+"', '', '')");
            res.redirect('/myaccount/mypayaments');
            }else{
                res.redirect('/myaccount/carderror.html');
                res.end();

             }

        }else{
            res.redirect('/myaccount/missingdata.html');
            res.end();
        }
    }else{
        res.redirect('/home');
    }
}

exports.userInterface_postsetmethod =  function(req, res){
    var email = req.session.email;
    if(email){
    console.log(req.body);
    db.query("UPDATE metodo SET `preferito`= 0 WHERE preferito = 1 and ref_email = ?", [email] );
    db.query("UPDATE metodo SET `preferito`= 1 WHERE metodo_pagamento = ? and ref_email = ?", [req.body.preferito, email] );
    res.redirect('/myaccount/mypage');
    }else{
        res.redirect('/home');
    }
}