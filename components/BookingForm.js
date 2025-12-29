"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, Clock, Users, Luggage, ArrowRight, Car, X } from "lucide-react";

export default function BookingForm({ hotelData, preSelectedVehicle }) {
  const { theme, name } = hotelData;
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    destination: "",
    pickupDate: "",
    pickupTime: "",
    passengers: "1",
    luggage: "0",
    vehicleType: "",
    specialRequests: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // In production, this would send data to your booking API
    console.log("Booking submitted:", formData);
    alert("Booking request submitted! Our concierge will contact you shortly.");
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (preSelectedVehicle && preSelectedVehicle.name !== formData.vehicleType) {
      setFormData(prev => ({
        ...prev,
        vehicleType: preSelectedVehicle.name
      }));
    }
  }, [preSelectedVehicle, formData.vehicleType]);

  return (
    <section id="booking-form" className="section-container bg-neutral-50">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 70, damping: 20 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl mb-4" style={{ color: theme.secondary }}>
            Reserve Your Journey
          </h2>
          <p className="text-neutral-600 text-lg">
            Our concierge service will ensure your comfort from the moment you depart
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 70,
            damping: 20,
            delay: 0.2 
          }}
          viewport={{ once: true }}
          onSubmit={handleSubmit}
          className="card-luxury p-8 md:p-12"
        >
          {/* Selected Vehicle Indicator */}
          <AnimatePresence>
            {formData.vehicleType && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-neutral-50 border border-neutral-200 p-4 rounded-sm flex items-center justify-between mb-6"
              >
                <div className="flex items-center gap-3">
                  <Car className="w-5 h-5" style={{ color: theme.primary }} />
                  <div>
                    <span className="text-xs uppercase text-neutral-500 font-medium block">Selected Vehicle</span>
                    <span className="text-neutral-900 font-semibold">{formData.vehicleType}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => updateField("vehicleType", "")}
                  className="text-neutral-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 1: Journey Details */}
          <div className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2 text-neutral-700">
                <MapPin className="w-5 h-5" style={{ color: theme.primary }} />
                Destination
              </label>
              <input
                type="text"
                required
                value={formData.destination}
                onChange={(e) => updateField("destination", e.target.value)}
                placeholder="Enter your destination"
                className="input-luxury"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2 text-neutral-700">
                  <Calendar className="w-5 h-5" style={{ color: theme.primary }} />
                  Pickup Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.pickupDate}
                  onChange={(e) => updateField("pickupDate", e.target.value)}
                  className="input-luxury"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2 text-neutral-700">
                  <Clock className="w-5 h-5" style={{ color: theme.primary }} />
                  Pickup Time
                </label>
                <input
                  type="time"
                  required
                  value={formData.pickupTime}
                  onChange={(e) => updateField("pickupTime", e.target.value)}
                  className="input-luxury"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2 text-neutral-700">
                  <Users className="w-5 h-5" style={{ color: theme.primary }} />
                  Passengers
                </label>
                <select
                  required
                  value={formData.passengers}
                  onChange={(e) => updateField("passengers", e.target.value)}
                  className="input-luxury"
                >
                  <option value="1">1 Passenger</option>
                  <option value="2">2 Passengers</option>
                  <option value="3">3 Passengers</option>
                  <option value="4">4 Passengers</option>
                  <option value="5">5+ Passengers</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2 text-neutral-700">
                  <Luggage className="w-5 h-5" style={{ color: theme.primary }} />
                  Luggage Items
                </label>
                <select
                  required
                  value={formData.luggage}
                  onChange={(e) => updateField("luggage", e.target.value)}
                  className="input-luxury"
                >
                  <option value="0">No Luggage</option>
                  <option value="1">1 Item</option>
                  <option value="2">2 Items</option>
                  <option value="3">3+ Items</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 text-neutral-700 block">
                Special Requests (Optional)
              </label>
              <textarea
                value={formData.specialRequests}
                onChange={(e) => updateField("specialRequests", e.target.value)}
                placeholder="Any special requests or requirements..."
                rows={4}
                className="input-luxury resize-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="btn-primary w-full mt-8 flex items-center justify-center gap-2"
            style={{
              background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primary}dd 100%)`,
            }}
          >
            Confirm Reservation
            <ArrowRight className="w-5 h-5" />
          </motion.button>

          <p className="text-center text-sm text-neutral-500 mt-6">
            Our concierge team will contact you within 15 minutes to confirm your booking
          </p>
        </motion.form>
      </div>
    </section>
  );
}
