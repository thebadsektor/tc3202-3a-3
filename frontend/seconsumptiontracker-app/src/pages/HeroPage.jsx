import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { motion } from "framer-motion";
import {
  BarChart3,
  Leaf,
  Users,
  AreaChart,
  Clock,
  History,
} from "lucide-react";
import { Timeline } from "../components/ui/timeline";
import { HeroParallax } from "../components/ui/hero-parallax";
import { HoverEffect } from "../components/ui/card-hover-effect";
import "../App.css";
import LinkPreview from "../components/ui/link-preview";
import ClickSpark from "../components/ui/click-spark";
import loginImage from "../assets/home-images/login.png";
import calculatorImage from "../assets/home-images/calculator.png";
import predictionImage from "../assets/home-images/prediction.png";
import featuresImage from "../assets/home-images/features1.png";
import usageImage from "../assets/home-images/usage.png";
import outputImage from "../assets/home-images/output.png";
import ratesImage from "../assets/home-images/meralco-rates.jpg";
import ratesImage2 from "../assets/home-images/meralco-rates2.jpg";
import ratesImage3 from "../assets/home-images/meralco-rates3.jpg";
import ratesImage4 from "../assets/home-images/meralco-rates4.png";
import ratesImage5 from "../assets/home-images/meralco-rates5.jpg";
import ratesImage6 from "../assets/home-images/meralco-rates6.jpg";

