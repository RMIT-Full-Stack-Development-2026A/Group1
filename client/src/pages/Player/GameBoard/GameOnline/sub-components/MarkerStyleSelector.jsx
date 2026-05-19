import { getMarkerVariants } from '@/pages/Player/GameCustomization/service/customization.service';

export default function MarkerStyleSelector({ selectedMarkerStyle, onSelect }) {
    const markerVariants = getMarkerVariants();

    return (
        <section className="w-65 shrink-0 flex flex-col gap-3 bg-[#12121f] border border-outline-variant px-4 py-3 shadow-[2px_2px_0px_#343342]">
            <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-primary-cyan" />
                <span className="font-mono text-[10px] text-primary-cyan uppercase tracking-widest">
                    MARKER STYLE
                </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
                {markerVariants.map((variant) => {
                    const isSelected = selectedMarkerStyle === variant.id;

                    return (
                        <button
                            key={variant.id}
                            type="button"
                            onClick={() => onSelect(variant.id)}
                            className={`flex flex-col items-center justify-center gap-1 px-2 py-2 border transition-all duration-200 ${
                                isSelected
                                    ? 'border-primary-cyan bg-[#1a2530] shadow-[0_0_12px_rgba(76,201,240,0.2)]'
                                    : 'border-outline-variant bg-[#10101b] hover:border-primary-cyan/60 hover:bg-[#171728]'
                            }`}
                        >
                            <div className={`flex gap-1 ${variant.skewed ? 'italic skew-x-12' : ''}`}>
                                {variant.isSymbol ? (
                                    <>
                                        <div className="w-2 h-2 bg-cyan-400" />
                                        <div className="w-2 h-2 border border-cyan-400" />
                                    </>
                                ) : (
                                    <>
                                        <span className={`font-headline text-sm ${variant.xColor} ${variant.xGlow}`}>X</span>
                                        <span className={`font-headline text-sm ${variant.oColor} ${variant.oGlow}`}>O</span>
                                    </>
                                )}
                            </div>
                            <span className="font-mono text-[8px] text-[#879398] uppercase tracking-widest">
                                {variant.id}
                            </span>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}