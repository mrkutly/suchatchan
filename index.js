const colors = require('colors/safe')

process.stdout.write('\u001B[2J\u001B[0;0f')

const server = require('net').createServer()
let counter = 0
const sockets = {}

const colorOptions = [
    'black',
    'red',
    'green',
    'yellow',
    'blue',
    'magenta',
    'cyan',
    'white',
    'gray',
    'grey',
    'rainbow',
    'random'
]

server.on('connection', socket => {
    socket.id = counter++
    socket.setEncoding('utf8')

    console.log('client connected')
    socket.write('\u001B[2J\u001B[0;0f')
    socket.write('Welcome to the sauer-utley chat channel!\n')
    socket.write('Which one are you?\n')

    socket.on('data', data => {
        if (!sockets[socket.id]) {
            socket.name = data.toString().trim()
            sockets[socket.id] = socket
            socket.write(`Welcome ${socket.name} :)\n`)
            socket.write(`Which color would you like your name to be?\nHere are the available options:\n`)
            
            colorOptions
                .filter(color => !(Object.values(sockets).some(sock => sock.color === color)))
                .forEach(color => socket.write(`\t- ${color}\n`))

            Object.values(sockets).forEach(globalSocket => {
                if (socket === globalSocket) return
                globalSocket.write(`${socket.name} has joined the channel\n`);
            })

            return
        }
        
        if(!socket.color) {
            const input = data.toString().trim()
          
            if (!colorOptions.find(color => input === color)) {
                socket.write('\u001B[2J\u001B[0;0f')
                socket.write(`Oops! I think there was a typo. Here's the options again: \n`)
                colorOptions
                    .filter(color => !(Object.values(sockets).some(sock => sock.color === color)))
                    .forEach(color => socket.write(`\t- ${color}\n`))
                return
            }

            socket.color = data.toString().trim()
            socket.colorFunc = colors[socket.color]
            socket.write('\u001B[2J\u001B[0;0f')
            socket.write(`Thanks for joining :) There are ${Object.keys(sockets).length} sauer-utleys in this channel\n`)
            return
        }

        Object.values(sockets).forEach(globalSocket => {
            if(socket === globalSocket) return
            globalSocket.write(`\n${socket.colorFunc(socket.name)}: `);
            globalSocket.write(`${data}\n`);
        })
    })

    socket.on('end', () => {
        delete sockets[socket.id]
        
        Object.values(sockets).forEach(globalSocket => {
            if (socket === globalSocket) return
            globalSocket.write(`${socket.name} has left the channel\n`);
        })

        console.log('Client Disconnected')
    })
})

server.listen(8000, () => console.log('server bound'))