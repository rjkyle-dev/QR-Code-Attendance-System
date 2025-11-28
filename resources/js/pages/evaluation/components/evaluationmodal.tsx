import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { Star } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Evaluation } from '../types/evaluation';

interface EvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluation: Evaluation;
  onSubmit?: () => void;
}

const criteria = [
  { key: 'work_quality', label: 'Work Quality' },
  { key: 'safety_compliance', label: 'Safety Compliance' },
  { key: 'equipment_handling', label: 'Equipment Handling' },
  { key: 'teamwork', label: 'Teamwork' },
  { key: 'punctuality', label: 'Punctuality' },
  { key: 'organization', label: 'Organization' },
];

export default function EvaluationModal({ isOpen, onClose, evaluation, onSubmit }: EvaluationModalProps) {
  if (!evaluation) return null;
  const [scores, setScores] = useState<{ [key: string]: number }>({});
  const scoresRef = React.useRef(scores);
  React.useEffect(() => {
    scoresRef.current = scores;
  }, [scores]);
  const [comment, setComment] = useState(evaluation.comment || '');

  // Calculate average score
  const average = useMemo(() => {
    const vals = Object.values(scores);
    if (!vals.length) return 0;
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  }, [scores]);

  const { post, processing, errors, reset, setData } = useForm({});

  const handleStarClick = (criterion: string, value: number) => {
    setScores((prev) => ({ ...prev, [criterion]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Use the latest scores from the ref
    const currentScores = scoresRef.current;
    const payload = {
      employee_id: evaluation.employee_id,
      work_quality: currentScores.work_quality || 0,
      safety_compliance: currentScores.safety_compliance || 0,
      equipment_handling: currentScores.equipment_handling || 0,
      teamwork: currentScores.teamwork || 0,
      punctuality: currentScores.punctuality || 0,
      organization: currentScores.organization || 0,
      ratings: average,
      comment,
    };
    console.log('Submitting payload:', payload); 
    setData(payload);
    post(route('evaluation.store'), {
      onSuccess: () => {
        toast.success('Evaluation saved successfully!');
        reset();
        setScores({});
        setComment('');
        onClose();
        if (onSubmit) onSubmit();
      },
      onError: () => {
        toast.promise(new Promise((resolve) => {
          setTimeout(() => {
            resolve('Calculating average score...');
          }, 1000);
        }), {
          loading: 'Calculating average score...',
          success: 'Click on save button again to save the evaluation.',
        });
      },  
      preserveScroll: true,
    });
  };

  const allCriteriaRated = criteria.every(c => scores[c.key] && scores[c.key] >= 1 && scores[c.key] <= 10);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="p-5 overflow-y-auto border-cfar-500 max-h-[90vh] min-w-2xl overflow-y-auto border-2 shadow-2xl"
      >
        <DialogHeader>
          <DialogTitle className="text-green-800">Evaluate Employee</DialogTitle>
        </DialogHeader>
        {evaluation && (
          <div className="mb-4 rounded bg-green-100 p-4 flex items-center gap-4">
            {/* Employee Profile Image */}
            <div className="flex-shrink-0">
              <img
                src={evaluation.picture || 'Logo.png'}
                alt={`${evaluation.employee_name} profile`}
                className="w-16 h-16 rounded-full object-cover border border-cfar-400 bg-white"
              />
            </div>
            <div>
              <div className="text-lg font-semibold">{evaluation.employee_name}</div>
              <div className="text-sm text-gray-500">{evaluation.employeeid}</div>
              <div className="mt-2 flex gap-2">
                <Badge variant="outline">{evaluation.department}</Badge>
                <Badge variant="outline">{evaluation.position}</Badge>
              </div>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <div className="mb-2 text-green-700 font-semibold">Evaluation Criteria</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {criteria.map((c) => (
                <div key={c.key} className="flex flex-col gap-1">
                  <span>{c.label}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5,6,7,8,9,10].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => handleStarClick(c.key, star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-5 w-5 ${scores[c.key] && scores[c.key] >= star ? 'fill-green-600 text-green-600' : 'text-gray-300'}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <div className="mb-1 font-medium text-green-700">Additional Notes</div>
            <Textarea
              placeholder="Add any additional comments about the employee's performance..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="resize-none"
            />
          </div>
          <div className="mb-4 rounded bg-green-100 p-4 text-center">
            <div className="text-sm text-green-700">Average Score</div>
            <div className="text-3xl font-bold text-green-800">{average}</div>
            <div className="flex justify-center mt-1">
              {[1, 2, 3, 4, 5,6,7,8,9,10].map((star) => (
                <Star
                  key={star}
                  className={`h-6 w-6 ${average && Number(average) >= star ? 'fill-green-600 text-green-600' : 'text-gray-300'}`}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
              Cancel
            </Button>
            <Button type="submit" variant="main" className="font-semibold" disabled={processing || !allCriteriaRated}>
              {processing ? 'Saving...' : 'Save Evaluation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 