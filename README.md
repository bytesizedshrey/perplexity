# Perplexity

A modern full-stack chat application with AI integration, real-time communication, and seamless authentication.

---

## Overview

Perplexity is a sophisticated chat platform that combines real-time messaging with advanced AI capabilities. The application features a responsive frontend built with React and Vite, powered by a robust Node.js backend with Socket.io for instant communication.

---

## Technology Stack

**Frontend**
- React 19 with Vite
- Redux Toolkit for state management
- Tailwind CSS for styling
- Socket.io Client for real-time updates
- React Router for navigation

**Backend**
- Express.js 5
- Socket.io for WebSocket communication
- MongoDB with Mongoose
- JWT-based authentication
- Integrated AI services

**AI & Services**
- LangChain integration
- Google GenAI API
- Mistral AI support
- Internet search capabilities
- Email service (Nodemailer)

---

## Project Structure

```
perplexity/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   └── chat/
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── backend/
    ├── src/
    │   ├── config/
    │   ├── controllers/
    │   ├── middlewares/
    │   ├── models/
    │   ├── routes/
    │   ├── services/
    │   ├── sockets/
    │   └── validator/
    ├── server.js
    └── package.json
```

---

## Features

**User Authentication**
- Secure JWT-based authentication
- Password encryption with bcrypt
- Protected routes and endpoints

**Real-time Chat**
- Instant message delivery via WebSocket
- Live user presence
- Message persistence

**AI Integration**
- Multi-AI model support
- Internet search capabilities
- Context-aware responses

**User Management**
- Profile management
- Email notifications
- Session handling

---

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB instance
- npm or yarn

### Backend Setup

1. Navigate to the backend directory
```bash
cd backend
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
Create a `.env` file in the backend directory:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/perplexity
JWT_SECRET=your_jwt_secret_key
GOOGLE_GENAI_API_KEY=your_google_genai_key
MISTRAL_API_KEY=your_mistral_key
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_email
SMTP_PASSWORD=your_password
```

4. Start the development server
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory
```bash
cd frontend
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
Create a `.env` file in the frontend directory:
```
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

4. Start the development server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

---

## API Endpoints

**Authentication**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

**Chat**
- `GET /api/chat` - Fetch user chats
- `POST /api/chat` - Create new chat
- `GET /api/chat/:id` - Get chat messages
- `POST /api/chat/:id/message` - Send message

---

## Socket Events

**Client to Server**
- `send_message` - Send a new message
- `typing` - User is typing
- `connect_user` - User connects
- `disconnect_user` - User disconnects

**Server to Client**
- `receive_message` - New message received
- `user_typing` - User typing notification
- `user_online` - User connected
- `user_offline` - User disconnected

---

## Development

### Running Tests
```bash
npm test
```

### Code Quality
```bash
npm run lint
```

### Building for Production

**Frontend**
```bash
cd frontend
npm run build
```

**Backend**
```bash
cd backend
npm run build
```

---

## Environment Configuration

Ensure all required environment variables are set in `.env` files for both backend and frontend before running the application.

---

## Performance Considerations

- Real-time updates via WebSocket for low latency
- JWT authentication for stateless sessions
- MongoDB indexing for optimized queries
- Client-side caching with Redux

---

## Security

- CORS protection enabled
- Input validation on all endpoints
- Password hashing with bcrypt
- Secure JWT token management
- SQL injection prevention via Mongoose

---

## Future Enhancements

- End-to-end encryption for messages
- User roles and permissions
- Advanced analytics dashboard
- Message search functionality
- File sharing capabilities
- Multi-language support

---

## Contributing

Contributions are welcome. Please ensure code quality standards are met before submitting pull requests.

---

## License

ISC License

---

## Support

For issues, questions, or suggestions, please open an issue in the repository.

---

**Built with precision. Designed for performance.**
