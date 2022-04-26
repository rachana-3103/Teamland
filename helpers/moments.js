const moment = require('moment');

async function getCurrentDateTime(){
  return moment().utcOffset('-04:00').format('YYYY-MM-DD HH:mm:ss');
}

async function getDateTimeInSpecificZone(date){
  return moment(date).tz('America/New_York').format('YYYY-MM-DD HH:mm:ss')
}

async function getCurrDate(){
  const result = moment().format('YYYY-MM-DD HH:mm:ss');
  return getDateTimeInSpecificZone(result)
}


module.exports = {
  getCurrentDateTime,
  getCurrDate,
}