function HeroPage() {
  const products = [
    {
      title: "Higher rates for Feb 2025",
      thumbnail: ratesImage4,
      link: "https://company.meralco.com.ph/news-and-advisories/higher-rates-february-2025",
    },
    {
      title: "Jan 2024",
      thumbnail: ratesImage2,
      link: "#",
    },
    {
      title: "Februate rates",
      thumbnail: ratesImage5,
      link: "/consumption-calculator",
    },
    {
      title: "Rates from 2011 to 2018",
      thumbnail: ratesImage3,
      link: "https://www.bworldonline.com/opinion/2023/04/17/517293/more-on-meralco-distribution-charges-and-energy-transition/",
    },
    {
      title: "Dashboard1",
      thumbnail: "",
      link: "#",
    },
    {
      title: "Solar Panels",
      thumbnail:
        "https://cdn.prod.website-files.com/63e230081c53f7989f5e0f64/64a3ba12c9f71e0de0487fb8_crm-saas-webflow-template.jpg",
      link: "#",
    },
    {
      title: "March 2025",
      thumbnail: ratesImage6,
      link: "",
    },
    {
      title: "Feb 2025 increase rates",
      thumbnail: ratesImage,
      link: "https://company.meralco.com.ph/news-and-advisories/higher-rates-february-2025",
    },
    {
      title: "Power rate increase",
      thumbnail: ratesImage4,
      link: "",
    },
    {
      title: "Rates from 2011 to 2018",
      thumbnail: ratesImage3,
      link: "https://www.bworldonline.com/opinion/2023/04/17/517293/more-on-meralco-distribution-charges-and-energy-transition/",
    },
  ];

  const advantages = [
    {
      icon: Users,
      title: "User-Friendly",
      description:
        "Intuitive interface designed to simplify complex energy management, making it easy for all users to use and manage",
      color: "text-blue-500 dark:text-blue-300",
    },
    {
      icon: BarChart3,
      title: "Predictive Billing",
      description:
        "Using Advanced predictive algorithms to analyze your historical energy usage to forecast future bills with high precision,",
      color: "text-green-500 dark:text-green-300",
    },
    {
      icon: Leaf,
      title: "Energy Optimization",
      description:
        "Intelligent insights and personalized recommendations that highlight opportunities to reduce energy waste and optimize your home or business's energy efficiency.",
      color: "text-red-500 dark:text-red-300",
    },
    {
      icon: History,
      title: "Consumption Timeline",
      description:
        "Comprehensive energy usage tracking with detailed historical data visualization, allowing you to understand your consumption trends",
      color: "text-purple-500 dark:text-purple-300",
    },
  ];

  const features = [
    {
      title: "Simple and Accurate Bill Prediction",
      description:
        "Forecast your monthly utility expenses with precision based on historical rate patterns and current rates. Get reliable estimates to better plan your budget and avoid billing surprises.",
      link: "/bill-prediction",
    },
    {
      title: "Energy Consumption Calculator",
      description:
        "Track and analyze your household's energy usage across all devices and systems. Understand exactly where your power goes each month to identify unexpected costs and consumption patterns.",
      link: "/consumption-calculator",
    },
    {
      title: "Energy Consumption Optimizer",
      description:
        "Receive personalized recommendations to reduce your energy footprint and lower monthly bills. Smart suggestions adapt to your lifestyle while maximizing efficiency and minimizing waste.",
      link: "#",
    },
  ];

  return (
    <>
      <ClickSpark
        sparkColor="#0BFEFA"
        sparkSize={10}
        sparkRadius={15}
        sparkCount={8}
        duration={400}
      >
        <div className="relative w-full">
          <div className="w-full">
            <HeroParallax products={products} />
          </div>

          <section className="">
            <div className="container  mx-auto px-4">
              <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-12">
                Main Features
              </h2>
              <p className="text-white/60 text-[18px] text-center px-5 md:px-40">
                Our smart energy management platform puts the power back in your
                hands with advanced tools that help you understand, predict, and
                optimize your electricity usage.
              </p>
              <HoverEffect items={features} className="gap-4" />
            </div>
          </section>

          <section className="w-full h-auto">
            <div className="about-content container">
              <Timeline
                data={[
                  {
                    title: "1",
                    content: (
                      <div className="text-white rounded-lg p-6 shadow-md">
                        <h4 className="text-2xl font-bold mb-3 dark:text-white">
                          Create Your Account
                        </h4>
                        <p className=" dark:text-neutral-300">
                          Sign up for free to access premium features like{" "}
                          <b>bill prediction</b>,{" "}
                          <b> energy saving recommendation </b>
                          and viewing historical data. A simple registration
                          gives you immediate access to understand your energy
                          consumption.
                        </p>

                        <div className="grid grid-cols-2 gap-5 mt-6">
                          <div className="aspect-square overflow-hidden rounded-lg">
                            <img
                              src={loginImage}
                              alt="Account feature 1"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="aspect-square overflow-hidden rounded-lg">
                            <img
                              src={predictionImage}
                              alt="Account feature 2"
                              className="w-full h-full object-cover object-center"
                            />
                          </div>
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: "2",
                    content: (
                      <div className="text-white rounded-lg p-6 shadow-md">
                        <h4 className="text-2xl font-bold mb-2 dark:text-white">
                          Choose Your Features
                        </h4>
                        <p className="">
                          Select which features you want to use. While basic
                          bill calculation is available to all users, premium
                          features like predictive analytics and personalized
                          recommendations require login.
                        </p>
                        <ul className="mt-5 ml-10 space-y-1.5 font-semibold list-disc cursor-pointer">
                          <li>
                            <LinkPreview
                              url="/bill-prediction"
                              imageSrc={predictionImage}
                              width={250}
                              height={150}
                            >
                              Bill Prediction
                            </LinkPreview>
                          </li>
                          <li>
                            <LinkPreview
                              url="/consumption-calculator"
                              imageSrc={calculatorImage}
                              width={250}
                              height={50}
                            >
                              Energy Consumption Calculator
                            </LinkPreview>
                          </li>
                          <li>
                            <LinkPreview
                              url=""
                              imageSrc="https://web.poecdn.com/public/news/2024-10-01/FanArtComp/Winners/xKzo.jpeg"
                              width={250}
                              height={120}
                            >
                              Save Energy (Optimization Recommendation)
                            </LinkPreview>
                          </li>
                        </ul>

                        <div className="grid grid-cols-2 gap-5 mt-6">
                          <div className="aspect-square overflow-hidden rounded-lg">
                            <img
                              src={featuresImage}
                              alt="Account feature 1"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="aspect-square overflow-hidden rounded-lg ">
                            <img
                              src={calculatorImage}
                              alt="Account feature 2"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: "3",
                    content: (
                      <div className="text-white  rounded-lg p-6 shadow-md">
                        <h4 className="text-2xl font-bold mb-2 dark:text-white">
                          Get Insights & Optimize
                        </h4>
                        <p className="">
                          Simply input your appliances, their wattage, and usage
                          patterns. Our system analyzes this data using
                          historical rate trends to predict your electricity
                          bills and provide personalized recommendations to help
                          you save money.
                        </p>

                        <div className="grid grid-cols-2 gap-5 mt-6">
                          <div className="aspect-square overflow-hidden rounded-lg">
                            <img
                              src={usageImage}
                              alt="Account feature 1"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="aspect-square overflow-hidden rounded-lg">
                            <img
                              src={outputImage}
                              alt="Account feature 2"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      </div>
                    ),
                  },
                  {
                    title: "4",
                    content: (
                      <div className="text-white rounded-lg p-6 shadow-md">
                        <h4 className="text-2xl font-bold mb-2 dark:text-white">
                          Track Progress & Adjust
                        </h4>
                        <p className="">
                          Monitor your predicted savings over time and see how
                          your changes impact your energy consumption. Our
                          dashboard shows your progress and continues to provide
                          new optimization suggestions as your usage patterns
                          evolve.
                        </p>

                        <div className="grid grid-cols-2 gap-5 mt-6">
                          <div className="aspect-square overflow-hidden rounded-lg">
                            <img
                              src={outputImage}
                              alt="Account feature 1"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="aspect-square overflow-hidden rounded-lg">
                            <img
                              src={outputImage}
                              alt="Account feature 2"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      </div>
                    ),
                  },
                ]}
              />
              {/* Advantaaaageeeee Section */}
              <section className="py-16 dark:bg-gray-900 transition-colors duration-300">
                <div className="container mx-auto px-4">
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                  >
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                      Why Choose Us?
                    </h2>
                    <p className="text-white/60 text-[16px] max-w-4xl mx-auto mt-5">
                      Empower your energy management with intelligent insights,
                      precise predictions, and user-friendly tools that
                      transform how you understand and optimize your
                      consumption.
                    </p>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {advantages.map((advantage, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 1, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{
                          duration: 0.5,
                          delay: index * 0.1,
                        }}
                        className="bg-gradient-to-r from-white via-cyan-50 to-cyan-100 dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                      >
                        <div className={`mb-4 ${advantage.color}`}>
                          <advantage.icon size={48} strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
                          {advantage.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          {advantage.description}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </section>
          <section className="h-20"></section>
        </div>
      </ClickSpark>
    </>
  );
}

export default HeroPage;
