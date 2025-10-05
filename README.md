# 🌟 Social Media Web Application

A modern, full-stack social media platform built with **Express.js**, **SQLite**, and **vanilla JavaScript**. Connect with friends, share your thoughts, and build your social network!

## 🚀 Features

### 👤 **User Management**
- **User Registration & Login** - Secure account creation with JWT authentication
- **Profile Management** - Create and edit your profile with bio and personal details
- **Password Security** - Encrypted password storage using bcrypt
- **User Search** - Discover new people by searching usernames or names

### 📝 **Posts & Content**
- **Create Posts** - Share your thoughts with text and optional images
- **Interactive Feed** - View posts from people you follow in real-time
- **Like System** - Show appreciation for posts with likes
- **Post Management** - Edit or delete your own posts
- **Image Support** - Add images to your posts via URL

### 💬 **Comments System**
- **Comment on Posts** - Engage with posts through comments
- **Comment Management** - Delete your own comments
- **Modal Interface** - View all comments in a clean popup modal
- **Real-time Updates** - Comments appear instantly

### 👥 **Social Features**
- **Follow/Unfollow Users** - Build your social network
- **Followers & Following Lists** - See who follows you and who you follow
- **Personalized Feed** - See posts only from people you follow
- **Social Stats** - Track your post count, followers, and following numbers

### 🎨 **User Interface**
- **Responsive Design** - Works perfectly on desktop and mobile
- **Modern UI** - Beautiful gradient design with smooth animations
- **Dark Theme Elements** - Elegant color scheme
- **Interactive Notifications** - Success and error message system
- **Loading States** - User-friendly loading indicators

## 🛠 Technology Stack

### **Frontend**
- **HTML5** - Semantic markup structure
- **CSS3** - Modern styling with flexbox, gradients, and animations
- **Vanilla JavaScript** - Pure JS with async/await for API calls
- **Font Awesome** - Beautiful icons throughout the interface

### **Backend**
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **JWT** - JSON Web Tokens for secure authentication
- **bcryptjs** - Password hashing and verification
- **CORS** - Cross-origin resource sharing support

### **Database**
- **SQLite** - Lightweight, file-based database
- **Sequelize ORM** - Database object-relational mapping
- **Auto-sync** - Database tables created automatically

## 📁 Project Structure

```
social-media-app/
├── backend/
│   ├── models/
│   │   ├── User.js          # User model with authentication
│   │   ├── Post.js          # Post model with content management
│   │   ├── Comment.js       # Comment model for post interactions
│   │   ├── Follow.js        # Follow relationship model
│   │   └── index.js         # Database configuration and associations
│   ├── routes/
│   │   ├── auth.js          # Authentication routes (login/register)
│   │   ├── users.js         # User profile and management routes
│   │   ├── posts.js         # Post creation, feed, and interaction routes
│   │   └── follow.js        # Follow system routes
│   ├── middleware/
│   │   └── auth.js          # JWT authentication middleware
│   └── server.js            # Main Express server configuration
├── frontend/
│   ├── css/
│   │   └── styles.css       # Complete responsive styling
│   ├── js/
│   │   └── app.js           # Frontend JavaScript logic
│   └── index.html           # Single-page application interface
├── package.json             # Project dependencies and scripts
└── README.md               # Project documentation
```

## 🚀 Getting Started

### **Prerequisites**
- Node.js (v14 or higher)
- npm (Node Package Manager)

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/SKANDA-SR/social-media-website.git
   cd social-media-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Access the application**
   - Open your browser
   - Navigate to `http://localhost:3000`
   - Sign up for a new account or login

## 📱 How to Use

### **Getting Started**
1. **Sign Up** - Create your account with username, email, and password
2. **Complete Profile** - Add your first name, last name, and bio
3. **Explore** - Navigate through Feed, Discover, and Profile sections

### **Social Interaction**
1. **Create Posts** - Share your thoughts in the Feed section
2. **Follow Users** - Go to Discover to find and follow interesting people
3. **Engage** - Like posts and leave comments to interact with others
4. **Manage Profile** - Edit your profile information anytime

## 🔧 API Endpoints

### **Authentication**
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info

### **Users**
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/search/:query` - Search users

### **Posts**
- `GET /api/posts/feed` - Get personalized feed
- `POST /api/posts` - Create new post
- `GET /api/posts/:id` - Get specific post
- `POST /api/posts/:id/like` - Like a post
- `POST /api/posts/:id/comments` - Add comment to post

### **Follow System**
- `POST /api/follow/:userId` - Follow a user
- `DELETE /api/follow/:userId` - Unfollow a user
- `GET /api/follow/:userId/followers` - Get user followers
- `GET /api/follow/:userId/following` - Get users followed by user

## 🎯 Key Features Highlights

- **🔐 Secure Authentication** - JWT-based login system with password encryption
- **📱 Fully Responsive** - Works seamlessly on all device sizes
- **⚡ Real-time Updates** - Dynamic content loading without page refreshes
- **🎨 Modern Design** - Beautiful gradient UI with smooth animations
- **👥 Social Networking** - Complete follow system with personalized feeds
- **💬 Interactive Comments** - Full commenting system with modal interface
- **🔍 User Discovery** - Search and discover new users to follow
- **📊 Social Stats** - Track your posts, followers, and following counts

## 🤝 Contributing

Feel free to fork this project, create feature branches, and submit pull requests for any improvements!

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Built with ❤️ using Express.js, SQLite, and modern web technologies**