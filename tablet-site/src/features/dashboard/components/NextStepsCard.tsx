import { Sparkles } from "lucide-react";

import { Card, CardContent } from "../../../components/ui/card";

type NextStepsCardProps = {
  lastRefresh: Date;
};

export default function NextStepsCard({ lastRefresh }: NextStepsCardProps) {
  return (
    <Card className="bg-gradient-to-br from-white/10 to-white/5">
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-white/10 p-2 ring-1 ring-white/10">
            <Sparkles className="h-5 w-5 text-white" />
          </div>

          <div>
            <div className="text-lg font-semibold text-white">
              Hvad der skal bygges bagefter
            </div>

            <div className="mt-2 text-sm leading-6 text-white/70">
              1. Byg ét backend-endpoint der samler Mealie + vejr + kalendere.
              <br />
              2. Kør dette UI i kiosk-tilstand på tabletten.
              <br />
              3. Tilføj kun touch-venlige undersider dér, hvor de faktisk giver
              værdi.
            </div>

            <div className="mt-4 text-xs uppercase tracking-[0.18em] text-white/45">
              Sidst opdateret{" "}
              {lastRefresh.toLocaleTimeString("da-DK", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}