declare module "*.svg?react" {
  import * as React from "react";
  export const Component: React.FC<React.SVGProps<SVGSVGElement>>;

  export default Component;
}
  