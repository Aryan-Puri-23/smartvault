import React from "react"

const Card = React.forwardRef(function Card({ className = "", ...props }, ref) {
  return (
    <div
      ref={ref}
      className={`rounded-lg border bg-white text-gray-900 shadow-sm ${className}`}
      {...props}
    />
  )
})

const CardHeader = React.forwardRef(function CardHeader({ className = "", ...props }, ref) {
  return (
    <div
      ref={ref}
      className={`flex flex-col space-y-1.5 p-6 ${className}`}
      {...props}
    />
  )
})

const CardTitle = React.forwardRef(function CardTitle({ className = "", ...props }, ref) {
  return (
    <div
      ref={ref}
      className={`text-2xl font-semibold leading-none tracking-tight ${className}`}
      {...props}
    />
  )
})

const CardDescription = React.forwardRef(function CardDescription({ className = "", ...props }, ref) {
  return (
    <div
      ref={ref}
      className={`text-sm text-gray-500 ${className}`}
      {...props}
    />
  )
})

const CardContent = React.forwardRef(function CardContent({ className = "", ...props }, ref) {
  return (
    <div
      ref={ref}
      className={`p-6 pt-0 ${className}`}
      {...props}
    />
  )
})

const CardFooter = React.forwardRef(function CardFooter({ className = "", ...props }, ref) {
  return (
    <div
      ref={ref}
      className={`flex items-center p-6 pt-0 ${className}`}
      {...props}
    />
  )
})

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
