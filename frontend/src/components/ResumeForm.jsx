import React, { useCallback } from 'react';
import { useResumeStore } from '../store/resumeStore';
import debounce from 'debounce';
import {
  User, Mail, Phone, MapPin, Target,
  Briefcase, GraduationCap, Wrench, Award,
  Calendar, Globe, Hash, Type
} from 'lucide-react';

const FIELD_ICONS = {
  'Full Name': User,
  'Email': Mail,
  'Phone': Phone,
  'Address': MapPin,
  'Objective': Target,
  'Experience': Briefcase,
  'Education': GraduationCap,
  'Skills': Wrench,
  'Certifications': Award,
  'Date of Birth': Calendar,
  'Website': Globe,
  'LinkedIn': Hash
};

const ResumeForm = ({ fields }) => {
  const { resumeData, setFieldData } = useResumeStore();

  // 🔥 Debounced input handler (performance ke liye)
  const debouncedUpdate = useCallback(
    debounce((label, value) => {
      setFieldData(label, value);
    }, 150),
    []
  );

  const handleChange = (label, value) => {
    // Instant UI update ke liye local state bhi update karo
    setFieldData(label, value);
  };

  if (fields.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center">
          <Type className="w-12 h-12 mx-auto text-gray-600 mb-3" />
          <h3 className="text-gray-400 font-semibold">Koi Field Nahi Hai</h3>
          <p className="text-gray-600 text-sm mt-2">
            Pehle "Map Fields" tab mein jaake<br />
            template pe fields drop karo
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          ✏️ Fill Your Details
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Type karo → Preview mein live dikhega!
        </p>
      </div>

      {fields.map((field) => {
        const Icon = FIELD_ICONS[field.label] || Type;
        const value = resumeData[field.label] || '';

        return (
          <div key={field.id} className="group">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-1.5">
              <Icon className="w-4 h-4 text-purple-400" />
              {field.label}
              <span className="text-[10px] text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded ml-auto">
                {field.type}
              </span>
            </label>

            {field.type === 'textarea' ? (
              <textarea
                value={value}
                onChange={(e) => handleChange(field.label, e.target.value)}
                placeholder={`${field.label} yahan likho...`}
                rows={4}
                className="w-full px-3 py-2.5 bg-gray-800/80 border border-gray-700 rounded-xl 
                  text-white placeholder-gray-500 text-sm resize-y
                  focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                  transition-all hover:border-gray-600"
              />
            ) : field.type === 'date' ? (
              <input
                type="date"
                value={value}
                onChange={(e) => handleChange(field.label, e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-800/80 border border-gray-700 rounded-xl 
                  text-white text-sm
                  focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                  transition-all hover:border-gray-600
                  [color-scheme:dark]"
              />
            ) : (
              <input
                type={field.type === 'email' ? 'email' : 'text'}
                value={value}
                onChange={(e) => handleChange(field.label, e.target.value)}
                placeholder={`${field.label} yahan likho...`}
                className="w-full px-3 py-2.5 bg-gray-800/80 border border-gray-700 rounded-xl 
                  text-white placeholder-gray-500 text-sm
                  focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                  transition-all hover:border-gray-600"
              />
            )}

            {/* Character count for textarea */}
            {field.type === 'textarea' && (
              <p className="text-[10px] text-gray-600 text-right mt-1">
                {value.length} characters
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ResumeForm;
