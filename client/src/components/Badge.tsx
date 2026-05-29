type BadgeProps = {
  label: string;
  color?: 'green' | 'yellow' | 'red' | 'blue' | 'purple' | 'gray';
}

const colors = {
  green: 'bg-green-900 text-green-300',
  yellow: 'bg-yellow-900 text-yellow-300',
  red: 'bg-red-900 text-red-300',
  blue: 'bg-blue-900 text-blue-300',
  purple: 'bg-purple-900 text-purple-300',
  gray: 'bg-gray-700 text-gray-300',
}

export default function Badge({ label, color = 'gray' }: BadgeProps) {
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${colors[color]}`}>
      {label}
    </span>
  );
}