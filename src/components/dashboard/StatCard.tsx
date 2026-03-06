import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  trend?: string;
}

export function StatCard({ label, value, icon: Icon, color, trend }: StatCardProps) {
  return (
    <Card className="border-none shadow-sm overflow-hidden bg-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("p-2 rounded-lg", color)}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend && (
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
              {trend}
            </span>
          )}
        </div>
        <div className="space-y-1">
          <h3 className="text-2xl font-headline font-bold">{value}</h3>
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}