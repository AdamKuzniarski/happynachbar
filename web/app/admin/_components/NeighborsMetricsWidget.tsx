"use client";

import * as React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { FormError } from "@/components/ui/FormError";
import { getPublicNeighborsMetrics } from "@/lib/api/public-neighbors";

export function NeighborsMetricsWidget() {
  const [plz, setPlz] = React.useState("10115");
  const [days, setDays] = React.useState(30);
  const [minCount, setMinCount] = React.useState(3);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<{
    activeNeighbors: number;
    thresholdApplied: boolean;
  } | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const res = await getPublicNeighborsMetrics({ plz, days, minCount });
      setResult(
        res
          ? {
              activeNeighbors: res.activeNeighbors,
              thresholdApplied: res.thresholdApplied,
            }
          : null,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <h2 className="text-base font-semibold">Neighbors metric</h2>
      <p className="mt-1 text-sm opacity-80">
        Quick check: active neighbors in a PLZ (privacy threshold included).
      </p>

      <div className="mt-4 grid gap-2 sm:grid-cols-[140px_1fr_1fr_auto]">
        <Input
          value={plz}
          onChange={(e) =>
            setPlz(e.target.value.replace(/\D+/g, "").slice(0, 5))
          }
          placeholder="PLZ"
        />

        <Select
          value={String(days)}
          onChange={(e) => setDays(Number(e.target.value))}
        >
          {[7, 14, 30, 60, 90].map((d) => (
            <option key={d} value={d}>
              {d} days
            </option>
          ))}
        </Select>

        <Select
          value={String(minCount)}
          onChange={(e) => setMinCount(Number(e.target.value))}
        >
          {[1, 2, 3, 5, 10].map((m) => (
            <option key={m} value={m}>
              min {m}
            </option>
          ))}
        </Select>

        <Button
          onClick={() => void run()}
          disabled={loading || plz.length !== 5}
        >
          Check
        </Button>
      </div>

      <div className="mt-3">
        <FormError message={error} />
        {result ? (
          <div className="text-sm">
            <span className="font-medium">Active neighbors:</span>{" "}
            {result.activeNeighbors}
            {result.thresholdApplied ? (
              <span className="ml-2 text-xs opacity-70">
                (threshold applied)
              </span>
            ) : null}
          </div>
        ) : (
          <div className="text-sm opacity-70">No result yet.</div>
        )}
      </div>
    </Card>
  );
}
