type DashboardLoadingStateProps = {
  message?: string;
};

export default function DashboardLoadingState({
  message = "Henter dashboard-data...",
}: DashboardLoadingStateProps) {
  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-4 p-4 md:p-6 lg:p-8">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
          {message}
        </div>
      </div>
    </div>
  );
}