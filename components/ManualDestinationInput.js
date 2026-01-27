"use client";

import { useState, useEffect, useRef } from 'react';
import { searchPlace } from '@/lib/manual-destination-api';

/**
 * Manual Destination Input Component
 * Provides autocomplete search for manual destination selection
 */
export default function ManualDestinationInput({ 
  onDestinationSelect,
  onInputFocus, // New: callback when input is focused
  selectedDestination: externalSelectedDestination, // New: Controlled prop
  primaryColor = "#1a1a1a",
  accentColor = "#d4af37",
  className = "" 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [isFocused, setIsFocused] = useState(false); // Track focus state for border color
  const searchTimeoutRef = useRef(null);
  const inputRef = useRef(null);
  const containerRef = useRef(null); // Ref for entire component container

  // NEW: Sync with external selected destination
  useEffect(() => {
    // If external prop is provided
    if (externalSelectedDestination !== undefined) {
      setSelectedDestination(externalSelectedDestination);
      if (externalSelectedDestination) {
        setSearchQuery(externalSelectedDestination.name);
      } else {
        // If external is null (cleared), clear internal state unless user is measuring typing
        // We only clear if the internal state thinks we have a selection but external says null
        // OR if we want to force reset.
        // Simple rule: if external is null, and we have a selectedDestination, clear everything.
        // But if we just have text and no selection, maybe don't clear? 
        // User requirement: "input manual otomatis kosong bersih". So yes, clear text too.
        if (selectedDestination !== null || searchQuery !== '') {
             // Only clear if we are not currently typing? 
             // No, this runs when prop changes. If parent clears it, we clear.
             // But we need to distinguish "parent cleared" vs "user is typing new query".
             // We rely on the fact that parent passes current formData value.
             setSearchQuery('');
        }
      }
    }
  }, [externalSelectedDestination]);

  // Debounced search
  useEffect(() => {
    // If we have a selected destination, don't search
    if (selectedDestination) return;

    if (searchQuery.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchPlace(searchQuery);
        setSearchResults(results);
        setShowResults(true);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500); // 500ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Handle destination selection
  const handleSelectDestination = (destination) => {
    console.log('[ManualDestinationInput] Destination selected:', destination);
    setSelectedDestination(destination);
    setSearchQuery(destination.name);
    setShowResults(false);
    
    // Notify parent component
    if (onDestinationSelect) {
      console.log('[ManualDestinationInput] Calling onDestinationSelect callback');
      onDestinationSelect(destination);
    } else {
      console.warn('[ManualDestinationInput] onDestinationSelect callback is not defined!');
    }
  };

  // Clear selection
  const handleClearSelection = () => {
    setSelectedDestination(null);
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    
    if (onDestinationSelect) {
      onDestinationSelect(null);
    }
    
    // Focus input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside the ENTIRE container (input + dropdown)
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl">
            🔍
          </span>
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              // Show results if available
              if (searchResults.length > 0) {
                setShowResults(true);
              }
              // Notify parent that input was focused (to clear fixed route selection)
              if (onInputFocus) {
                onInputFocus();
              }
            }}
            onBlur={() => setIsFocused(false)}
            placeholder="Search destination (e.g., Stasiun Kereta Cepat)"
            className="w-full pl-12 pr-12 py-4 rounded-xl border-2 transition-all text-base"
            style={{
              borderColor: isFocused ? (accentColor || '#D4AF37') : '#e5e5e5',
              outline: 'none'
            }}
            disabled={selectedDestination !== null}
          />
          
          {/* Loading Spinner */}
          {isSearching && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-amber-500"></div>
            </div>
          )}
          
          {/* Clear Button */}
          {selectedDestination && (
            <button
              onClick={handleClearSelection}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
              title="Clear selection"
            >
              ✕
            </button>
          )}
        </div>

        {/* Minimum Characters Hint */}
        {searchQuery.length > 0 && searchQuery.length < 3 && !selectedDestination && (
          <p className="mt-2 text-sm text-neutral-500">
            Type at least 3 characters to search...
          </p>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && searchResults.length > 0 && !selectedDestination && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border-2 border-neutral-200 max-h-96 overflow-y-auto">
          {searchResults.map((result, index) => (
            <button
              key={result.place_id || index}
              onClick={() => {
                console.log('[DIRECT CLICK] Button clicked!', result);
                handleSelectDestination(result);
              }}
              className="w-full px-6 py-4 text-left border-b border-neutral-100 hover:bg-amber-50 transition-colors group"
            >
              <div className="flex items-start gap-3">
                <span className="text-xl mt-1 group-hover:scale-110 transition-transform">
                  📍
                </span>
                <div className="flex-1">
                  <h4 className="font-bold text-neutral-800 mb-1">
                    {result.name}
                  </h4>
                  <p className="text-sm text-neutral-600 line-clamp-2">
                    {result.address}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No Results Message */}
      {showResults && searchResults.length === 0 && !isSearching && searchQuery.length >= 3 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border-2 border-neutral-200 px-6 py-8 text-center">
          <p className="text-neutral-500">
            No destinations found for "{searchQuery}"
          </p>
          <p className="text-sm text-neutral-400 mt-2">
            Try different keywords or check your spelling
          </p>
        </div>
      )}

      {/* Selected Destination Display */}
      {selectedDestination && (
        <div 
          className="mt-4 p-4 rounded-xl border-2 transition-all"
          style={{ 
            borderColor: accentColor || '#D4AF37',
            backgroundColor: `${accentColor || '#D4AF37'}10`
          }}
        >
          <div className="flex items-start gap-3">
            {/* Checkmark Icon - Consistent with other selections */}
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0"
              style={{ backgroundColor: accentColor || '#D4AF37' }}
            >
              ✓
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-neutral-600 mb-1">
                Selected Destination:
              </p>
              <h4 className="font-bold text-neutral-800 mb-1">
                {selectedDestination.name}
              </h4>
              <p className="text-sm text-neutral-600">
                {selectedDestination.address}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
