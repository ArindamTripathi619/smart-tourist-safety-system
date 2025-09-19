const io = require('socket.io-client');

console.log('🔌 Testing Socket.IO connection...');

const socket = io('http://localhost:5000', {
    autoConnect: true,
    reconnection: true,
    timeout: 5000
});

socket.on('connect', () => {
    console.log('✅ Connected with ID:', socket.id);
    
    // Test authentication
    console.log('🔐 Authenticating as admin...');
    socket.emit('authenticate', {
        token: 'admin-demo-token',
        userType: 'admin'
    });
});

socket.on('connect_error', (error) => {
    console.log('❌ Connection error:', error.message);
    process.exit(1);
});

socket.on('disconnect', (reason) => {
    console.log('📡 Disconnected:', reason);
});

socket.on('authenticated', (data) => {
    console.log('🔐 Authenticated successfully:', data);
    
    // Test getting stats
    socket.emit('get_online_users');
    
    setTimeout(() => {
        console.log('✅ Socket.IO connection test successful!');
        process.exit(0);
    }, 2000);
});

socket.on('auth_error', (error) => {
    console.log('🚫 Auth error:', error.message);
    process.exit(1);
});

socket.on('online_users', (users) => {
    console.log('👥 Online users:', users);
});

// Timeout after 10 seconds
setTimeout(() => {
    console.log('⏰ Connection timeout');
    process.exit(1);
}, 10000);
