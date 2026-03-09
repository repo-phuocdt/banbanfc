'use client'

import DatePicker, { registerLocale } from 'react-datepicker'
import { vi } from 'date-fns/locale'
import 'react-datepicker/dist/react-datepicker.css'
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form'

registerLocale('vi', vi)

interface DatePickerFieldProps<T extends FieldValues> {
  name: Path<T>
  control: Control<T>
  label?: string
  placeholder?: string
  required?: boolean
  error?: string
}

export function DatePickerField<T extends FieldValues>({
  name, control, label, placeholder = 'Chọn ngày...', required = false, error,
}: DatePickerFieldProps<T>) {
  return (
    <div>
      {label && (
        <label className="mb-1 block text-sm font-medium">
          {label} {required && '*'}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <DatePicker
            selected={field.value ? new Date(field.value) : null}
            onChange={(date: Date | null) => {
              field.onChange(date ? date.toISOString().split('T')[0] : '')
            }}
            dateFormat="dd/MM/yyyy"
            locale="vi"
            placeholderText={placeholder}
            isClearable
          />
        )}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

/* Standalone date picker (no RHF) */
export function StandaloneDatePicker({
  value, onChange, placeholder = 'Chọn ngày...',
}: {
  value: string
  onChange: (val: string) => void
  placeholder?: string
}) {
  return (
    <DatePicker
      selected={value ? new Date(value) : null}
      onChange={(date: Date | null) => {
        onChange(date ? date.toISOString().split('T')[0] : '')
      }}
      dateFormat="dd/MM/yyyy"
      locale="vi"
      placeholderText={placeholder}
      isClearable
    />
  )
}
