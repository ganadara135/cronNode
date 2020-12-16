var fetch = require('node-fetch');
var fs = require('fs');
var mysql = require('mysql');
const { connect } = require('http2');

var conn = mysql.createConnection({
    host : '172.18.68.174',
    user : 'mysql69',
    password : 'mysql69',
    database : 'eddb',
    port : '63306'
})

conn.connect();

conn.query('select * from edboards', function (error, results, fields) {
    if (error) {
        console.log(error);
    }
    console.log(results);
});

conn.end();


// fetch("http://localhost:8086/query?pretty=true&db=emsdb&q=SELECT \"ess0/ActivePower\" FROM data LIMIT 1", {
 fetch("http://localhost:8086/query?pretty=true&db=emsdb&q=SELECT mean(\"ess0/Soc\") FROM data where time > now() - 10m GROUP BY time(1m) fill(null)", {
    // 어제
//fetch("http://localhost:8086/query?pretty=true&db=emsdb&q=SELECT mean(\"ess0/Soc\") FROM data where time > now() - 1d GROUP BY time(1d) fill(null)", {
    // 전달, 한달에 한 번 시행
//fetch("http://localhost:8086/query?pretty=true&db=emsdb&q=SELECT mean(\"ess0/Soc\") FROM data where time > now() - 30d GROUP BY time(30d) fill(null)", {

    // 오늘 현재시간까지, 오늘 시간을 구해서 빼준다
//fetch("http://localhost:8086/query?pretty=true&db=emsdb&q=SELECT mean(\"ess0/Soc\") FROM data where time > now() - 1d GROUP BY time(오늘지난시간) fill(null)", {
 // 이번 달 현재날짜까지, 오늘 날짜를 구해서 빼준다
//fetch("http://localhost:8086/query?pretty=true&db=emsdb&q=SELECT mean(\"ess0/Soc\") FROM data where time > now() - 1d GROUP BY time(오늘날짜) fill(null)", {

  headers: {
    Accept: "application/json",
    Authorization: "Basic YWRtaW46YWRtaW4="
  },
  method: "POST"
// }).then(res => res.json()).then(json => console.log(json.results[0].series));    // console.log(JSON.stringify(json)));
})
.then(res => res.json())
.then(json => 
    fs.writeFile('/home/ubuntu/work/cron/out3',JSON.stringify(json.results[0].series), function(err){
        if (err === null) {
            console.log('success ' + new Date().toLocaleString());
        } else {
            console.log('fail', err);
        }
    })
)