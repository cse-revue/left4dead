// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

server.listen(port, function () {
    console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));

// Chatroom

// usernames which are currently connected to the chat
var users = {};
var numUsers = 0;
var status = ("surv", "zomb", "dead");

//30s disconnect timeout
var DISCONNECT_TIMEOUT = 30;

io.on('connection', function (socket) {
    // when the client emits 'new message', this listens and executes
    socket.on('new message', function (data) {
        // we tell the client to execute 'new message'
        socket.broadcast.emit('new message', {
            username: socket.username,
            message: data
        });
    });

    socket.on('username list', function(){
        io.sockets.connected[socket.id].emit('usernames sent', users);
    });
  
    // when the client emits 'add user', this listens and executes
    socket.on('add user', function (username) {
        // we store the username in the socket session for this client    
        socket.username = username;
        
        if(users[socket.username] === undefined) {
            // add the client's username to the global list
            users[username] = {
                latitude: 0,
                longitude: 0,
                stat: status[0],
                disconnect: new Date()
            };
            ++numUsers;
            socket.emit('login', {
                numUsers: numUsers
            });

            // echo globally (all clients) that a person has connected
            socket.broadcast.emit('user joined', {
                username: socket.username,
                numUsers: numUsers
            });
        } else {
            ++numUsers;
            // echo globally (all clients) that a person has connected
            var currTime = new Date();
            if (currTime > users[socket.username].disconnect) {
                users[socket.username].stat = status[2];
            }
            socket.broadcast.emit('user reconnected', {
                username: socket.username,
                numUsers: numUsers
            });
        }
    });

    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', function () {
        socket.broadcast.emit('typing', {
            username: socket.username
        });
    });

    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', function () {
        socket.broadcast.emit('stop typing', {
            username: socket.username
        });
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', function () {
        --numUsers;
        
        //gets current time
        var d = new Date();
        //sets dead timeout for 30 seconds
        if (user[socket.username]) {
            user[socket.username].disconnect.setTime(d.getTime() + DISCONNECT_TIMEOUT * 1000);
        }
        
        
        // echo globally that this client has left
        socket.broadcast.emit('user left', {
            username: socket.username,
            numUsers: numUsers
        });
    });

    socket.on('gps position', function (latitude, longitude) {        
        if(users[socket.username] !== undefined) {
            users[socket.username].latitude = latitude;
            users[socket.username].longitude = longitude;   
        }
    });
});
