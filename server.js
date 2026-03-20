const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('Bir kullanıcı bağlandı:', socket.id);

    // Odaya Katılma
    socket.on('join_room', (roomName) => {
        socket.join(roomName);
        console.log(`${socket.id} şu odaya katıldı: ${roomName}`);
    });

    // Mesaj Gönderme
    socket.on('send_message', (data) => {
        // data: { room, message, sender, msgId }
		// Mesajı terminale yazdıralım:
		console.log(`[MESAJ] Oda: ${data.room} | Gönderen: ${data.sender} | İçerik: ${data.message}`);
		// Sonra yine tarayıcılara gönderelim:
        io.to(data.room).emit('receive_message', data);
    });

    // Yazıyor Bilgisi
    socket.on('typing', (data) => {
        // Kendisi hariç odadaki diğerlerine "yazıyor" bilgisini gönderir
        socket.to(data.room).emit('display_typing', data);
    });

    // Okundu Bilgisi
    socket.on('message_read', (data) => {
        // Mesajın okunduğunu gönderene iletir
        socket.to(data.room).emit('update_read_status', data);
    });

    socket.on('disconnect', () => {
        console.log('Kullanıcı ayrıldı');
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} üzerinde çalışıyor`);
});