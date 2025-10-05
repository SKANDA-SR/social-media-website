// Global variables
let currentUser = null;
let authToken = null;
let currentPostId = null;

// API Base URL
const API_BASE = '/api';

// DOM Elements
const authContainer = document.getElementById('auth-container');
const mainContent = document.getElementById('main-content');
const navbar = document.getElementById('navbar');
const notification = document.getElementById('notification');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
});

// Authentication Functions
async function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        showAuthContainer();
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            authToken = token;
            showMainApp();
            loadInitialData();
        } else {
            localStorage.removeItem('authToken');
            showAuthContainer();
        }
    } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('authToken');
        showAuthContainer();
    }
}

async function login(event) {
    event.preventDefault();
    
    const login = document.getElementById('login-identifier').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ login, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('authToken', data.token);
            currentUser = data.user;
            authToken = data.token;
            showNotification('Login successful!', 'success');
            showMainApp();
            loadInitialData();
        } else {
            showNotification(data.error || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Login failed. Please try again.', 'error');
    }
}

async function signup(event) {
    event.preventDefault();
    
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const firstName = document.getElementById('signup-firstname').value;
    const lastName = document.getElementById('signup-lastname').value;
    const bio = document.getElementById('signup-bio').value;
    const password = document.getElementById('signup-password').value;

    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                username, 
                email, 
                firstName, 
                lastName, 
                bio, 
                password 
            })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('authToken', data.token);
            currentUser = data.user;
            authToken = data.token;
            showNotification('Account created successfully!', 'success');
            showMainApp();
            loadInitialData();
        } else {
            showNotification(data.error || 'Signup failed', 'error');
        }
    } catch (error) {
        console.error('Signup error:', error);
        showNotification('Signup failed. Please try again.', 'error');
    }
}

function logout() {
    localStorage.removeItem('authToken');
    currentUser = null;
    authToken = null;
    showAuthContainer();
    showNotification('Logged out successfully', 'success');
}

// UI Functions
function showAuthContainer() {
    authContainer.style.display = 'flex';
    mainContent.style.display = 'none';
    navbar.style.display = 'none';
}

function showMainApp() {
    authContainer.style.display = 'none';
    mainContent.style.display = 'block';
    navbar.style.display = 'block';
    
    // Update username in navbar
    document.getElementById('current-username').textContent = `@${currentUser.username}`;
    
    // Show feed section by default
    showSection('feed');
}

function showLoginForm() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('signup-form').style.display = 'none';
}

function showSignupForm() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'block';
}

function showSection(sectionName) {
    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Find and activate the correct button
    const targetButton = Array.from(document.querySelectorAll('.nav-btn')).find(btn => 
        btn.onclick && btn.onclick.toString().includes(sectionName)
    );
    if (targetButton) {
        targetButton.classList.add('active');
    }

    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });

    // Show selected section
    const section = document.getElementById(`${sectionName}-section`);
    if (section) {
        section.style.display = 'block';
    }

    // Load section-specific data
    switch(sectionName) {
        case 'feed':
            loadPosts();
            break;
        case 'discover':
            loadUsers();
            break;
        case 'profile':
            loadUserProfile();
            break;
    }
}

function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Posts Functions
async function loadPosts() {
    const container = document.getElementById('posts-container');
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading posts...</div>';

    try {
        const response = await fetch(`${API_BASE}/posts/feed`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            displayPosts(data.posts);
        } else {
            container.innerHTML = '<p>Failed to load posts</p>';
        }
    } catch (error) {
        console.error('Load posts error:', error);
        container.innerHTML = '<p>Failed to load posts</p>';
    }
}

