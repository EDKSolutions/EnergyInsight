import React, { useState } from 'react';
import { useCalculationEditStore } from '@/store/useCalculationEditStore';

interface EditableFieldProps {
  label: string;
  field: keyof import('@/types/calculation-result-type').CalculationResult;
  value: string;
  className?: string;
  inputType?: 'text' | 'number' | 'textarea';
  placeholder?: string;
}

const EditableField: React.FC<EditableFieldProps> = ({
  label,
  field,
  value,
  className = '',
  inputType = 'text',
  placeholder
}) => {
  const { isEditMode, editableFields, updateField } = useCalculationEditStore();
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  const currentValue = editableFields[field] as string || value;

  const handleEdit = () => {
    if (isEditMode) {
      setIsEditing(true);
      setLocalValue(currentValue);
    }
  };

  const handleSave = () => {
    updateField(field, localValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLocalValue(currentValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditMode && isEditing) {
    return (
      <div className={`flex gap-2 items-center justify-between ${className}`}>
        <span className="text-sm font-semibold text-gray-500 dark:text-gray-200">
          {label}:
        </span>
        <div className="flex items-center gap-2">
          {inputType === 'textarea' ? (
            <textarea
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              placeholder={placeholder}
              className="text-gray-900 text-sm dark:text-gray-100 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
          ) : (
            <input
              type={inputType}
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              placeholder={placeholder}
              className="text-gray-900 text-sm dark:text-gray-100 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
          <button
            onClick={handleSave}
            className="text-green-600 hover:text-green-700 p-1"
            title="Save"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
          </button>
          <button
            onClick={handleCancel}
            className="text-red-600 hover:text-red-700 p-1"
            title="Cancel"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`flex gap-2 items-center justify-between ${className} ${isEditMode ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded px-2 py-1 transition-colors' : ''}`}
      onClick={handleEdit}
    >
      <span className="text-sm font-semibold text-gray-500 dark:text-gray-200">
        {label}:
      </span>
      <div className="text-gray-900 text-sm dark:text-gray-100 flex items-center gap-2">
        {currentValue}
        {isEditMode && (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
            <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path>
          </svg>
        )}
      </div>
    </div>
  );
};

export default EditableField; 
