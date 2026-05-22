export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="relative">
        {/* Outer ring */}
        <div className="h-16 w-16 rounded-full border-2 border-primary/20 animate-[spin_3s_linear_infinite]" />
        {/* Inner ring */}
        <div className="absolute inset-2 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        {/* Center logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-primary text-lg font-bold italic">V</span>
        </div>
      </div>
    </div>
  )
}
