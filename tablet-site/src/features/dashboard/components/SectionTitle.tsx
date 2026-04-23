import type { LucideIcon } from "lucide-react";

type SectionTitleProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
};

export default function SectionTitle({
  icon: Icon,
  title,
  description,
}: SectionTitleProps) {
  return (
    <div className="flex items-center gap-3 text-white">
      <div className="rounded-2xl bg-white/10 p-2 ring-1 ring-white/10">
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-white">
          {title}
        </h2>
        {description ? (
          <p className="text-sm text-white/65">{description}</p>
        ) : null}
      </div>
    </div>
  );
}