async function createPost(event) {
    event.preventDefault();
    
    const content = document.getElementById('post-content').value;
    const imageUrl = document.getElementById('post-image').value;

    try {
        const response = await fetch(`${API_BASE}/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ content, imageUrl })
        });

        const data = await response.json();

        if (response.ok) {
            showNotification('Post created successfully!', 'success');
            document.getElementById('post-content').value = '';
            document.getElementById('post-image').value = '';
            loadPosts(); // Reload posts
        } else {
            showNotification(data.error || 'Failed to create post', 'error');
        }
    } catch (error) {
        console.error('Create post error:', error);
        showNotification('Failed to create post', 'error');
    }
}

function displayPosts(posts) {
    const container = document.getElementById('posts-container');
    
    if (posts.length === 0) {
        container.innerHTML = '<p>No posts yet. Start following people to see their posts!</p>';
        return;
    }

    container.innerHTML = posts.map(post => createPostHTML(post)).join('');
}

function createPostHTML(post) {
    const timeAgo = formatTimeAgo(new Date(post.createdAt));
    const hasImage = post.imageUrl ? `<img src="${post.imageUrl}" alt="Post image" class="post-image">` : '';
    const comments = post.comments || [];
    const commentsPreview = comments.slice(0, 2).map(comment => 
        `<div class="comment">
            <div class="comment-header">
                <div class="comment-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="comment-info">
                    <h5>${comment.author.firstName} ${comment.author.lastName}</h5>
                </div>
            </div>
            <div class="comment-content">${comment.content}</div>
        </div>`
    ).join('');

    const moreComments = comments.length > 2 ? 
        `<button class="action-btn" onclick="showComments(${post.id})">
            View all ${comments.length} comments
        </button>` : '';

    return `
        <div class="post">
            <div class="post-header">
                <div class="post-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="post-info">
                    <h4>${post.author.firstName} ${post.author.lastName}</h4>
                    <p>@${post.author.username} • ${timeAgo}</p>
                </div>
            </div>
            <div class="post-content">${post.content}</div>
            ${hasImage}
            <div class="post-actions">
                <button class="action-btn" onclick="likePost(${post.id})">
                    <i class="fas fa-heart"></i> ${post.likes || 0}
                </button>
                <button class="action-btn" onclick="showComments(${post.id})">
                    <i class="fas fa-comment"></i> ${comments.length}
                </button>
            </div>
            ${commentsPreview ? `<div class="comments-section">${commentsPreview}${moreComments}</div>` : ''}
        </div>
    `;
}

async function likePost(postId) {
    try {
        const response = await fetch(`${API_BASE}/posts/${postId}/like`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            loadPosts(); // Reload to show updated likes
        }
    } catch (error) {
        console.error('Like post error:', error);
    }
}

// Comments Functions
async function showComments(postId) {
    currentPostId = postId;
    const modal = document.getElementById('comment-modal');
    const container = document.getElementById('comments-container');
    
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading comments...</div>';
    modal.style.display = 'flex';

    try {
        const response = await fetch(`${API_BASE}/posts/${postId}`);
        const data = await response.json();

        if (response.ok && data.post.comments) {
            container.innerHTML = data.post.comments.map(comment => 
                `<div class="comment">
                    <div class="comment-header">
                        <div class="comment-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="comment-info">
                            <h5>${comment.author.firstName} ${comment.author.lastName}</h5>
                        </div>
                    </div>
                    <div class="comment-content">${comment.content}</div>
                </div>`
            ).join('');
        } else {
            container.innerHTML = '<p>No comments yet.</p>';
        }
    } catch (error) {
        console.error('Load comments error:', error);
        container.innerHTML = '<p>Failed to load comments.</p>';
    }
}

async function addComment(event) {
    event.preventDefault();
    
    const content = document.getElementById('comment-content').value;

    try {
        const response = await fetch(`${API_BASE}/posts/${currentPostId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ content })
        });

        if (response.ok) {
            document.getElementById('comment-content').value = '';
            showComments(currentPostId); // Reload comments
            showNotification('Comment added!', 'success');
        }
    } catch (error) {
        console.error('Add comment error:', error);
        showNotification('Failed to add comment', 'error');
    }
}

function closeCommentModal() {
    document.getElementById('comment-modal').style.display = 'none';
    currentPostId = null;
}

// Users Functions
async function loadUsers() {
    const container = document.getElementById('users-container');
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Loading users...</div>';

    try {
        const response = await fetch(`${API_BASE}/users`);
        const data = await response.json();

        if (response.ok) {
            displayUsers(data.users);
        } else {
            container.innerHTML = '<p>Failed to load users</p>';
        }
    } catch (error) {
        console.error('Load users error:', error);
        container.innerHTML = '<p>Failed to load users</p>';
    }
}

async function searchUsers() {
    const query = document.getElementById('search-input').value.trim();
    if (!query) {
        loadUsers();
        return;
    }

    const container = document.getElementById('users-container');
    container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Searching...</div>';

    try {
        const response = await fetch(`${API_BASE}/users/search/${encodeURIComponent(query)}`);
        const data = await response.json();

        if (response.ok) {
            displayUsers(data.users);
        } else {
            container.innerHTML = '<p>Search failed</p>';
        }
    } catch (error) {
        console.error('Search users error:', error);
        container.innerHTML = '<p>Search failed</p>';
    }
}

