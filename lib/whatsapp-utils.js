/**
 * WhatsApp Notification Utilities
 * 
 * Handles WhatsApp message formatting and sending for:
 * 1. Manual user-initiated contact (urgent night bookings)
 * 2. Auto-notifications to admin (all bookings)
 */

/**
 * Check if PICKUP is urgent night service (<24h + 00:00-06:00)
 */
export function isPickupUrgentNight(formData) {
  if (!formData.pickupTime) return false;
  
  // Determine correct date field based on service type
  const isRental = formData.serviceType === 'rental';
  const pickupDate = isRental ? formData.rentalDate : formData.pickupDate;
  
  if (!pickupDate) return false;
  
  // Check if pickup time is night hours (00:00-06:00)
  const pickupHour = parseInt(formData.pickupTime.split(':')[0]);
  const isPickupNight = pickupHour >= 0 && pickupHour < 6;
  
  if (!isPickupNight) return false;
  
  // Calculate time until pickup
  const pickupDateTime = new Date(pickupDate + 'T' + formData.pickupTime);
  const now = new Date();
  const hoursUntilPickup = (pickupDateTime - now) / (1000 * 60 * 60);
  
  return hoursUntilPickup < 24;
}

/**
 * Check if RETURN is urgent night service (<24h + 00:00-06:00)
 */
export function isReturnUrgentNight(formData) {
  if (!formData.isRoundTrip || !formData.returnTime || !formData.returnDate) return false;

  // Check if return time is night hours
  const returnHour = parseInt(formData.returnTime.split(':')[0]);
  const isReturnNight = returnHour >= 0 && returnHour < 6;
  
  if (!isReturnNight) return false;

  // Calculate time until return
  const returnDateTime = new Date(formData.returnDate + 'T' + formData.returnTime);
  const now = new Date();
  const hoursUntilReturn = (returnDateTime - now) / (1000 * 60 * 60);

  return hoursUntilReturn < 24;
}

/**
 * Check if EITHER pickup OR return is urgent night service
 * Used for displaying WhatsApp button on success page
 */
export function isUrgentNightBooking(formData) {
  return isPickupUrgentNight(formData) || isReturnUrgentNight(formData);
}

/**
 * Format A: Manual User Request (Urgent Night Booking)
 * User clicks button to contact admin for manual coordination
 * More natural, people-to-people communication style
 */
export function buildUrgentNightMessage(formData, bookingId = 'PENDING', hotelData = null) {
  const isRental = formData.serviceType === 'rental';
  
  // Rental-specific data
  const durationLabels = {
    "6_hours": "6 Jam",
    "12_hours": "12 Jam",
    "24_hours": "24 Jam (1 Hari)",
    "2_days": "2 Hari",
    "3_days": "3 Hari",
    "week": "1 Minggu"
  };
  
  const returnLocationLabel = formData.returnLocation === 'classic_hotel' 
    ? 'Classic Hotel' 
    : 'Halim Perdanakusuma Airport (HLP)';
  
  // Get vehicle name or class
  const vehicleInfo = formData.selectedVehicle 
    ? formData.selectedVehicle.name
    : (formData.selectedVehicleClass ? `Kelas ${formData.selectedVehicleClass.toUpperCase()}` : '-');
  
  let message = '';
  
  if (isRental) {
    // RENTAL BOOKING - Night service manual request
    message = `Halo Admin,

Saya baru saja melakukan pembayaran untuk sewa mobil dan butuh konfirmasi untuk penjemputan malam hari.

Detail Pemesanan:
📋 Booking ID: ${bookingId}

Jadwal Rental:
📅 Tanggal: ${formData.rentalDate}
🕐 Jam Jemput: ${formData.pickupTime} (Malam Hari)
⏱️ Durasi: ${durationLabels[formData.rentalDuration] || formData.rentalDuration}

Kendaraan:
🚗 ${vehicleInfo}
${formData.withDriver ? '👨 Dengan Sopir' : '🔑 Lepas Kunci (Self Drive)'}

Lokasi:
📍 Jemput: Classic Hotel Jakarta
📍 Kembali: ${returnLocationLabel}

Data Pemesan:
👤 ${formData.passengerName}
📱 ${formData.passengerWhatsApp}

Mohon konfirmasi ketersediaan sopir untuk jam malam ini ya. Terima kasih! 🙏`;
    
  } else {
    // AIRPORT TRANSFER - Night service manual request
    const hotelName = hotelData?.name || 'Classic Hotel Jakarta';
    const routeObj = hotelData?.routes?.find(r => r.id === formData.selectedRoute);
    const routeName = routeObj?.name || 'Airport Transfer';
    
    message = `Halo Admin,

Saya baru saja melakukan pembayaran untuk airport transfer dan butuh konfirmasi untuk penjemputan malam hari.

Detail Pemesanan:
📋 Booking ID: ${bookingId}
🏨 Hotel: ${hotelName}

Jadwal Transfer:
📅 Tanggal: ${formData.pickupDate}
🕐 Jam Jemput: ${formData.pickupTime} (Malam Hari)
${formData.isRoundTrip ? `🔄 Pulang-Pergi\n   Kembali: ${formData.returnDate} jam ${formData.returnTime}` : '➡️ Sekali Jalan'}

Rute & Kendaraan:
🛣️ ${routeName}
🚗 ${vehicleInfo}

Data Pemesan:
👤 ${formData.passengerName}
📱 ${formData.passengerWhatsApp}

Mohon konfirmasi ketersediaan sopir untuk jam malam ini ya. Terima kasih! 🙏`;
  }

  return message;
}

