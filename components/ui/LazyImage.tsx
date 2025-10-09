import * as React from 'react';
import { useInView } from 'react-intersection-observer';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholderSrc?: string;
  width?: number | string;
  height?: number | string;
  srcSet?: string;
}

const LazyImage: React.FC<LazyImageProps> = ({ 
  src, 
  alt, 
  placeholderSrc = '/awardlogo.png',
  className = '', 
  width,
  height,
  srcSet,
  ...rest
}) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const effectiveSrc = inView ? src : placeholderSrc;

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      <img
        src={effectiveSrc}
        alt={alt}
        width={width}
        height={height}
        srcSet={inView ? srcSet : undefined}
        className={`transition-opacity duration-500 w-full h-full object-cover ${
          isLoaded && inView ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setIsLoaded(true)}
        loading="lazy"
        {...rest}
      />
      {(!isLoaded || !inView) && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          {/* Optional: You can have a placeholder icon here */}
        </div>
      )}
    </div>
  );
};

export default LazyImage;