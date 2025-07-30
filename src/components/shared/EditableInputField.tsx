import React, { useState } from 'react';
import { useCalculationEditStore } from '@/store/useCalculationEditStore';

interface EditableInputFieldProps {
  field: keyof import('@/types/calculation-result-type').CalculationResult;
  value: string;
  className?: string;
  inputType?: 'text' | 'number' | 'textarea';
  abbreviate?: string;
  placeholder?: string;
}

const EditableInputField: React.FC<EditableInputFieldProps> = ({
  field,
  value,
  className = '',
  inputType = 'text',
  placeholder,
  abbreviate = ''
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
      <div className={`flex items-center gap-2 ${className}`}>
        {inputType === 'textarea' ? (
          <textarea
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 text-gray-900 text-sm dark:text-gray-100 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
          />
        ) : (
          <input
            type={inputType}
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 w-[100px] text-gray-900 text-sm dark:text-gray-100 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="flex-1">
        {currentValue} {abbreviate}
      </span>
      {isEditMode && (
        <button
          onClick={handleEdit}
          className="text-blue-600 hover:text-blue-700 p-1"
          title="Edit"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path>
          </svg>
        </button>
      )}
    </div>
  );
};

export default EditableInputField; 
