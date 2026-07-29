import { ArrowRight, Home, Users, Award } from 'lucide-react';

/**
 * Call-to-Action Section Component
 * Encourages users to take action (list property, become agent, etc.)
 */
export default function CTASection() {
  return (
    <section className="py-16 bg-gradient-to-r from-[#005e9e] to-[#004d84]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main CTA */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Find Your Dream Home?
          </h2>
          <p className="text-xl text-[#cce5f5] mb-8">
            Join thousands of happy homeowners who found their perfect property with us
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-[#005e9e] rounded-lg hover:bg-gray-100 transition font-semibold flex items-center justify-center space-x-2">
              <span>Browse Properties</span>
              <ArrowRight size={20} />
            </button>
            <button className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white hover:text-[#005e9e] transition font-semibold">
              List Your Property
            </button>
          </div>
        </div>

        {/* Stats/Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Stat 1 */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
              <Home size={32} className="text-white" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">5,000+</h3>
            <p className="text-[#cce5f5]">Properties Listed</p>
          </div>

          {/* Stat 2 */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
              <Users size={32} className="text-white" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">10,000+</h3>
            <p className="text-[#cce5f5]">Happy Customers</p>
          </div>

          {/* Stat 3 */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-4">
              <Award size={32} className="text-white" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-2">15+</h3>
            <p className="text-[#cce5f5]">Years of Excellence</p>
          </div>
        </div>
      </div>
    </section>
  );
}
