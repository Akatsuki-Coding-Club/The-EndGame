import React, { useState, useEffect } from 'react';

const HEROES = [
  {
    id: 'dr-strange',
    src: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExbTlobGt4enltcmE5ZHcxaG5kdW5mMHJ1Y2Vpa3dueHM5bGhqamlrMiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/iVS4wrp1XT3BqUAQjo/giphy.gif',
    animation: 'fly-across', 
    duration: 5000, 
    baseWidth: '150px'
  },
  {
    id: 'thor-hammer',
    src: 'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExdHE4c25hbG1qeDNvMzk0MzlhbXJ2enBjcWtiZ3h5M2RxOHZwd2NybSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/U4AWLHWyhJUF217brs/giphy.gif',
    animation: 'fade-float', 
    duration: 8000,
    baseWidth: '180px'
  },
  {
    id: 'spidey-corner',
    src: 'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExczJ4MzA5bXFqd3B3Y3dvOGFydWRxMzR3cHJjYm9hb3o2MGY1cnh5cCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/vKhKsyEFVK4IuEKzWY/giphy.gif',
    animation: 'corner-drop', 
    duration: 5000, 
    baseWidth: '140px'
  },
  // --- NEW GIFS ADDED BELOW ---
  {
    id: 'Spider-man-trio',
    src: 'https://media.tenor.com/bWnCK.gif', 
    animation: 'fade-float', // You can change this to fly-across or drop-swing
    duration: 6000, 
    baseWidth: '160px'
  },
  {
    id: 'Spider-man',
    src: 'https://media.tenor.com/bTTJi.gif', 
    animation: 'fly-across', 
    duration: 5000, 
    baseWidth: '150px'
  },
  {
    id: 'Wanda',
    src: 'https://media.tenor.com/bWnCF.gif', 
    animation: 'corner-drop', 
    duration: 5000, 
    baseWidth: '140px'
  }
];

const HeroManager = () => {
  const [activeHero, setActiveHero] = useState(null);
  const [positionStyle, setPositionStyle] = useState({});
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Helper Functions
  const random = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
  const coinFlip = () => Math.random() > 0.5;

  const getSafePosition = (animation, width) => {
    let style = { top: 'auto', bottom: 'auto', left: 'auto', right: 'auto', width };
    switch (animation) {
      case 'corner-drop':
        style.top = '12%';   
        style.right = '2%';  
        return style;
      case 'roll-left-to-right':
        style.bottom = '10px';
        style.left = '-200px'; 
        return style;
      case 'roll-right-to-left':
        style.bottom = '10px';
        style.left = '100vw'; 
        return style;
      case 'fly-across':
        style.left = '0'; 
        style.top = coinFlip() ? `${random(15, 35)}%` : 'auto';
        style.bottom = style.top === 'auto' ? `${random(5, 25)}%` : 'auto';
        return style;
      case 'drop-swing':
        style.top = '-20px';
        if (coinFlip()) style.left = `${random(2, 15)}%`; else style.right = `${random(2, 15)}%`;
        return style;
      case 'fly-up':
        style.bottom = '-20%';
        if (coinFlip()) style.left = `${random(5, 20)}%`; else style.right = `${random(5, 20)}%`;
        return style;
      case 'thunder-strike':
        style.bottom = '0';
        if (coinFlip()) style.left = `${random(5, 25)}%`; else style.right = `${random(5, 25)}%`;
        return style;
      case 'fade-float':
      default:
        const vertical = coinFlip() ? 'top' : 'bottom';
        const horizontal = coinFlip() ? 'left' : 'right';
        style[vertical] = vertical === 'top' ? `${random(15, 40)}%` : `${random(10, 30)}%`;
        style[horizontal] = `${random(5, 15)}%`; 
        return style;
    }
  };

  // --- THE STATE MACHINE ---
  useEffect(() => {
    let timerId;

    // STATE 1: COOLDOWN (No Hero)
    // If we have no hero, we wait 30-35s, then pick one.
    if (!activeHero) {
      const cooldown = random(30000, 35000); // 30s - 35s
      timerId = setTimeout(() => {
        // Picks a random hero from the array
        const randomHero = HEROES[Math.floor(Math.random() * HEROES.length)];
        const newPosition = getSafePosition(randomHero.animation, randomHero.baseWidth);
        
        setPositionStyle(newPosition);
        setIsImageLoaded(false); 
        setActiveHero(randomHero);
      }, cooldown);
    } 
    
    // STATE 2: LOADING (Hero selected, but image not loaded yet)
    else if (activeHero && !isImageLoaded) {
        timerId = setTimeout(() => {
            // Safety fallback: if image takes > 5s, give up and reset
            setActiveHero(null);
        }, 5000);
    }

    // STATE 3: ACTIVE (Hero selected AND Image loaded)
    else if (activeHero && isImageLoaded) {
      timerId = setTimeout(() => {
        // Animation finished, go back to State 1
        setActiveHero(null);
        setIsImageLoaded(false); 
      }, activeHero.duration);
    }

    // Cleanup
    return () => clearTimeout(timerId);

  }, [activeHero, isImageLoaded]); 

  if (!activeHero) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[100]">
      <img
        key={activeHero.id} 
        src={activeHero.src}
        alt="Hero Event"
        onLoad={() => setIsImageLoaded(true)}
        className={`absolute object-contain 
          ${activeHero.id.includes('cap-shield') ? '' : 'mix-blend-screen'} 
          ${activeHero.animation}`}
        style={{
            ...positionStyle,
            opacity: isImageLoaded ? (activeHero.id.includes('cap-shield') ? 1 : 0.8) : 0,
            transition: 'opacity 0.2s ease-in'
        }}
      />
    </div>
  );
};

export default HeroManager;