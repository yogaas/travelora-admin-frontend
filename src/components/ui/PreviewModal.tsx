import { X } from "lucide-react";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: any;
  isLoading?: boolean;
}

export function PreviewModal({ isOpen, onClose, title, data, isLoading }: PreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-[24px] shadow-premium w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 shrink-0">
          <h2 className="text-lg font-semibold text-text-primary font-poppins">
            Preview {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
            {isLoading ? (
                <div className="flex justify-center py-12">
                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue"></div>
                </div>
            ) : data ? (
                <pre className="bg-gray-50 p-4 rounded-xl text-sm font-mono text-text-secondary overflow-x-auto">
                    {JSON.stringify(data, null, 2)}
                </pre>
            ) : (
                <div className="text-center text-text-secondary py-8">No data available</div>
            )}
        </div>
      </div>
    </div>
  );
}
