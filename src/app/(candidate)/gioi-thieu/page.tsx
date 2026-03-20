'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import styles from './gioi-thieu.module.css';

const HERO_IMG = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&q=80';
const BREAK_IMG = 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1600&q=80';

const BENEFITS = [
  { num: '0₫', title: 'Công nghệ miễn phí', desc: 'Website, app, CRM, tools — trị giá hàng trăm triệu, được cung cấp hoàn toàn miễn phí.' },
  { num: '30%', title: 'Lợi nhuận trực tiếp', desc: 'Team nhận tối đa 30% lợi nhuận từ doanh thu dự án. Tiền thật.' },
  { num: 'AI', title: 'Hỗ trợ toàn diện', desc: 'Sử dụng miễn phí các AI hàng đầu để lập kế hoạch, marketing, phân tích.' },
  { num: '∞', title: 'Quyền xây bộ máy', desc: 'Tuyển thêm người, mở rộng quy mô, xây dựng team của riêng bạn.' },
  { num: '↗', title: 'AI đề xuất phát triển', desc: 'AI đề xuất cơ chế phát triển và hệ thống tiếp theo cho dự án.' },
  { num: '%↑', title: 'Tăng sở hữu', desc: 'Chứng minh năng lực → được tăng tỉ lệ sở hữu hệ thống.' },
];

const STEPS = [
  { title: 'Đăng ký', desc: 'Tạo tài khoản, điền thông tin cá nhân.' },
  { title: 'Lập đội', desc: 'Tạo đội 2–3 người hoặc tham gia bằng mã mời.' },
  { title: 'Kế hoạch', desc: 'Viết kế hoạch kinh doanh 14 phần với AI hỗ trợ.' },
  { title: 'Đánh giá', desc: 'Nộp bản hoàn chỉnh, chấm 4 tiêu chí.' },
  { title: 'Kết quả', desc: 'Xem điểm chi tiết, nhận xét từ mentor.' },
  { title: 'Triển khai', desc: 'Dự án được duyệt — AI tạo task, bắt đầu vận hành.' },
];

const DUTIES = [
  'Nghiên cứu mô hình kinh doanh có ứng dụng công nghệ',
  'Tập trung marketing & tìm kiếm khách hàng — ưu tiên organic',
  'Xác định chân dung khách hàng trả tiền',
  'Xây dựng quy trình thanh toán & tự động hóa',
  'Cam kết tối thiểu 20–30 giờ/tuần',
];

const CRITERIA = [
  { name: 'Hệ thống Workflow', weight: 35 },
  { name: 'Mô hình kinh doanh', weight: 30 },
  { name: 'Marketing Organic', weight: 25 },
  { name: 'Quảng cáo trả phí', weight: 10 },
];

const MARQUEE_ITEMS = ['14 phần kế hoạch', '4 tiêu chí đánh giá', 'AI hỗ trợ 24/7', 'Hoàn toàn miễn phí'];

function useRevealOnScroll() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.revealed);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    const children = el.querySelectorAll('[data-reveal]');
    children.forEach((child) => observer.observe(child));

    return () => observer.disconnect();
  }, []);

  return ref;
}

