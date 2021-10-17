/*Author : Sai Bhargav*/

var log4js = require('log4js');
var fs = require('fs-extra');

 var getLogger = function (moduleName) {
 try{
    var appList=[];
    // appList.push(moduleName);
    var logger = log4js.getLogger(moduleName);
    var appLog = './logs/app.log';
    fs.ensureFileSync(appLog);

    log4js.configure({
       appenders: {
        out: {
          type: 'stdout',
          layout: {
            type: 'pattern', pattern: '[%d] [%p] %c:%l %m%n'
            // type: 'pattern', pattern: '%z [%d] [%p] %c %f:%l %m%n'
          }
        },
          console: { type: 'console' },
          //  filelog: { type: 'file', filename: appLog,  pattern: '-yyyy-MM-dd-hh-mm-ss', category: appList }
          filelog: { type: 'file', filename: appLog }

       },
      categories: {
          //  file: { appenders:['filelog','out'],level:'info',enableCallStack: true},
          //  another: {appenders: ['console','out'],level: 'trace',enableCallStack: true},
          //  default: {appenders: ['console','filelog'],level: 'trace',enableCallStack: true}
           default: { appenders: ['filelog','out'], level: 'info',enableCallStack: true },
      }
    });

  }catch(err){
    console.log(err);
  }
  return logger;
};
exports.getLogger = getLogger;