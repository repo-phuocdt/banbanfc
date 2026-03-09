'use client'

import Select, { type Props as SelectProps, type GroupBase } from 'react-select'
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form'

interface SelectFieldProps<T extends FieldValues> {
  name: Path<T>
  control: Control<T>
  label?: string
  options: { value: string; label: string }[]
  placeholder?: string
  isClearable?: boolean
  isSearchable?: boolean
  isDisabled?: boolean
  required?: boolean
  error?: string
  menuPortalTarget?: HTMLElement | null
}

const customStyles = {
  control: (base: any, state: any) => ({
    ...base,
    borderRadius: '0.5rem',
    borderColor: state.isFocused ? '#2563EB' : '#d1d5db',
    boxShadow: state.isFocused ? '0 0 0 1px #2563EB' : 'none',
    fontSize: '0.875rem',
    minHeight: '38px',
    '&:hover': { borderColor: state.isFocused ? '#2563EB' : '#9ca3af' },
  }),
  option: (base: any, state: any) => ({
    ...base,
    fontSize: '0.875rem',
    backgroundColor: state.isSelected ? '#2563EB' : state.isFocused ? '#EFF6FF' : 'white',
    color: state.isSelected ? 'white' : '#1f2937',
    '&:active': { backgroundColor: '#DBEAFE' },
  }),
  placeholder: (base: any) => ({ ...base, color: '#9ca3af', fontSize: '0.875rem' }),
  singleValue: (base: any) => ({ ...base, fontSize: '0.875rem' }),
  menu: (base: any) => ({ ...base, borderRadius: '0.5rem', overflow: 'hidden', zIndex: 50 }),
  menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
}

export function SelectField<T extends FieldValues>({
  name, control, label, options, placeholder = 'Chọn...', isClearable = false,
  isSearchable = true, isDisabled = false, required = false, error, menuPortalTarget,
}: SelectFieldProps<T>) {
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
          <Select
            options={options}
            value={options.find(o => o.value === field.value) || null}
            onChange={opt => field.onChange(opt?.value ?? '')}
            placeholder={placeholder}
            isClearable={isClearable}
            isSearchable={isSearchable}
            isDisabled={isDisabled}
            styles={customStyles}
            menuPortalTarget={menuPortalTarget}
            noOptionsMessage={() => 'Không có kết quả'}
          />
        )}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

/* Standalone select (no RHF) */
export function StandaloneSelect({
  value, onChange, options, placeholder = 'Chọn...', isClearable = false,
  isSearchable = false, isDisabled = false,
}: {
  value: string
  onChange: (val: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
  isClearable?: boolean
  isSearchable?: boolean
  isDisabled?: boolean
}) {
  return (
    <Select
      options={options}
      value={options.find(o => o.value === value) || null}
      onChange={opt => onChange(opt?.value ?? '')}
      placeholder={placeholder}
      isClearable={isClearable}
      isSearchable={isSearchable}
      isDisabled={isDisabled}
      styles={customStyles}
      noOptionsMessage={() => 'Không có kết quả'}
    />
  )
}
