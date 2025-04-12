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

    // 1. Cache your elements
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
      el.style.opacity = '1';
      const fx = new TextScramble(el);
      fx.setText(el.textContent);
    }
  
    // 3. Animate in sequence with optimized timeouts
    let delay = 500; // Reduced initial delay
    
    setTimeout(() => {
      scrambleHeader(nameHeader);
    }, delay);
    delay += 400; // Reduced from 700

    setTimeout(() => {
      nameContent.style.opacity = '1';
      nameContent.style.transform = 'translateY(0)';
    }, delay);
    delay += 500; // Reduced from 800
    
    // Reveal/Decrypt > date
    setTimeout(() => {
      scrambleHeader(dateHeader);
    }, delay);
    delay += 400; // Reduced from 700
  
    // Slide in date content
    setTimeout(() => {
      dateContent.style.opacity = '1';
      dateContent.style.transform = 'translateY(0)';
    }, delay);
    delay += 500; // Reduced from 800
  
    // Reveal/Decrypt > formerly
    setTimeout(() => {
      scrambleHeader(formerlyHeader);
    }, delay);
    delay += 400; // Reduced from 700
  
    // Slide in formerly text
    setTimeout(() => {
      formerlyContent.style.opacity = '1';
      formerlyContent.style.transform = 'translateY(0)';
    }, delay);
    delay += 500; // Reduced from 800
  
    // Reveal/Decrypt > currently
    setTimeout(() => {
      scrambleHeader(currentlyHeader);
    }, delay);
    delay += 400; // Reduced from 700
  
    // Slide in currently text
    setTimeout(() => {
      currentlyContent.style.opacity = '1';
      currentlyContent.style.transform = 'translateY(0)';
    }, delay);
    delay += 500;

    // Scramble in coding header
    setTimeout(() => {
      scrambleHeader(document.getElementById('codingHeader'));
    }, delay);
    delay += 400;

    setTimeout(() => {
      const chart = document.getElementById('github-chart');
      chart.style.opacity = '1';
      chart.style.transform = 'translateY(0)';
    }, delay);
    delay += 500;

    setTimeout(() => {
      const counter = document.getElementById('visitor-counter');
      counter.style.opacity = '1';
      counter.style.transform = 'translateY(0)';
    }, delay);
    delay += 500; // Reduced from 800

    setTimeout(() => {
      const sidebar = document.getElementById('sidebar');
      sidebar.classList.add('visible');
    }, delay);
    delay += 500;

    // Animate in copyright
    setTimeout(() => {
      copyright.style.opacity = '1';
      copyright.style.transform = 'translateY(0)';
    }, delay);
  
    // 4. Also don't forget to run your time function for the #time element
    setTime();
    setInterval(setTime, 1000);
  });