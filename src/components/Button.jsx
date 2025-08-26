export default function Button({
  children,
  className = "",
  variant = "primary",
  ...props
}) {
  const variants = {
    icon: "bg-white hover:bg-gray-100  text-[#1E1D1D] rounded-full p-2",
  };

  return (
    <button className={` ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
