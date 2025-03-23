import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

const Toaster = ({ ...props }) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner theme={theme} className="toaster group bg-gray-900" {...props} />
  );
};

export { Toaster };
