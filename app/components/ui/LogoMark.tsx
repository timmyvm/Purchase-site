import Image from "next/image";
import { BUSINESS } from "@/app/lib/business-identity";

type LogoMarkProps = {
  className?: string;
  /**
   * The logo renders several times per page (header, mobile header, drawer,
   * footer). Only the main header copy names the brand; the others pass ""
   * so screen readers don't read the brand name four times.
   */
  alt?: string;
};

export const LogoMark = ({ className = "", alt = BUSINESS.tradingName }: LogoMarkProps) => (
  <span className={`inline-flex shrink-0 items-center ${className}`}>
    <Image
      src="/images/logo.svg"
      alt={alt}
      width={1920}
      height={1080}
      className="h-full w-auto max-w-full object-contain"
    />
  </span>
);
