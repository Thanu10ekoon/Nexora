// Chatbot API Routes
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const CampusAgent = require('../chatbot/agent');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const agent = new CampusAgent();

// Store chat sessions (in production, use Redis or database)
const chatSessions = new Map();

// Start a new chat session
router.post('/chat/start', authenticateToken, async (req, res) => {
  try {
    const sessionId = uuidv4();
    const userId = req.user.id;
    
    chatSessions.set(sessionId, {
      userId,
      messages: [],
      createdAt: new Date(),
      lastActivity: new Date()
    });
    
    const welcomeMessage = {
      id: uuidv4(),
      type: 'bot',
      content: `Hello ${req.user.name}! 👋 I'm Campus Copilot, your university assistant. I can help you with schedules, menus, buses, events, updates, and FAQs. What would you like to know?`,
      timestamp: new Date()
    };
    
    chatSessions.get(sessionId).messages.push(welcomeMessage);
    
    res.json({
      success: true,
      sessionId,
      message: welcomeMessage
    });
  } catch (error) {
    console.error('Chat start error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start chat session'
    });
  }
});

// Send a message
router.post('/chat/message', authenticateToken, async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    
    if (!sessionId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and message are required'
      });
    }
    
    const session = chatSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }
    
    // Verify session belongs to user
    if (session.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to chat session'
      });
    }
    
    // Add user message to session
    const userMessage = {
      id: uuidv4(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };
    session.messages.push(userMessage);
    
    // Process message with agent
    const agentResponse = await agent.processMessage(message, {
      userId: req.user.id,
      userName: req.user.name,
      userType: req.user.userType
    });
    
    // Add bot response to session
    const botMessage = {
      id: uuidv4(),
      type: 'bot',
      content: agentResponse.response,
      metadata: {
        type: agentResponse.type,
        tool_used: agentResponse.tool_used
      },
      timestamp: new Date()
    };
    session.messages.push(botMessage);
    
    // Update session activity
    session.lastActivity = new Date();
    
    res.json({
      success: true,
      userMessage,
      botMessage
    });
    
  } catch (error) {
    console.error('Chat message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process message'
    });
  }
});

// Get chat history
router.get('/chat/history/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = chatSessions.get(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }
    
    // Verify session belongs to user
    if (session.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to chat session'
      });
    }
    
    res.json({
      success: true,
      messages: session.messages,
      sessionInfo: {
        createdAt: session.createdAt,
        lastActivity: session.lastActivity
      }
    });
    
  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chat history'
    });
  }
});

// End chat session
router.delete('/chat/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = chatSessions.get(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }
    
    // Verify session belongs to user
    if (session.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to chat session'
      });
    }
    
    chatSessions.delete(sessionId);
    
    res.json({
      success: true,
      message: 'Chat session ended'
    });
    
  } catch (error) {
    console.error('Chat end error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to end chat session'
    });
  }
});

// Get quick actions/suggestions
router.get('/chat/quick-actions', authenticateToken, async (req, res) => {
  try {
    const quickActions = [
      {
        id: 'schedule',
        label: '📅 My Schedule',
        message: 'Show me my schedule for today'
      },
      {
        id: 'menu',
        label: '🍽️ Today\'s Menu',
        message: 'What\'s for lunch today?'
      },
      {
        id: 'buses',
        label: '🚌 Bus Times',
        message: 'Show me bus schedules'
      },
      {
        id: 'events',
        label: '🎉 Events',
        message: 'What events are happening this week?'
      },
      {
        id: 'updates',
        label: '📢 Updates',
        message: 'Any important updates?'
      },
      {
        id: 'help',
        label: '❓ Help',
        message: 'How can you help me?'
      }
    ];
    
    res.json({
      success: true,
      quickActions
    });
    
  } catch (error) {
    console.error('Quick actions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get quick actions'
    });
  }
});

// Cleanup old sessions (run periodically)
setInterval(() => {
  const now = new Date();
  for (const [sessionId, session] of chatSessions.entries()) {
    const timeDiff = now - session.lastActivity;
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    // Remove sessions older than 24 hours
    if (hoursDiff > 24) {
      chatSessions.delete(sessionId);
    }
  }
}, 1000 * 60 * 60); // Run every hour

module.exports = router;
