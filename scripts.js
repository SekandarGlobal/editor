// Authentication System
const Auth = {
    // Initialize auth system
    init() {
        this.checkAuth();
        this.setupEventListeners();
    },

    // Check if user is authenticated
    isAuthenticated() {
        return localStorage.getItem('user') !== null;
    },

    // Get current user
    getCurrentUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    // Check authentication status and redirect if needed
    checkAuth() {
        const currentPage = window.location.pathname.split('/').pop();
        const user = this.getCurrentUser();

        // Redirect authenticated users from auth pages to dashboard
        if (user && (currentPage === 'signin.html' || currentPage === 'signup.html')) {
            window.location.href = 'dashboard.html';
            return;
        }

        // Redirect unauthenticated users from protected pages
        if (!user && (currentPage === 'dashboard.html' || currentPage === 'profile.html')) {
            window.location.href = 'signin.html';
            return;
        }

        // Load user data on profile page
        if (user && currentPage === 'profile.html') {
            this.loadProfileData(user);
        }

        // Load user data on dashboard page
        if (user && currentPage === 'dashboard.html') {
            this.loadDashboardData(user);
        }
    },

    // Setup event listeners
    setupEventListeners() {
        // Intro page redirect
        const introPage = document.querySelector('.intro-container');
        if (introPage) {
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 3000);
        }

        // Home page login button
        const loginBtn = document.querySelector('.login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                window.location.href = 'signup.html';
            });
        }

        // Sign up form
        const signupForm = document.getElementById('signup-form');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignup(signupForm);
            });
        }

        // Sign in form
        const signinForm = document.getElementById('signin-form');
        if (signinForm) {
            signinForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignin(signinForm);
            });
        }

        // Logout button
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }

        // Profile icon click
        const profileIcon = document.querySelector('.profile-icon');
        if (profileIcon) {
            profileIcon.addEventListener('click', () => {
                window.location.href = 'profile.html';
            });
        }

        // Back button
        const backBtn = document.querySelector('.back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                window.location.href = 'dashboard.html';
            });
        }
    },

    // Handle sign up
    handleSignup(form) {
        const email = form.querySelector('#email').value;
        const password = form.querySelector('#password').value;
        const confirmPassword = form.querySelector('#confirm-password').value;

        // Validation
        if (!email || !password || !confirmPassword) {
            this.showError('Please fill in all fields');
            return;
        }

        if (password !== confirmPassword) {
            this.showError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            this.showError('Password must be at least 6 characters');
            return;
        }

        // Check if user already exists
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        if (users.find(u => u.email === email)) {
            this.showError('User already exists');
            return;
        }

        // Create new user
        const newUser = {
            email,
            password, // In production, this should be hashed
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        // Auto-login after signup
        this.loginUser(newUser);
        this.showSuccess('Account created successfully! Redirecting...');

        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    },

    // Handle sign in
    handleSignin(form) {
        const email = form.querySelector('#email').value;
        const password = form.querySelector('#password').value;

        // Validation
        if (!email || !password) {
            this.showError('Please fill in all fields');
            return;
        }

        // Check credentials
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            this.showError('Invalid email or password');
            return;
        }

        // Login user
        this.loginUser(user);
        this.showSuccess('Login successful! Redirecting...');

        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    },

    // Login user (store in localStorage)
    loginUser(user) {
        const userData = {
            email: user.email,
            createdAt: user.createdAt
        };
        localStorage.setItem('user', JSON.stringify(userData));
    },

    // Handle logout
    handleLogout() {
        localStorage.removeItem('user');
        this.showSuccess('Logged out successfully!');
        setTimeout(() => {
            window.location.href = 'home.html';
        }, 1000);
    },

    // Load profile data
    loadProfileData(user) {
        const emailElement = document.querySelector('.profile-email');
        if (emailElement) {
            emailElement.textContent = user.email;
        }
    },

    // Load dashboard data
    loadDashboardData(user) {
        const welcomeTitle = document.querySelector('.welcome-title');
        if (welcomeTitle) {
            welcomeTitle.textContent = `Welcome, ${user.email.split('@')[0]}!`;
        }
    },

    // Show error message
    showError(message) {
        const errorElement = document.querySelector('.error-message');
        const successElement = document.querySelector('.success-message');
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
        
        if (successElement) {
            successElement.style.display = 'none';
        }

        setTimeout(() => {
            if (errorElement) {
                errorElement.style.display = 'none';
            }
        }, 3000);
    },

    // Show success message
    showSuccess(message) {
        const errorElement = document.querySelector('.error-message');
        const successElement = document.querySelector('.success-message');
        
        if (successElement) {
            successElement.textContent = message;
            successElement.style.display = 'block';
        }
        
        if (errorElement) {
            errorElement.style.display = 'none';
        }

        setTimeout(() => {
            if (successElement) {
                successElement.style.display = 'none';
            }
        }, 3000);
    }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    ImageEditor.init();
});

