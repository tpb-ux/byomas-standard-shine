import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const typographyVariants = cva("", {
  variants: {
    variant: {
      h1: "text-4xl md:text-5xl lg:text-6xl font-light tracking-kinexys leading-tight",
      h2: "text-3xl md:text-4xl font-light tracking-kinexys leading-tight",
      h3: "text-2xl md:text-3xl font-normal tracking-normal leading-snug",
      h4: "text-xl md:text-2xl font-normal tracking-normal leading-snug",
      label: "text-xs font-medium uppercase tracking-widest",
      body: "text-base font-normal leading-relaxed",
      bodyLarge: "text-lg font-normal leading-relaxed",
      caption: "text-sm font-normal",
      muted: "text-sm",
    },
    textColor: {
      default: "text-foreground",
      primary: "text-primary",
      muted: "text-muted-foreground",
      inherit: "",
    },
  },
  defaultVariants: {
    variant: "body",
    textColor: "default",
  },
});

export interface TypographyProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'color'>,
    VariantProps<typeof typographyVariants> {
  as?: keyof JSX.IntrinsicElements;
}

const variantToElement: Record<string, keyof JSX.IntrinsicElements> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  label: "span",
  body: "p",
  bodyLarge: "p",
  caption: "span",
  muted: "span",
};

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant, textColor, as, children, ...props }, ref) => {
    const Component = as || variantToElement[variant || "body"] || "p";
    
    return React.createElement(
      Component,
      {
        ref,
        className: cn(typographyVariants({ variant, textColor }), className),
        ...props,
      },
      children
    );
  }
);

Typography.displayName = "Typography";

export { Typography, typographyVariants };
