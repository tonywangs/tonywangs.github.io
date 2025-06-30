function setTime() {
    var text2 = document.getElementById("time");
    var now = new Date();
    var options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' };
    text2.innerHTML = now.toLocaleDateString('en-US', options).toLowerCase().replace(/,/g, '');
}

// Matrix effect for terminal aesthetic
function createMatrixEffect() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    canvas.style.opacity = '0.05';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const cols = Math.floor(width / 20);
    const ypos = Array(cols).fill(0);

    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);

    function matrix() {
        ctx.fillStyle = '#0001';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#64ffda';
        ctx.font = '15pt monospace';

        ypos.forEach((y, ind) => {
            const text = String.fromCharCode(Math.random() * 128);
            const x = ind * 20;
            ctx.fillText(text, x, y);
            if (y > 100 + Math.random() * 10000) ypos[ind] = 0;
            else ypos[ind] = y + 20;
        });
    }

    setInterval(matrix, 50);
    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, width, height);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // Create matrix effect
    createMatrixEffect();

    // Handle menu buttons
    const menuBtns = document.querySelectorAll('.menu-btn');
      
    menuBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const menuContent = this.nextElementSibling;
            if (menuContent) {
                menuContent.style.display = menuContent.style.display === 'block' ? 'none' : 'block';
            }
            
            const menu = this.closest('.menu');
            if (menu) {
                menu.classList.toggle('toggled');
            }
        });
    });

    // 1. Cache your elements - check if they exist first
    const nameHeader = document.getElementById('nameHeader');
    const nameContent = document.getElementById('nameContent');

    const dateHeader = document.getElementById('dateHeader');
    const dateContent = document.getElementById('dateContent');
  
    const formerlyHeader = document.getElementById('formerlyHeader');
    const formerlyContent = document.getElementById('formerlyContent');
  
    const currentlyHeader = document.getElementById('currentlyHeader');
    const currentlyContent = document.getElementById('currentlyContent');

    const copyright = document.querySelector('.copyright');
  
    // 2. A small helper for scrambling text
    function scrambleHeader(el) {
      if (el) {
        el.style.opacity = '1';
        const fx = new TextScramble(el);
        fx.setText(el.textContent);
      }
    }
  
    // 3. Animate in sequence with optimized timeouts
    let delay = 500; // Reduced initial delay
    
    // Only animate nameHeader if it exists
    if (nameHeader) {
      setTimeout(() => {
        scrambleHeader(nameHeader);
      }, delay);
      delay += 400; // Reduced from 700
    }

    // Only animate nameContent if it exists
    if (nameContent) {
      setTimeout(() => {
        nameContent.style.opacity = '1';
        nameContent.style.transform = 'translateY(0)';
      }, delay);
      delay += 500; // Reduced from 800
    }
    
    // Reveal/Decrypt > date - only if it exists
    if (dateHeader) {
      setTimeout(() => {
        scrambleHeader(dateHeader);
      }, delay);
      delay += 400; // Reduced from 700
    }
  
    // Slide in date content - only if it exists
    if (dateContent) {
      setTimeout(() => {
        dateContent.style.opacity = '1';
        dateContent.style.transform = 'translateY(0)';
      }, delay);
      delay += 500; // Reduced from 800
    }
  
    // Reveal/Decrypt > currently - only if it exists
    if (currentlyHeader) {
      setTimeout(() => {
        scrambleHeader(currentlyHeader);
      }, delay);
      delay += 400; // Reduced from 700
    }
  
    // Slide in currently text - only if it exists
    if (currentlyContent) {
      setTimeout(() => {
        currentlyContent.style.opacity = '1';
        currentlyContent.style.transform = 'translateY(0)';
      }, delay);
      delay += 500; // Reduced from 800
    }
  
    // Reveal/Decrypt > formerly - only if it exists
    if (formerlyHeader) {
      setTimeout(() => {
        scrambleHeader(formerlyHeader);
      }, delay);
      delay += 400; // Reduced from 700
    }
  
    // Slide in formerly text - only if it exists
    if (formerlyContent) {
      setTimeout(() => {
        formerlyContent.style.opacity = '1';
        formerlyContent.style.transform = 'translateY(0)';
      }, delay);
      delay += 500;
    }

    // Scramble in coding header - only if it exists
    const codingHeader = document.getElementById('codingHeader');
    if (codingHeader) {
      setTimeout(() => {
        scrambleHeader(codingHeader);
      }, delay);
      delay += 400;
    }

    // Animate github chart - only if it exists
    const chart = document.getElementById('github-chart');
    if (chart) {
      setTimeout(() => {
        chart.style.opacity = '1';
        chart.style.transform = 'translateY(0)';
      }, delay);
      delay += 500;
    }

    // Animate visitor counter - only if it exists
    const counter = document.getElementById('visitor-counter');
    if (counter) {
      setTimeout(() => {
        counter.style.opacity = '1';
        counter.style.transform = 'translateY(0)';
      }, delay);
      delay += 500; // Reduced from 800
    }

    // Animate reading header and content - only if they exist
    const readingHeader = document.getElementById('readingHeader');
    const goodreadsLine = document.getElementById('goodreadsLine');
    const readingList = document.getElementById('readingList');
    
    if (readingHeader) {
      setTimeout(() => {
        scrambleHeader(readingHeader);
      }, delay);
      delay += 400;
    }
    
    if (goodreadsLine) {
      setTimeout(() => {
        scrambleHeader(goodreadsLine);
      }, delay);
      delay += 400;
    }
    
    if (readingList) {
      setTimeout(() => {
        readingList.style.opacity = '1';
        readingList.style.transform = 'translateY(0)';
      }, delay);
      delay += 500;
    }

    // Animate writing header and content - only if they exist
    const writingHeader = document.getElementById('writingHeader');
    const writingList = document.getElementById('writingList');
    
    if (writingHeader) {
      setTimeout(() => {
        scrambleHeader(writingHeader);
      }, delay);
      delay += 400;
    }
    
    if (writingList) {
      setTimeout(() => {
        writingList.style.opacity = '1';
        writingList.style.transform = 'translateY(0)';
      }, delay);
      delay += 500;
    }

    // Animate projects header and subtitle - only if they exist
    const projectsHeader = document.getElementById('projectsHeader');
    const projectsSubtitle = document.getElementById('projectsSubtitle');
    
    if (projectsHeader) {
      setTimeout(() => {
        scrambleHeader(projectsHeader);
      }, delay);
      delay += 400;
    }
    
    if (projectsSubtitle) {
      setTimeout(() => {
        scrambleHeader(projectsSubtitle);
      }, delay);
      delay += 400;
    }

    // Animate project posts - only if they exist
    const projectPosts = document.querySelectorAll('.project-post');
    if (projectPosts.length > 0) {
      projectPosts.forEach(post => {
        setTimeout(() => {
          post.style.opacity = '1';
          post.style.transform = 'translateY(0)';
        }, delay);
        delay += 300;
      });
    }

    // Keep the pages menu open by default on projects page
    const pagesMenuBtn = Array.from(document.querySelectorAll('.menu-btn')).find(btn => btn.textContent.includes('./pages'));
    if (pagesMenuBtn) {
      const menuContent = pagesMenuBtn.nextElementSibling;
      if (menuContent) {
        menuContent.style.display = 'block';
        pagesMenuBtn.closest('.menu').classList.add('toggled');
      }
    }

    // Always show sidebar after a delay
    setTimeout(() => {
      const sidebar = document.getElementById('sidebar');
      if (sidebar) {
        sidebar.classList.add('visible');
      }
    }, 500); // Show sidebar much faster
    delay += 500;

    // Animate in copyright - only if it exists
    if (copyright) {
      setTimeout(() => {
        copyright.style.opacity = '1';
        copyright.style.transform = 'translateY(0)';
      }, delay);
    }
  
    // 4. Also don't forget to run your time function for the #time element - only if it exists
    const timeElement = document.getElementById('time');
    if (timeElement) {
      setTime();
      setInterval(setTime, 1000);
    }
  });