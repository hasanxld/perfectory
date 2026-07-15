// Email validation - Gmail only or advanced validation
export function validateEmail(email: string): { valid: boolean; error?: string } {
  const trimmedEmail = email.trim().toLowerCase()
  
  // Basic format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(trimmedEmail)) {
    return { valid: false, error: 'Invalid email format' }
  }
  
  // Gmail only validation
  if (!trimmedEmail.endsWith('@gmail.com')) {
    return { valid: false, error: 'Please use a Gmail address (@gmail.com)' }
  }
  
  // Gmail username validation (must be 6-30 chars, alphanumeric + dots/underscores/dashes)
  const gmailUsername = trimmedEmail.split('@')[0]
  if (gmailUsername.length < 6 || gmailUsername.length > 30) {
    return { valid: false, error: 'Gmail username must be 6-30 characters' }
  }
  
  if (!/^[a-z0-9._-]+$/.test(gmailUsername)) {
    return { valid: false, error: 'Gmail username can only contain letters, numbers, dots, dashes, and underscores' }
  }
  
  return { valid: true }
}

// Phone validation - Bangladesh format with +880
export function validatePhone(phone: string): { valid: boolean; error?: string; formatted?: string } {
  const digitsOnly = phone.replace(/\D/g, '')
  
  // Check if starts with 880 (country code) or just the local part
  let finalNumber = digitsOnly
  if (digitsOnly.startsWith('880')) {
    finalNumber = digitsOnly
  } else if (digitsOnly.startsWith('0')) {
    finalNumber = '880' + digitsOnly.slice(1)
  } else {
    finalNumber = '880' + digitsOnly
  }
  
  // Bangladesh numbers should have 12 digits total (880 + 10 digit local)
  if (finalNumber.length !== 12) {
    return { valid: false, error: 'Bangladesh phone number must be 10 digits' }
  }
  
  if (!finalNumber.startsWith('880')) {
    return { valid: false, error: 'Phone number must start with +880' }
  }
  
  // Valid operator prefixes in Bangladesh (1, 3, 4, 5, 6, 7, 8, 9)
  const operatorDigit = finalNumber[3]
  if (!/^[13456789]/.test(operatorDigit)) {
    return { valid: false, error: 'Invalid phone number format' }
  }
  
  const formatted = `+${finalNumber.slice(0, 3)} ${finalNumber.slice(3, 5)} ${finalNumber.slice(5, 8)} ${finalNumber.slice(8)}`
  return { valid: true, formatted }
}

// Password validation with strength meter
export interface PasswordStrength {
  score: number // 0-100
  level: 'weak' | 'fair' | 'good' | 'strong'
  feedback: string[]
  isValid: boolean
}

export function validatePassword(password: string): PasswordStrength {
  const feedback: string[] = []
  let score = 0
  
  if (password.length === 0) {
    return { score: 0, level: 'weak', feedback: ['Password is required'], isValid: false }
  }
  
  // Length checks
  if (password.length >= 8) score += 20
  else feedback.push('At least 8 characters')
  
  if (password.length >= 12) score += 10
  if (password.length >= 16) score += 10
  
  // Character type checks
  if (/[a-z]/.test(password)) score += 15
  else feedback.push('Add lowercase letters')
  
  if (/[A-Z]/.test(password)) score += 15
  else feedback.push('Add uppercase letters')
  
  if (/\d/.test(password)) score += 15
  else feedback.push('Add numbers')
  
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 15
  else feedback.push('Add special characters (!@#$%^&*)')
  
  // Determine level
  let level: PasswordStrength['level'] = 'weak'
  if (score >= 70) level = 'strong'
  else if (score >= 50) level = 'good'
  else if (score >= 30) level = 'fair'
  else level = 'weak'
  
  const isValid = level === 'good' || level === 'strong'
  
  return { score, level, feedback, isValid }
}

// Full name validation
export function validateFullName(name: string): { valid: boolean; error?: string } {
  const trimmed = name.trim()
  
  if (!trimmed) {
    return { valid: false, error: 'Full name is required' }
  }
  
  if (trimmed.length < 2) {
    return { valid: false, error: 'Full name must be at least 2 characters' }
  }
  
  if (trimmed.length > 50) {
    return { valid: false, error: 'Full name must be less than 50 characters' }
  }
  
  // Allow letters, spaces, hyphens, apostrophes
  if (!/^[a-zA-Z\s\-']{2,50}$/.test(trimmed)) {
    return { valid: false, error: 'Full name can only contain letters, spaces, hyphens, and apostrophes' }
  }
  
  return { valid: true }
}

// Generate avatar URL from name
export function generateAvatarUrl(name: string): string {
  const encodedName = encodeURIComponent(name.trim())
  return `https://ui-avatars.com/api/?name=${encodedName}&background=random&color=fff&size=256&bold=true&rounded=true`
}

// Get color based on password strength
export function getPasswordStrengthColor(level: PasswordStrength['level']): string {
  switch (level) {
    case 'strong':
      return '#10b981' // green
    case 'good':
      return '#3b82f6' // blue
    case 'fair':
      return '#f59e0b' // amber
    case 'weak':
      return '#ef4444' // red
    default:
      return '#9ca3af' // gray
  }
}
