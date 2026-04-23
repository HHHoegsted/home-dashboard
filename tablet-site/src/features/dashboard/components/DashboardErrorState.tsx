type DashboardErrorStateProps = {
  message?: string;
};

export default function DashboardErrorState({
  message = "Dashboard-data kunne ikke indlæses.",
}: DashboardErrorStateProps) {
  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-4 p-4 md:p-6 lg:p-8">
        <div className="rounded-2xl border border-red-400/30 bg-red-300/10 px-4 py-3 text-sm text-red-100">
          {message}
        </div>
      </div>
    </div>
  );
}