/**
 * Format B: Auto-Notification (All Bookings)
 * Sent automatically to admin after payment success
 * Service-aware format with complete details
 */
export function buildAutoNotificationMessage(formData, bookingId, paymentAmount, hotelData = null) {
  const isRental = formData.serviceType === 'rental';
  
  // Rental-specific data
  const durationLabels = {
    "6_hours": "6 Jam",
    "12_hours": "12 Jam",
    "24_hours": "24 Jam",
    "2_days": "2 Hari",
    "3_days": "3 Hari",
    "week": "1 Minggu"
  };
  
  const returnLocationLabel = formData.returnLocation === 'classic_hotel' 
    ? 'Classic Hotel' 
    : 'Halim Perdanakusuma Airport (HLP)';
  
  // Get vehicle name or class
  const vehicleInfo = formData.selectedVehicle 
    ? formData.selectedVehicle.name
    : (formData.selectedVehicleClass ? `Kelas ${formData.selectedVehicleClass.toUpperCase()}` : '-');
  
  // Check if night service
  const hour = formData.pickupTime ? parseInt(formData.pickupTime.split(':')[0]) : -1;
  const isNightService = hour >= 0 && hour < 6;
  
  let message = '';
  
  if (isRental) {
    // RENTAL BOOKING AUTO-NOTIFICATION
    message = `🔔 PEMESANAN BARU - RENTAL MOBIL

📋 ID: ${bookingId}
${isNightService ? '⚠️ NIGHT SERVICE (00:00-06:00)\n' : ''}
━━━━━━━━━━━━━━━━━━━

📅 JADWAL RENTAL
• Tanggal: ${formData.rentalDate}
• Jam Jemput: ${formData.pickupTime}
• Durasi: ${durationLabels[formData.rentalDuration] || formData.rentalDuration}

🚗 KENDARAAN
• ${vehicleInfo}
• ${formData.withDriver ? 'Dengan Sopir' : 'Lepas Kunci'}

📍 LOKASI
• Jemput: Classic Hotel Jakarta
• Kembali: ${returnLocationLabel}

👤 PEMESAN
• Nama: ${formData.passengerName}
• WhatsApp: ${formData.passengerWhatsApp}
${formData.passengerEmail ? `• Email: ${formData.passengerEmail}` : ''}

💰 PEMBAYARAN
• Total: Rp ${paymentAmount.toLocaleString('id-ID')}
• Status: LUNAS ✅

━━━━━━━━━━━━━━━━━━━
Notifikasi otomatis dari sistem`;
    
  } else {
    // AIRPORT TRANSFER AUTO-NOTIFICATION
    const hotelName = hotelData?.name || 'Classic Hotel Jakarta';
    const routeObj = hotelData?.routes?.find(r => r.id === formData.selectedRoute);
    const routeName = routeObj?.name || 'Airport Transfer';
    
    message = `🔔 PEMESANAN BARU - AIRPORT TRANSFER

📋 ID: ${bookingId}
🏨 Hotel: ${hotelName}
${isNightService ? '⚠️ NIGHT SERVICE (00:00-06:00)\n' : ''}
━━━━━━━━━━━━━━━━━━━

📅 JADWAL TRANSFER
• Tanggal: ${formData.pickupDate}
• Jam Jemput: ${formData.pickupTime}
• Tipe: ${formData.isRoundTrip ? 'Pulang-Pergi (Round Trip)' : 'Sekali Jalan (One Way)'}
${formData.isRoundTrip ? `• Kembali: ${formData.returnDate} jam ${formData.returnTime}` : ''}

🛣️ RUTE & KENDARAAN
• ${routeName}
• ${vehicleInfo}

👤 PEMESAN
• Nama: ${formData.passengerName}
• WhatsApp: ${formData.passengerWhatsApp}
${formData.passengerEmail ? `• Email: ${formData.passengerEmail}` : ''}

💰 PEMBAYARAN
• Total: Rp ${paymentAmount.toLocaleString('id-ID')}
• Status: LUNAS ✅

━━━━━━━━━━━━━━━━━━━
Notifikasi otomatis dari sistem`;
  }

  return message;
}

/**
 * Send WhatsApp message (opens WhatsApp with pre-filled message)
 */
export function sendWhatsAppMessage(phoneNumber, message) {
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  window.open(whatsappUrl, '_blank');
}

/**
 * Send auto-notification to admin (background, user doesn't see)
 * Console log only - backend will implement actual WhatsApp Business API
 */
export function sendAdminAutoNotification(phoneNumber, formData, bookingId, paymentAmount, hotelData = null) {
  const message = buildAutoNotificationMessage(formData, bookingId, paymentAmount, hotelData);
  
  // Log to console for now (backend will handle actual sending)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('[AUTO-NOTIFICATION TO ADMIN]');
  console.log(`WhatsApp: ${phoneNumber}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(message);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // TODO: Backend will implement via API
  // POST /api/whatsapp/send-admin-notification
  // { phoneNumber, message, bookingId }
}
