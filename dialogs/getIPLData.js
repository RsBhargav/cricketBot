/*Author : Sai Bhargav*/

var axios = require('axios');
var logger = require('./logger.js').getLogger('getIPLData');
class APICall {
    static async getIPLData() {
        logger.info(this.getIPLData, `IPL Data`);
        let options = {
            'headers': {
                'Content-Type': 'application/json'
            }
        };
        let resp = await axios.get(`${process.env.IplURL}`, options);
        // console.log("------------",Object.keys(resp.data).length)
        console.log("------------",resp.data[1].season)
        // var count = Object.keys(resp).length;
        // var x = resp["1"]
        return resp.data;
        
    }
}
module.exports.APICall = APICall;
