import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

function CountUpNumber({ end, decimals = 0, suffix = '', prefix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  useEffect(() => {
    if (!isInView) return;

    let startTime = null;
    const duration = 1800; // ms

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = ease * end;
      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(step);
  }, [isInView, end]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {count.toFixed(decimals)}
      {suffix}
    </span>
  );
}

export default function StatsBand() {
  const stats = [
    { label: 'Students Placed', end: 212, suffix: '', decimals: 0, caption: 'Across 4 engineering streams' },
    { label: 'Average Package', end: 14.8, suffix: ' LPA', decimals: 1, caption: '+24% higher than last batch' },
    { label: 'Recruitment Drives', end: 58, suffix: '+', decimals: 0, caption: 'Top Tier 1 Tech Partners' },
    { label: 'Placement Rate', end: 41.7, suffix: '%', decimals: 1, caption: 'Ongoing drive season 2026' },
  ];

  return (
    <section id="stats" className="py-20 bg-white border-y border-black/[0.05]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 divide-y lg:divide-y-0 lg:divide-x divide-black/[0.06]">
          {stats.map((stat, idx) => (
            <div key={idx} className={`pt-6 lg:pt-0 ${idx > 0 ? 'lg:pl-8' : ''}`}>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-2">
                {stat.label}
              </p>
              <div className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl text-[#0B0B0F] tracking-tight mb-2">
                <CountUpNumber
                  end={stat.end}
                  decimals={stat.decimals}
                  suffix={stat.suffix}
                />
              </div>
              <p className="text-xs text-[#94A3B8] font-medium">{stat.caption}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
