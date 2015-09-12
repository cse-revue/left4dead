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
var status = ["SURV", "ZOMB", "DEAD"];
var adminId = "";

var ADMIN_NAME = "a";

//30s disconnect timeout
var DISCONNECT_TIMEOUT = 30;

io.on('connection', function (socket) {

    socket.on('username list', function(){
        io.to(socket.id).emit('usernames sent', users);
    });
  
    // when the client emits 'add user', this listens and executes
    socket.on('add user', function (username) {
        // we store the username in the socket session for this client    
        socket.username = username;
        if(username == ADMIN_NAME){
            adminId = socket.id;
            socket.emit('populate users', users);
        }
        else if(adminId != ""){
            io.to(adminId).emit('appendDropDown', username);
        }
        if(users[socket.username] === undefined) {
            // add the client's username to the global list
            users[username] = {
                latitude: 0,
                longitude: 0,
                stat: status[0],
                disconnect: new Date(),
                id: socket.id,
                escaped: "FALSE"
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

    // when the user disconnects.. perform this
    socket.on('disconnect', function () {
        --numUsers;
        
        //gets current time
        var d = new Date();
        //sets dead timeout for 30 seconds
        if (users[socket.username]) {
            users[socket.username].disconnect.setTime(d.getTime() + DISCONNECT_TIMEOUT * 1000);
        }
        
        
        // echo globally that this client has left
        //admin removes from dropdown, doesn't do this if the admin is leaving.
        if(socket.username != ADMIN_NAME && adminId != ""){
            io.to(adminId).emit('removeDropDown', socket.username); 
            //io.to(adminId).emit('debug', socket.username);           
        }
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

    socket.on('get status', function(username){
        socket.emit('change status', users[username].stat);
    });

    socket.on('changeStatus', function(username, status){
        users[username].stat = status;
        io.to(users[username].id).emit('change status', status);
    });
    socket.on('changeEscaped', function(username, escaped){
        users[username].escaped = escaped;
        if(escaped == "TRUE"){
            io.to(users[username].id).emit('successful escape');            
        }
    });
    
    socket.on('game started', function(){
        for (var user in users) {
                user.latitude = 0;
                user.longitude = 0;
                user.stat = status[0];
                user.disconnect = new Date();
                user.id = socket.id;
                user.escaped = "FALSE";
        }
        socket.broadcast.emit('announce start');
    });
});
