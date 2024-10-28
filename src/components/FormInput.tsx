import React from 'react';

interface FormInputProps {
  label: string;
  type: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  placeholder: string;
  required?: boolean;
}

export default function FormInput({ 
  label, 
  type, 
  name,
  value,
  onChange,
  placeholder, 
  required 
}: FormInputProps) {
  return (
    <div>
      <label className="block text-[#b5bac1] text-sm font-medium mb-2">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        required={required}
        className="w-full px-3 py-2 bg-[#1e1f22] text-white rounded border border-[#1e1f22] focus:border-[#5865f2] focus:ring-1 focus:ring-[#5865f2] outline-none transition"
        placeholder={placeholder}
      />
    </div>
  );
}