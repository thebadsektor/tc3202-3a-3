import React from "react";
import wattifyLogo from "../assets/wattify.png";
import {
  GithubIcon,
  HomeIcon,
  InfoIcon,
  PhoneIcon,
  CalculatorIcon,
  BarChartIcon,
  BoltIcon,
  MailIcon,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#212129] text-gray-100 py-8">
      <div className="container mx-auto px-4">
        {/* Wide screen layout - single line */}
        <div className="hidden lg:flex justify-between items-start">
          {/* Left Section - Logo and Description */}
          <div className="flex items-start max-w-xs">
            <div className="mr-4">
              <img src={wattifyLogo} alt="Wattify" className="w-30" />
            </div>
            <div>
              <div className="text-xl font-bold mb-2">Wattify</div>
              <p className="text-white/60 text-sm">
                Helping you understand and optimize your energy consumption with
                smart predictions and practical recommendations.
              </p>
            </div>
          </div>

          <div className="flex space-x-12">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-200">
                Navigation
              </h3>
              <ul className="space-y-2 text-white/60">
                <li>
                  <a
                    href="/"
                    className="flex items-center  hover:text-white transition duration-200"
                  >
                    <HomeIcon className="h-4 w-4 mr-2" />
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="/about"
                    className="flex items-center  hover:text-white transition duration-200"
                  >
                    <InfoIcon className="h-4 w-4 mr-2" />
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="/contact"
                    className="flex items-center hover:text-white transition duration-200"
                  >
                    <PhoneIcon className="h-4 w-4 mr-2" />
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-200">
                Services
              </h3>
              <ul className="space-y-2 text-white/60">
                <li>
                  <a
                    href="/bill-prediction"
                    className="flex items-center  hover:text-white transition duration-200"
                  >
                    <CalculatorIcon className="h-4 w-4 mr-2" />
                    Bill Prediction
                  </a>
                </li>
                <li>
                  <a
                    href="/bill-calculator"
                    className="flex items-center hover:text-white transition duration-200"
                  >
                    <BarChartIcon className="h-4 w-4 mr-2" />
                    Consumption Calculator
                  </a>
                </li>
                <li>
                  <a
                    href="/recommendations"
                    className="flex items-center hover:text-white transition duration-200"
                  >
                    <BoltIcon className="h-4 w-4 mr-2" />
                    Efficient Recommendations
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Section - Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-200">
              Connect With Us
            </h3>
            <div className="space-y-2 text-white/60">
              <a
                href="mailto:info@energyiq.com"
                className="flex items-center hover:text-white transition duration-200"
              >
                <MailIcon className="h-5 w-5 mr-2" />
                info@energyiq.com
              </a>
              <a
                href="https://github.com/energyiq"
                className="flex items-center hover:text-white transition duration-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                <GithubIcon className="h-5 w-5 mr-2" />
                GitHub
              </a>
              <a
                href="https://google.com"
                className="flex items-center hover:text-white transition duration-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                </svg>
                Google
              </a>
            </div>
          </div>
        </div>

        {/* Mobile and tablet layout */}
        <div className="lg:hidden">
          {/* Mobile logo and description */}
          <div className="flex flex-col items-center text-center mb-8">
            <BoltIcon className="h-10 w-10 text-yellow-400 mb-2" />
            <div className="text-xl font-bold mb-2">EnergyIQ</div>
            <p className="text-gray-300 text-sm max-w-sm">
              Helping you understand and optimize your energy consumption with
              smart predictions and practical recommendations.
            </p>
          </div>

          {/* Mobile navigation and services */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Basic Navigation */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-200 text-center md:text-left">
                Navigation
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="/"
                    className="flex items-center justify-center md:justify-start text-gray-300 hover:text-white transition duration-200"
                  >
                    <HomeIcon className="h-4 w-4 mr-2" />
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="/about"
                    className="flex items-center justify-center md:justify-start text-gray-300 hover:text-white transition duration-200"
                  >
                    <InfoIcon className="h-4 w-4 mr-2" />
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="/contact"
                    className="flex items-center justify-center md:justify-start text-gray-300 hover:text-white transition duration-200"
                  >
                    <PhoneIcon className="h-4 w-4 mr-2" />
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-200 text-center md:text-left">
                Services
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="/bill-prediction"
                    className="flex items-center justify-center md:justify-start text-gray-300 hover:text-white transition duration-200"
                  >
                    <CalculatorIcon className="h-4 w-4 mr-2" />
                    Bill Prediction
                  </a>
                </li>
                <li>
                  <a
                    href="/energy-calculator"
                    className="flex items-center justify-center md:justify-start text-gray-300 hover:text-white transition duration-200"
                  >
                    <BarChartIcon className="h-4 w-4 mr-2" />
                    Consumption Calculator
                  </a>
                </li>
                <li>
                  <a
                    href="/recommendations"
                    className="flex items-center justify-center md:justify-start text-gray-300 hover:text-white transition duration-200"
                  >
                    <BoltIcon className="h-4 w-4 mr-2" />
                    Efficient Recommendations
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Mobile contact info */}
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-4 text-gray-200">
              Connect With Us
            </h3>
            <div className="flex space-x-6">
              <a
                href="mailto:info@energyiq.com"
                className="text-gray-300 hover:text-white transition duration-200"
                aria-label="Email"
              >
                <MailIcon className="h-6 w-6" />
              </a>
              <a
                href="https://github.com/energyiq"
                className="text-gray-300 hover:text-white transition duration-200"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <GithubIcon className="h-6 w-6" />
              </a>
              <a
                href="https://google.com"
                className="text-gray-300 hover:text-white transition duration-200"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Google"
              >
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-700 text-sm text-center text-gray-400">
          <p>© {new Date().getFullYear()} EnergyIQ. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
