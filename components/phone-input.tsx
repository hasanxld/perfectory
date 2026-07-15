'use client'

import { useState, useCallback } from 'react'
import { validatePhone } from '@/lib/validation'
import { Icon } from './icon'

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  error?: string
  onValidChange?: (isValid: boolean) => void
}

export function PhoneInput({ value, onChange, error, onValidChange }: PhoneInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [isValid, setIsValid] = useState(false)

  const formatPhoneNumber = (input: string): string => {
    // Remove all non-digits
    const digitsOnly = input.replace(/\D/g, '')
    
    // Convert to standard format
    let formatted = digitsOnly
    if (digitsOnly.startsWith('880')) {
      formatted = digitsOnly
    } else if (digitsOnly.startsWith('0')) {
      formatted = '880' + digitsOnly.slice(1)
    } else if (digitsOnly.length > 0) {
      formatted = '880' + digitsOnly
    }
    
    // Format for display: +880 XX XXX XXXX
    if (formatted.length >= 3) {
      const part1 = formatted.slice(0, 3)
      const part2 = formatted.slice(3, 5)
      const part3 = formatted.slice(5, 8)
      const part4 = formatted.slice(8, 12)
      
      let display = `+${part1}`
      if (part2) display += ` ${part2}`
      if (part3) display += ` ${part3}`
      if (part4) display += ` ${part4}`
      
      return display
    }
    
    return digitsOnly ? `+${formatted}` : ''
  }

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const formatted = formatPhoneNumber(inputValue)
    onChange(formatted)
    
    // Validate
    const validation = validatePhone(formatted)
    setIsValid(validation.valid)
    onValidChange?.(validation.valid)
  }, [onChange, onValidChange])

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium">Phone Number</label>
      <div className="relative">
        <input
          type="tel"
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="+880 XX XXX XXXX"
          className="w-full px-3 py-2.5 bg-background border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-1/50 focus:border-brand-1"
          style={{
            borderColor: error ? '#ef4444' : isValid && value ? '#10b981' : isFocused ? '#3b82f6' : 'var(--border)',
          }}
        />
        {isValid && value && (
          <Icon
            name="check-circle-bold"
            size={20}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600"
          />
        )}
        {error && (
          <Icon
            name="x-circle-bold"
            size={20}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500"
          />
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {isValid && value && (
        <p className="text-xs text-green-600 flex items-center gap-1">
          <Icon name="check-circle-bold" size={12} /> Valid phone number
        </p>
      )}
    </div>
  )
}
