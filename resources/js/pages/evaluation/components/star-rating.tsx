import { Star } from 'lucide-react';

interface StarRatingProps {
    rating: number;
    onRatingChange: (rating: number) => void;
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
}

export function StarRating({ 
    rating, 
    onRatingChange, 
    size = 'md', 
    disabled = false 
}: StarRatingProps) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6',
    };

    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onRatingChange(star)}
                    className={`transition-colors hover:scale-110 focus:outline-none ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
                    disabled={disabled}
                >
                    <Star className={`${sizeClasses[size]} ${rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                </button>
            ))}
            <span className="ml-2 text-sm font-medium text-gray-600">{rating}/10</span>
        </div>
    );
} 