export default function GioiThieuPage() {
  const router = useRouter();
  const revealRef = useRevealOnScroll();

  return (
    <div className={styles.page} ref={revealRef}>

      {/* ─── HERO ─── */}
      <section className={styles.hero}>
        <div className={styles.heroImageWrap}>
          <img src={HERO_IMG} alt="" className={styles.heroImg} />
        </div>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <div className={styles.heroInner} data-reveal>
            <div className={styles.heroLine} />
            <p className={styles.heroEyebrow}>Talent Venture 2025</p>
            <h1 className={styles.heroTitle}>
              Biến ý tưởng thành<br />dự án kinh doanh thật
            </h1>
            <p className={styles.heroSub}>
              Chương trình ươm tạo doanh nhân trẻ — xây dựng kế hoạch,
              được mentor đánh giá, rồi triển khai thực tế.
            </p>
            <button className={styles.heroBtn} onClick={() => router.push('/doi-nhom')}>
              <span>Khám phá ngay</span>
            </button>
          </div>
        </div>
        <div className={styles.heroScroll}>
          <div className={styles.heroScrollLine} />
          <span className={styles.heroScrollText}>Cuộn xuống</span>
        </div>
      </section>

      {/* ─── MARQUEE ─── */}
      <section className={styles.marquee}>
        <div className={styles.marqueeTrack}>
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((t, i) => (
            <span key={i} className={styles.marqueeItem}>
              <span className={styles.marqueeDiamond} />
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* ─── EDITORIAL INTRO ─── */}
      <section className={styles.editorial}>
        <div className={styles.editorialInner} data-reveal>
          <p className={styles.editorialEyebrow}>Giới thiệu</p>
          <h2 className={styles.editorialTitle}>
            Một chương trình.<br />Mọi thứ bạn cần.
          </h2>
          <div className={styles.editorialDivider} />
          <p className={styles.editorialBody}>
            Talent Venture cung cấp công nghệ, AI, và hệ thống vận hành — hoàn toàn miễn phí.
            Bạn chỉ cần mang theo ý tưởng, sự cam kết, và tinh thần doanh nhân.
          </p>
        </div>
      </section>

      {/* ─── BENEFITS ─── */}
      <section className={styles.benefits}>
        <div className={styles.benefitsHeader} data-reveal>
          <p className={styles.sectionEyebrow}>Quyền lợi</p>
          <h2 className={styles.sectionTitle}>Bạn nhận được gì</h2>
        </div>
        <div className={styles.benefitsGrid}>
          {BENEFITS.map((b, i) => (
            <div key={i} className={styles.benefitItem} data-reveal>
              <div className={styles.benefitNumWrap}>
                <span className={styles.benefitNum}>{b.num}</span>
              </div>
              <div className={styles.benefitBody}>
                <h3 className={styles.benefitTitle}>{b.title}</h3>
                <p className={styles.benefitDesc}>{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── IMAGE BREAK: parallax-style ─── */}
      <section className={styles.imageBreak}>
        <div className={styles.imageBreakInner}>
          <img src={BREAK_IMG} alt="" className={styles.imageBreakImg} />
        </div>
        <div className={styles.imageBreakOverlay} />
        <div className={styles.imageBreakContent} data-reveal>
          <p className={styles.imageBreakQuote}>
            &ldquo;Hành trình ngàn dặm bắt đầu từ một bước chân.&rdquo;
          </p>
        </div>
      </section>

      {/* ─── PROCESS ─── */}
      <section className={styles.process}>
        <div className={styles.processHeader} data-reveal>
          <p className={styles.sectionEyebrow}>Quy trình</p>
          <h2 className={styles.sectionTitle}>6 bước từ ý tưởng đến dự án</h2>
        </div>
        <div className={styles.processGrid}>
          {STEPS.map((step, i) => (
            <div key={i} className={styles.processItem} data-reveal>
              <span className={styles.processNum}>{String(i + 1).padStart(2, '0')}</span>
              <div className={styles.processDivider} />
              <h3 className={styles.processTitle}>{step.title}</h3>
              <p className={styles.processDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── DUTIES ─── */}
      <section className={styles.duties}>
        <div className={styles.dutiesInner}>
          <div className={styles.dutiesLeft} data-reveal>
            <p className={styles.sectionEyebrow}>Trách nhiệm</p>
            <h2 className={styles.sectionTitle}>Cam kết<br />của bạn</h2>
            <div className={styles.dutiesAccent} />
          </div>
          <div className={styles.dutiesRight}>
            {DUTIES.map((d, i) => (
              <div key={i} className={styles.dutyRow} data-reveal>
                <span className={styles.dutyNum}>{String(i + 1).padStart(2, '0')}</span>
                <p className={styles.dutyText}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CRITERIA ─── */}
      <section className={styles.criteria}>
        <div className={styles.criteriaHeader} data-reveal>
          <p className={styles.sectionEyebrow}>Đánh giá</p>
          <h2 className={styles.sectionTitle}>Tiêu chí chấm điểm</h2>
        </div>
        <div className={styles.criteriaList}>
          {CRITERIA.map((c, i) => (
            <div key={i} className={styles.criteriaRow} data-reveal>
              <span className={styles.criteriaIndex}>{String(i + 1).padStart(2, '0')}</span>
              <span className={styles.criteriaName}>{c.name}</span>
              <span className={styles.criteriaLine} />
              <span className={styles.criteriaWeight}>{c.weight}%</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className={styles.cta}>
        <div className={styles.ctaInner} data-reveal>
          <div className={styles.ctaDecor}>
            <div className={styles.ctaDecorLine} />
            <div className={styles.ctaDecorDiamond} />
            <div className={styles.ctaDecorLine} />
          </div>
          <p className={styles.ctaEyebrow}>Sẵn sàng?</p>
          <h2 className={styles.ctaTitle}>
            Bắt đầu hành trình<br />của bạn
          </h2>
          <button className={styles.ctaBtn} onClick={() => router.push('/doi-nhom')}>
            <span>Tạo đội nhóm</span>
          </button>
        </div>
      </section>

    </div>
  );
}
