const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// In-memory store for presence data (use Redis for production)
const presenceStore = {
  Sayem: null,
  Shajeda: null
};

// Store recent online events (last 10 events)
const recentEvents = [];
const MAX_EVENTS = 10;

// Helper to format timestamp
function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
}

// Helper to add event to history
function addEvent(username, status, modelName, timestamp) {
  const event = {
    username,
    status,
    modelName,
    timestamp,
    formattedTime: formatTime(timestamp),
    message: status === 'online' 
      ? `🟢 ${username} is now online\n📱 Device: ${modelName}\n🕐 Time: ${formatTime(timestamp)}`
      : `🔴 ${username} went offline\n🕐 Time: ${formatTime(timestamp)}`
  };
  
  recentEvents.unshift(event);
  if (recentEvents.length > MAX_EVENTS) {
    recentEvents.pop();
  }
  
  return event;
}

// POST /api/presence - Update presence status
app.post('/api/presence', (req, res) => {
  const { username, status, modelName, userAgent, timestamp } = req.body;
  
  // Validate input
  if (!username || !status) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing username or status' 
    });
  }
  
  if (!['Sayem', 'Shajeda'].includes(username)) {
    return res.status(400).json({ 
      success: false, 
      error: 'Invalid username' 
    });
  }
  
  // Update presence store
  presenceStore[username] = {
    status,
    modelName: modelName || 'Unknown device',
    userAgent: userAgent || 'Unknown',
    timestamp: timestamp || Date.now(),
    lastUpdated: Date.now()
  };
  
  // Add to event history
  const event = addEvent(username, status, modelName, timestamp || Date.now());
  
  console.log(`[${new Date().toISOString()}] ${username} is now ${status}`);
  
  res.json({ 
    success: true, 
    message: event.message,
    data: presenceStore[username]
  });
});

// GET /api/presence/:username - Get specific user's presence
app.get('/api/presence/:username', (req, res) => {
  const { username } = req.params;
  
  if (!['Sayem', 'Shajeda'].includes(username)) {
    return res.status(404).json({ 
      success: false, 
      error: 'User not found' 
    });
  }
  
  const presence = presenceStore[username];
  
  if (!presence) {
    return res.json({ 
      success: true,
      username,
      status: 'unknown',
      message: `${username} has not connected yet`
    });
  }
  
  // Check if status is stale (no update in 2 minutes = offline)
  const isStale = Date.now() - presence.lastUpdated > 2 * 60 * 1000;
  const currentStatus = isStale ? 'offline' : presence.status;
  
  res.json({ 
    success: true,
    username,
    status: currentStatus,
    modelName: presence.modelName,
    timestamp: presence.timestamp,
    lastUpdated: presence.lastUpdated,
    formattedTime: formatTime(presence.timestamp),
    message: currentStatus === 'online'
      ? `🟢 ${username} is now online\n📱 Device: ${presence.modelName}\n🕐 Time: ${formatTime(presence.timestamp)}`
      : `🔴 ${username} is offline\n🕐 Last seen: ${formatTime(presence.lastUpdated)}`
  });
});

// GET /api/presence - Get all users' presence
app.get('/api/presence', (req, res) => {
  const now = Date.now();
  const result = {};
  
  for (const [username, presence] of Object.entries(presenceStore)) {
    if (!presence) {
      result[username] = {
        status: 'unknown',
        message: `${username} has not connected yet`
      };
      continue;
    }
    
    // Check if stale
    const isStale = now - presence.lastUpdated > 2 * 60 * 1000;
    const currentStatus = isStale ? 'offline' : presence.status;
    
    result[username] = {
      status: currentStatus,
      modelName: presence.modelName,
      timestamp: presence.timestamp,
      lastUpdated: presence.lastUpdated,
      formattedTime: formatTime(presence.timestamp),
      message: currentStatus === 'online'
        ? `🟢 ${username} is now online\n📱 Device: ${presence.modelName}\n🕐 Time: ${formatTime(presence.timestamp)}`
        : `🔴 ${username} is offline\n🕐 Last seen: ${formatTime(presence.lastUpdated)}`
    };
  }
  
  res.json({ 
    success: true,
    users: result,
    timestamp: now
  });
});

// GET /api/events - Get recent presence events
app.get('/api/events', (req, res) => {
  res.json({ 
    success: true,
    events: recentEvents,
    count: recentEvents.length
  });
});

// GET /api/latest - Get the most recent online event
app.get('/api/latest', (req, res) => {
  const latestOnline = recentEvents.find(e => e.status === 'online');
  
  if (!latestOnline) {
    return res.json({ 
      success: true,
      message: 'No recent online events',
      event: null
    });
  }
  
  res.json({ 
    success: true,
    event: latestOnline
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: Date.now(),
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Presence API Server',
    version: '1.0.0',
    endpoints: {
      'POST /api/presence': 'Update user presence',
      'GET /api/presence': 'Get all users presence',
      'GET /api/presence/:username': 'Get specific user presence',
      'GET /api/events': 'Get recent presence events',
      'GET /api/latest': 'Get latest online event',
      'GET /health': 'Health check'
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Presence API server running on port ${PORT}`);
  console.log(`📡 Endpoints available at http://localhost:${PORT}`);
});
