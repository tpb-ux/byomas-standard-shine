import { useMemo } from "react";

interface Particle {
  id: number;
  type: 'leaf' | 'glow';
  left: number;
  top: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
}

const FloatingParticles = () => {
  const particles = useMemo<Particle[]>(() => {
    const items: Particle[] = [];
    
    // Generate 8-10 leaves
    for (let i = 0; i < 9; i++) {
      items.push({
        id: i,
        type: 'leaf',
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 4 + Math.random() * 8,
        delay: Math.random() * 8,
        duration: 8 + Math.random() * 7,
        opacity: 0.2 + Math.random() * 0.2,
      });
    }
    
    // Generate 6-8 glows
    for (let i = 9; i < 16; i++) {
      items.push({
        id: i,
        type: 'glow',
        left: Math.random() * 100,
        top: 20 + Math.random() * 60,
        size: 3 + Math.random() * 5,
        delay: Math.random() * 10,
        duration: 6 + Math.random() * 9,
        opacity: 0.3 + Math.random() * 0.3,
      });
    }
    
    return items;
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[5]" aria-hidden="true">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={particle.type === 'leaf' ? 'particle-leaf' : 'particle-glow'}
          style={{
            position: 'absolute',
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        />
      ))}
    </div>
  );
};

export default FloatingParticles;
