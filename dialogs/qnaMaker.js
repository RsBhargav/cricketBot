//author : Sai Bhargav
var axios = require('axios');

class QnAMaker {
  static async getAns(userQuery) {
    var data = JSON.stringify({
      "question": `${userQuery}`
    });
    let options = {
      headers: {
        'Authorization': 'EndpointKey 30ebd994-f602-44ce-9ea8-e2f4930e9663',
        'Content-type': 'application/json',
      },
      data: data
    };
    let resp = await axios.post(`${process.env.URL}`, data, options)
    console.log('response:', resp.data.answers[0].answer)
    var res = resp.data.answers[0].answer;
    return res;
  }
}
module.exports.QnAMaker = QnAMaker;