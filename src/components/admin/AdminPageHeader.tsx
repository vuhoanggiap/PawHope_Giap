interface AdminPageHeaderProps {
  title: string;
  description?: string;
  badge?: string;
}

export function AdminPageHeader({ title, description, badge }: AdminPageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <h1 className="admin-page-title">{title}</h1>
        {badge ? <span className="admin-badge">{badge}</span> : null}
      </div>
      {description ? (
        <p className="max-w-2xl text-sm leading-relaxed text-slate-400 md:text-base">{description}</p>
      ) : null}
      <div className="mt-4 h-px w-full max-w-xs bg-gradient-to-r from-[#2c5f51]/60 via-[#f6931d]/30 to-transparent" />
    </div>
  );
}
