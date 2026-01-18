import {
  Chart,
  ControlBar,
  DashHeader,
  ExpenseFiltersStoreProvider,
  Totalizers,
} from "@/features/dashboard";

export default function Page() {
  return (
    <div className="p-4 md:p-8 flex-1">
      <ExpenseFiltersStoreProvider>
        <DashHeader />
        <Totalizers />
        <ControlBar />
        <Chart />
      </ExpenseFiltersStoreProvider>
    </div>
  );
}
