import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Eye, 
  CheckCircle, 
  Clock, 
  Users 
} from '@phosphor-icons/react';
import { PageHeader } from '../../components/common/PageHeader';
import { contentApi } from '../../lib/api';

const teamMembers = [
  {
    name: 'Naufal Ghani',
    role: 'Chief Executive Officer (CEO)',
    badge: 'CEO',
    photo: '/team/naufal-ghani.png',
    desc: 'Pemimpin visi strategis bisnis, pengembangan inovasi layanan, dan tata kelola kepemimpinan Lave Streat.'
  },
  {
    name: 'M. Rafi Fahrezi',
    role: 'Chief Operating Officer (COO)',
    badge: 'COO',
    photo: '/team/rafi-fahrezi.png',
    desc: 'Penanggung jawab eksekusi operasional workshop harian, kontrol kualitas mutu perawatan, dan manajemen logistik.'
  },
  {
    name: 'M. Raditya P. P.',
    role: 'Chief Marketing Officer (CMO)',
    badge: 'CMO',
    photo: '/team/raditya.png',
    desc: 'Pengembang strategi pemasaran kreatif, komunikasi brand, serta perluasan jangkauan pelanggan Sidoarjo dan Surabaya.'
  }
];

export function AboutPage() {
  const [aboutData, setAboutData] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await contentApi.getAboutContent();
        setAboutData(data);
      } catch {
      }
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-white page-smooth-enter">
      
      <PageHeader
        title="About Us"
        breadcrumb={[{ label: 'About Us' }]}
        subtitle="Mengenal lebih dekat dedikasi, komitmen mutu, dan tim di balik perawatan sepatu manual profesional Lave Streat."
        bgImage="/specialist.jpg"
      />

      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            
            <div className="lg:col-span-6 flex flex-col justify-between py-0.5">
              <div>
                <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-brand-900 tracking-tight mb-4">
                  About Company
                </h2>
                <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-4">
                  <p>
                    {aboutData?.sejarah || 'Lave Streat berdiri di Sidoarjo berawal dari kecintaan terhadap budaya sneakers dan kebutuhan akan perawatan sepatu yang higienis serta aman. Bermula dari melayani teman-teman komunitas dan keluarga, kini Lave Streat hadir memberikan solusi perawatan sepatu terpercaya dengan kemudahan penjemputan untuk wilayah Sidoarjo dan Surabaya.'}
                  </p>
                  <p>
                    Kami meyakini bahwa sepatu yang bersih bukan sekadar tampilan luar, melainkan tentang kenyamanan pemakaian sehari-hari, kesehatan kaki, serta merawat daya tahan material sepatu favorit Anda agar bertahan lebih lama tanpa merusak jahitan, lem, maupun serat bahan.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 relative mt-8 lg:mt-0 flex">
              <div className="absolute -top-5 -left-3 sm:-top-6 sm:-left-4 w-20 h-28 sm:w-24 sm:h-32 rounded-t-full bg-brand-600 z-0 pointer-events-none" />
              <div className="absolute -bottom-5 -right-3 sm:-bottom-6 sm:-right-4 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-brand-600 z-0 pointer-events-none" />
              
              <div className="relative z-10 w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-md border border-brand-200/80 bg-brand-100 min-h-[220px] lg:min-h-full">
                <img
                  src="/about-shoes-cleaning.jpg"
                  alt="Aktivitas Perawatan Sepatu Manual Workshop Lave Streat"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-brand-light border-y border-brand-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600 block mb-2">
              KOMITMEN & ARAH
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-4xl text-brand-900 tracking-tight">
              Visi & Misi Kami
            </h2>
            <p className="text-xs sm:text-sm text-slate-wet mt-2 max-w-lg mx-auto">
              Fondasi filosofi dan komitmen utama kami dalam merawat setiap pasang sepatu kepercayaan Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            <div className="bg-white rounded-3xl border border-brand-200 p-8 sm:p-10 shadow-xs hover:border-brand-600/50 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center mb-6 shadow-xs">
                  <Eye size={28} weight="bold" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-brand-600 block mb-1">
                  VISION
                </span>
                <h3 className="font-display font-bold text-xl sm:text-2xl text-brand-900 mb-4">
                  Visi Perusahaan
                </h3>
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                  {aboutData?.visi || 'Menjadi studio perawatan dan restorasi sepatu paling terpercaya di Jawa Timur yang mengedepankan kualitas pengerjaan tangan detail, standar higienis tinggi, serta kemudahan akses penjemputan terpadu bagi masyarakat.'}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-brand-200 p-8 sm:p-10 shadow-xs hover:border-brand-600/50 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-brand-900 text-white flex items-center justify-center mb-6 shadow-xs">
                  <Target size={28} weight="bold" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-brand-600 block mb-1">
                  MISSION
                </span>
                <h3 className="font-display font-bold text-xl sm:text-2xl text-brand-900 mb-4">
                  Misi Perusahaan
                </h3>
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                  {aboutData?.misi || 'Memberikan layanan penjemputan yang tepat waktu, mengedukasi perawatan sepatu yang ramah material, memformulasikan cairan pembersih berkualitas tanpa merusak serat, serta memberikan jaminan kepuasan pelanggan penuh.'}
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-600 block mb-2">
              TIM KEPEMIMPINAN
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-4xl text-brand-900 tracking-tight">
              Meet Our Team
            </h2>
            <p className="text-xs sm:text-sm text-slate-wet mt-3 max-w-xl mx-auto leading-relaxed">
              Tim kepemimpinan dan pendiri Lave Streat yang berdedikasi menghadirkan standar perawatan sepatu profesional dan terpercaya.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {teamMembers.map((member) => (
              <div
                key={member.name}
                className="bg-white rounded-md border border-brand-200 p-5 shadow-xs flex flex-col items-center text-center transition-all duration-200 hover:shadow-md hover:border-brand-600/40 group"
              >
                <div className="w-full aspect-[4/5] rounded-md overflow-hidden bg-gradient-to-b from-brand-100/50 via-brand-100/20 to-transparent border border-brand-200/60 mb-4 flex items-end justify-center pt-4 relative">
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="w-full h-full object-contain object-bottom transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-2.5 right-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white text-brand-900 border border-brand-200 shadow-2xs">
                      {member.badge}
                    </span>
                  </div>
                </div>

                <h3 className="font-display font-bold text-base sm:text-lg text-brand-900 leading-snug">
                  {member.name}
                </h3>
                <span className="text-xs font-semibold text-brand-600 mt-0.5 mb-2">
                  {member.role}
                </span>
                <p className="text-xs text-slate-wet leading-relaxed">
                  {member.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
