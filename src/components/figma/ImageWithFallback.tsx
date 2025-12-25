import image_f58c2b45316a5aad7e54e39df8fbcfd03b464f7a from 'figma:asset/f58c2b45316a5aad7e54e39df8fbcfd03b464f7a.png';
import React, { useState, forwardRef } from 'react'

const ERROR_IMG_SRC =
  image_f58c2b45316a5aad7e54e39df8fbcfd03b464f7a

export const ImageWithFallback = forwardRef<HTMLImageElement, React.ImgHTMLAttributes<HTMLImageElement>>((props, ref) => {
  const [didError, setDidError] = useState(false)

  const handleError = () => {
    setDidError(true)
  }

  const { src, alt, style, className, ...rest } = props

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
    <img ref={ref} src={src} alt={alt} className={className} style={style} {...rest} onError={handleError} />
  )
})
