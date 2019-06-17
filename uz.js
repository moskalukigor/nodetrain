const exec = require("child_process").exec;
const logger = require("winston");
const TelegramLogger = require("winston-telegram");
var request = require('request');



logger.add(
  new TelegramLogger({
    token: "658206408:AAE-GHvzoZPF4aBLL38ptmgGhRU0BJg-S6c",
    chatId: -286167346
  })
);

function run(date, FROM, TO) {
  console.log('Start ' + getName(FROM) + ' - ' + getName(TO) + ` (${date})`);

  //var command = `curl 'https://booking.uz.gov.ua/ru/train_search/' -H 'Cookie: _gv_lang=en; _ga=GA1.3.303985031.1559218660; HTTPSERVERID=server4; _gv_sessid=tfje2lg09t4dh5ara16sqr3255; _gid=GA1.3.1073728056.1560788208' -H 'Origin: https://booking.uz.gov.ua' -H 'Accept-Encoding: gzip, deflate, br' -H 'cache-version: 755' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36' -H 'Content-Type: application/x-www-form-urlencoded; charset=UTF-8' -H 'Accept-Language: uk,en-US;q=0.9,en;q=0.8,ru-RU;q=0.7,ru;q=0.6' -H 'Accept: */*' -H 'Referer: https://booking.uz.gov.ua/en/?from=${FROM}&to=${TO}&date=${date}&time=00%3A00&url=train-list' -H 'X-Requested-With: XMLHttpRequest' -H 'Connection: keep-alive' --data 'from=${FROM}&to=${TO}&date=${date}&time=00%3A00' --compressed`;

  var headers = {
    'Origin': 'https://booking.uz.gov.ua',
    'Accept-Encoding': 'gzip, deflate, br',
    'cache-version': '755',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Accept-Language': 'uk,en-US;q=0.9,en;q=0.8,ru-RU;q=0.7,ru;q=0.6',
    'Accept': '*/*',
    'Referer': `https://booking.uz.gov.ua/en/?from=${FROM}&to=${TO}&date=${date}&time=00%3A00&url=train-list`,
    'X-Requested-With': 'XMLHttpRequest',
    'Connection': 'keep-alive',
    'Cookie': '_gv_lang=en; _ga=GA1.3.303985031.1559218660; HTTPSERVERID=server4; _gv_sessid=tfje2lg09t4dh5ara16sqr3255; _gid=GA1.3.1073728056.1560788208'
};

var dataString = `from=${FROM}&to=${TO}&date=${date}&time=00%3A00`;

var options = {
    url: 'https://booking.uz.gov.ua/ru/train_search/',
    method: 'POST',
    headers: headers,
    body: dataString
};

  request(options, function(error, response, data){
  if (error) {
    console.log("ERROR1");
    return logger.log("error", JSON.stringify(data));;
  }

    console.log();
    data = JSON.parse(data);

    if (data.captcha) { 
      console.log("Captcha");
      return logger.log("captcha", JSON.stringify(data));
    }
    if (data.error) {
      console.log("ERROR2");
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
  });
}

let offset = 0;
const LVIV = "2218000";
const KYIV = "2200001";
let directions = [{date: "2019-06-24", FROM: LVIV, TO:KYIV},
                  {date: "2019-06-21", FROM: KYIV, TO:LVIV}];
directions.forEach(direction => {
  setTimeout(() => {
    run(direction.date, direction.FROM, direction.TO);
    setInterval(() => run(direction.date, direction.FROM, direction.TO), 60 * 1000);
  }, offset);

  offset += 60 * 1000;
});

function getName(x) {
  if (x === LVIV) {
    return 'LVIV';
  }

  if (x === KYIV) {
    return 'KYIV';
  }

  return 'WRONG CITY';
}
