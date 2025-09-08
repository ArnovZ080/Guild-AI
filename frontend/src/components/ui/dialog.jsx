import * as React from "react"
import { cn } from "../../lib/utils.js"

const Dialog = ({ children, open, onOpenChange, ...props }) => {
  // If open is false, don't render anything
  if (!open) {
    return null;
  }
  
  return (
    <div {...props}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { onOpenChange });
        }
        return child;
      })}
    </div>
  );
}

const DialogTrigger = React.forwardRef(({ className, asChild = false, ...props }, ref) => {
  if (asChild) {
    return React.cloneElement(props.children, { ref, ...props })
  }
  return <button ref={ref} className={className} {...props} />
})
DialogTrigger.displayName = "DialogTrigger"

const DialogContent = React.forwardRef(({ className, children, onOpenChange, ...props }, ref) => {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && onOpenChange) {
      onOpenChange(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && onOpenChange) {
      onOpenChange(false);
    }
  };

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onOpenChange]);

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black/50" 
        onClick={handleBackdropClick}
      />
      {/* Content */}
      <div
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg duration-200 sm:rounded-lg",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </>
  );
})
DialogContent.displayName = "DialogContent"

const DialogHeader = ({ className, ...props }) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = "DialogDescription"

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
}