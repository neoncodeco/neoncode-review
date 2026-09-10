export const TEAM_ROLES = [
  "Designer",
  "Sales Executive",
  "Project Manager",
];

export const DESIGNATION_OPTIONS = [
  "Designer",
  "Sales Executive",
  "Project Manager",
];

/** Initial seed / client fallback */
export const TEAM_SEED = [
  {
    name: "Prince Bala",
    designation: "Project Manager",
    image: "",
  },
  {
    name: "Sagor Mandal",
    designation: "Sales Executive",
    image: "",
  },
  {
    name: "Abdullah Jilhan",
    designation: "Sales Executive",
    image: "",
  },
  {
    name: "Mithul",
    designation: "Sales Executive",
    image: "",
  },
  {
    name: "Abdullah",
    designation: "Designer",
    image: "",
  },
  {
    name: "Turan",
    designation: "Designer",
    image: "",
  },
  {
    name: "Israfil",
    designation: "Designer",
    image: "",
  },
  {
    name: "Fahim",
    designation: "Designer",
    image: "",
  },
  {
    name: "Jobaer",
    designation: "Designer",
    image: "",
  },
];

export function slugify(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
