const fs = require('fs');
const files = [
  'about.html', 'artisans.html', 'masterpiece.html', 
  'products.html', 'search.html', 'state_categories.html', 'states.html'
];

const htmlPayload = `
    <!-- Cinematic Preloader -->
    <div id="preloader" class="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--dark-background-color)] transition-opacity duration-1000">
      <div class="relative flex flex-col items-center">
        <div class="text-[var(--primary-color)] text-3xl font-serif mb-4 animate-[pulse_2s_ease-in-out_infinite]">Parampara</div>
        <div class="w-48 h-[1px] bg-white/20 relative overflow-hidden">
          <div id="preloader-progress" class="absolute top-0 left-0 h-full w-0 bg-[var(--primary-color)] transition-all duration-[2000ms] ease-out"></div>
        </div>
      </div>
    </div>
    
    <!-- Custom Magnetic Cursor -->
    <div id="magnetic-cursor-follower" class="fixed top-0 left-0 w-10 h-10 border border-[var(--primary-color)] rounded-full pointer-events-none z-[9998] transition-transform duration-100 ease-out hidden md:block" style="transform: translate(-50%, -50%);"></div>
    <div id="magnetic-cursor" class="fixed top-0 left-0 w-2 h-2 bg-[var(--primary-color)] rounded-full pointer-events-none z-[9999] transition-transform duration-75 ease-out hidden md:block" style="transform: translate(-50%, -50%);"></div>
`;

const jsPayload = `
        // Preloader Logic
        window.addEventListener('load', () => {
            const preloader = document.getElementById('preloader');
            const progress = document.getElementById('preloader-progress');
            if (progress) { setTimeout(() => { progress.style.width = '100%'; }, 100); }
            if (preloader) {
                setTimeout(() => {
                    preloader.style.opacity = '0';
                    setTimeout(() => { preloader.style.display = 'none'; }, 1000);
                }, 1000);
            }
        });

        // Magnetic Cursor Logic
        const cursor = document.getElementById('magnetic-cursor');
        const follower = document.getElementById('magnetic-cursor-follower');
        
        if (window.innerWidth >= 768) {
            let mouseX = window.innerWidth / 2;
            let mouseY = window.innerHeight / 2;
            let cursorX = mouseX;
            let cursorY = mouseY;
            let followerX = mouseX;
            let followerY = mouseY;
            
            document.addEventListener('mousemove', (e) => {
                mouseX = e.clientX;
                mouseY = e.clientY;
            });
            
            function animateCursor() {
                cursorX += (mouseX - cursorX) * 0.5;
                cursorY += (mouseY - cursorY) * 0.5;
                followerX += (mouseX - followerX) * 0.15;
                followerY += (mouseY - followerY) * 0.15;
                
                if (cursor) cursor.style.transform = \`translate(calc(\${cursorX}px - 50%), calc(\${cursorY}px - 50%))\`;
                if (follower) follower.style.transform = \`translate(calc(\${followerX}px - 50%), calc(\${followerY}px - 50%))\`;
                
                requestAnimationFrame(animateCursor);
            }
            requestAnimationFrame(animateCursor);
            
            const hoverElements = document.querySelectorAll('a, button, .magnetic-item, .product-card');
            hoverElements.forEach((el) => {
                el.addEventListener('mouseenter', () => {
                    if (cursor) cursor.style.opacity = '0';
                    if (follower) {
                        follower.style.transform = \`translate(calc(\${followerX}px - 50%), calc(\${followerY}px - 50%)) scale(1.5)\`;
                        follower.style.backgroundColor = 'rgba(184, 134, 11, 0.1)';
                    }
                });
                el.addEventListener('mouseleave', () => {
                    if (cursor) cursor.style.opacity = '1';
                    if (follower) {
                        follower.style.transform = \`translate(calc(\${followerX}px - 50%), calc(\${followerY}px - 50%)) scale(1)\`;
                        follower.style.backgroundColor = 'transparent';
                    }
                });
            });
        }
`;

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    
    if(!content.includes('id="preloader"')) {
        content = content.replace(/(<body[^>]*>)/i, '$1\\n' + htmlPayload);
    }
    
    if(!content.includes('Magnetic Cursor Logic')) {
        content = content.replace(/<\/body>/i, '<script>\\n' + jsPayload + '\\n</script>\\n</body>');
    }
    fs.writeFileSync(file, content);
    console.log('Updated', file);
});
