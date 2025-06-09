import React from 'react'

interface EconDashLogoProps {
  className?: string
  size?: number
}

const EconDashLogo: React.FC<EconDashLogoProps> = ({
  className = '',
  size = 32
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      width={size}
      height={size}
      className={className}
    >
      <rect width="32" height="32" rx="4" fill="#2563eb"/>
      <path d="M8 20h3v4h-3v-4zm5-6h3v10h-3V14zm5-4h3v14h-3V10zm5-2h3v16h-3V8z" fill="white"/>
      <circle cx="9.5" cy="18.5" r="1.5" fill="#60a5fa"/>
      <circle cx="14.5" cy="12.5" r="1.5" fill="#60a5fa"/>
      <circle cx="19.5" cy="8.5" r="1.5" fill="#60a5fa"/>
      <circle cx="24.5" cy="6.5" r="1.5" fill="#60a5fa"/>
      <path d="M9.5 18.5L14.5 12.5L19.5 8.5L24.5 6.5" stroke="#60a5fa" strokeWidth="1.5" fill="none"/>
    </svg>
  )
}

export default EconDashLogo