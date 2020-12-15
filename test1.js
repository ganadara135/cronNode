var schedule = require('node-schedule');


var j = schedule.scheduleJob('*/5 * * * * *', function(fireDate){
    console.log('This job was supposed to run at ' + fireDate + ', but actually ran at ' + new Date());
    fetch
});

  