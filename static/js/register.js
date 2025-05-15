document.addEventListener('DOMContentLoaded', function() {
    // Form elementləri
    const registerForm = document.getElementById('register-form');
    const registrationSection = document.getElementById('registration-section');
    const verificationSection = document.getElementById('verification-section');
    const sendCodeBtn = document.getElementById('send-code-btn');
    const verifyCodeBtn = document.getElementById('verify-code-btn');
    const backBtn = document.getElementById('back-btn');
    const resendCodeBtn = document.getElementById('resend-code-btn');
    const timerElement = document.getElementById('timer');
    const confirmPhoneElement = document.getElementById('confirm-phone');
    const codeInputs = document.querySelectorAll('.code-input');
    const passwordInput = document.getElementById('id_password');
    const confirmPasswordInput = document.getElementById('id_confirm_password');
    const passwordStrengthMeter = document.querySelector('.password-strength-meter');
    const passwordHint = document.querySelector('.password-hint');
    const notification = document.getElementById('notification');
    const notificationText = notification.querySelector('.notification-text');
    const notificationIcon = notification.querySelector('.notification-icon i');
    const formContainer = document.querySelector('.auth-form-container');
    
    // Toggle password buttonları
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    
    // Telefon input inisiallizasiyası
    const phoneInputField = document.querySelector("#id_phone_number");
    const phoneInput = window.intlTelInput(phoneInputField, {
        preferredCountries: ["az", "tr", "ru", "gb", "us"],
        separateDialCode: true,
        utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.13/js/utils.js",
        customContainer: "phone-input-container"
    });

    // Loading indicatoru gizlət (əgər varsa)
    const loadingIndicator = document.querySelector('.loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }

    // Şifrə göstərmə/gizlətmə butonlarını aktivləşdirmək
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.closest('.password-field').querySelector('input');
            togglePasswordVisibility(input, this);
        });
    });
    
    // Password visibility toggle helper function
    function togglePasswordVisibility(inputField, toggleButton) {
        if (inputField.type === 'password') {
            inputField.type = 'text';
            toggleButton.innerHTML = '<i class="fas fa-eye-slash"></i>';
        } else {
            inputField.type = 'password';
            toggleButton.innerHTML = '<i class="fas fa-eye"></i>';
        }
    }
    
    // Password strength checker
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        const passwordStrength = checkPasswordStrength(password);
        
        passwordHint.classList.add('show');
        
        if (passwordStrength === 'weak') {
            passwordStrengthMeter.className = 'password-strength-meter strength-weak';
            passwordHint.textContent = 'Zəif şifrə - daha uzun şifrə daxil edin';
        } else if (passwordStrength === 'medium') {
            passwordStrengthMeter.className = 'password-strength-meter strength-medium';
            passwordHint.textContent = 'Orta şifrə - xüsusi simvollar əlavə edin';
        } else if (passwordStrength === 'strong') {
            passwordStrengthMeter.className = 'password-strength-meter strength-strong';
            passwordHint.textContent = 'Güclü şifrə!';
        }
    });
   
    function checkPasswordStrength(password) {
        // At least 8 characters
        if (password.length < 8) {
            return 'weak';
        }
        
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        const passedTests = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChars].filter(Boolean).length;
        
        if (passedTests <= 2) {
            return 'weak';
        } else if (passedTests === 3) {
            return 'medium';
        } else {
            return 'strong';
        }
    }
    
    // Verification code input handling
    codeInputs.forEach((input, index) => {
        // Auto focus next input
        input.addEventListener('input', function() {
            if (this.value && index < codeInputs.length - 1) {
                codeInputs[index + 1].focus();
            }
            
            // Check if all inputs are filled
            const allFilled = [...codeInputs].every(input => input.value.trim() !== '');
            if (allFilled) {
                verifyCodeBtn.focus();
            }
        });
        
        // Handle backspace
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && !this.value && index > 0) {
                codeInputs[index - 1].focus();
            }
        });
        
        // Numbers only
        input.addEventListener('keypress', function(e) {
            const charCode = (e.which) ? e.which : e.keyCode;
            if (charCode < 48 || charCode > 57) {
                e.preventDefault();
            }
        });
        
        // Paste handling
        input.addEventListener('paste', function(e) {
            e.preventDefault();
            const paste = (e.clipboardData || window.clipboardData).getData('text');
            if (/^\d+$/.test(paste)) { // Numbers only
                const digits = paste.split('');
                for (let i = 0; i < digits.length && i + index < codeInputs.length; i++) {
                    codeInputs[i + index].value = digits[i];
                    if (i + index < codeInputs.length - 1) {
                        codeInputs[i + index + 1].focus();
                    }
                }
                
                // Əgər bütün inputlar doldurulubsa, düyməni fokusla
                const allFilled = [...codeInputs].every(input => input.value.trim() !== '');
                if (allFilled) {
                    verifyCodeBtn.focus();
                }
            }
        });
    });
    
    // Form validation
    function validateRegistrationForm() {
        // User type validation
        const userTypeSelected = registerForm.querySelector('input[name="user_type"]:checked');
        if (!userTypeSelected) {
            showNotification('error', 'Zəhmət olmasa istifadəçi tipini seçin');
            return false;
        }
        
        // Name validation
        const nameField = document.getElementById('id_name');
        if (!nameField.value.trim()) {
            showNotification('error', 'Zəhmət olmasa tam adınızı daxil edin');
            nameField.focus();
            return false;
        }
        
        // Phone validation
        if (!phoneInput.isValidNumber()) {
            showNotification('error', 'Zəhmət olmasa düzgün telefon nömrəsi daxil edin');
            phoneInputField.focus();
            return false;
        }
        
        // Password validation
        const password = passwordInput.value;
        if (password.length < 8) {
            showNotification('error', 'Şifrə ən az 8 simvoldan ibarət olmalıdır');
            passwordInput.focus();
            return false;
        }
        
        // Password confirmation
        if (password !== confirmPasswordInput.value) {
            showNotification('error', 'Şifrələr uyğun gəlmir');
            confirmPasswordInput.focus();
            return false;
        }
        
        // Gender validation
        const genderSelected = registerForm.querySelector('input[name="gender"]:checked');
        if (!genderSelected) {
            showNotification('error', 'Zəhmət olmasa cinsinizi seçin');
            return false;
        }
        
        // Age range validation
        const ageRangeSelected = registerForm.querySelector('input[name="age_range"]:checked');
        if (!ageRangeSelected) {
            showNotification('error', 'Zəhmət olmasa yaş aralığınızı seçin');
            return false;
        }
        
        return true;
    }
    
    // CSRF Token function
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
    
    // Notification system
    function showNotification(type, message) {
        // Update icon
        if (type === 'success') {
            notificationIcon.className = 'fas fa-check';
            notification.style.borderColor = '#4dff4d';
        } else if (type === 'error') {
            notificationIcon.className = 'fas fa-times';
            notification.style.borderColor = '#ff4d4d';
        } else if (type === 'info') {
            notificationIcon.className = 'fas fa-info';
            notification.style.borderColor = '#4d88ff';
        } else if (type === 'warning') {
            notificationIcon.className = 'fas fa-exclamation-triangle';
            notification.style.borderColor = '#ffd24d';
        }
        
        // Set message
        notificationText.textContent = message;
        
        // Show notification
        notification.classList.add('show');
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 5000);
    }
    
    // Switch between sections function
    function switchToSection(section) {
        if (section === 'registration') {
            // Əvvəlcə formu gizlət və sonra yeni məzmunla göstər
            formContainer.style.opacity = '0.5';
            formContainer.style.transform = 'scale(0.98)';
            
            setTimeout(() => {
                registrationSection.classList.add('active');
                verificationSection.classList.remove('active');
                
                // Formu animasiya ilə göstər
                formContainer.style.opacity = '1';
                formContainer.style.transform = 'scale(1)';
                
                // Scroll to top after switching
                window.scrollTo(0, 0);
            }, 300);
        } else if (section === 'verification') {
            // Əvvəlcə formu gizlət və sonra yeni məzmunla göstər
            formContainer.style.opacity = '0.5';
            formContainer.style.transform = 'scale(0.98)';
            
            setTimeout(() => {
                registrationSection.classList.remove('active');
                verificationSection.classList.add('active');
                
                // Formu animasiya ilə göstər
                formContainer.style.opacity = '1';
                formContainer.style.transform = 'scale(1)';
                
                // İlk kod inputuna fokuslan
                codeInputs[0].focus();
                
                // Scroll to top after switching
                window.scrollTo(0, 0);
            }, 300);
        }
    }
    
    // Send verification code
    sendCodeBtn.addEventListener('click', function() {
        // Validate form
        if (!validateRegistrationForm()) {
            return;
        }
        
        // Get phone number
        const phoneNumber = phoneInput.getNumber();
        
        // Show loading state
        sendCodeBtn.disabled = true;
        sendCodeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Göndərilir...';
        
        // Send API request
        fetch('/accounts/api/send-verification-code/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify({
                phone_number: phoneNumber
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Reset button
            sendCodeBtn.disabled = false;
            sendCodeBtn.innerHTML = 'SMS kodu göndər';
            
            if (data.success) {
                // Show success notification with animation
                showNotification('success', 'Doğrulama kodu göndərildi!');
                
                // Update confirmation phone display
                confirmPhoneElement.textContent = phoneNumber;
                
                // Switch to verification screen
                switchToSection('verification');
                
                // Start timer
                startResendTimer();
                
                // Clear previous codes
                codeInputs.forEach(input => {
                    input.value = '';
                });
            } else {
                showNotification('error', data.error || 'SMS kodu göndərmə xətası');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            sendCodeBtn.disabled = false;
            sendCodeBtn.innerHTML = 'SMS kodu göndər';
            showNotification('error', 'Server xətası: ' + error.message);
        });
    });
    
    // Verify code
    verifyCodeBtn.addEventListener('click', function() {
        // Get verification code
        let verificationCode = '';
        let isValid = true;
        
        codeInputs.forEach(input => {
            if (!input.value) {
                isValid = false;
            }
            verificationCode += input.value;
        });
        
        if (!isValid) {
            showNotification('error', 'Zəhmət olmasa bütün rəqəmləri daxil edin');
            codeInputs[0].focus();
            return;
        }
        
        // Show loading state
        verifyCodeBtn.disabled = true;
        verifyCodeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Doğrulanır...';
        
        // Get phone number
        const phoneNumber = phoneInput.getNumber();
        
        // Verify code API request
        fetch('/accounts/api/verify-code/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken()
            },
            body: JSON.stringify({
                phone_number: phoneNumber,
                verification_code: verificationCode
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                // Set verified state
                const isVerifiedInput = document.getElementById('id_is_verified');
                if (isVerifiedInput) {
                    isVerifiedInput.checked = true;
                }
                
                // Prepare form data for final submission
                const formData = new FormData(registerForm);
                formData.set('phone_number', phoneNumber); // Ensure the full E.164 number is submitted
                formData.append('is_verified', 'true');
                formData.append('password', passwordInput.value);
                
                // Submit form to complete registration
                fetch(registerForm.action, {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': getCSRFToken()
                    },
                    body: formData
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Registration failed');
                    }
                    return response.text();
                })
                .then(() => {
                    // Show final success message
                    showNotification('success', 'Qeydiyyat uğurla tamamlandı! Yönləndirilirsiniz...');
                    
                    // Formu animasiya ilə gizlət
                    formContainer.style.opacity = '0';
                    formContainer.style.transform = 'translateY(20px) scale(0.98)';
                    
                    // Redirect to login page after 2 seconds
                    setTimeout(() => {
                        window.location.href = '/accounts/login/';
                    }, 2000);
                })
                .catch(error => {
                    console.error('Registration error:', error);
                    verifyCodeBtn.disabled = false;
                    verifyCodeBtn.innerHTML = 'Kodu doğrula və qeydiyyatdan keç';
                    showNotification('error', 'Qeydiyyat zamanı xəta baş verdi');
                });
            } else {
                // Show error
                showNotification('error', data.error || 'Yanlış doğrulama kodu');
                
                // Reset button
                verifyCodeBtn.disabled = false;
                verifyCodeBtn.innerHTML = 'Kodu doğrula və qeydiyyatdan keç';
                
                // Clear inputs, focus first one
                codeInputs.forEach(input => {
                    input.value = '';
                });
                codeInputs[0].focus();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            verifyCodeBtn.disabled = false;
            verifyCodeBtn.innerHTML = 'Kodu doğrula və qeydiyyatdan keç';
            showNotification('error', 'Server xətası: ' + error.message);
        });
    });
    
    // Back button
    backBtn.addEventListener('click', function() {
        switchToSection('registration');
    });
    
    // Resend code
    resendCodeBtn.addEventListener('click', function() {
        if (resendCodeBtn.disabled) return;
        
        // Return to registration section
        switchToSection('registration');
        
        // Trigger send code button after a short delay
        setTimeout(() => {
            sendCodeBtn.click();
        }, 600);
    });
    
    // Timer for resend code
    let resendTimer;
    function startResendTimer() {
        // Clear previous timer
        if (resendTimer) {
            clearInterval(resendTimer);
        }
        
        // Set timer for 90 seconds
        let secondsLeft = 90;
        resendCodeBtn.disabled = true;
        
        function updateTimer() {
            const minutes = Math.floor(secondsLeft / 60);
            const seconds = secondsLeft % 60;
            timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        // Initial display
        updateTimer();
        
        // Start countdown
        resendTimer = setInterval(function() {
            secondsLeft--;
            updateTimer();
            
            if (secondsLeft <= 0) {
                clearInterval(resendTimer);
                resendCodeBtn.disabled = false;
            }
        }, 1000);
    }
    
    // Handle form submission (prevent default)
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        // The form is submitted via fetch in the verify code function
    });
    
    // User tipi ətraflı görünməsi üçün
    const userTypeNames = document.querySelectorAll('.user-type-name');
    userTypeNames.forEach(function(element) {
        // Əmin ol ki, heç bir halda mətn bölünməsin
        element.style.whiteSpace = 'nowrap';
        element.style.overflow = 'hidden';
        element.style.textOverflow = 'ellipsis';
    });
    
    // ülkə seçim düzəlişləri
    function adjustCountryDropdown() {
        const countryList = document.querySelector('.iti__country-list');
        if (countryList) {
            countryList.style.backgroundColor = 'rgba(15, 25, 40, 0.95)';
            countryList.style.maxHeight = '300px';
            countryList.style.border = '1px solid rgba(77, 240, 255, 0.3)';
            countryList.style.borderRadius = '10px';
            
            const countries = countryList.querySelectorAll('.iti__country');
            countries.forEach(country => {
                country.style.color = 'white';
                const countryName = country.querySelector('.iti__country-name');
                const dialCode = country.querySelector('.iti__dial-code');
                
                if (countryName) countryName.style.color = 'rgba(255, 255, 255, 0.9)';
                if (dialCode) dialCode.style.color = 'rgba(255, 255, 255, 0.9)';
            });
        }
    }
    
    // Telefon input-da fokus olduqda ölkə dropdown-u düzəlt
    phoneInputField.addEventListener('focus', function() {
        setTimeout(adjustCountryDropdown, 100);
    });
    
    // İlk yükləmədə də düzəltməyi yoxla
    setTimeout(adjustCountryDropdown, 500);
    
    // Responsive form layout
    function adjustFormLayout() {
        const viewport = window.innerHeight;
        const container = document.querySelector('.auth-container');
        
        if (container) {
            // Maintain fixed distance from top (header) regardless of screen size
            if (viewport < 600) {
                container.style.margin = '100px auto 30px'; // Fixed top margin at 100px
            } else if (viewport < 800) {
                container.style.margin = '100px auto 40px'; // Fixed top margin at 100px
            } else {
                container.style.margin = '100px auto 70px'; // Fixed top margin at 100px
            }
            
            // Ensure icons are positioned correctly
            const icons = document.querySelectorAll('.input-with-icon i');
            icons.forEach(function(icon) {
                icon.style.position = 'absolute';
                icon.style.left = '15px';
                icon.style.top = '50%';
                icon.style.transform = 'translateY(-50%)';
            });
        }
    }
    
    // İlkin və resize zamanı düzəlişlər
    window.addEventListener('resize', adjustFormLayout);
    adjustFormLayout();
    
    // Gizlət loading indicator-u
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
});