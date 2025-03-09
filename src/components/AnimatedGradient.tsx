
import { useEffect, useRef } from "react";

interface AnimatedGradientProps {
  className?: string;
}

export function AnimatedGradient({ className = "" }: AnimatedGradientProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Gradient colors
    const colors = [
      { r: 19, g: 21, b: 32 },     // Very dark blue (background)
      { r: 74, g: 123, b: 247 },   // Light blue accent
      { r: 54, g: 226, b: 221 },   // Bright teal accent
      { r: 30, g: 33, b: 48 },     // Dark blue medium
    ];

    // Create gradient particles
    const particles: any[] = [];
    const particleCount = 20;
    
    for (let i = 0; i < particleCount; i++) {
      const colorIndex = Math.floor(Math.random() * colors.length);
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 300 + 100,
        color: colors[colorIndex],
        speedX: Math.random() * 0.2 - 0.1,
        speedY: Math.random() * 0.2 - 0.1,
        alpha: Math.random() * 0.12
      });
    }

    // Animation
    let animationFrameId: number;
    
    const render = () => {
      // Clear canvas with base color
      ctx.fillStyle = "#131520"; // Dark background
      ctx.fillRect(0, 0, width, height);
      
      // Draw particles
      particles.forEach((particle) => {
        const { x, y, radius, color, alpha } = particle;
        
        // Create radial gradient
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`);
        gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
        
        // Draw gradient
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Boundary check - wrap around edges
        if (particle.x < -radius) particle.x = width + radius;
        if (particle.x > width + radius) particle.x = -radius;
        if (particle.y < -radius) particle.y = height + radius;
        if (particle.y > height + radius) particle.y = -radius;
      });
      
      animationFrameId = requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed top-0 left-0 w-full h-full -z-10 ${className}`}
    />
  );
}
