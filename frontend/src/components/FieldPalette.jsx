import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import {
  User, Mail, Phone, MapPin, Target,
  Briefcase, GraduationCap, Wrench, Award,
  Calendar, Globe, Hash
} from 'lucide-react';

const AVAILABLE_FIELDS = [
  { id: 'fullName', label: 'Full Name', icon: User, fieldType: 'text' },
  { id: 'email', label: 'Email', icon: Mail, fieldType: 'text' },
  { id: 'phone', label: 'Phone', icon: Phone, fieldType: 'text' },
  { id: 'address', label: 'Address', icon: MapPin, fieldType: 'text' },
  { id: 'objective', label: 'Objective', icon: Target, fieldType: 'textarea' },
  { id: 'experience', label: 'Experience', icon: Briefcase, fieldType: 'textarea' },
  { id: 'education', label: 'Education', icon: GraduationCap, fieldType: 'textarea' },
  { id: 'skills', label: 'Skills', icon: Wrench, fieldType: 'textarea' },
  { id: 'certifications', label: 'Certifications', icon: Award, fieldType: 'textarea' },
  { id: 'dob', label: 'Date of Birth', icon: Calendar, fieldType: 'date' },
  { id: 'website', label: 'Website', icon: Globe, fieldType: 'text' },
  { id: 'linkedin', label: 'LinkedIn', icon: Hash, fieldType: 'text' },
];

const DraggableField = ({ field }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${field.id}`,
    data: {
      type: 'palette-item',
      label: field.label,
      fieldId: field.id,
      fieldType: field.fieldType
    }
  });

  const Icon = field.icon;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-3 px-3 py-2.5 bg-gray-800 hover:bg-gray-700 
        rounded-xl cursor-grab active:cursor-grabbing transition-all border border-gray-700
        hover:border-purple-500/50 ${isDragging ? 'opacity-40 scale-95' : ''}`}
    >
      <Icon className="w-4 h-4 text-purple-400 shrink-0" />
      <span className="text-sm font-medium">{field.label}</span>
      <span className="ml-auto text-[10px] text-gray-500 bg-gray-900 px-1.5 py-0.5 rounded">
        {field.fieldType}
      </span>
    </div>
  );
};

const FieldPalette = () => {
  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0">
      <div className="p-4 border-b border-gray-800">
        <h2 className="font-bold text-sm text-gray-300">📦 FIELD PALETTE</h2>
        <p className="text-xs text-gray-600 mt-1">
          Drag karo → Template pe drop karo
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {AVAILABLE_FIELDS.map((field) => (
          <DraggableField key={field.id} field={field} />
        ))}
      </div>

      <div className="p-3 border-t border-gray-800">
        <div className="bg-purple-900/30 border border-purple-800/50 rounded-lg p-3">
          <p className="text-xs text-purple-300 font-semibold">💡 Tip:</p>
          <p className="text-[11px] text-purple-400/70 mt-1">
            Field ko drag karke template pe exact jagah drop karo. Drop ke baad resize bhi kar sakte ho!
          </p>
        </div>
      </div>
    </div>
  );
};

export default FieldPalette;
