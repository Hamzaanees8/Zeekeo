import { motion } from "framer-motion";

export default function Card({ plan, price, style, onClick }) {
  return (
    <motion.div
      onClick={onClick}
      className="absolute w-[160px] px-[6px] py-[10px]  rounded-[8px] h-[160px] md:w-[240px] md:h-[240px] cursor-pointer bg-white text-black shadow-md xl:py-[32px] xl:px-[18px] lg:w-[190px] lg:h-[215px] lg:px-[10px] lg:py-[20px] xl:w-[260px] xl:h-[240px]"
      animate={style}
      transition={{ type: "tween", duration: 0.6, ease: "easeInOut" }}
    >
      <div className="flex flex-col gap-y-2 md:gap-y-6 lg:gap-y-3 xl:gap-y-6">
        <div className="text-center">
          <h3 className="text-[#0387FF] font-normal text-xs sm:text-sm">
            {plan.title}
          </h3>
          <p className="text-black text-[10px] sm:text-xs font-normal mt-0.5">
            {plan.description}
          </p>
        </div>

        <div className="text-center space-y-1">
          <h1 className="text-[25px] sm:text-[48px] font-semibold lg:text-[35px] xl:text-[48px]">
            ${price}
            <span className="text-[10px] sm:text-sm font-medium">USD</span>
          </h1>
          <div>
            <p className="text-[10px] sm:text-xs  font-normal text-black">
              {plan.type === "individual" ? `Per month` : `Per month per user`}
            </p>
            <p className="text-[8px] sm:text-[10px] font-normal text-black">
              {plan.type === "individual" ? "" : "Minimum 2 users"}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
