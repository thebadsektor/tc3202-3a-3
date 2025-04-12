import React from "react";
import { Button } from "./moving-border";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export const HeroParallax = ({ products }) => {
  const firstRow = products.slice(0, 5);
  const secondRow = products.slice(5, 10);
  const thirdRow = products.slice(10, 15);
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const springConfig = { stiffness: 300, damping: 30, bounce: 100 };

  const translateX = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, 1000]),
    springConfig
  );
  const translateXReverse = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, -1000]),
    springConfig
  );
  const rotateX = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [50, 0]),
    springConfig
  );
  const opacity = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [0.1, 1]),
    springConfig
  );
  const rotateZ = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [30, 0]),
    springConfig
  );
  const translateY = useSpring(
    useTransform(scrollYProgress, [0, 0.2], [-700, 100]),
    springConfig
  );

  return (
    <>
      <div
        ref={ref}
        className="h-[230vh] py-20 overflow-hidden antialiased relative flex flex-col self-auto perspective-1000 transform-style-3d"
      >
        <Header />
        <motion.div style={{ rotateX, rotateZ, translateY, opacity }}>
          {/* First row - now responsive with smaller spacing on mobile */}
          <motion.div className="flex flex-row-reverse space-x-reverse space-x-20 md:space-x-20 sm:space-x-10 xs:space-x-6 mb-20 md:mb-20 sm:mb-10">
            {firstRow.map((product) => (
              <ProductCard
                product={product}
                translate={translateX}
                key={product.title}
              />
            ))}
          </motion.div>

          {/* Second row - now responsive with smaller spacing on mobile */}
          <motion.div className="flex flex-row mb-20 md:mb-20 sm:mb-20 space-x-20 md:space-x-20 sm:space-x-10 xs:space-x-6">
            {secondRow.map((product) => (
              <ProductCard
                product={product}
                translate={translateXReverse}
                key={product.title}
              />
            ))}
          </motion.div>

          {/* Third row - now visible on all screen sizes */}
          <motion.div className="flex flex-row-reverse space-x-reverse space-x-20 md:space-x-20 sm:space-x-10 xs:space-x-6">
            {thirdRow.map((product) => (
              <ProductCard
                product={product}
                translate={translateX}
                key={product.title}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export const Header = () => {
  return (
    <div className="max-w-7xl container relative mx-auto py-20 md:py-40 px-4 w-full left-0 top-0">
      <p className="text-blue-300 text-center md:text-left text-base md:text-base">
        Smart Energy Consumption using AI.
      </p>
      <h1 className="text-center md:text-left text-5xl md:text-7xl font-bold text-white">
        Optimize energy,
        <br />
        Maximize{" "}
        <span className="bg-gradient-to-r from-cta-blue to-[#c124ff] bg-clip-text text-transparent">
          savings.
        </span>
      </h1>

      <p className="text-center md:text-left max-w-2xl text-base md:text-xl mt-8 text-neutral-200">
        Empower your energy decisions with AI! Our smart tool analyzes your
        electricity consumption, provides real-time insights, and helps you save
        money while reducing waste.
      </p>

      <div className="pt-10">
        <Button
          containerClassName="shadow-lg"
          borderClassName="bg-blue-500"
          duration={3000}
          className="hover:bg-sky-900 transition-all cursor-pointer text-xl z-10"
        >
          Get Started
        </Button>
      </div>

      <div className="mt-35 grid grid-cols-1 sm:grid-cols-3 gap-2 text-center sm:divide-x divide-gray-400">
        <div className="px-4">
          <h2 className="text-2xl font-bold text-cta-bluegreen">98.25%</h2>
          <p className="text-white/80 text-lg">Bill Prediction Rate</p>
        </div>
        <div className="px-4">
          <h2 className="text-2xl font-bold text-cta-bluegreen">97.94%</h2>
          <p className="text-white/80 text-lg">
            Energy Consumption Prediction Rate
          </p>
        </div>
        <div className="px-4">
          <h2 className="text-2xl font-bold text-cta-bluegreen">4.8/5</h2>
          <p className="text-white/80 text-lg">User Satisfaction</p>
        </div>
      </div>
    </div>
  );
};

export const ProductCard = ({ product, translate }) => {
  return (
    <motion.div
      style={{ x: translate }}
      whileHover={{ y: -20 }}
      key={product.title}
      className="group/product h-96 w-[30rem] xs:w-[15rem] relative shrink-0"
    >
      <a
        href={product.link}
        target="_blank"
        rel="noopener noreferrer"
        className="block group-hover/product:shadow-2xl"
      >
        <img
          src={product.thumbnail}
          className="object-cover object-center absolute h-full w-full inset-0 shadow-2xl hover:shadow-lg transition-shadow duration-300 rounded-md"
          alt={product.title}
          loading="lazy"
        />
      </a>
      <div className="absolute inset-0 h-full w-full opacity-0 group-hover/product:opacity-80 bg-black pointer-events-none"></div>
      <h2 className="absolute bottom-4 left-4 opacity-0 group-hover/product:opacity-100 text-white">
        {product.title}
      </h2>
    </motion.div>
  );
};
