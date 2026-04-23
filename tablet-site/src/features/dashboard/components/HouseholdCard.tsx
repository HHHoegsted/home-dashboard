import { Users } from "lucide-react";

import { Card, CardContent, CardHeader } from "../../../components/ui/card";
import type { DashboardData } from "../../../types/dashboard";
import MetricPill from "./MetricPill";
import SectionTitle from "./SectionTitle";

type HouseholdCardProps = {
  data: DashboardData;
};

export default function HouseholdCard({ data }: HouseholdCardProps) {
  return (
    <Card>
      <CardHeader>
        <SectionTitle
          icon={Users}
          title="Hjemmet"
          description="Mulige tilføjelser senere"
        />
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {data.household.map((item) => (
            <MetricPill
              key={item.id}
              label={item.label}
              value={item.value}
            />
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-dashed border-white/15 bg-white/5 p-4 text-sm text-white/65">
          Senere kan du udvide dette med Home Assistant-sensorer,
          skraldeafhentning, skolepåmindelser, indeklima, pakkepost eller
          afgange.
        </div>
      </CardContent>
    </Card>
  );
}