// Image Editor System
const ImageEditor = {
    canvas: null,
    ctx: null,
    originalImage: null,
    currentImage: null,
    cropOverlay: null,
    cropBox: null,
    isDragging: false,
    dragStart: { x: 0, y: 0 },
    cropRect: { x: 0, y: 0, width: 100, height: 100 },
    resizeHandle: null,

    init() {
        this.canvas = document.getElementById('image-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.cropOverlay = document.getElementById('crop-overlay');
        this.cropBox = document.getElementById('crop-box');
        
        this.setupEventListeners();
    },
    
    setupEventListeners() {
        const uploadBtn = document.getElementById('upload-btn');
        const imageUpload = document.getElementById('image-upload');
        const applyResizeBtn = document.getElementById('apply-resize');
        const cropBtn = document.getElementById('crop-btn');
        const resetBtn = document.getElementById('reset-btn');
        const downloadBtn = document.getElementById('download-btn');
        const removeBtn = document.getElementById('remove-btn');

        if (uploadBtn && imageUpload) {
            uploadBtn.addEventListener('click', () => imageUpload.click());
            imageUpload.addEventListener('change', (e) => this.handleImageUpload(e));
        }

        if (applyResizeBtn) {
            applyResizeBtn.addEventListener('click', () => this.handleResize());
        }

        if (cropBtn) {
            cropBtn.addEventListener('click', () => this.handleCrop());
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetImage());
        }

        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadImage());
        }

        if (removeBtn) {
            removeBtn.addEventListener('click', () => this.removeImage());
        }

        // Crop box interaction
        if (this.cropBox) {
            this.setupCropBoxInteraction();
        }
    },

    setupCropBoxInteraction() {
        const handles = this.cropBox.querySelectorAll('.crop-handle');
        
        handles.forEach(handle => {
            handle.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                e.preventDefault();
                // Get the handle type from classList
                this.resizeHandle = Array.from(handle.classList).find(cls => ['nw', 'ne', 'sw', 'se'].includes(cls));
                this.isDragging = true;
                this.dragStart = { x: e.clientX, y: e.clientY };
                this.initialCropRect = { ...this.cropRect };
            });
        });

        this.cropBox.addEventListener('mousedown', (e) => {
            if (e.target === this.cropBox) {
                e.preventDefault();
                this.isDragging = true;
                this.resizeHandle = 'move';
                this.dragStart = { x: e.clientX, y: e.clientY };
                this.initialCropRect = { ...this.cropRect };
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            e.preventDefault();
            this.handleCropBoxMove(e);
        });

        document.addEventListener('mouseup', () => {
            this.isDragging = false;
            this.resizeHandle = null;
        });
    },
    
    handleCropBoxMove(e) {
        const dx = e.clientX - this.dragStart.x;
        const dy = e.clientY - this.dragStart.y;
        const canvasRect = this.canvas.getBoundingClientRect();
        
        const maxX = canvasRect.width;
        const maxY = canvasRect.height;

        if (this.resizeHandle === 'move') {
            // Move the crop box
            this.cropRect.x = Math.max(0, Math.min(this.initialCropRect.x + dx, maxX - this.cropRect.width));
            this.cropRect.y = Math.max(0, Math.min(this.initialCropRect.y + dy, maxY - this.cropRect.height));
        } else {
            // Resize the crop box
            const minSize = 20;
            
            switch (this.resizeHandle) {
                case 'nw':
                    const newWidthNW = Math.max(minSize, this.initialCropRect.width - dx);
                    const newHeightNW = Math.max(minSize, this.initialCropRect.height - dy);
                    this.cropRect.width = newWidthNW;
                    this.cropRect.height = newHeightNW;
                    this.cropRect.x = this.initialCropRect.x + (this.initialCropRect.width - newWidthNW);
                    this.cropRect.y = this.initialCropRect.y + (this.initialCropRect.height - newHeightNW);
                    break;
                case 'ne':
                    const newWidthNE = Math.max(minSize, this.initialCropRect.width + dx);
                    const newHeightNE = Math.max(minSize, this.initialCropRect.height - dy);
                    this.cropRect.width = newWidthNE;
                    this.cropRect.height = newHeightNE;
                    this.cropRect.y = this.initialCropRect.y + (this.initialCropRect.height - newHeightNE);
                    break;
                case 'sw':
                    const newWidthSW = Math.max(minSize, this.initialCropRect.width - dx);
                    const newHeightSW = Math.max(minSize, this.initialCropRect.height + dy);
                    this.cropRect.width = newWidthSW;
                    this.cropRect.height = newHeightSW;
                    this.cropRect.x = this.initialCropRect.x + (this.initialCropRect.width - newWidthSW);
                    break;
                case 'se':
                    const newWidthSE = Math.max(minSize, this.initialCropRect.width + dx);
                    const newHeightSE = Math.max(minSize, this.initialCropRect.height + dy);
                    this.cropRect.width = newWidthSE;
                    this.cropRect.height = newHeightSE;
                    break;
            }
            
            // Ensure crop box stays within bounds
            this.cropRect.x = Math.max(0, this.cropRect.x);
            this.cropRect.y = Math.max(0, this.cropRect.y);
            this.cropRect.width = Math.min(this.cropRect.width, maxX - this.cropRect.x);
            this.cropRect.height = Math.min(this.cropRect.height, maxY - this.cropRect.y);
        }

        this.updateCropBox();
    },

    updateCropBox() {
        if (!this.cropBox) return;
        
        // Get canvas display dimensions
        const canvasRect = this.canvas.getBoundingClientRect();
        const displayWidth = canvasRect.width;
        const displayHeight = canvasRect.height;
        
        // Get actual canvas dimensions
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        
        // Calculate scale factors
        const scaleX = displayWidth / canvasWidth;
        const scaleY = displayHeight / canvasHeight;
        
        // Convert canvas coordinates to display coordinates
        const displayX = this.cropRect.x * scaleX;
        const displayY = this.cropRect.y * scaleY;
        const displayWidth2 = this.cropRect.width * scaleX;
        const displayHeight2 = this.cropRect.height * scaleY;
        
        // Update crop box position and size
        this.cropBox.style.left = displayX + 'px';
        this.cropBox.style.top = displayY + 'px';
        this.cropBox.style.width = displayWidth2 + 'px';
        this.cropBox.style.height = displayHeight2 + 'px';
    },

    handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                this.originalImage = img;
                this.currentImage = img;
                
                // Set canvas size
                const maxWidth = 800;
                const maxHeight = 600;
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = (maxWidth / width) * height;
                    width = maxWidth;
                }
                if (height > maxHeight) {
                    width = (maxHeight / height) * width;
                    height = maxHeight;
                }

                this.canvas.width = width;
                this.canvas.height = height;
                this.ctx.drawImage(img, 0, 0, width, height);

                // Show editor workspace
                document.querySelector('.upload-area').style.display = 'none';
                document.querySelector('.editor-workspace').style.display = 'flex';
                
                // Show crop overlay
                if (this.cropOverlay) {
                    this.cropOverlay.style.display = 'block';
                    this.cropOverlay.classList.add('active');
                }

                // Initialize crop box
                this.cropRect = {
                    x: width * 0.1,
                    y: height * 0.1,
                    width: width * 0.8,
                    height: height * 0.8
                };
                this.updateCropBox();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    },

    handleResize() {
        const widthInput = document.getElementById('width-input');
        const heightInput = document.getElementById('height-input');
        
        const newWidth = parseInt(widthInput.value);
        const newHeight = parseInt(heightInput.value);

        if (!newWidth || !newHeight || newWidth < 1 || newHeight < 1) {
            alert('Please enter valid width and height values (minimum 1px)');
            return;
        }

        // Create temporary canvas for resizing
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = newWidth;
        tempCanvas.height = newHeight;
        const tempCtx = tempCanvas.getContext('2d');
        
        // Draw current image resized
        tempCtx.drawImage(this.canvas, 0, 0, newWidth, newHeight);

        // Update main canvas
        this.canvas.width = newWidth;
        this.canvas.height = newHeight;
        this.ctx.drawImage(tempCanvas, 0, 0);

        // Update crop box to full image
        this.cropRect = {
            x: 0,
            y: 0,
            width: newWidth,
            height: newHeight
        };
        this.updateCropBox();
    },

    handleCrop() {
        // Get the canvas dimensions
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;

        // Get the canvas display dimensions
        const canvasRect = this.canvas.getBoundingClientRect();
        const displayWidth = canvasRect.width;
        const displayHeight = canvasRect.height;

        // Calculate the scale factors
        const scaleX = canvasWidth / displayWidth;
        const scaleY = canvasHeight / displayHeight;

        // Get the crop box position and size from the DOM
        const cropBoxRect = this.cropBox.getBoundingClientRect();

        // Calculate crop coordinates in canvas space
        const cropX = (cropBoxRect.left - canvasRect.left) * scaleX;
        const cropY = (cropBoxRect.top - canvasRect.top) * scaleY;
        const cropWidth = cropBoxRect.width * scaleX;
        const cropHeight = cropBoxRect.height * scaleY;

        // Ensure crop area is within bounds
        const clampedX = Math.max(0, Math.min(cropX, canvasWidth));
        const clampedY = Math.max(0, Math.min(cropY, canvasHeight));
        const clampedWidth = Math.max(1, Math.min(cropWidth, canvasWidth - clampedX));
        const clampedHeight = Math.max(1, Math.min(cropHeight, canvasHeight - clampedY));

        // Get cropped image data
        const imageData = this.ctx.getImageData(clampedX, clampedY, clampedWidth, clampedHeight);

        // Create new canvas with cropped size
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = clampedWidth;
        tempCanvas.height = clampedHeight;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.putImageData(imageData, 0, 0);

        // Update main canvas
        this.canvas.width = clampedWidth;
        this.canvas.height = clampedHeight;
        this.ctx.drawImage(tempCanvas, 0, 0);

        // Update crop box to full image
        this.cropRect = {
            x: 0,
            y: 0,
            width: clampedWidth,
            height: clampedHeight
        };
        this.updateCropBox();
    },

    resetImage() {
        if (!this.originalImage) return;

        const maxWidth = 800;
        const maxHeight = 600;
        let width = this.originalImage.width;
        let height = this.originalImage.height;

        if (width > maxWidth) {
            height = (maxWidth / width) * height;
            width = maxWidth;
        }
        if (height > maxHeight) {
            width = (maxHeight / height) * width;
            height = maxHeight;
        }

        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx.drawImage(this.originalImage, 0, 0, width, height);

        this.cropRect = {
            x: width * 0.1,
            y: height * 0.1,
            width: width * 0.8,
            height: height * 0.8
        };
        this.updateCropBox();

        document.getElementById('width-input').value = '';
        document.getElementById('height-input').value = '';
    },

    downloadImage() {
        const link = document.createElement('a');
        link.download = 'edited-image.png';
        link.href = this.canvas.toDataURL('image/png');
        link.click();
    },

    removeImage() {
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Reset state
        this.originalImage = null;
        this.currentImage = null;
        this.cropRect = { x: 0, y: 0, width: 100, height: 100 };
        
        // Hide crop overlay
        if (this.cropOverlay) {
            this.cropOverlay.style.display = 'none';
            this.cropOverlay.classList.remove('active');
        }
        
        // Hide editor workspace and show upload area
        document.querySelector('.upload-area').style.display = 'flex';
        document.querySelector('.editor-workspace').style.display = 'none';
        
        // Clear resize inputs
        document.getElementById('width-input').value = '';
        document.getElementById('height-input').value = '';
        
        // Reset file input so the same file can be selected again
        const imageUpload = document.getElementById('image-upload');
        if (imageUpload) {
            imageUpload.value = '';
        }
    }
};