import { useEffect } from 'react';

export function MoodParticles() {
  useEffect(() => {
    const container = document.querySelector('.mood-particles-dynamic');
    if (!container) return;

    const colors = [
      'var(--mood-happy)',
      'var(--mood-calm)',
      'var(--mood-motivated)',
      'var(--mood-curious)',
      'var(--mood-grateful)'
    ];

    // Create additional floating particles dynamically
    for (let i = 0; i < 8; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle opacity-10';
      particle.style.cssText = `
        width: ${Math.random() * 4 + 1}px;
        height: ${Math.random() * 4 + 1}px;
        background-color: ${colors[Math.floor(Math.random() * colors.length)]};
        top: ${Math.random() * 100}%;
        left: ${Math.random() * 100}%;
        animation-delay: ${Math.random() * 6}s;
      `;
      container.appendChild(particle);
    }

    return () => {
      // Cleanup
      container.innerHTML = '';
    };
  }, []);

  return (
    <div className="mood-particles">
      <div className="mood-particles-dynamic"></div>
      {/* Static particles from design */}
      <div className="particle w-2 h-2 bg-mood-happy opacity-20" style={{top: '10%', left: '10%', animationDelay: '0s'}}></div>
      <div className="particle w-3 h-3 bg-mood-calm opacity-15" style={{top: '20%', left: '80%', animationDelay: '1s'}}></div>
      <div className="particle w-1 h-1 bg-mood-motivated opacity-25" style={{top: '60%', left: '15%', animationDelay: '2s'}}></div>
      <div className="particle w-2 h-2 bg-mood-curious opacity-20" style={{top: '80%', left: '70%', animationDelay: '3s'}}></div>
      <div className="particle w-1 h-1 bg-mood-grateful opacity-30" style={{top: '40%', left: '60%', animationDelay: '4s'}}></div>
    </div>
  );
}
