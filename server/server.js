const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const {generateMessage, generateLocationMessage} = require('./utils/message');
const {isRealString} = require('./utils/validation');
const {Users} = require('./utils/users');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var users = new Users();

// Establish the path for the server
app.use(express.static(publicPath));

// Establish connection to server
io.on('connection', (socket) => {
    console.log('New user connected');

    // Join event when a user joins a room
    socket.on('join', (params, callback) => {
        // Check if name and room values are possible strings, else callback with error message
        if (!isRealString(params.name) || !isRealString(params.room)) {
            return callback('Name and room name are required');
        }

        socket.join(params.room);       // Join the room with the given name
        users.removeUser(socket.id);    // Remove the user from list of users, if joined room from earlier
        users.addUser(socket.id, params.name, params.room); // Append the user to the users online list and joins the room

        io.to(params.room).emit('updateUserList', users.getUserList(params.room));  // Update the list of users online
        socket.emit('newMessage', generateMessage('Admin', 'Welcome to web chat')); // Default message when room is joined
        socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined.`));    // Lets users in the room know who joined

        // Callback with no errors
        callback();     
    });
    
    // New message event when user types and submits a message
    socket.on('createMessage', (message, callback) => {
        var user = users.getUser(socket.id);

        if (user && isRealString(message.text)) {
            io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
        }

        callback();
    });

    // Send location event when user presses the 'Send location' button
    socket.on('createLocationMessage', (coords) => {
        var user = users.getUser(socket.id);

        if (user) {
            io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude));
        }
    });

    // Disconnects the current user(socket)
    socket.on('disconnect', () => {
        var user = users.removeUser(socket.id);

        // Update the users online list and let others know who left
        if (user) {
            io.to(user.room).emit('updateUserList', users.getUserList(user.room));
            io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left.`));
        };
    });
});

server.listen(port, () => {
    console.log(`Starting app on port ${port}`)
});