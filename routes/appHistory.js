exports.view = async function(req, res) {
        var redis= require("redis"), client = redis.createClient(process.env.REDIS_URL || 6379);
	var https = require("https");
        const {promisify} = require('util');
        const getAsync = promisify(client.get).bind(client);
        const setAsync = promisify(client.set).bind(client);
	const getHttpAsync = promisify(https.get).bind(https);
        var logged_in = false;
        var user = req.cookies.user;
        if(user != undefined) {
	        //console.log(user);
	        logged_in = true;
	        var userInfo = await getAsync(user);
                //console.log(userInfo);
	        if(!userInfo) {
                console.log("Generating user info!");
		        await setAsync(user, JSON.stringify({'bookmarks': [], 'applications': []}));
		        console.log(await getAsync(user));
	        }
        }
	var uinfo = await getAsync(user);
	var uApps = JSON.parse(uinfo).applications;
	var jobs = [];
	for(app in uApps) {
            https.get('https://jobs.github.com/positions/' + uApps[app].id + '.json', (resp) => {
	    let data = "";
	    
	    resp.on('data', (chunk) => {
		    data += chunk;
	    });

	    resp.on('end', async () => {
	        var job = JSON.parse(data);
		job.status = uApps[app].status;
		jobs.push(job);
		//console.log(jobs);
	    });
            }).on("error", (err) => {
	        console.log("Error: " + err.message);
            });
	}
	console.log(jobs);
	res.render('appHistory', {jobs});
    
    //var jobs = require("../jobs.json");
    //res.render('appHistory', {jobs});
}
