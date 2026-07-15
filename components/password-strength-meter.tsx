'use client'

import { PasswordStrength, getPasswordStrengthColor } from '@/lib/validation'
import { Icon } from './icon'

export function PasswordStrengthMeter({ strength }: { strength: PasswordStrength }) {
  if (strength.score === 0) return null

  const color = getPasswordStrengthColor(strength.level)

  return (
    <div className="mt-3 space-y-2">
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-300 rounded-full"
            style={{
              width: `${strength.score}%`,
              backgroundColor: color,
            }}
          />
        </div>
        <span
          className="text-xs font-medium whitespace-nowrap"
          style={{ color }}
        >
          {strength.level.charAt(0).toUpperCase() + strength.level.slice(1)}
        </span>
      </div>

      {/* Requirements */}
      {strength.feedback.length > 0 && (
        <div className="text-xs space-y-1">
          {strength.feedback.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-muted-foreground">
              <Icon name="circle-bold" size={12} className="text-red-500" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      )}

      {/* Completed requirements */}
      {strength.isValid && (
        <div className="text-xs text-green-600 flex items-center gap-2">
          <Icon name="check-circle-bold" size={12} />
          <span>Password is strong enough</span>
        </div>
      )}
    </div>
  )
}
