# 🔐 LifeLog Authentication Setup Guide

This guide covers the complete setup process for Firebase Authentication in your LifeLog project, including both Email/Password and Google Sign-in methods.

## 📋 Table of Contents

1. [Firebase Console Setup](#firebase-console-setup)
2. [Environment Variables Configuration](#environment-variables-configuration)
3. [Code Implementation](#code-implementation)
4. [Testing Authentication](#testing-authentication)
5. [Troubleshooting](#troubleshooting)
6. [Security Best Practices](#security-best-practices)

---

## 🔥 Firebase Console Setup

### Step 1: Create/Select Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Sign in with your Google account
3. Select your existing project or create a new one

### Step 2: Enable Authentication

1. In the left sidebar, click on **"Authentication"**
2. Click **"Get started"** (if you haven't set up authentication yet)
3. You'll see the Authentication dashboard

### Step 3: Configure Sign-in Methods

#### Email/Password Authentication

1. Click on the **"Sign-in method"** tab
2. Find **"Email/Password"** in the list and click on it
3. Toggle the **"Enable"** switch to turn it on
4. Optionally enable:
   - **"Email link (passwordless sign-in)"** - for passwordless authentication
   - **"Allow users to sign up"** - should be enabled by default
5. Click **"Save"**

#### Google Authentication

1. In the same **"Sign-in method"** tab
2. Find **"Google"** in the list and click on it
3. Toggle the **"Enable"** switch to turn it on
4. **Project support email**: This will be automatically filled
5. Click **"Save"**

### Step 4: Configure OAuth Consent Screen (for Google Auth)

If this is your first time setting up Google authentication:

1. **Go to Google Cloud Console**:
   - In Firebase Console, click the **gear icon (⚙️)** next to "Project Overview"
   - Select **"Project settings"**
   - Scroll down and click **"Go to Google Cloud Console"**

2. **Configure OAuth consent screen**:
   - In Google Cloud Console, go to **"APIs & Services"** → **"OAuth consent screen"**
   - Choose **"External"** user type (unless you have a Google Workspace)
   - Fill in the required information:
     - **App name**: "LifeLog" (or your preferred name)
     - **User support email**: Your email
     - **Developer contact information**: Your email
   - Click **"Save and Continue"**

3. **Add scopes** (optional):
   - Click **"Add or remove scopes"**
   - Add these scopes if needed:
     - `email`
     - `profile`
     - `openid`
   - Click **"Save and Continue"**

4. **Add test users** (for external apps):
   - Add your email address as a test user
   - Click **"Save and Continue"**

5. **Review and publish**:
   - Review your settings
   - Click **"Back to Dashboard"**

### Step 5: Add Authorized Domains

1. **Back in Firebase Console** → Authentication → Settings tab
2. Scroll down to **"Authorized domains"**
3. Add these domains:
   - `localhost` (for development)
   - Your production domain (when you deploy)

### Step 6: Get Firebase Configuration

1. In Firebase Console, click the **gear icon (⚙️)** next to "Project Overview"
2. Select **"Project settings"**
3. Scroll down to **"Your apps"** section
4. If you don't have a web app, click **"Add app"** → **"Web"** (</>) icon
5. Register your app with a nickname (e.g., "LifeLog Web App")
6. Copy the configuration object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

---

## 🔧 Environment Variables Configuration

### Step 1: Create Environment File

Create a `.env` file in your project root (same level as `package.json`) with the following content:

```env
# Firebase Configuration
# Replace these values with your actual Firebase project credentials
# You can find these in your Firebase Console > Project Settings > General > Your apps

VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Step 2: Replace Placeholder Values

Replace the placeholder values in your `.env` file with your actual Firebase configuration:

```env
VITE_FIREBASE_API_KEY=AIzaSyC...your_actual_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### Step 3: Restart Development Server

After creating the `.env` file, restart your development server:

```bash
npm run dev
```

---

## 💻 Code Implementation

### Firebase Configuration (`src/firebase/config.js`)

```javascript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

### Authentication State Management (`src/App.jsx`)

```javascript
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/config";

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Protected Route component
  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return <LoadingSpinner message="Checking authentication..." />;
    }
    
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    
    return children;
  };

  // Public Route component
  const PublicRoute = ({ children }) => {
    if (loading) {
      return <LoadingSpinner message="Checking authentication..." />;
    }
    
    if (user) {
      return <Navigate to="/" replace />;
    }
    
    return children;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        {/* Add other protected routes */}
      </Routes>
    </Router>
  );
};
```

### Login Page Implementation

The login page includes:
- Email/Password authentication
- Google Sign-in
- Form validation
- Error handling
- Loading states

### Register Page Implementation

The register page includes:
- Email/Password registration
- Google Sign-up
- Form validation with password confirmation
- User profile creation
- Error handling

---

## 🧪 Testing Authentication

### Step 1: Test Environment Variables

1. Open your browser and go to your app (usually `http://localhost:5173`)
2. Open Developer Tools (F12) and check the Console tab
3. You should see messages like:
   - ✅ Environment Variables Check: all should show `true`
   - ✅ Firebase connection successful
   - ✅ Auth connection successful

### Step 2: Test Email/Password Authentication

1. Navigate to `/register` in your app
2. Fill in all fields:
   - First name
   - Last name
   - Email address
   - Password (at least 6 characters)
   - Confirm password
3. Click "Create Account"
4. You should be redirected to the dashboard
5. Check Firebase Console → Authentication → Users to see the new user

### Step 3: Test Google Authentication

1. Navigate to `/login` or `/register`
2. Click "Continue with Google"
3. You should see the Google sign-in popup
4. Sign in with your Google account
5. You should be redirected to the dashboard

### Step 4: Test Login with Email/Password

1. Navigate to `/login`
2. Enter the email and password you used during registration
3. Click "Sign In"
4. You should be redirected to the dashboard

---

## 🚨 Troubleshooting

### Common Issues and Solutions

#### Issue: "auth/configuration-not-found"
- **Cause**: Environment variables are missing or incorrect
- **Solution**: 
  - Check that `.env` file exists in project root
  - Verify all environment variables are set correctly
  - Restart development server after creating `.env`

#### Issue: "auth/operation-not-allowed"
- **Cause**: Email/Password authentication is not enabled
- **Solution**: Enable Email/Password authentication in Firebase Console

#### Issue: "auth/unauthorized-domain"
- **Cause**: Domain is not in authorized domains list
- **Solution**: Add your domain to authorized domains in Firebase Console

#### Issue: "auth/popup-blocked"
- **Cause**: Browser blocked the Google sign-in popup
- **Solution**: Allow pop-ups for your localhost domain

#### Issue: "auth/email-already-in-use"
- **Cause**: User is trying to register with an existing email
- **Solution**: User should use login instead of register

#### Issue: "auth/weak-password"
- **Cause**: Password is less than 6 characters
- **Solution**: Use a password with at least 6 characters

#### Issue: Environment variables not loading
- **Cause**: Incorrect variable naming or file location
- **Solution**: 
  - Ensure variable names start with `VITE_`
  - Place `.env` file in project root
  - Restart development server

### Debugging Steps

1. **Check Console Logs**: Look for error messages in browser console
2. **Verify Firebase Console**: Ensure authentication is properly configured
3. **Test Environment Variables**: Use the test function to verify configuration
4. **Check Network Tab**: Look for failed requests to Firebase
5. **Verify Domain Authorization**: Ensure localhost is in authorized domains

---

## 🔒 Security Best Practices

### Environment Variables
- ✅ Never commit `.env` files to version control
- ✅ Use `VITE_` prefix for Vite environment variables
- ✅ Keep API keys secure and rotate them regularly

### Firebase Security Rules
- ✅ Set up proper Firestore security rules
- ✅ Restrict access to authenticated users only
- ✅ Validate data on both client and server side

### Authentication
- ✅ Enable only necessary sign-in methods
- ✅ Set up proper authorized domains
- ✅ Monitor authentication logs in Firebase Console
- ✅ Implement proper error handling

### General Security
- ✅ Keep dependencies updated
- ✅ Use HTTPS in production
- ✅ Implement rate limiting for authentication attempts
- ✅ Set up proper CORS policies

---

## 📋 Setup Checklist

### Firebase Console
- [ ] Firebase project created
- [ ] Authentication enabled
- [ ] Email/Password sign-in method enabled
- [ ] Google sign-in method enabled
- [ ] OAuth consent screen configured (if needed)
- [ ] Authorized domains added
- [ ] Web app registered in Firebase

### Environment Configuration
- [ ] `.env` file created in project root
- [ ] All Firebase configuration values added
- [ ] Development server restarted

### Code Implementation
- [ ] Firebase configuration file created
- [ ] Authentication state management implemented
- [ ] Protected routes configured
- [ ] Login page implemented
- [ ] Register page implemented
- [ ] Error handling added

### Testing
- [ ] Environment variables loading correctly
- [ ] Firebase connection successful
- [ ] Email/Password registration works
- [ ] Email/Password login works
- [ ] Google sign-in works
- [ ] Google sign-up works
- [ ] Protected routes redirect properly
- [ ] Error messages display correctly

---

## 🎯 Next Steps

After completing the authentication setup:

1. **Implement User Profile Management**
2. **Add Password Reset Functionality**
3. **Set up User Data Storage in Firestore**
4. **Implement Email Verification**
5. **Add Social Media Authentication (Facebook, Twitter, etc.)**
6. **Set up Analytics and Monitoring**
7. **Implement Multi-factor Authentication**

---

## 📚 Additional Resources

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Firebase Security Rules Guide](https://firebase.google.com/docs/rules)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [React Router Documentation](https://reactrouter.com/)

---

**Note**: This guide assumes you're using Vite as your build tool. If you're using a different build tool, adjust the environment variable prefix accordingly. 