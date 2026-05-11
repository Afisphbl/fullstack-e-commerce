import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as LucideIcons from "lucide-react";

// Common icons for features
const COMMON_ICONS = [
  "Truck",
  "Shield",
  "Zap",
  "Award",
  "Users",
  "Globe",
  "Heart",
  "Star",
  "CheckCircle",
  "Package",
  "CreditCard",
  "Clock",
  "MapPin",
  "Phone",
  "Mail",
  "MessageCircle",
  "ShoppingCart",
  "Gift",
  "Sparkles",
  "TrendingUp",
  "Target",
  "Lightbulb",
  "Rocket",
  "Crown",
  "Gem",
  "Leaf",
  "Sun",
  "Moon",
  "Cloud",
  "Wifi",
];

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  label?: string;
  disabled?: boolean;
}

export default function IconPicker({
  value,
  onChange,
  label = "Icon",
  disabled = false,
}: IconPickerProps) {
  const [search, setSearch] = useState("");

  const filteredIcons = COMMON_ICONS.filter((icon) =>
    icon.toLowerCase().includes(search.toLowerCase())
  );

  const renderIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    if (!IconComponent) return null;
    return <IconComponent className="h-4 w-4" />;
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue>
            <div className="flex items-center gap-2">
              {renderIcon(value)}
              <span>{value || "Select an icon"}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <div className="p-2">
            <Input
              placeholder="Search icons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-2"
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {filteredIcons.map((icon) => (
              <SelectItem key={icon} value={icon}>
                <div className="flex items-center gap-2">
                  {renderIcon(icon)}
                  <span>{icon}</span>
                </div>
              </SelectItem>
            ))}
          </div>
        </SelectContent>
      </Select>
    </div>
  );
}
