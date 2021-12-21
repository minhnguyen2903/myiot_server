const express = require("express");
const {
  createServer
} = require("http");
const {
  Server
} = require("socket.io");
const cors = require("cors");
var requestIp = require('request-ip');
const bodyparser = require('body-parser');
const fs = require('fs');
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  /* options */
});


app.use(cors());
app.use(bodyparser.json());
const port = 8163
const timeStart = Date.now();


const data = {"data":[{"id":0,"value":0,"createdAt":1638512032689},{"id":1,"value":2131,"createdAt":1638712032689}],"current":{"value":2000,"createdAt":1638870500592,"requestCount":1}};
const apiKey = "dsEsxde2341"

const user = {
  username: 'minh',
  password: 'minh1234'
}

var i = 0;
const led = {
  led1: 0,
  led2: 0
}
const contact = {
  led1: 0,
  led2: 0,
}

const current = {
  value: 0,
  request: 0,
  createdAt: 0
}

io.on("connection", (socket) => {
  console.log("user connected");
  socket.emit("hello", "world");
});

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/index.html`);
});

app.get('/download', (req, res) => {
  var apkFile = `${__dirname}/apk/myapp.apk`
if(!fs.existsSync(apkFile))
    return res.status(404).send('Sorry no APKs here');
res.download(apkFile);
});

app.get('/runtime', (req, res) => {
  res.json({
    timeStart: timeStart,
    timeStop: current.createdAt,
    runTime: current.createdAt - timeStart,
    toMinutes: ((current.createdAt - timeStart) / 1000) / 60,
    requestTime: current.request
  })
});

app.get('/api/data', (req, res) => {
  var clientIp = requestIp.getClientIp(req);
  i++;
  // obj.ip = clientIp;
  if (req.query) {
    if (req.query.apiKey === apiKey && req.query.value) {
      current.value = req.query.value;
      current.request = req.query.request;
      current.createdAt = Date.now();
      data.current.value = req.query.value - 0;
      data.current.createdAt = Date.now();
      data.current.requestCount = i;
      io.emit('current', JSON.stringify(current));
      if (Date.now() - data.data[data.data.length - 1].createdAt > 300000 || Math.abs(data.data[data.data.length - 1].value - req.query.value) > 500) {  //300000
        data.data.push({
          id: data.data.length,
          value: req.query.value * 1,
          createdAt: Date.now()});
        io.emit('analist', JSON.stringify(data.data));
      }
      contact.led1 = req.query.led1;
      contact.led2 = req.query.led2;
   //   fs.writeFileSync("./data.json", JSON.stringify(data));
      console.log(req.query.request, req.query.value, req.query.led1, req.query.led2);
      res.json({
        message: `request ${req.query.request} OK`,
        ...led
      });
    } else {
      res.sendStatus(400);
    }
  } else {
    res.sendStatus(404);
  }
});

app.get('/view', (req, res) => {
  res.json(data.data);
})

app.get('/current', (req, res) => {
  console.log('%c User get Data ', 'background: #222; color: #bada55');
  res.json(data.current);
});

app.post('/login', (req, res) => {
  if (!req.body.username || !req.body.password) {
    res.send("<h1>Page not found</h1>")
  }
  if (req.body.username === username && req.body.password === password) {
    res.send("welcome");
  } else {
    res.send("please check username and password");
  }
});

app.get('/control', (req, res) => {
  const led1Control = req.query.led1;
  const led2Control = req.query.led2;
  if (led1Control) {
    if (led1Control == 1) {
      led.led1 = 1;
    } else {
      led.led1 = 0;
    }
  }
  if (led2Control) {
    if (led2Control == 1) {
      led.led2 = 1;
    } else {
      led.led2 = 0;
    }
  }
  console.log("user set led status");
  res.json(led);
});

app.get('/random', (req, res) => {
  var clientIp = requestIp.getClientIp(req);
  console.log("access from: ", clientIp)
  res.send(`value: ${Math.floor(Math.random()*100)}\r\n`);
});

app.get('/toggle', (req, res) => {
  let query = req.query.led;
  if (query === 'led1') {
    console.log('user toggle led1');
    if (led.led1 == 0) led.led1 = 1;
    else led.led1 = 0;
  }
  if (query === 'led2') {
    console.log('user toggle led2')
    if (led.led2 == 0) led.led2 = 1;
    else led.led2 = 0;
  }
  const result = {
    led1: (led.led1 != contact.led1) * 1,
    led2: (led.led2 != contact.led2) * 1
  }
  res.json(result);
});

httpServer.listen(process.env.PORT || port, () => {
  console.log(`Example app listening at http://localhost:${process.env.PORT|| port}`)
})