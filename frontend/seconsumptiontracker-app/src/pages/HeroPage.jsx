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
      title: "Dashboard",
      thumbnail:
        "https://www.geckoboard.com/uploads/google-sheets-dashboard-geckoboard--d.png",
      link: "#",
    },
    {
      title: "Smart Meters",
      thumbnail:
        "https://cdn.shopify.com/s/files/1/0070/7032/files/about-us-page-yeti-2.png?v=1716989532",
      link: "#",
    },
    {
      title: "Eco Homes",
      thumbnail:
        "data:image/jpeg;base64,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",
      link: "#",
    },
    {
      title: "Solar Panels",
      thumbnail:
        "https://www.geckoboard.com/uploads/google-sheets-dashboard-geckoboard--d.png",
      link: "#",
    },
    {
      title: "Dashboard",
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
      title: "Eco Homes",
      thumbnail: "https://i.ytimg.com/vi/py3W80hMuzE/maxresdefault.jpg",
      link: "#",
    },
    {
      title: "Solar Panels",
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
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
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
