import { AssetCategory } from "@/types/assets";

export const categoryConfig: Record<AssetCategory, { label: string; icon: string; color: string }> = {
  characters: { label: "Characters", icon: "👤", color: "bg-category-characters" },
  parts: { label: "Parts", icon: "🧩", color: "bg-category-parts" },
  sequences: { label: "Sequences", icon: "🎬", color: "bg-category-sequences" },
  props: { label: "Props", icon: "🎭", color: "bg-category-props" },
  custom: { label: "Custom", icon: "✨", color: "bg-category-custom" },
};
