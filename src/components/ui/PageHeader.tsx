import { Plus } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description: string;
  icon: any;
  actionButtonLabel?: string;
  onAction?: () => void;
}

export function PageHeader({ title, description, icon: Icon, actionButtonLabel, onAction }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h2 className="text-[28px] font-bold text-text-primary font-poppins tracking-tight flex items-center">
          {Icon && <Icon className="w-7 h-7 mr-3 text-primary-blue" />}
          {title}
        </h2>
        <p className="text-sm text-text-secondary mt-1">{description}</p>
      </div>
      {actionButtonLabel && onAction && (
        <button 
          onClick={onAction}
          className="bg-gradient-to-r from-primary-blue to-blue-500 hover:from-blue-600 hover:to-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/50 transition-all flex items-center justify-center transform active:scale-95"
        >
          <Plus className="w-5 h-5 mr-1" />
          {actionButtonLabel}
        </button>
      )}
    </div>
  );
}
