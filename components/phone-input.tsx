'use client'

import { useState, useCallback } from 'react'
import { validatePhone } from '@/lib/validation'
import { Icon } from './icon'
import { GInput } from './ui-kit'

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  error?: string
  onValidChange?: (isValid: boolean) => void
}

export function PhoneInput({ value, onChange, error, onValidChange }: PhoneInputProps) {
  const [isValid, setIsValid] = useState(false)

  const formatPhoneNumber = (input: string): string => {
    // Remove all non-digits
    let digitsOnly = input.replace(/\D/g, '')
    
    // Limit to exactly 10 digits (after +880 conversion)
    // If user enters 880XXXXXXXXXX, keep it. Otherwise, add 880 prefix
    if (digitsOnly.startsWith('880')) {
      // Already has country code, limit to 12 digits total
      digitsOnly = digitsOnly.slice(0, 12)
    } else if (digitsOnly.startsWith('0')) {
      // Bangladesh domestic format (0XXXXXXXXX), convert to 880XXXXXXXXX and limit
      digitsOnly = '880' + digitsOnly.slice(1, 11) // 880 + 10 digits
    } else {
      // Just digits, add 880 prefix and limit to 10 digits
      digitsOnly = '880' + digitsOnly.slice(0, 10)
    }
    
    // Format for display: +8801744298642 (continuous format)
    return digitsOnly ? `+${digitsOnly}` : ''
  }

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value
    
    // Prevent deletion of +880 prefix
    if (inputValue.length < value.length && !inputValue.startsWith('+880')) {
      // User tried to delete the prefix, restore the full value
      return
    }
    
    const formatted = formatPhoneNumber(inputValue)
    onChange(formatted)
    
    // Validate
    const validation = validatePhone(formatted)
    setIsValid(validation.valid)
    onValidChange?.(validation.valid)
  }, [onChange, onValidChange, value])

  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">Phone Number</label>
      <div className="relative">
        <GInput
          type="tel"
          value={value}
          onChange={handleChange}
          placeholder="+8801744298642"
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
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
