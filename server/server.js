import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { networkInterfaces } from 'os';
import * as fs from 'fs';
import * as path from 'path';

const app = express();
app.use(cors());

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;
const COMMAND_LOG_CAP = 500;
const logs = [];

// Serve key config
app.get('/api/key-config', (req, res) => {
  const configPath = path.resolve('client/public/key.config.json');
  fs.readFile(configPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read key config.' });
    }
    try {
      const config = JSON.parse(data);
      res.json(config);
    } catch (parseErr) {
      res.status(500).json({ error: 'Failed to parse key config.' });
    }
  });
});

// Serve in-memory logs
app.get('/api/logs', (req, res) => {
  res.json(logs);
});

// Active sockets tracking
const socketRoles = new Map(); // socket.id -> 'dashboard' | 'controller'

function getStatus() {
  let dashboards = 0;
  let controllers = 0;
  for (const role of socketRoles.values()) {
    if (role === 'dashboard') dashboards++;
    if (role === 'controller') controllers++;
  }
  return { dashboards, controllers };
}

function broadcastStatus() {
  const status = getStatus();
  // Emit status to all dashboard clients
  for (const [id, role] of socketRoles.entries()) {
    if (role === 'dashboard') {
      io.to(id).emit('status', status);
    }
  }
}

io.on('connection', (socket) => {
  // Listen for registration
  socket.on('register', (role) => {
    if (role === 'dashboard' || role === 'controller') {
      socketRoles.set(socket.id, role);
      broadcastStatus();
    }
  });

  // Listen for commands from controllers
  socket.on('command', (command) => {
    const role = socketRoles.get(socket.id);
    if (role === 'controller') {
      // Append to in-memory log
      const loggedCommand = {
        timestamp: new Date().toISOString(),
        command
      };
      logs.push(loggedCommand);
      if (logs.length > COMMAND_LOG_CAP) {
        logs.shift();
      }

      // Forward to all dashboards
      for (const [id, r] of socketRoles.entries()) {
        if (r === 'dashboard') {
          io.to(id).emit('command', command);
        }
      }
    }
  });

  socket.on('disconnect', () => {
    socketRoles.delete(socket.id);
    broadcastStatus();
  });
});

// Virtual/VPN adapters (VirtualBox, VMware, Hyper-V, Docker, WSL, tunnels)
// commonly enumerate before the real WiFi/Ethernet adapter on Windows, and
// their IPs aren't reachable from a phone on the actual home network — skip
// them so the printed URL is one a phone can actually connect to.
const VIRTUAL_ADAPTER_PATTERN = /virtual|vpn|vethernet|docker|wsl|loopback|hyper-v|tailscale|zerotier|tunnel/i;

function getLocalIp() {
  const nets = networkInterfaces();
  const candidates = [];

  for (const name of Object.keys(nets)) {
    for (const net of nets[name] ?? []) {
      if (net.family === 'IPv4' && !net.internal) {
        candidates.push({ name, address: net.address });
      }
    }
  }

  const preferred = candidates.find((c) => !VIRTUAL_ADAPTER_PATTERN.test(c.name));
  return (preferred ?? candidates[0])?.address ?? 'localhost';
}

// Bind explicitly to 0.0.0.0 rather than relying on the implicit default —
// on Windows in particular, omitting the host can bind only to the IPv6 "::"
// address in some network configurations, silently refusing the IPv4
// connections phones on the LAN actually make.
server.listen(PORT, '0.0.0.0', () => {
  const localIp = getLocalIp();
  console.log(`\n======================================================`);
  console.log(`Relay Server running locally at: http://localhost:${PORT}`);
  console.log(`Relay Server running on network at: http://${localIp}:${PORT}`);
  console.log(`To open the remote controller on your mobile device, visit:`);
  console.log(`http://${localIp}:5173/controller`); // Assuming default Vite port 5173
  console.log(`======================================================\n`);
});