function displayUsers(users) {
    const container = document.getElementById('users-container');
    
    if (users.length === 0) {
        container.innerHTML = '<p>No users found.</p>';
        return;
    }

    container.innerHTML = users.map(user => createUserCardHTML(user)).join('');
}

function createUserCardHTML(user) {
    if (user.id === currentUser.id) {
        return ''; // Don't show current user in the list
    }

    return `
        <div class="user-card">
            <div class="user-info-card">
                <div class="user-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="user-details">
                    <h4>${user.firstName} ${user.lastName}</h4>
                    <p>@${user.username}</p>
                    <p>${user.bio || 'No bio available'}</p>
                </div>
            </div>
            <button class="follow-btn" onclick="followUser(${user.id}, this)">
                <i class="fas fa-user-plus"></i> Follow
            </button>
        </div>
    `;
}

async function followUser(userId, buttonElement) {
    try {
        const response = await fetch(`${API_BASE}/follow/${userId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            buttonElement.innerHTML = '<i class="fas fa-user-check"></i> Following';
            buttonElement.classList.add('following');
            buttonElement.onclick = () => unfollowUser(userId, buttonElement);
            showNotification('User followed!', 'success');
        } else {
            showNotification(data.error || 'Failed to follow user', 'error');
        }
    } catch (error) {
        console.error('Follow user error:', error);
        showNotification('Failed to follow user', 'error');
    }
}

async function unfollowUser(userId, buttonElement) {
    try {
        const response = await fetch(`${API_BASE}/follow/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            buttonElement.innerHTML = '<i class="fas fa-user-plus"></i> Follow';
            buttonElement.classList.remove('following');
            buttonElement.onclick = () => followUser(userId, buttonElement);
            showNotification('User unfollowed', 'success');
        }
    } catch (error) {
        console.error('Unfollow user error:', error);
        showNotification('Failed to unfollow user', 'error');
    }
}

// Profile Functions
async function loadUserProfile() {
    try {
        const response = await fetch(`${API_BASE}/users/${currentUser.id}`);
        const data = await response.json();

        if (response.ok) {
            const user = data.user;
            document.getElementById('profile-name').textContent = `${user.firstName} ${user.lastName}`;
            document.getElementById('profile-username').textContent = `@${user.username}`;
            document.getElementById('profile-bio').textContent = user.bio || 'No bio yet';
            document.getElementById('profile-posts').textContent = `${user.posts?.length || 0} posts`;
            document.getElementById('profile-followers').textContent = `${user.followersCount || 0} followers`;
            document.getElementById('profile-following').textContent = `${user.followingCount || 0} following`;
            
            displayUserPosts(user.posts || []);
        }
    } catch (error) {
        console.error('Load profile error:', error);
    }
}

function displayUserPosts(posts) {
    const container = document.getElementById('profile-posts-container');
    
    if (posts.length === 0) {
        container.innerHTML = '<p>No posts yet. Share something!</p>';
        return;
    }

    container.innerHTML = posts.map(post => createPostHTML(post)).join('');
}

function showEditProfile() {
    const form = document.getElementById('edit-profile-form');
    form.style.display = 'block';
    
    // Pre-fill form
    document.getElementById('edit-firstname').value = currentUser.firstName;
    document.getElementById('edit-lastname').value = currentUser.lastName;
    document.getElementById('edit-bio').value = currentUser.bio || '';
}

function hideEditProfile() {
    document.getElementById('edit-profile-form').style.display = 'none';
}

async function updateProfile(event) {
    event.preventDefault();
    
    const firstName = document.getElementById('edit-firstname').value;
    const lastName = document.getElementById('edit-lastname').value;
    const bio = document.getElementById('edit-bio').value;

    try {
        const response = await fetch(`${API_BASE}/users/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ firstName, lastName, bio })
        });

        const data = await response.json();

        if (response.ok) {
            currentUser = data.user;
            hideEditProfile();
            loadUserProfile();
            showNotification('Profile updated!', 'success');
        } else {
            showNotification(data.error || 'Failed to update profile', 'error');
        }
    } catch (error) {
        console.error('Update profile error:', error);
        showNotification('Failed to update profile', 'error');
    }
}

// Utility Functions
function formatTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
}

function loadInitialData() {
    // Load feed data by default
    loadPosts();
}

// Event Listeners
document.getElementById('search-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchUsers();
    }
});

// Close modal when clicking outside
document.getElementById('comment-modal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeCommentModal();
    }
});