import * as React from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ icon: Icon, title, subtitle }) => (
  <header className="my-6 text-center">
    <Icon className="w-12 h-12 mx-auto text-[#3A3A3A] mb-2" />
    <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
    <p className="text-md text-gray-500 mt-1">{subtitle}</p>
  </header>
);

export default PageHeader;
