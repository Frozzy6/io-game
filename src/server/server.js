import path from 'path';
import http from 'http';
import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';

import SocketManager from './SocketManager';
import Core from './core';


const app = express();

app.set('port', process.env.PORT || 3000);
// app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
const server = http.createServer(app);

const sm = new SocketManager(server);
app.use(express.static(path.join(__dirname, './', 'public')));

server.listen(app.get('port'), () => {
  console.log(`start listening on port ${app.get('port')}`);
});

const core = new Core(sm);
