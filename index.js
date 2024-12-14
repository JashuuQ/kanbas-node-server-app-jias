import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import Hello from './Hello.js';
import Lab5 from './Lab5/index.js';
import cors from 'cors';
import mongoose from "mongoose";

import UserRoutes from './Kanbas/Users/routes.js';
import CourseRoutes from './Kanbas/Courses/routes.js';
import ModuleRoutes from './Kanbas/Modules/routes.js';
import AssignmentRoutes from './Kanbas/Assignments/routes.js';
import EnrollmentsRoutes from './Kanbas/Enrollments/routes.js';

const CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING || "mongodb://127.0.0.1:27017/kanbas"
mongoose.connect(CONNECTION_STRING)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((error) => console.error('MongoDB connection error:', error));

const app = express();

// CORS Configuration
app.use(
  cors({
    origin: process.env.NETLIFY_URL || 'http://localhost:3000/',
    credentials: true,
  })
);

// app.options('*', (req, res) => {
//   res.header(
//     'Access-Control-Allow-Origin',
//     process.env.NETLIFY_URL || 'http://localhost:3000'
//   );
//   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//   res.header('Access-Control-Allow-Credentials', 'true');
//   res.sendStatus(204);
// });

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Session Options
const sessionOptions = {
  secret: process.env.SESSION_SECRET || 'kanbas',
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  },
};

// Local
if (process.env.NODE_ENV !== 'development') {
  sessionOptions.proxy = true;
  sessionOptions.cookie = {
    sameSite: 'none',
    secure: true,
    domain: process.env.NODE_SERVER_DOMAIN,
  };
}

app.use(session(sessionOptions));

app.use(express.json()); // Process JSON requests

// Load Routes
Lab5(app);
Hello(app);
AssignmentRoutes(app);
CourseRoutes(app);
EnrollmentsRoutes(app);
ModuleRoutes(app);
UserRoutes(app);
// PeopleRoutes(app);

const PORT = process.env.PORT || 4000;

// Debug
console.log('Server configured for:', process.env.REMOTE_SERVER);
console.log('Server configured for:', process.env.NODE_SERVER_DOMAIN || 'Localhost');

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
