import { Button } from "@/shared/components/ui/button";
import { Plus } from "lucide-react";

export const DashHeader = () => {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Overview of your spending habits
        </p>
      </div>
      <Button className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-all hover:shadow-md active:scale-95">
        <Plus size={18} />
        New Expense
      </Button>
    </header>
  );
};
