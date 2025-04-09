// Firebase configuration from Django settings
let firebaseConfig;

// Get Firebase config from data attribute
document.addEventListener('DOMContentLoaded', function() {
    const firebaseConfigEl = document.getElementById('firebase-config');
    if (firebaseConfigEl) {
        firebaseConfig = JSON.parse(firebaseConfigEl.getAttribute('data-config'));
        initializeFirebase();
    }
});

// Initialize Firebase
function initializeFirebase() {
    if (!firebaseConfig) return;
    
    firebase.initializeApp(firebaseConfig);
    
    // Listen for auth state changes
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in
            user.getIdToken().then(function(idToken) {
                // Send the token to the server
                sendTokenToServer(idToken);
            });
        }
    });
}

// Send ID token to the server
function sendTokenToServer(idToken) {
    fetch('/accounts/verify-firebase-token/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({
            idToken: idToken
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = data.redirect_url;
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Get CSRF token from cookie
function getCSRFToken() {
    const name = 'csrftoken';
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Firebase email/password sign in
function signInWithEmail(email, password) {
    return firebase.auth().signInWithEmailAndPassword(email, password);
}

// Firebase email/password sign up
function signUpWithEmail(email, password) {
    return firebase.auth().createUserWithEmailAndPassword(email, password);
}

// Update user profile
function updateUserProfile(name, phoneNumber) {
    const user = firebase.auth().currentUser;
    if (user) {
        return user.updateProfile({
            displayName: name
        }).then(() => {
            // Custom claims for phone number can be set from server side
            return user.getIdToken(true);
        });
    }
    return Promise.reject('No user is signed in');
}

// Sign out
function signOut() {
    return firebase.auth().signOut();
}