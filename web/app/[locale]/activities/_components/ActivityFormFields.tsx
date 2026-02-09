"use client";

import { ACTIVITY_CATEGORIES, formatActivityCategory } from "@/lib/api/enums";
import type { ActivityFormFieldsProps } from "@/lib/api/types";
import { normalizePostalCodeInput } from "@/lib/validators";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

export function ActivityFormFields(props: ActivityFormFieldsProps) {
  const {
    title,
    setTitle,
    category,
    setCategory,
    plz,
    setPlz,
    description,
    setDescription,
    startAt,
    setStartAt,
  } = props;

  return (
    <>
      <div>
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="z.B. Spaziergang im Park"
        />
        <div className="mt-1 text-right text-xs text-hunter">
          {title.length}/120
        </div>
      </div>

      <div>
        <Label htmlFor="category">Kategorie *</Label>
        <Select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Bitte wählen</option>
          {ACTIVITY_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {formatActivityCategory(c)}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="plz">PLZ *</Label>
        <Input
          value={plz}
        onChange={(e) => setPlz(normalizePostalCodeInput(e.target.value))}
          inputMode="numeric"
          maxLength={5}
          placeholder="10115"
        />
      </div>

      <div>
        <Label htmlFor="desc">Beschreibung</Label>
        <Textarea
          id="desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional…"
        />
        <div className="mt-1 text-right text-xs text-hunter">
          {description.length}/2000
        </div>
      </div>

      <div>
        <Label htmlFor="startAt">Startzeit (optional)</Label>
        <Input
          id="startAt"
          type="datetime-local"
          value={startAt}
          onChange={(e) => setStartAt(e.target.value)}
        />
      </div>
    </>
  );
}
