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

    let thisMonthDate = new Date().getDate();
    console.log("thisMonthDate : ", thisMonthDate)
        // 이번 달 가스량  
    await fetch(`http://localhost:8086/query?pretty=true&db=emsdb&q=SELECT (mean(\"meter151/GasUsage1\") %2B mean(\"meter151/GasUsage2\") %2B mean(\"meter151/GasUsage3\") %2B mean(\"meter151/GasUsage4\") %2B mean(\"meter151/GasUsage5\") %2B mean(\"meter151/GasUsage6\") %2B mean(\"meter151/GasUsage7\") %2B mean(\"meter151/GasUsage8\") %2B mean(\"meter151/GasUsage9\") %2B mean(\"meter151/GasUsage10\") %2B mean(\"meter151/GasUsage12\") %2B mean(\"meter151/GasUsage13\") %2B mean(\"meter151/GasUsage14\") %2B mean(\"meter151/GasUsage15\") %2B mean(\"meter151/GasUsage16\")) as mean  FROM data  WHERE time > now() - ${thisMonthDate}d GROUP BY time(${thisMonthDate}d) fill(null)`, {
            // +  %2B
    
    headers: {
        Accept: "application/json",
        Authorization: "Basic YWRtaW46YWRtaW4="
    },
    method: "POST"
    // }).then(res => res.json()).then(json => console.log(json.results[0].series));    // console.log(JSON.stringify(json)));
    })
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

                conn.query(`INSERT INTO stat_this_month_gas (created, rawData) VALUES                     
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
                conn.query(`INSERT INTO stat_this_month_gas (created, rawData) VALUES                     
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
    
    let thisMonthDate = new Date().getDate();
    console.log("thisMonthDate : ", thisMonthDate)

    await fetch(`http://localhost:8086/query?pretty=true&db=emsdb&q=select difference(*) from (SELECT  (mean(\"meter151/GasUsage1\") %2B mean(\"meter151/GasUsage2\") %2B mean(\"meter151/GasUsage3\") %2B mean(\"meter151/GasUsage4\") %2B mean(\"meter151/GasUsage5\") %2B mean(\"meter151/GasUsage6\") %2B mean(\"meter151/GasUsage7\") %2B mean(\"meter151/GasUsage8\") %2B mean(\"meter151/GasUsage9\") %2B mean(\"meter151/GasUsage10\") %2B mean(\"meter151/GasUsage12\") %2B mean(\"meter151/GasUsage13\") %2B mean(\"meter151/GasUsage14\") %2B mean(\"meter151/GasUsage15\") %2B mean(\"meter151/GasUsage16\")) as mean  FROM data  WHERE time > now() - ${thisMonthDate}d GROUP BY time(${thisMonthDate}d) fill(null))`, {
    headers: {
        Accept: "application/json",
        Authorization: "Basic YWRtaW46YWRtaW4="
    },
    method: "POST"
    })
    .then(res => 
        
        res.json()
        //console.log("res : ", res)
        
    )
    .then(json => 
        {
             console.log("json : ", json)

            if (json === undefined || json === null){

                console.log('communication only success: ' + new Date().toLocaleString());

                conn.query(`UPDATE stat_this_month_gas SET delta = "${0}" WHERE id in (select id FROM (select max(id) as id FROM stat_this_month_gas) as temp)`,
                function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }
                    console.log(results);
                    conn.end();
                });

            }else{

                // console.log("unix time : ", Math.floor(new Date(json.results[0].series[0].values[0][0]).getTime()/1000))

                // console.log("data: ", new Date(Math.floor(new Date(json.results[0].series[0].values[0][0]).getTime())))

                console.log('success: ' + new Date().toLocaleString() + ' , ' 
                    + json.results[0].series[0].values[0][0] + ': ' + json.results[0].series[0].values[0][1]);

                conn.query(`UPDATE stat_this_month_gas SET delta = "${json.results[0].series[0].values[0][1]}" WHERE id in (select id FROM (select max(id) as id FROM stat_this_month_gas) as temp)`,
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



async function myCall() {
    conn.connect();
    //callFetch().then(lastFunction()); //.catch(conn.end())
    await callFetch(); //.then(lastFunction());
    //conn.connect();
    await new Promise(r => setTimeout(r, 600));


    await lastFunction(); // .then(conn.end());
}


myCall();