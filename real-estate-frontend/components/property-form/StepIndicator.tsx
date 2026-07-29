const steps = ['Basic Information', 'Description', 'Attachment', 'Submit'];

export default function StepIndicator({ current }: { current: number }) {
  return (
    <div className="bg-[#002d52] rounded-xl p-5 mb-6">
      <div className="flex items-center justify-between relative">
        {/* connecting line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-[#004d84] z-0" />
        {steps.map((label, i) => {
          const step = i + 1;
          const done    = step < current;
          const active  = step === current;
          return (
            <div key={step} className="flex flex-col items-center z-10 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all
                ${done   ? 'bg-[#3d8fc0] border-[#3d8fc4] text-white'
                : active ? 'bg-white border-white text-[#003d6b]'
                :          'bg-[#002d52] border-[#005e9e] text-[#3d8fc4]'}`}>
                {done ? '?' : step}
              </div>
              <span className={`mt-2 text-xs font-semibold text-center leading-tight
                ${active ? 'text-white' : 'text-[#3d8fc4]'}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
