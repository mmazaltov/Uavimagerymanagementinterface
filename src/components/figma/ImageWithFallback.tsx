import image_f58c2b45316a5aad7e54e39df8fbcfd03b464f7a from 'figma:asset/f58c2b45316a5aad7e54e39df8fbcfd03b464f7a.png';
import React, { useEffect, useState, forwardRef } from 'react'

const ERROR_IMG_SRC =
  image_f58c2b45316a5aad7e54e39df8fbcfd03b464f7a

type ImageWithFallbackProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  fallbackSrc?: string;
  fallbackSrcSet?: string;
};

export const ImageWithFallback = forwardRef<HTMLImageElement, ImageWithFallbackProps>((props, ref) => {
  const [didError, setDidError] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(props.src)
  const [currentSrcSet, setCurrentSrcSet] = useState(props.srcSet)

  const handleError = () => {
    if (props.fallbackSrc && currentSrc !== props.fallbackSrc) {
      setCurrentSrc(props.fallbackSrc)
      setCurrentSrcSet(props.fallbackSrcSet)
      return
    }
    setDidError(true)
  }

  const { src, alt, style, className, fallbackSrc, fallbackSrcSet, ...rest } = props

  useEffect(() => {
    setDidError(false)
    setCurrentSrc(src)
    setCurrentSrcSet(props.srcSet)
  }, [src, props.srcSet])

  return didError ? (
    <div
      className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
      style={style}
    >
      <div className="flex items-center justify-center w-full h-full">
        <img ref={ref} src={ERROR_IMG_SRC} alt="Error loading image" {...rest} data-original-url={src} />
      </div>
    </div>
  ) : (
    <img
      ref={ref}
      src={currentSrc}
      srcSet={currentSrcSet}
      alt={alt}
      className={className}
      style={style}
      {...rest}
      onError={handleError}
    />
  )
})
