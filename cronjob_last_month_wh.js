var fetch = require('node-fetch');
var fs = require('fs');
var mysql = require('mysql');
const { connect } = require('http2');

var conn = mysql.createConnection({
    host : 'localhost',
    user : 'mysql69',
    password : 'mysql69',
    database : 'eddb',
    port : '3306'
})



let insertIdVal = null;

 async function callFetch(){

    await fetch("http://localhost:8086/query?pretty=true&db=emsdb&q=SELECT mean(\"meter152/Accura23501NetKwh\") %2B mean(\"meter153/Accura23501NetKwh\") FROM data where time > now() - 30d GROUP BY time(30d) fill(null)", {
        headers: {
            Accept: "application/json",
            Authorization: "Basic YWRtaW46YWRtaW4="
        },
        method: "POST"
    })
        // 어제 가스량                                                                                  // +  %2B
   // fetch("http://localhost:8086/query?pretty=true&db=emsdb&q=SELECT mean(\"meter152/Accura23501NetKwh\") %2B mean(\"meter153/Accura23501NetKwh\") FROM data where time > now() - 1d GROUP BY time(1d) fill(null)", {
    
    .then(res => 
      //  {
            res.json()
           // console.log('res 111 ', res);
      //  }
    )
    .then(json => 
        {

            if (json === undefined || json === null){

                console.log('communication only success: ' + new Date().toLocaleString())

                conn.query(`INSERT INTO stat_last_month_wh (created, rawData) VALUES                     
                ( now(), "${0}")`,
                function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }
                    console.log(results);
                    console.log(results.insertId);
                });

            }else{
            
                console.log('success: ' + new Date().toLocaleString() + ' , ' 
                    + json.results[0].series[0].values[1][0] + ': ' + json.results[0].series[0].values[1][1]);

            // console.log("inserval : ", insertVal)  TO_TIMESTAMP
                //conn.query('INSERT INTO stat_day_wh SET ? ', insertVal, function (error, results, fields) {
                conn.query(`INSERT INTO stat_last_month_wh (created, rawData) VALUES                     
                (FROM_UNIXTIME ("${Math.floor(new Date(json.results[0].series[0].values[1][0]).getTime()/1000)}"), 
                "${json.results[0].series[0].values[1][1]}")`,
                function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }
                    console.log(results);
                    console.log(results.insertId);
                    insertIdVal = results.insertId;
                    // return results.insertId;
                    //conn.end();
                });
            }
        }
    )
    
}


async function lastFunction(){
    
    // conn.connect();

    await fetch("http://localhost:8086/query?pretty=true&db=emsdb&q=SELECT DIFFERENCE(\*) from (SELECT mean(\"meter152/Accura23501NetKwh\") %2B mean(\"meter153/Accura23501NetKwh\") FROM data where time > now() - 30d GROUP BY time(30d) fill(null))", {
        headers: {
            Accept: "application/json",
            Authorization: "Basic YWRtaW46YWRtaW4="
        },
        method: "POST"
    })
    .then(res => 
        {
        res.json()
        //console.log("res : ", res)
        }
    )
    .then(json => 
        {
            console.log("json : ", json)

            if (json === undefined || json === null){

                console.log('communication only success: ' + new Date().toLocaleString());

                conn.query(`UPDATE stat_last_month_wh SET delta = "${0}" WHERE id in (select id FROM (select max(id) as id FROM stat_last_month_wh) as temp)`,
                function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }
                    console.log(results);
                    conn.end();
                });

            }else{

                console.log('success: ' + new Date().toLocaleString() + ' , ' 
                    + json.results[0].series[0].values[0][0] + ': ' + json.results[0].series[0].values[0][1]);

                conn.query(`UPDATE stat_last_month_wh SET delta = "${json.results[0].series[0].values[0][1]}" WHERE id in (select id FROM (select max(id) as id FROM stat_last_month_wh) as temp)`,
                function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }
                    console.log(results);
                    conn.end();
                });
            }
            
        }
    )       
}


/*
function myCall() {
    conn.connect();
    //callFetch().then(lastFunction()); //.catch(conn.end())
    callFetch(); //.then(lastFunction());
    
    // new Promise(r => setTimeout(r, 100));


    lastFunction(); // .then(conn.end());
}*/


async function myCall() {
    conn.connect();
    //callFetch().then(lastFunction()); //.catch(conn.end())
    await callFetch(); //.then(lastFunction());
    
    await new Promise(r => setTimeout(r, 100));


    await lastFunction(); // .then(conn.end());
}


myCall();