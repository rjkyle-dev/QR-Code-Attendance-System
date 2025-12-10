import { useEffect, useState } from "react";

const QRCodeVisual = () => {
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setScanProgress((prev) => (prev >= 100 ? 0 : prev + 1));
    }, 30);
    return () => clearInterval(interval);
  }, []);

  // Generate QR code pattern
  const generatePattern = () => {
    const pattern = [];
    const size = 9;
    
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        // Corner patterns
        const isCorner = 
          (i < 3 && j < 3) || 
          (i < 3 && j >= size - 3) || 
          (i >= size - 3 && j < 3);
        
        // Random data pattern for middle area
        const isData = !isCorner && Math.random() > 0.5;
        
        if (isCorner || isData) {
          pattern.push({ x: j, y: i, isCorner });
        }
      }
    }
    return pattern;
  };

  const [pattern] = useState(generatePattern);

  return (
    <div className="relative w-64 h-64 md:w-80 md:h-80">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-glow animate-pulse-glow rounded-3xl" />
      
      {/* QR Code container */}
      <div className="relative w-full h-full bg-card/50 backdrop-blur-xl rounded-3xl border border-border p-6 shadow-card">
        {/* QR Code grid */}
        <div className="relative w-full h-full">
          <svg viewBox="0 0 9 9" className="w-full h-full">
            {pattern.map((cell, i) => (
              <rect
                key={i}
                x={cell.x}
                y={cell.y}
                width={0.85}
                height={0.85}
                rx={0.1}
                className={`${
                  cell.isCorner 
                    ? "fill-primary" 
                    : "fill-foreground/80"
                } transition-all duration-300`}
                style={{
                  animationDelay: `${i * 0.02}s`,
                }}
              />
            ))}
          </svg>
          
          {/* Scan line */}
          <div 
            className="absolute left-0 right-0 h-1 bg-gradient-primary rounded-full shadow-glow"
            style={{
              top: `${scanProgress}%`,
              opacity: scanProgress > 0 && scanProgress < 100 ? 1 : 0,
              transition: scanProgress === 0 ? 'none' : 'top 0.03s linear',
            }}
          />
        </div>
        
        {/* Corner accents */}
        <div className="absolute top-4 left-4 w-4 h-4 border-l-2 border-t-2 border-primary rounded-tl-lg" />
        <div className="absolute top-4 right-4 w-4 h-4 border-r-2 border-t-2 border-primary rounded-tr-lg" />
        <div className="absolute bottom-4 left-4 w-4 h-4 border-l-2 border-b-2 border-primary rounded-bl-lg" />
        <div className="absolute bottom-4 right-4 w-4 h-4 border-r-2 border-b-2 border-primary rounded-br-lg" />
      </div>
      
      {/* Floating particles */}
      <div className="absolute -top-4 -right-4 w-3 h-3 bg-primary/60 rounded-full animate-float" />
      <div className="absolute -bottom-2 -left-6 w-2 h-2 bg-primary/40 rounded-full animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 -right-8 w-2 h-2 bg-primary/50 rounded-full animate-float" style={{ animationDelay: '2s' }} />
    </div>
  );
};

export default QRCodeVisual;
