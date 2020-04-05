const express = require("express");
const redis = require("redis");
const process = require("process");

const app = express();

const client = redis.createClient(
{
	host: "redis-server",
	port: 6379
});
client.set('counter', 0);

// Dostępne policy dla restartu w docker-compose.yml
// AKTUALNIE USTAWIONE : on-failure
// always -- nawet przy kodzie 0 wstanie ponownie
// on-failure -- przy kodach innych niż 0 kontener wstanie
// "no" -- olej restartowanie

function nwd(a,b){
	while(b!==0){
		var c = a%b;
		a = b;
		b = c;
	}
	return a;
}

app.get('/nwd/:A/:B', (r,s) => {
	
	var L1 = parseInt(r.params.A);
	var L2 = parseInt(r.params.B);
	
	var lower = L1 < L2 ? L1: L2;
	var higher = L1 > L2 ? L1: L2;
	
	client.get(`${lower}${higher}`, (e, res) =>{
		if(res !== null){
			s.send('WYNIK Z PAMIĘCI REDISA:' + res);
		}
		else{
			var result = nwd(lower,higher);
			s.send('NOWY WYNIK NWD:' + result + 'dla liczb:' + lower + ' i ' + higher);
			client.set(`${lower}${higher}`, result);
		}
		
	});
});

app.get('/shutdown', (rq, rs)=>{
	//without restart (jeśli policy ustawione na on-failure)
	process.exit(0);
});
app.get('/simulateerror', (rq, rs)=>{
	// with restart
	process.exit(1);
});

app.get('/', (req, res) => {
	client.get('counter', (err,c) => {
		res.send('Counter:'+ c);
		client.set('counter', parseInt(c)+1);
	});
});

app.listen(8080, ()=> {
	console.log("Listening on port 8080");
});