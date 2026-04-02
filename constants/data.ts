import { icons } from "./icons";

export const tabs = [
  { name: "index", title: "Home", icon: icons.home },
  { name: "subscriptions/index", title: "Subscriptions", icon: icons.wallet },
  { name: "insights", title: "Insights", icon: icons.activity },
  { name: "settings", title: "Settings", icon: icons.setting },
  {
    name: "subscriptions/[id]",
    title: "Subscriptions",
    icon: icons.wallet,
    href: null,
  },
];
