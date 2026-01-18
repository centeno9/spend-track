import {
  Chart,
  ControlBar,
  DashHeader,
  ExpenseFiltersStoreProvider,
  TagFilter,
  Totalizers,
} from "@/features/dashboard";

export default function Page() {
  return (
    <div className="p-4 md:p-8 flex-1">
      <ExpenseFiltersStoreProvider>
        <DashHeader />
        <Totalizers />
        <ControlBar />
        <TagFilter />
        <Chart />
      </ExpenseFiltersStoreProvider>
    </div>
  );
}
