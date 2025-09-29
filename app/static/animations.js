// Enhanced animations and interactions for Edu+ Admin Panel
document.addEventListener('DOMContentLoaded', function() {
    // Add fade-in animation to main elements
    const mainElements = document.querySelectorAll('.video-section, .students-panel');
    mainElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        element.style.animationDelay = (index * 0.1) + 's';
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 100);
    });

    // Enhanced button ripple effect
    const buttons = document.querySelectorAll('.control-btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = this.querySelector('.btn-ripple');
            if (!ripple) return;
            
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            
            setTimeout(() => {
                ripple.style.width = ripple.style.height = '0';
            }, 300);
        });
    });

    // Smooth hover effects for download links
    const downloadLinks = document.querySelectorAll('.download-link');
    downloadLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-1px)';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Add loading state to buttons
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            if (!this.classList.contains('loading')) {
                this.classList.add('loading');
                setTimeout(() => {
                    this.classList.remove('loading');
                }, 1000);
            }
        });
    });

    // Smooth scroll behavior for any internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add intersection observer for student list animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -20px 0px'
    };

    const listObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateX(0)';
            }
        });
    }, observerOptions);

    // Observe student list items for slide-in effect
    const studentsList = document.getElementById('present');
    if (studentsList) {
        // Monitor for new student additions
        const listObserverForNew = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1 && node.tagName === 'LI') {
                        node.style.opacity = '0';
                        node.style.transform = 'translateX(-20px)';
                        node.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                        
                        setTimeout(() => {
                            node.style.opacity = '1';
                            node.style.transform = 'translateX(0)';
                        }, 50);
                    }
                });
            });
        });
        
        listObserverForNew.observe(studentsList, { childList: true });
    }

    // Add click feedback to all interactive elements
    const interactiveElements = document.querySelectorAll('.control-btn, .download-link');
    interactiveElements.forEach(element => {
        element.addEventListener('mousedown', function() {
            this.style.transform = 'scale(0.98) ' + (this.style.transform || '');
        });
        
        element.addEventListener('mouseup', function() {
            this.style.transform = this.style.transform.replace('scale(0.98)', '').trim();
        });
        
        element.addEventListener('mouseleave', function() {
            this.style.transform = this.style.transform.replace('scale(0.98)', '').trim();
        });
    });

    // Add focus management for accessibility
    buttons.forEach(button => {
        button.addEventListener('focus', function() {
            this.style.outline = '2px solid #4fc3f7';
            this.style.outlineOffset = '2px';
        });
        
        button.addEventListener('blur', function() {
            this.style.outline = 'none';
        });
    });

    // Add keyboard navigation support
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            // Enhanced focus visibility during keyboard navigation
            document.body.classList.add('keyboard-navigation');
        }
    });

    document.addEventListener('mousedown', function() {
        document.body.classList.remove('keyboard-navigation');
    });

    // Smooth appearance for the detection status
    const detectionStatus = document.querySelector('.detection-status');
    if (detectionStatus) {
        detectionStatus.style.opacity = '0';
        detectionStatus.style.transform = 'translateY(10px)';
        detectionStatus.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        setTimeout(() => {
            detectionStatus.style.opacity = '1';
            detectionStatus.style.transform = 'translateY(0)';
        }, 300);
    }

    // Add subtle pulse animation to video container when active
    const videoContainer = document.querySelector('.video-container');
    if (videoContainer) {
        // Add a subtle glow effect when facial recognition is active
        function addActiveGlow() {
            videoContainer.style.boxShadow = '0 0 20px rgba(44, 95, 107, 0.3)';
            videoContainer.style.transition = 'box-shadow 0.3s ease';
        }
        
        function removeActiveGlow() {
            videoContainer.style.boxShadow = 'none';
        }
        
        // These functions can be called by the main facial recognition system
        window.activateVideoGlow = addActiveGlow;
        window.deactivateVideoGlow = removeActiveGlow;
    }

    // Initialize dashboard animations
    console.log('Edu+ Live Attendance Dashboard animations initialized successfully');
    
    // Add header animation
    const header = document.querySelector('.dashboard-header');
    if (header) {
        header.style.opacity = '0';
        header.style.transform = 'translateY(-20px)';
        header.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        
        setTimeout(() => {
            header.style.opacity = '1';
            header.style.transform = 'translateY(0)';
        }, 100);
    }

    // Add custom CSS for keyboard navigation
    const style = document.createElement('style');
    style.textContent = `
        .keyboard-navigation *:focus {
            outline: 2px solid #4fc3f7 !important;
            outline-offset: 2px !important;
        }
    `;
    document.head.appendChild(style);
});

// Utility functions for external facial recognition integration
window.EduPlusUtils = {
    // Function to add a student to the live list
    addStudentToList: function(studentName) {
        const studentsList = document.getElementById('present');
        if (studentsList && studentName) {
            const listItem = document.createElement('li');
            listItem.textContent = studentName + ' marked present';
            studentsList.appendChild(listItem);
        }
    },
    
    // Function to clear the students list
    clearStudentsList: function() {
        const studentsList = document.getElementById('present');
        if (studentsList) {
            studentsList.innerHTML = '';
        }
    },
    
    // Function to update detection status
    updateDetectionStatus: function(message) {
        const statusElement = document.querySelector('.detection-status p');
        if (statusElement && message) {
            statusElement.textContent = message;
        }
    },
    
    // Function to show loading state on buttons
    setButtonLoading: function(buttonId, isLoading) {
        const button = document.getElementById(buttonId);
        if (button) {
            if (isLoading) {
                button.classList.add('loading');
            } else {
                button.classList.remove('loading');
            }
        }
    }
};