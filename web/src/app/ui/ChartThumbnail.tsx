import React from "react";

interface ChartThumbnailProps {
  title: string;
  subtitle: string;
  // chart: React.ReactNode;
}

export const ChartThumbnail: React.FC<ChartThumbnailProps> = ({
  title,
  subtitle,
}) => {
  return (
    <a
      href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
      className="bg-primary-900 m-3 group rounded-lg overflow-hidden border border-primary-800 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-primary-600 hover:dark:bg-primary-900/30"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className="px-5 py-4">
        <h2 className={`mb-3 text-xl font-semibold text-primary-100`}>
          {title}
          <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none opacity-35 ml-2">
            -&gt;
          </span>
        </h2>
        <p className={`m-0 max-w-[30ch] text-sm opacity-50 text-primary-200`}>
          {subtitle}
        </p>
      </div>
      <div className="bg-primary-800 mt-2" style={{ height: 300 }}></div>
    </a>
  );
};
