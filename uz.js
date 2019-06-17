const http = require("http");
const exec = require("child_process").exec;
const logger = require("winston");
const TelegramLogger = require("winston-telegram");
const CronJob = require('cron').CronJob;

// const job = new CronJob({
//   cronTime: '* * * * * *',
//   onTick: function() {
//     /*
//      * Runs every day at 700pm 
//      */
//     console.log("cron execution - 700pm");
//     // code for your job goes here :) 
    
//     const LVIV = "2218000";
//   const KYIV = "2200001";
//   let directions = [{date: "2019-06-24", FROM: LVIV, TO:KYIV},
//                     {date: "2019-06-21", FROM: KYIV, TO:LVIV}];
//   directions.forEach(direction => {
//     run(direction.date, direction.FROM, direction.TO);
//   });

//   },
//   start: false,
//   timeZone: 'America/New_York'
// });
// job.start();



module.exports = function (req, res) {
  const LVIV = "2218000";
  const KYIV = "2200001";
  let directions = [{date: "2019-06-24", FROM: LVIV, TO:KYIV},
                    {date: "2019-06-21", FROM: KYIV, TO:LVIV}];
  run(directions[0].date, directions[0].FROM, directions[0].TO, () => {
    run(directions[1].date, directions[1].FROM, directions[1].TO, () => {
      res.end(JSON.stringify(directions));
    })
  });
};

logger.add(
  new TelegramLogger({
    token: "658206408:AAE-GHvzoZPF4aBLL38ptmgGhRU0BJg-S6c",
    chatId: -286167346
  })
);

function run(date, FROM, TO, callback) {
  console.log('Start ' + getName(FROM) + ' - ' + getName(TO) + ` (${date})`);

  var command = `curl 'https://booking.uz.gov.ua/ru/train_search/' -H 'Cookie: _gv_lang=en; _ga=GA1.3.303985031.1559218660; HTTPSERVERID=server4; _gv_sessid=tfje2lg09t4dh5ara16sqr3255; _gid=GA1.3.1073728056.1560788208' -H 'Origin: https://booking.uz.gov.ua' -H 'Accept-Encoding: gzip, deflate, br' -H 'cache-version: 755' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36' -H 'Content-Type: application/x-www-form-urlencoded; charset=UTF-8' -H 'Accept-Language: uk,en-US;q=0.9,en;q=0.8,ru-RU;q=0.7,ru;q=0.6' -H 'Accept: */*' -H 'Referer: https://booking.uz.gov.ua/en/?from=${FROM}&to=${TO}&date=${date}&time=00%3A00&url=train-list' -H 'X-Requested-With: XMLHttpRequest' -H 'Connection: keep-alive' --data 'from=${FROM}&to=${TO}&date=${date}&time=00%3A00' --compressed`;

  exec(command, function(error, stdout, stderr) {
    if (error !== null) {
      console.log("exec error: " + error);
    }

    const data = JSON.parse(stdout);

    if (data.captcha) {
      return logger.log("error", JSON.stringify(data));
    }

    data.data.list.forEach(function(el) {
      if (el.types.length > 0) {
        console.log(
          new Date().toISOString(),
          el.types.map(x => x.title).join(", ")
        );

        el.types.forEach(function(typ, i) {
          if (typ.title == "Плацкарт") {
            logger.log("info", typ.title + ` (${getName(FROM)} -> ${getName(TO)} | ${date}) `);
          }
        });
      }
    });

    callback();
  });
}

// const LVIV = "2218000";
//   const KYIV = "2200001";
//   let directions = [{date: "2019-06-24", FROM: LVIV, TO:KYIV},
//                     {date: "2019-06-21", FROM: KYIV, TO:LVIV}];
//   directions.forEach(direction => {
//     run(direction.date, direction.FROM, direction.TO);
//   });


// let offset = 0;


function getName(x) {
  if (x === LVIV) {
    return 'LVIV';
  }

  if (x === KYIV) {
    return 'KYIV';
  }

  return 'WRONG CITY';
}
