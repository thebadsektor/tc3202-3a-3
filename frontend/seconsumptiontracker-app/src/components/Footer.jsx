import { StickyScroll } from "../components/ui/sticky-scroll-reveal";

function Footer() {
  const contentData = [
    {
      title: "Introduction",
      description: "This is an introduction to the sticky scrolling component.",
      content: (
        <div className="h-full w-full bg-gray-200 flex items-center justify-center">
          <img
            src="https://i.ytimg.com/vi/jC3jpjgesXA/maxresdefault.jpg"
            alt=""
          />
        </div>
      ),
    },
    {
      title: "Features",
      description: "Learn about the powerful features of this component.",
      content: (
        <div className="h-full w-full bg-blue-300 flex items-center justify-center">
          Features Section
        </div>
      ),
    },
    {
      title: "Conclusion",
      description: "A brief summary of what you've learned.",
      content: (
        <div className="h-full w-full bg-green-300 flex items-center justify-center">
          Conclusion Section
        </div>
      ),
    },
  ];

  return (
    <>
      <div className=" w-full bg-gray-900">
        <StickyScroll content={contentData} />
      </div>
    </>
  );
}

export default Footer;
