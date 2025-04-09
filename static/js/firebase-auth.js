// Firebase Auth JS - v8 API üçün
document.addEventListener('DOMContentLoaded', function() {
    console.log("Firebase auth.js yükləndi");
    
    // Firebase başlatılıb mı? Xeyr isə gözlə
    function checkFirebaseInit() {
        if (window.firebaseInitialized === true) {
            console.log("Firebase başladıldığı təsdiq edildi, auth kodları işləyir");
            initializeFirebaseAuth();
        } else {
            console.log("Firebase hələ başladılmayıb, 100ms sonra yenidən yoxlanacaq");
            setTimeout(checkFirebaseInit, 100);
        }
    }
    
    // Firebase auth kodları
    function initializeFirebaseAuth() {
        if (typeof firebase !== 'undefined' && firebase.auth) {
            console.log("Firebase auth moduluna erişildi");
            
            // Listen for auth state changes
            firebase.auth().onAuthStateChanged(function(user) {
                console.log("Auth durumu dəyişdi:", user ? "İstifadəçi daxil olub" : "İstifadəçi daxil olmayıb");
                
                if (user) {
                    // User is signed in
                    user.getIdToken().then(function(idToken) {
                        // Send the token to the server
                        sendTokenToServer(idToken);
                    }).catch(function(error) {
                        console.error("Token alma xətası:", error);
                    });
                }
            });
        } else {
            console.error("Firebase auth modulu tapılmadı!");
        }
    }
    
    // Firebase başladılıb mı yoxla, sonra işlə
    checkFirebaseInit();
});

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
    if (typeof firebase !== 'undefined' && firebase.auth) {
        return firebase.auth().signInWithEmailAndPassword(email, password);
    }
    return Promise.reject("Firebase auth yüklənmədi");
}

// Firebase email/password sign up
function signUpWithEmail(email, password) {
    if (typeof firebase !== 'undefined' && firebase.auth) {
        return firebase.auth().createUserWithEmailAndPassword(email, password);
    }
    return Promise.reject("Firebase auth yüklənmədi");
}

// Update user profile
function updateUserProfile(name, phoneNumber) {
    if (typeof firebase !== 'undefined' && firebase.auth) {
        const user = firebase.auth().currentUser;
        if (user) {
            return user.updateProfile({
                displayName: name
            }).then(() => {
                // Custom claims for phone number can be set from server side
                return user.getIdToken(true);
            });
        }
    }
    return Promise.reject('No user is signed in');
}

// Sign out
function signOut() {
    if (typeof firebase !== 'undefined' && firebase.auth) {
        return firebase.auth().signOut();
    }
    return Promise.reject("Firebase auth not loaded");
}