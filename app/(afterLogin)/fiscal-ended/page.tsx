export default function FiscalEndedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-2 text-center">
      <h1 className="text-3xl font-bold text-yellow-400">
        ⚠️ Fiscal Year Ended
      </h1>
      <p className="text-white max-w-md">
        Your organization&#39;s active fiscal year has ended. Please contact
        your administrator for further access.
      </p>
    </div>
  );
}
