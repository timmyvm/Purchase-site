import type { HTMLAttributes } from "react";

type ContainerProps = HTMLAttributes<HTMLDivElement>;

export const Container = ({ className = "", ...props }: ContainerProps) => (
  <div className={`mx-auto w-full max-w-6xl px-6 ${className}`} {...props} />
);

