import type { Product } from "@/app/lib/types";
import { HeroClient } from "./HeroClient";

type HeroSectionProps = {
  pickerProducts: Product[];
  dropName: string;
  /** Single designs in the current drop, for the badge and fact rows. */
  designCount: number;
  finishes: string[];
};

export const HeroSection = (props: HeroSectionProps) => <HeroClient {...props} />;
