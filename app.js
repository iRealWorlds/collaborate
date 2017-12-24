const express = require('express'), app = express(); // ExpressJS
const fs  = require('fs'); // FileSystem
const io = require("socket.io")(8080);

const config = {
    views: __dirname + "/views/" // views path
};

var sockets = [], currentForm;

app.use(express.static("public"));

fs.readFile(__dirname + "/text.txt", "utf8", (err, data) => {
    if(err)
        return console.log("Error while loading text: " + err);
    currentForm = data;
});

io.on('connection', (socket) => {
    console.log("new connection");
    sockets.push(socket);

    socket.on('disconnect', () => {
        let pos = sockets.indexOf(socket);
        if(pos !== -1) {
            sockets.splice(pos, 1);
            console.log("User #" + (pos + 1) + " disconnected");
        }
    });

	socket.on('newText', (data) => {
		currentForm = data.val;
        for(var i in sockets)
            if(sockets[i] != socket)
                sockets[i].emit('updateText', {value: currentForm, cursor: data.cursor, e: data.e});
		// emitToAll('updateText', {value: currentForm, cursor: data.cursor, e: data.e});
	});

	socket.emit('updateText', {value: currentForm, cursor: 0});
});


function emitToAll(name, data) {
    for(var i in sockets)
        sockets[i].emit(name, data);
}

app.get('/', (req, res) => {
    res.sendFile(config.views + "index.html");
});

app.listen(80, () => {
    console.log("Listening on port 80");
});