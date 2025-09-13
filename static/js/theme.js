// Theme management
(function() {
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;
    
    // Initialize theme from localStorage or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    
    // Theme toggle functionality
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = html.classList.contains('dark') ? 'dark' : 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
        });
    }
    
    function setTheme(theme) {
        if (theme === 'dark') {
            html.classList.add('dark');
            updateThemeIcons(true);
        } else {
            html.classList.remove('dark');
            updateThemeIcons(false);
        }
        localStorage.setItem('theme', theme);
    }
    
    function updateThemeIcons(isDark) {
        const lightIcons = document.querySelectorAll('.theme-icon-light');
        const darkIcons = document.querySelectorAll('.theme-icon-dark');
        
        lightIcons.forEach(icon => {
            icon.style.display = isDark ? 'none' : 'inline';
        });
        
        darkIcons.forEach(icon => {
            icon.style.display = isDark ? 'inline' : 'none';
        });
    }
    
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
})();