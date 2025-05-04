import { Link } from "wouter";

interface OptionCardProps {
  title: string;
  description: string;
  icon: string;
  href: string;
  bgColor?: string;
  iconColor?: string;
}

const OptionCard = ({ 
  title, 
  description, 
  icon, 
  href,
  bgColor = "bg-primary/10",
  iconColor = "text-primary"
}: OptionCardProps) => {
  return (
    <Link href={href}>
      <a className="bg-neutral-100 rounded-xl p-4 flex flex-col items-center text-center cursor-pointer transition hover:shadow-md">
        <div className={`w-12 h-12 rounded-full ${bgColor} flex items-center justify-center mb-3`}>
          <i className={`${icon} text-xl ${iconColor}`}></i>
        </div>
        <h3 className="font-heading font-semibold mb-1">{title}</h3>
        <p className="text-xs text-neutral-600">{description}</p>
      </a>
    </Link>
  );
};

export default OptionCard;
