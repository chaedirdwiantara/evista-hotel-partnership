"use client";

import { motion } from "framer-motion";
import { Building2, Sparkles } from "lucide-react";

/**
 * AboutPartnership Component
 * 
 * Displays information about the Evista x Hotel partnership.
 * 
 * @param {Object} hotelData - Hotel configuration containing branding and theme
 */
export default function AboutPartnership({ hotelData }) {
  const { theme, name, branding } = hotelData;

  return (
    <section className="section-container bg-white">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 70, damping: 20 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-4 mb-8">
            <Building2 className="w-12 h-12" style={{ color: theme.primary }} />
            <span className="text-4xl font-light text-neutral-400">×</span>
            <Sparkles className="w-12 h-12" style={{ color: theme.primary }} />
          </div>

          <h2 className="text-4xl md:text-5xl mb-6" style={{ color: theme.secondary }}>
            {name} × Evista
          </h2>

          <div className="space-y-6 text-neutral-600 text-lg leading-relaxed">
            <p>
              We've partnered with Evista to bring you a new standard of luxury transportation. 
              Every journey is an experience in sustainable elegance.
            </p>

            <p>
              From the moment you step into one of our electric vehicles, you'll understand 
              why discerning travelers choose this partnership. Whisper-quiet comfort, 
              zero emissions, and the assurance that your journey reflects your values.
            </p>

            <div className="grid md:grid-cols-3 gap-8 mt-12 pt-12 border-t border-neutral-200">
              <FeatureHighlight
                title="100% Electric"
                description="Zero emissions, maximum luxury"
                theme={theme}
              />
              <FeatureHighlight
                title="24/7 Concierge"
                description="Always ready when you are"
                theme={theme}
              />
              <FeatureHighlight
                title="Premium Fleet"
                description="The finest vehicles available"
                theme={theme}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Feature Highlight Component
 */
function FeatureHighlight({ title, description, theme }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 70, damping: 20 }}
      viewport={{ once: true }}
      className="text-center"
    >
      <h3 className="text-xl font-semibold mb-2" style={{ color: theme.primary }}>
        {title}
      </h3>
      <p className="text-sm text-neutral-600">
        {description}
      </p>
    </motion.div>
  );
}
