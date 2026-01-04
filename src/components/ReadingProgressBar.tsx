import { useEffect, useState } from "react";

export const ReadingProgressBar = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const article = document.querySelector('article');
      if (!article) return;
      
      const articleRect = article.getBoundingClientRect();
      const articleTop = articleRect.top + window.scrollY;
      const articleHeight = articleRect.height;
      const windowHeight = window.innerHeight;
      const scrollY = window.scrollY;
      
      // Calculate how much of the article has been scrolled
      const scrolledIntoArticle = scrollY - articleTop + windowHeight * 0.3;
      const totalScrollableHeight = articleHeight - windowHeight * 0.3;
      
      const readProgress = Math.min(100, Math.max(0, (scrolledIntoArticle / totalScrollableHeight) * 100));
      setProgress(readProgress);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial calculation
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-muted z-50">
      <div 
        className="h-full bg-gradient-to-r from-party-purple via-party-pink to-party-purple transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};
