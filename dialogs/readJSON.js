var fs = require('fs');
//const RandomResponse={}
class ReadJSON {
    static async pomResponse(season, team1, team2) {
        try {
            let iplData = fs.readFileSync('./cognitiveModels/iplData.json', 'utf-8');
            var jsonData = JSON.parse(iplData);
            var data = [];
            for (let i = 0; i < jsonData.length; i++) {
                if ((team1 == jsonData[i].team1 && team2 == jsonData[i].team2) || (team1 == jsonData[i].team2 && team2 == jsonData[i].team1)) {
                    if (jsonData[i]['season'] == season) {
                        let mom = `date- ${jsonData[i]['date']}; ${jsonData[i].team1} v/s ${jsonData[i].team2}; Man of the Match- ${jsonData[i]['player_of_match']}`
                        console.log("man of the match", jsonData[i]['player_of_match'])
                        data = data + `\n\n` + mom
                    }
                }
            }
            console.log("data - ", data)
            return data;
        } catch (err) {
            console.log(`Read Json: ${ err } Check your File configuration`);
        }
    }
    static async winnerResponse(season, team1, team2) {
        try {
            let iplData = fs.readFileSync('./cognitiveModels/iplData.json', 'utf-8');
            var jsonData = JSON.parse(iplData);
            var data = [];
            for (let i = 0; i < jsonData.length; i++) {
                if ((team1 == jsonData[i].team1 && team2 == jsonData[i].team2) || (team1 == jsonData[i].team2 && team2 == jsonData[i].team1)) {
                    if (jsonData[i]['season'] == season) {
                        let mom = `date- ${jsonData[i]['date']}; ${jsonData[i].team1} v/s ${jsonData[i].team2}; winner- ${jsonData[i]['winner']}`
                        console.log("man of the match", jsonData[i]['winner'])
                        data = data + `\n\n` + mom
                    }
                }
            }
            console.log("data - ", data)
            return data;
        } catch (err) {
            console.log(`Read Json: ${ err } Check your File configuration`);
        }
    }
    static async tossResponse(season, team1, team2) {
        try {
            let iplData = fs.readFileSync('./cognitiveModels/iplData.json', 'utf-8');
            var jsonData = JSON.parse(iplData);
            var data = [];
            for (let i = 0; i < jsonData.length; i++) {
                if ((team1 == jsonData[i].team1 && team2 == jsonData[i].team2) || (team1 == jsonData[i].team2 && team2 == jsonData[i].team1)) {
                    if (jsonData[i]['season'] == season) {
                        let mom = `date- ${jsonData[i]['date']}; ${jsonData[i].team1} v/s ${jsonData[i].team2}; toss winner- ${jsonData[i]['toss_winner']}`
                        console.log("man of the match", jsonData[i]['toss_winner'])
                        data = data +`\n\n`+ mom
                    }
                }           
            }
            console.log("data - ", data)
            return data;
        } catch (err) {
            console.log(`Read Json: ${ err } Check your File configuration`);
        }
    }
}
module.exports.ReadJSON = ReadJSON;