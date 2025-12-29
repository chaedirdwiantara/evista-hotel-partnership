# Evista Hotel Landing Page - README

Luxury dynamic landing page platform untuk partnership hotel dengan Evista electric vehicle service.

## 🚗 Tentang Proyek

Landing page ini adalah platform eksklusif yang memungkinkan setiap hotel partner Evista memiliki halaman branded tersendiri dalam satu domain yang sama. Setiap halaman memiliki:

- **Tema Warna Unik** sesuai branding hotel
- **Konten Spesifik** (fleet, destinasi lokal)  
- **Desain Luxury** yang mencerminkan premium service

## ✨ Fitur

- ✅ **Dynamic Routing**: Halaman unik per hotel (`/hotels/[hotel-slug]`)
- ✅ **Fully Responsive**: Mobile-first design (375px - 1920px+)
- ✅ **Luxury Design System**: Playfair Display + Inter typography
- ✅ **Smooth Animations**: Framer Motion interactions
- ✅ **SEO Optimized**: Dynamic metadata per hotel
- ✅ **Image-Ready**: Struktur folder asset sudah disiapkan

## 🏨 Demo Hotels

1. **The Grand Plaza Jakarta** - `/hotels/grand-plaza-jakarta`
   - Tema: Gold/Champagne
   - Fleet: Tesla Model S, Mercedes EQS, Tesla Model X

2. **Royal Beach Resort Bali** - `/hotels/royal-beach-bali`
   - Tema: Forest Green
   - Fleet: IONIQ 5, BMW iX

## 🛠️ Tech Stack

- **Next.js 15** (App Router)
- **Tailwind CSS v4** (Custom luxury design system)
- **Framer Motion** (Animations)
- **Lucide React** (Icons)

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production
npm start
```

Akses di: `http://localhost:3000`

## 📁 Struktur Proyek

```
hotel-landing-page/
├── app/
│   ├── hotels/[slug]/      # Dynamic hotel pages
│   ├── layout.js           # Root layout
│   ├── page.js             # Homepage
│   └── globals.css         # Design system
├── components/             # Reusable components
│   ├── Hero.js
│   ├── BookingForm.js
│   ├── FleetShowcase.js
│   └── ...
├── lib/
│   └── hotels.js          # Hotel configuration
└── public/assets/hotels/   # Asset directories
    ├── backgrounds/
    ├── gallery/
    ├── logos/
    └── vehicles/
```

## 🎨 Menambahkan Hotel Baru

Edit `lib/hotels.js`:

```javascript
export const hotelData = {
  "hotel-name-slug": {
    name: "Hotel Name",
    slug: "hotel-name-slug",
    theme: {
      primary: "#HEXCODE",    // Warna utama
      secondary: "#HEXCODE",  // Warna sekunder
      accent: "#HEXCODE",     // Warna aksen
    },
    hero: {
      title: "Your Journey...",
      subtitle: "...",
      backgroundPlaceholder: "linear-gradient(...)",
    },
    fleet: [/* ... */],
    curatedDestinations: [/* ... */],
    // ...
  }
}
```

## 🖼️ Menambahkan Gambar

1. **Simpan gambar** di folder yang sesuai:
   - Hero backgrounds → `public/assets/hotels/backgrounds/`
   - Vehicle photos → `public/assets/hotels/vehicles/`
   - Hotel logos → `public/assets/hotels/logos/`
   - Gallery → `public/assets/hotels/gallery/`

2. **Update `lib/hotels.js`**:
   ```javascript
   hero: {
     backgroundImage: "/assets/hotels/backgrounds/hotel-name.jpg",
     // Hapus backgroundPlaceholder
   }
   ```

## 🎯 Next Steps (Production)

- [ ] Ganti placeholder dengan gambar asli
- [ ] Integrasi database (MongoDB/PostgreSQL)
- [ ] Hubungkan booking form ke API backend Evista
- [ ] Setup email notifications
- [ ] Deploy ke production (Vercel recommended)

## 📱 Responsive Breakpoints

- **Mobile**: 375px - 767px
- **Tablet**: 768px - 1023px  
- **Desktop**: 1024px+

## 🔐 Environment Variables (Untuk Production)

```env
DATABASE_URL=your_database_url
EVISTA_API_KEY=your_api_key
SMTP_HOST=your_smtp_host
```

## 📄 License

© 2025 Evista. All rights reserved.

---

**Developed with ❤️ for luxury sustainable transport**
