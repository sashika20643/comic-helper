// Field definitions for each design type. Add / rename fields here —
// values are stored as JSON so no database migration is needed.

export type FieldDef = {
  key: string;
  label: string;
  type?: "text" | "textarea";
  placeholder?: string;
  options?: string[]; // suggestions shown while typing
};

export type KindConfig = {
  slug: "characters" | "mechanics" | "environments";
  label: string;
  singular: string;
  fields: FieldDef[];
  imageTags: string[];
};

export const KINDS: KindConfig[] = [
  {
    slug: "characters",
    label: "Characters",
    singular: "Character",
    fields: [
      { key: "age", label: "Age", placeholder: "e.g. 17" },
      {
        key: "category",
        label: "Category",
        options: ["Protagonist", "Antagonist", "Supporting", "Side", "Creature"],
      },
      { key: "level", label: "Character level", placeholder: "e.g. Lv 3 / Rookie" },
      { key: "power", label: "Power / abilities", type: "textarea" },
      { key: "special", label: "Special things", type: "textarea", placeholder: "Signature items, quirks, catchphrases…" },
      { key: "appearance", label: "Appearance", type: "textarea", placeholder: "Height, build, colours, outfit…" },
      { key: "personality", label: "Personality", type: "textarea" },
      { key: "backstory", label: "Backstory", type: "textarea" },
    ],
    imageTags: ["Character sheet", "Reference", "Expression", "Pose", "Outfit"],
  },
  {
    slug: "mechanics",
    label: "Mechanics",
    singular: "Mechanic",
    fields: [
      { key: "category", label: "Category", options: ["Power system", "Technology", "Magic", "Rule", "Item", "Vehicle"] },
      { key: "howItWorks", label: "How it works", type: "textarea" },
      { key: "rules", label: "Rules & limits", type: "textarea" },
      { key: "cost", label: "Cost / weakness", type: "textarea" },
      { key: "usedBy", label: "Used by", placeholder: "Characters or groups" },
      { key: "visuals", label: "Visual effects / look", type: "textarea" },
    ],
    imageTags: ["Concept", "Reference", "Diagram", "Effect"],
  },
  {
    slug: "environments",
    label: "Environments",
    singular: "Environment",
    fields: [
      { key: "type", label: "Type", options: ["City", "Interior", "Forest", "Desert", "Ocean", "Space", "Village"] },
      { key: "location", label: "Location / region" },
      { key: "era", label: "Era / time of day" },
      { key: "mood", label: "Mood & atmosphere", type: "textarea" },
      { key: "palette", label: "Colour palette & lighting", type: "textarea" },
      { key: "features", label: "Key features / landmarks", type: "textarea" },
      { key: "significance", label: "Story significance", type: "textarea" },
    ],
    imageTags: ["Concept", "Reference", "Map", "Lighting"],
  },
];

export function getKind(slug: string): KindConfig | undefined {
  return KINDS.find((k) => k.slug === slug);
}
