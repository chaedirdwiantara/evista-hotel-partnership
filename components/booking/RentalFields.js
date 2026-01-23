"use client";

/**
 * RentalFields Component
 * 
 * Rental-specific fields (driver, duration, return location).
 * Extracted from Step1JourneyBuilder.js (lines 439-524)
 * 
 * @param {Object} props
 * @param {Object} props.formData - Current form state
 * @param {Function} props.updateFormData - Form data update handler
 * @param {Object} props.hotelData - Hotel configuration for theme
 */
export default function RentalFields({ formData, updateFormData, hotelData }) {
  return (
    <div className="space-y-6 animate-slideDown">
      <div>
        <label className="block text-sm font-semibold mb-3 text-neutral-800">
          With Driver? <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => updateFormData('withDriver', true)}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              formData.withDriver === true
                ? 'border-purple-600 bg-purple-50'
                : 'border-neutral-300 bg-white hover:border-neutral-400'
            }`}
            style={{
              borderColor: formData.withDriver === true ? hotelData.theme.accentColor : undefined,
              backgroundColor: formData.withDriver === true ? `${hotelData.theme.accentColor}10` : undefined
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium">With Driver</span>
            </div>
          </button>
          <button
            type="button"
            onClick={() => updateFormData('withDriver', false)}
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
              formData.withDriver === false
                ? 'border-purple-600 bg-purple-50'
                : 'border-neutral-300 bg-white hover:border-neutral-400'
            }`}
            style={{
              borderColor: formData.withDriver === false ? hotelData.theme.accentColor : undefined,
              backgroundColor: formData.withDriver === false ? `${hotelData.theme.accentColor}10` : undefined
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">Self Drive</span>
            </div>
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2 text-neutral-800">
          Rental Duration <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.rentalDuration || ''}
          onChange={(e) => updateFormData('rentalDuration', e.target.value)}
          className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="">Select duration...</option>
          <option value="6_hours">6 Jam</option>
          <option value="12_hours">12 Jam</option>
          <option value="24_hours">24 Jam (1 Hari)</option>
          <option value="2_days">2 Hari</option>
          <option value="3_days">3 Hari</option>
          <option value="week">1 Minggu</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2 text-neutral-800">
          Return Location <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.returnLocation || ''}
          onChange={(e) => updateFormData('returnLocation', e.target.value)}
          className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="">Select return location...</option>
          <option value="classic_hotel">Classic Hotel (Same as Pickup)</option>
          <option value="halim_airport">Halim Perdanakusuma Airport (HLP)</option>
        </select>
      </div>
    </div>
  );
}
