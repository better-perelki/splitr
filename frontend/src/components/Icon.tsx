interface IconProps {
  name: string
  className?: string
  filled?: boolean
}

export default function Icon({ name, className = '', filled }: IconProps) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
    >
      {name}
    </span>
  )
}
