import React, { useState, useEffect } from "react";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@radix-ui/react-hover-card";
import { motion } from "framer-motion";

const LinkPreview = ({
  children,
  url,
  className = "",
  width = 200,
  height = 125,
  imageSrc = "",
  isStatic = true, // Default to static image for simplicity
}) => {
  const [isOpen, setOpen] = useState(false);

  // If not using a static image, you'd need to implement a way to get preview screenshots
  // For simplicity, this example uses only static images
  const previewSrc = isStatic ? imageSrc : url;

  return (
    <HoverCard openDelay={50} closeDelay={100} onOpenChange={setOpen}>
      <HoverCardTrigger
        className={` hover:text-blue-200  ${className}`}
        asChild
      >
        <a href={url} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      </HoverCardTrigger>

      <HoverCardContent
        side="top"
        align="center"
        sideOffset={10}
        className="p-0 border-0 shadow-none"
      >
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.6 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: { type: "spring", stiffness: 260, damping: 20 },
            }}
            exit={{ opacity: 0, y: 20, scale: 0.6 }}
            className="shadow-xl rounded-xl"
          >
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-1 bg-white border-2 border-transparent shadow rounded-xl hover:border-neutral-200 dark:hover:border-neutral-800"
            >
              <img
                src={previewSrc}
                width={width}
                height={height}
                className="rounded-lg"
                alt="Link preview"
              />
            </a>
          </motion.div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
};

export default LinkPreview;
