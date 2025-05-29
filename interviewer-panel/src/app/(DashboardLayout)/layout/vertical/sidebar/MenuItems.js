import { uniqueId } from "lodash";

import {
  IconAperture,
  IconBrandPaypal,
  IconMailCheck
} from "@tabler/icons-react";
import { IconHelp } from "@tabler/icons-react";

const Menuitems = [
  {
    navlabel: true,
    subheader: "Home",
  },

  {
    id: uniqueId(),
    title: "Dashboard",
    icon: IconAperture,
    href: "/",
    chipColor: "secondary",
  },

  {
    id: uniqueId(),
    title: "Interviewer",
    icon: IconAperture,
    href: "/interviewer",
    chipColor: "secondary",
  },
  // {

  //   id: uniqueId(),
  //   title: "Make a call",
  //   icon: IconHelp,
  //   href: "tel:+919016600610",
  // },
];

export default Menuitems;
