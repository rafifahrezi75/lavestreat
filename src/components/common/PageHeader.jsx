import React from 'react';
import { Link } from 'react-router-dom';

export function PageHeader({ 
  title, 
  subtitle, 
  breadcrumb = [], 
  bgImage = '/hero-bg.jpg' 
}) {
  return (
    <section className="relative pt-36 pb-16 sm:pb-20 bg-[#07243E] text-white overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-45 mix-blend-luminosity scale-105 transition-transform duration-1000" 
        style={{ backgroundImage: `url('${bgImage}')` }} 
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#07243E]/90 via-[#0A3D66]/80 to-[#07243E]/90" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#07243E]/70 via-transparent to-[#07243E]" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h1 className="font-display font-bold text-3xl sm:text-5xl text-white tracking-tight mb-3 drop-shadow-sm">
          {title}
        </h1>
        {breadcrumb.length > 0 && (
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-brand-200/90 mb-3 font-medium">
            <Link to="/" className="hover:text-white transition-colors">
              Beranda
            </Link>
            {breadcrumb.map((item, idx) => (
              <React.Fragment key={idx}>
                <span className="text-brand-200/50">&gt;</span>
                {item.href ? (
                  <Link to={item.href} className="hover:text-white transition-colors">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-white font-semibold">{item.label}</span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
        {subtitle && (
          <p className="text-xs sm:text-sm text-brand-100/90 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
