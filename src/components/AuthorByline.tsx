interface AuthorBylineProps {
  date: string;
  readTime: string;
}

export const AuthorByline = ({ date, readTime }: AuthorBylineProps) => {
  return (
    <div className="flex items-center gap-4 py-4">
      <div className="w-12 h-12 rounded-full bg-gradient-party flex items-center justify-center flex-shrink-0">
        <span className="text-white font-bold text-sm">CA</span>
      </div>
      <div className="flex-1">
        <p className="font-semibold text-foreground">Cake AI Artist Team</p>
        <p className="text-sm text-muted-foreground">
          {date} · {readTime}
        </p>
      </div>
    </div>
  );
};
