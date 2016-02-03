var http = require('http');
var fs = require('fs');

function scrapy(query, callback) {
	query = query || '600718'
	var msa='/s?wd=' + query;
	console.log(msa);
	var options = {
		hostname: 'www.baidu.com',
		port: 80,
		path: '/s?wd=' + query,
		method: 'GET'
	};

	var req = http.request(options, function(res) {
		res.setEncoding('utf8');
		resultData = '';
		res.on('data', function(chunk) {
			resultData += chunk;
		});
		res.on('end', function(argument) {
			resultData = resultData.match(/"p":"[^"]{1,}"/);
			resultData = resultData.toString();
			resultData = resultData.match(/[^p";]+/g);
			//console.log(resultData);
			var data = [];
			for (var i = 1; i < resultData.length; i++) {
				var item = {};
				var temp = resultData[i].split(',');
				item.index = temp[1];
				item.time = temp[0];
				var tempRate = temp[temp.length - 2].split(' ');
				item.rate = tempRate[0];
				data.push(item);
			}
			console.log(data);

			var transJson = {
				"data": data
			}
			callback(transJson);
		})
	}).end();

}



var server = http.createServer(function(req, res) {
	if ('GET' == req.method && '.js' == req.url.substr(-3)) {
		fs.stat(__dirname + req.url, function(err, stat) {
			if (err || !stat.isFile()) {
				res.writeHead(404);
				res.end('not found');
				return;
			}
			serve(__dirname + req.url, 'text/javascript');
		})
	} 
	else if ('GET' == req.method && '/' == req.url) {
		res.setHeader("Access-Control-Allow-Origin", "http://192.168.1.104");
		serve(__dirname + '/real-data.html', 'text/html');
	} 
	else if ('POST' == req.method && '/' == req.url) {
		var body = '';
		req.on('data', function(chunk) {
			body += chunk;
		});
		req.on('end', function() {
			//console.log(body + "pppp")
			scrapy(body, function(transJson) {
				var string = JSON.stringify(transJson);
				res.end(string);
			})
		})
		res.writeHead(200, {
			'Content-Type': 'application/json'
		});
	}
	 else {
		res.writeHead(404);
		res.end('not found');
	}

	function serve(path, type) {
		res.writeHead(200, {
			"Content-Type": type
		});
		fs.createReadStream(path).pipe(res);
	}

}).listen(3002, "192.168.1.104");


/*
	var  temperature=html.match(/"od22":"-?\d{1,2}"/gm);
	 var t=temperature.toString();
	t=t.replace(/od22/g,"k");
	temperature= t.match(/-?\d{1,2}/gm);

	var time=html.match(/"od21":"\d{1,}"/gm);
	t=time.toString();
	t=t.replace(/od21/g,"k");
                time=t.match(/\d{1,}/gm);

	var  wind_dir=html.match(/"od24":"\S{0,3}"/gm);
	t=wind_dir.toString();
	t=t.replace(/od24":/g," ");
	console(t);
                wind_dir=t.match(/\S{1,3}/gm);
                //console.log(wind_dir);

	var  wind_lev=html.match(/"od25":"\d*"/gm);
	t=wind_lev.toString();
	t=t.replace(/od25/g,"k");
                wind_lev=t.match(/\d{1,2}/gm);

	//var string=html.match(/observe24h_data *= *\S*};/g);
	//var data24h=JSON.parse(string):
	//console.log(wind_lev);
	var data={
		"time":time,
		"temperature":temperature,
		"wind":{
			"direction":wind_dir,
			"level":wind_lev
		}
	}
	if (data.time==null) {
		console.log("err");
	};
	//console.log(data);*/