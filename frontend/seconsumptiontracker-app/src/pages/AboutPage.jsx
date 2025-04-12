import React from "react";
import {
  ChevronRight,
  BarChart2,
  Zap,
  Lightbulb,
  Wind,
  LineChart,
} from "lucide-react";

const AboutPage = () => {
  return (
    <div className="container min-h-screen py-20">
      {/* Project Overview Section */}
      <section className="py-16 px-4 sm:px-10 max-w-8xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white">Project Overview</h2>
          <div className="h-1 w-24 bg-cta-bluegreen mx-auto mt-4"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center text-white/70">
          <div className="order-2 md:order-1">
            <p className="mb-6 text-lg">
              This project addresses the growing need for efficient energy
              management in commercial settings. It leverages modern web and
              machine learning technologies to provide users with detailed
              insights into their energy consumption.
            </p>
            <p className="mb-6 text-lg">
              The application is aimed at small-scale company owners, building
              managers, and environmentally conscious individuals who want to
              monitor and reduce their energy expenses.
            </p>
            <p className="text-lg">
              By integrating historical electricity rate data and standard
              consumption values, the project not only predicts future bills but
              also offers personalized energy-saving tips, that can be used to
              significantly save budget and reduce environmental footprint.
            </p>
          </div>
          <div className="order-1 md:order-2">
            <div className="rounded-xl p-6 shadow-lg transform transition-all duration-300 hover:shadow-xl hover:scale-105">
              <img
                src="https://images.ctfassets.net/fevtq3bap7tj/4Z3xdca3bymwimUoa408Ck/8c3bf8a8d2335a9613131d03c650131b/Energy_Dashboard_2x.jpg.png"
                alt="Energy management dashboard"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Hexagonal Design */}
      <section className="py-20 px-4 sm:px-10 max-w-7xl mx-auto" id="features">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white">Key Features</h2>
          <div className="h-1 w-24 bg-cta-bluegreen mx-auto mt-4 mb-8"></div>
          <p className="max-w-3xl mx-auto text-white/70 text-lg">
            Our platform offers powerful tools to help businesses track,
            predict, and optimize their energy usage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-[#333] rounded-xl shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-xl">
            <div className="h-3 bg-blue-500"></div>
            <div className="p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <BarChart2 className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">
                Smart Energy Consumption Calculator
              </h3>
              <p className="text-white/70">
                Users input details about their appliances (number of devices, wattage, hours of usage, days used per week, weeks used per month) to calculate the total energy
                consumption based on standard consumption values.
              </p>
            </div>
            <div className="bg-blue-100  p-6"></div>
          </div>

          {/* Feature 2 */}
          <div className="bg-[#333] rounded-xl shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-xl">
            <div className="h-3 bg-green-500"></div>
            <div className="p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <LineChart className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">
                Bill Prediction with ML Model
              </h3>
              <p className="text-white/70">
                The system retrieves the calculated energy consumption data and
                processes it through an (SARIMAX/XGBoost) machine learning model
                trained on historical electricity rate data, providing users
                with an estimated electricity bill.
              </p>
            </div>
            <div className="bg-green-100 p-6"></div>
          </div>

          {/* Feature 3 */}
          <div className="bg-[#333] rounded-xl shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-xl">
            <div className="h-3 bg-yellow-500"></div>
            <div className="p-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                <Lightbulb className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">
                Energy-Saving Recommendations
              </h3>
              <p className="text-white/70">
                Based on the consumption breakdown, the system generates
                personalized optimization tips—such as reducing aircon usage,
                and switching to LED lighting help users reduce consumption.
              </p>
            </div>
            <div className="bg-yellow-100 p-6"></div>
          </div>
        </div>
      </section>

      {/* Call to Action Section
      <section className="py-16 px-4 sm:px-10">
        <div className="max-w-7xl mx-auto bg-gradient-to-r from-gray-800 to-blue-900 rounded-2xl overflow-hidden shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-5">
            <div className="col-span-3 p-8 md:p-12 text-white">
              <h2 className="text-3xl font-bold mb-6">
                Ready to Optimize Your Energy Consumption?
              </h2>
              <p className="text-lg mb-8 max-w-2xl">
                Join our platform today and start saving on your energy bills
                while contributing to a more sustainable future.
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href="/signup"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition duration-300"
                >
                  Get Started
                </a>
                <a
                  href="/demo"
                  className="bg-transparent border border-blue-400 text-blue-400 hover:bg-blue-900/30 px-6 py-3 rounded-lg font-medium transition duration-300"
                >
                  Request Demo
                </a>
              </div>
            </div>
            <div className="col-span-2 bg-gray-900 flex items-center justify-center p-8">
              <div className="w-full h-64 rounded-xl overflow-hidden shadow-lg">
                <img
                  src="/src/assets/about-images/dashboard.png"
                  alt="Energy dashboard"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* Team/Contact Section */}
      <section className="py-16 px-4 sm:px-10 max-w-7xl mx-auto" id="contact">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white">Our Team</h2>
          <div className="h-1 w-24 bg-cta-bluegreen mx-auto mt-4 mb-8"></div>
          <p className="max-w-3xl mx-auto text-white/70 text-lg">
            We're a team of 3rd year college students who are passionate to
            develop and deliver quality services.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-8 md:p-12">
              <h3 className="text-2xl font-bold text-blue-900 mb-6">
                Get in Touch
              </h3>
              <p className="text-gray-600 mb-8">
                Have questions about our Smart Energy Consumption Tracker? We're
                here to help!
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-blue-600"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <span className="text-gray-600">
                    seconsumptiontracker@gmail.com
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-green-600"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-gray-600">kahit san</span>
                </div>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-yellow-600"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                  <span className="text-gray-600">(123) 456-7890</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-green-100 p-8 md:p-12 flex items-center justify-center">
              <div className="grid grid-cols-2 gap-6 w-full">
                <div className="bg-white rounded-xl shadow-md p-4 text-center transform transition duration-300 hover:scale-105">
                  <div className="w-24 h-24 rounded-full bg-blue-200 mx-auto mb-4 overflow-hidden">
                    <img
                      src="https://i.ibb.co/XX5GcgJ/91ff0839465f.jpg"
                      alt="Team member"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="font-bold text-blue-900">Rouin Vallejo</h4>
                  <p className="text-sm text-gray-600">ML Engineer</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-4 text-center transform transition duration-300 hover:scale-105">
                  <div className="w-24 h-24 rounded-full bg-green-200 mx-auto mb-4 overflow-hidden">
                    <img
                      src="/api/placeholder/200/200"
                      alt="Team member"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="font-bold text-blue-900">Jomar Maestro</h4>
                  <p className="text-sm text-gray-600">Backend Developer</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-4 text-center transform transition duration-300 hover:scale-105">
                  <div className="w-24 h-24 rounded-full bg-yellow-200 mx-auto mb-4 overflow-hidden">
                    <img
                      src="/api/placeholder/200/200"
                      alt="Team member"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="font-bold text-blue-900">Bianca Ignacio</h4>
                  <p className="text-sm text-gray-600">UI/UX Designer</p>
                </div>
                <div className="bg-white rounded-xl shadow-md p-4 text-center transform transition duration-300 hover:scale-105">
                  <div className="w-24 h-24 rounded-full bg-purple-200 mx-auto mb-4 overflow-hidden">
                    <img
                      src="/api/placeholder/200/200"
                      alt="Team member"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="font-bold text-blue-900">Iner Collado</h4>
                  <p className="text-sm text-gray-600">Frontend Developer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
