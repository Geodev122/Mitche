import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContextRoles';
import { SymbolicIdentityManager } from '../utils/symbolic-identity';
import SymbolIcon from './ui/SymbolIcon';

interface SymbolicIdentitySetupProps {
  onComplete?: () => void;
  className?: string;
}

const SymbolicIdentitySetup: React.FC<SymbolicIdentitySetupProps> = ({ 
  onComplete,
  className = ''
}) => {
  const { user, updateUserProfile } = useAuth();
  const [symbolicName, setSymbolicName] = useState(user?.symbolicName || '');
  const [symbolicIcon, setSymbolicIcon] = useState(user?.symbolicIcon || 'Star');
  const [nameError, setNameError] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);

  const availableIcons = SymbolicIdentityManager.getAvailableIcons();

  useEffect(() => {
    if (user) {
      // Generate name suggestions based on user's language preference
      const userLanguage = 'en'; // Default language for now
      const suggested = SymbolicIdentityManager.generateSuggestedNames(
        user.username,
        userLanguage
      );
      setSuggestions(suggested);
    }
  }, [user]);

  const handleNameChange = (value: string) => {
    setSymbolicName(value);
    setNameError('');
    
    // Validate name
    const validation = SymbolicIdentityManager.validateSymbolicName(value);
    if (!validation.valid && value.length > 0) {
      setNameError(validation.error || '');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    // Final validation
    const validation = SymbolicIdentityManager.validateSymbolicName(symbolicName);
    if (!validation.valid) {
      setNameError(validation.error || '');
      return;
    }

    setIsSubmitting(true);

    try {
      const identityUpdate = SymbolicIdentityManager.createIdentityUpdate(
        symbolicName,
        symbolicIcon
      );

      await updateUserProfile(identityUpdate);
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error updating symbolic identity:', error);
      setNameError(error instanceof Error ? error.message : 'Failed to update identity');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasChanges = user && (
    symbolicName !== user.symbolicName || 
    symbolicIcon !== user.symbolicIcon
  );

  const isValid = symbolicName.length > 0 && !nameError;

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Choose Your Symbolic Identity
        </h2>
        <p className="text-gray-600">
          Your symbolic identity is how you'll be known throughout the Mitché community. 
          This is different from your login username and represents the persona you want to embody.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identity Preview */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Preview</h3>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-[#F1EADF] rounded-full flex items-center justify-center">
              <SymbolIcon name={symbolicIcon} className="w-7 h-7 text-[#D4AF37]" />
            </div>
            <div>
              <p className="font-bold text-gray-800">
                {symbolicName || 'Your Symbolic Name'}
              </p>
              <p className="text-sm text-gray-600">Community Helper</p>
            </div>
          </div>
        </div>

        {/* Symbolic Name Input */}
        <div>
          <label htmlFor="symbolicName" className="block text-sm font-medium text-gray-700 mb-2">
            Symbolic Name *
          </label>
          <input
            type="text"
            id="symbolicName"
            value={symbolicName}
            onChange={(e) => handleNameChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              nameError ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter your chosen symbolic name"
            maxLength={50}
          />
          {nameError && (
            <p className="mt-1 text-sm text-red-600">{nameError}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            This will be your public identity across the platform
          </p>
        </div>

        {/* Name Suggestions */}
        {suggestions.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Suggestions
            </label>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleNameChange(suggestion)}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Icon Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Symbolic Icon *
          </label>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setShowIconPicker(!showIconPicker)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <SymbolIcon name={symbolicIcon} className="w-5 h-5 text-[#D4AF37]" />
              <span>{symbolicIcon}</span>
              <span className="text-gray-400">▼</span>
            </button>
          </div>

          {showIconPicker && (
            <div className="mt-3 p-4 border border-gray-200 rounded-lg bg-gray-50 max-h-64 overflow-y-auto">
              <div className="grid grid-cols-8 gap-2">
                {availableIcons.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => {
                      setSymbolicIcon(icon);
                      setShowIconPicker(false);
                    }}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                      symbolicIcon === icon
                        ? 'bg-blue-100 border-2 border-blue-300'
                        : 'bg-white border border-gray-200 hover:bg-gray-100'
                    }`}
                    title={icon}
                  >
                    <SymbolIcon name={icon} className="w-5 h-5 text-[#D4AF37]" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Current vs New Comparison */}
        {user && hasChanges && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">Changes Preview</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 mb-1">Current:</p>
                <div className="flex items-center space-x-2">
                  <SymbolIcon name={user.symbolicIcon || 'User'} className="w-4 h-4 text-gray-500" />
                  <span>{user.symbolicName || 'Not set'}</span>
                </div>
              </div>
              <div>
                <p className="text-gray-600 mb-1">New:</p>
                <div className="flex items-center space-x-2">
                  <SymbolIcon name={symbolicIcon} className="w-4 h-4 text-[#D4AF37]" />
                  <span>{symbolicName}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Login Username Info */}
        {user && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-1">Note about usernames</h4>
            <p className="text-sm text-blue-700">
              Your login username ({user.username}) remains the same and is used only for authentication. 
              Your symbolic identity is what the community will see.
            </p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            * Required fields
          </div>
          <button
            type="submit"
            disabled={!isValid || isSubmitting || !hasChanges}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              isValid && hasChanges && !isSubmitting
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'Updating...' : hasChanges ? 'Update Identity' : 'No Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SymbolicIdentitySetup;