"use client";

/**
 * Step 3: Passenger Details Component
 * Collects passenger contact information
 */
export default function Step3PassengerDetails({ formData, updateFormData, hotelData }) {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold mb-6" style={{ color: hotelData.theme.primaryColor }}>Your Information</h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-3">Full Name <span className="text-red-500">*</span></label>
          <input 
            type="text" 
            value={formData.passengerName} 
            onChange={(e) => updateFormData("passengerName", e.target.value)} 
            placeholder="e.g., Alexander Hamilton" 
            className="w-full px-6 py-4 rounded-xl border-2 border-neutral-200 focus:border-amber-500 focus:outline-none transition-all text-lg" 
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-3">WhatsApp Number <span className="text-red-500">*</span></label>
          <input 
            type="tel" 
            value={formData.passengerWhatsApp} 
            onChange={(e) => updateFormData("passengerWhatsApp", e.target.value)} 
            placeholder="e.g., +62 812 3456 7890" 
            className={`w-full px-6 py-4 rounded-xl border-2 focus:outline-none transition-all text-lg ${
              formData.passengerWhatsApp && (() => {
                const cleanedPhone = formData.passengerWhatsApp.replace(/[\s\-()]/g, '');
                const phoneRegex = /^(\+|00)?[0-9]{8,15}$/;
                return !phoneRegex.test(cleanedPhone);
              })()
                ? 'border-red-500 bg-red-50 focus:border-red-600'
                : 'border-neutral-200 focus:border-amber-500'
            }`}
          />
          {formData.passengerWhatsApp && (() => {
            const cleanedPhone = formData.passengerWhatsApp.replace(/[\s\-()]/g, '');
            const phoneRegex = /^(\+|00)?[0-9]{8,15}$/;
            return !phoneRegex.test(cleanedPhone);
          })() ? (
            <p className="text-xs text-red-600 font-semibold mt-2">
              ⚠️ Please enter a valid phone number (8-15 digits, international format accepted)
            </p>
          ) : (
            <p className="text-xs text-neutral-500 mt-2">We'll send your booking confirmation via WhatsApp</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-3">Email Address</label>
          <input 
            type="email" 
            value={formData.passengerEmail} 
            onChange={(e) => updateFormData("passengerEmail", e.target.value)} 
            placeholder="e.g., alexander@example.com" 
            className="w-full px-6 py-4 rounded-xl border-2 border-neutral-200 focus:border-amber-500 focus:outline-none transition-all text-lg" 
          />
          <p className="text-xs text-neutral-500 mt-2">Optional - for booking receipt and updates</p>
        </div>
      </div>
    </div>
  );
}
