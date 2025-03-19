import React from "react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import { HeroParallax } from "../components/ui/hero-parallax";
import { HoverEffect } from "../components/ui/card-hover-effect";
import "../App.css";

function HeroPage() {
  const products = [
    {
      title: "Dashboard2",
      thumbnail:
        "https://www.geckoboard.com/uploads/google-sheets-dashboard-geckoboard--d.png",
      link: "#",
    },
    {
      title: "Smart Meters23",
      thumbnail:
        "https://cdn.shopify.com/s/files/1/0070/7032/files/about-us-page-yeti-2.png?v=1716989532",
      link: "#",
    },
    {
      title: "Eco Homes23",
      thumbnail:
        "https://cdn.shopify.com/s/files/1/0070/7032/files/about-us-page-yeti-2.png?v=1716989532",
      link: "#",
    },
    {
      title: "Solar Panels1",
      thumbnail:
        "https://www.geckoboard.com/uploads/google-sheets-dashboard-geckoboard--d.png",
      link: "#",
    },
    {
      title: "Dashboard1",
      thumbnail:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_P115pICTVV2qmUZT3IGa-nV16j584lX-NA&s",
      link: "#",
    },
    {
      title: "Smart Meters",
      thumbnail:
        "https://evolve-systems.com/wp-content/uploads/2020/02/dark-mode-website-design.png",
      link: "#",
    },
    {
      title: "Eco Homes",
      thumbnail: "https://i.ytimg.com/vi/py3W80hMuzE/maxresdefault.jpg",
      link: "#",
    },
    {
      title: "Solar Panels",
      thumbnail:
        "https://cdn.prod.website-files.com/63e230081c53f7989f5e0f64/64a3ba12c9f71e0de0487fb8_crm-saas-webflow-template.jpg",
      link: "#",
    },
    {
      title: "Eco Homes232",
      thumbnail: "https://i.ytimg.com/vi/py3W80hMuzE/maxresdefault.jpg",
      link: "#",
    },
    {
      title: "Solar Panels11",
      thumbnail:
        "https://resend.com/_next/image?url=%2Fstatic%2Fposts%2Fintroducing-light-mode.jpg&w=3840&q=100",
      link: "#",
    },
  ];

  const advantages = [
    {
      title: "Accurate Bill Prediction",
      image: "assets/icons8-goa.png",
      description:
        "Get an estimate of your upcoming bill based on our model trained by past rates of Meralco.",
      nth: "#1",
    },
    {
      title: "Energy Optimization Tips",
      image: "/assets/save-energy.png",
      description:
        " Receive smart suggestions on how to reduce energy consumption, helping you save money while using power efficiently.",
      nth: "#2",
    },
    {
      title: "Easy history tracking",
      image: "/assets/history.png",
      description:
        "Easily access and review your past energy usage, so you can monitor trends and make informed decisions.",
      nth: "#3",
    },
    {
      title: "Better for Environment",
      image: "/assets/turbine.png",
      description:
        "By optimizing energy use, you reduce waste and lower your carbon footprint, contributing to a healthier planet.",
      nth: "#4",
    },
  ];

  const carouselImages = [
    "/assets/jebron.jpg",
    "/assets/jebron.jpg",
    "/assets/jebron.jpg",
  ];

  const features = [
    {
      title: "Bill Calculator",
      description:
        "Get insights from your data with our advanced machine learning algorithms that identify patterns and trends automatically.",
      link: "/bill-calculator",
    },
    {
      title: "Responsive Design",
      description:
        "All components are fully responsive and adapt seamlessly to any device size for optimal user experience.",
      link: "#",
    },
    {
      title: "Real-time Collaboration",
      description:
        "Work together with your team in real-time, with changes syncing instantly across all connected devices.",
      link: "#",
    },
  ];

  return (
    <>
      <div className="relative w-full">
        <div className="w-full">
          <HeroParallax products={products} />
        </div>

        <section className="">
          <div className="container  mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
              Main Features
            </h2>

            <HoverEffect items={features} className="gap-4" />
          </div>
        </section>

        <section className="w-full bg-[#f8fbfd] h-auto">
          <div className="about-content container">
            <h1
              className="text-5xl text-font-black font-bold tracking-wide leading-tight pt-30"
              style={{ fontFamily: "Helvetica" }}
            >
              Smart Energy Consumption <br /> Tracker and Predictor
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 gap-y-5 mt-25 ">
              <article className="text-font-black col-span-1 row-span-2 video-container p-5 pt-0">
                <iframe
                  width="100%"
                  height="70%"
                  className="h-[250px]"
                  title="YouTube Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </article>
              <article className="col-span-1 text-font-black">
                <h2
                  className="text-[1.9em] font-semibold leading-tight tracking-wide"
                  style={{ fontFamily: "Helvetica" }}
                >
                  How it works
                </h2>
                <p className="text-[1.1em] mt-3">
                  Input a list of appliances and devices used in their
                  home/building, including quantity and estimated hours of
                  usage, Then <span className="font-semibold">Wattify</span>{" "}
                  will calculate the estimated total energy consumption (in
                  watts or kWh) using a dataset of standard consumption values
                  for each appliance/device.
                </p>
              </article>

              <article className="col-span-1">
                <h2
                  className="text-[1.9em] font-semibold leading-tight tracking-wide"
                  style={{ fontFamily: "Helvetica" }}
                >
                  Energy Optimization Suggestions
                </h2>
                <p className="text-[1.1em] mt-3">
                  Input a list of appliances and devices used in their
                  home/building, including quantity and estimated hours of
                  usage, Then <span className="font-semibold">Wattify</span>{" "}
                  will calculate the estimated total energy consumption (in
                  watts or kWh)
                </p>
              </article>

              <article className="col-span-1 ">
                <h2
                  className="text-[1.9em] font-semibold leading-tight tracking-wide"
                  style={{ fontFamily: "Helvetica" }}
                >
                  Bill Prediction Mode
                </h2>
                <p className="text-[1.1em] mt-3">
                  Input a list of appliances and devices used in their
                  home/building, including quantity and estimated hours of
                  usage, Then <span className="font-semibold">Wattify</span>{" "}
                </p>
              </article>

              <article className="col-span-1">
                <h2
                  className="text-[1.9em] font-semibold leading-tight tracking-wide"
                  style={{ fontFamily: "Helvetica" }}
                >
                  Understand Your Energy Consumption Patterns
                </h2>
                <p className="text-[1.1em] mt-3">
                  Input a list of appliances and devices used in their
                  home/building, including quantity and estimated hours of
                  usage, Then <span className="font-semibold">Wattify</span>{" "}
                  will calculate the estimated total energy consumption (in
                  watts or kWh) using a dataset of standard consumption values
                  for each appliance/device.
                </p>
              </article>
            </div>

            {/* Advantaaaageeeee Section */}
            <section className="py-40">
              <section className=" py-10">
                <div className="w-full mx-auto px-6">
                  <h2
                    className="text-5xl tracking-wide font-extrabold text-center mb-22 "
                    style={{ fontFamily: "Helvetica" }}
                  >
                    Advantages
                  </h2>
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    {/* Advantages List */}
                    <div className="flex-1 space-y-15 pr-0 md:pr-20">
                      {advantages.map((advantage, index) => (
                        <div key={index} className="flex items-start gap-10">
                          {/* Dynamic Image for Each Advantage */}
                          <div className="w-15 h-15 md:w-20 md:h-20 flex items-center justify-center bg-blue-100 rounded-2xl mt-[-20px]">
                            <img
                              src={advantage.image}
                              alt="Icon"
                              className="max-w-full max-h-full object-cover"
                            />
                          </div>
                          {/* Advantage Text */}
                          <div className="relative flex-1 text-font-black">
                            <h3 className="font-semibold leading-tight tracking-wide text-[1.9em] z-10">
                              {advantage.title}
                            </h3>
                            <p className="text-[1.1em] mt-5 z-10">
                              {advantage.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="w-full md:w-[50%] h-[400px]">
                      <Swiper
                        modules={[Navigation, Pagination, Autoplay]}
                        spaceBetween={20}
                        slidesPerView={1}
                        // autoplay={{ delay: 3000, disableOnInteraction: false }}
                        pagination={{ clickable: true }}
                        navigation
                        className="w-full h-full"
                      >
                        {carouselImages.map((image, index) => (
                          <SwiperSlide
                            key={index}
                            className="flex items-center justify-center"
                          >
                            <img
                              src={image}
                              alt={`Carousel ${index}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    </div>
                  </div>
                </div>
              </section>
            </section>
          </div>
        </section>
      </div>
    </>
  );
}

export default HeroPage;
